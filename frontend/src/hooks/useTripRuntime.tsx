import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../auth/types";
import type { LatLng, Route } from "../types/route";
import type {
  AlertPayload,
  AnomalyKind,
  Recipient,
  Thresholds,
  TripState,
  TripTrack,
} from "../types/trip";
import { buildTripTrack } from "../services/trip";
import { detectAnomaly } from "../services/monitoring";
import { buildAlertPayload } from "../services/alert";
import { haversineDistance } from "../services/coverage";

const TICK_MS = 1000;
const WALKING_SPEED_KMH = 5;
const PREALERT_WINDOW_MS = 30_000;
const DEVIATION_DEMO_METERS = 120;

// ---------------------------------------------------------------------------
// Internal reducer state and actions
// ---------------------------------------------------------------------------

interface InternalState {
  tripState: TripState;
  route: Route;
  recipient: Recipient | null;
  user: User;
  track: TripTrack;
  thresholds: Thresholds;
  elapsedSec: number;
  currentPosition: LatLng;
  traveledPath: LatLng[];
  simulatePaused: boolean;
  pauseStartedAt: number | null;
  pauseDurationSec: number;
  anomalyKind: AnomalyKind | null;
  prealertDeadline: number | null;
  alertPayload: AlertPayload | null;
}

type Action =
  | { type: "TICK"; now: number }
  | { type: "FORCE_PREALERT"; now: number }
  | { type: "CONFIRM_OK" }
  | { type: "ESCALATE_NOW" }
  | { type: "TOGGLE_SIMULATED_PAUSE"; now: number }
  | { type: "TRIGGER_DEVIATION"; now: number }
  | { type: "ARRIVE" }
  | { type: "CANCEL" }
  | { type: "MARK_ALERT_RESOLVED" }
  | { type: "UPDATE_THRESHOLDS"; thresholds: Thresholds };

interface InitArgs {
  route: Route;
  recipient: Recipient | null;
  user: User;
  thresholds: Thresholds;
}

function init({ route, recipient, user, thresholds }: InitArgs): InternalState {
  const track = buildTripTrack(route, WALKING_SPEED_KMH);
  const initialPosition = track.samples[0]?.point ?? route.waypoints[0];
  return {
    tripState: "in_progress",
    route,
    recipient,
    user,
    track,
    thresholds,
    elapsedSec: 0,
    currentPosition: initialPosition,
    traveledPath: [initialPosition],
    simulatePaused: false,
    pauseStartedAt: null,
    pauseDurationSec: 0,
    anomalyKind: null,
    prealertDeadline: null,
    alertPayload: null,
  };
}

function positionFromTrack(track: TripTrack, elapsedSec: number): LatLng {
  if (track.samples.length === 0) return { lat: 0, lng: 0 };
  const idx = Math.min(
    track.samples.length - 1,
    Math.max(0, Math.floor(elapsedSec)),
  );
  return track.samples[idx].point;
}

function enterPrealert(
  s: InternalState,
  kind: AnomalyKind,
  now: number,
): InternalState {
  if (
    s.tripState === "alert" ||
    s.tripState === "completed" ||
    s.tripState === "cancelled"
  ) {
    return s;
  }
  return {
    ...s,
    tripState: "prealert",
    anomalyKind: kind,
    prealertDeadline: now + PREALERT_WINDOW_MS,
  };
}

function escalate(
  s: InternalState,
  reason: AnomalyKind | "timeout",
): InternalState {
  const destination = s.route.waypoints[s.route.waypoints.length - 1];
  return {
    ...s,
    tripState: "alert",
    prealertDeadline: null,
    alertPayload: buildAlertPayload({
      user: s.user,
      recipient: s.recipient,
      lastKnownLocation: s.currentPosition,
      destination,
      routeWaypoints: s.route.waypoints,
      routeLabel: s.route.label,
      triggerReason: reason,
    }),
  };
}

/**
 * Produce a point perpendicular to the origin→destination chord, offset
 * by `distanceMeters` on the "right" side. Used by the deviation demo.
 */
function offsetOffRoute(
  waypoints: LatLng[],
  from: LatLng,
  distanceMeters: number,
): LatLng {
  if (waypoints.length < 2) {
    return { lat: from.lat + 0.001, lng: from.lng + 0.001 };
  }
  const a = waypoints[0];
  const b = waypoints[waypoints.length - 1];
  const midLat = (a.lat + b.lat) / 2;
  const mPerLat = 111_320;
  const mPerLng = 111_320 * Math.cos((midLat * Math.PI) / 180);
  const dx = (b.lng - a.lng) * mPerLng;
  const dy = (b.lat - a.lat) * mPerLat;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = dy / len;
  const perpY = -dx / len;
  return {
    lat: from.lat + (perpY * distanceMeters) / mPerLat,
    lng: from.lng + (perpX * distanceMeters) / mPerLng,
  };
}

function reducer(s: InternalState, action: Action): InternalState {
  switch (action.type) {
    case "TICK": {
      const { now } = action;

      // Prealert countdown expiration -> escalate (RF-28, RF-31).
      if (
        s.tripState === "prealert" &&
        s.prealertDeadline !== null &&
        now >= s.prealertDeadline
      ) {
        return escalate(s, "timeout");
      }
      if (s.tripState !== "in_progress") {
        return s;
      }

      // Paused simulation: count pause duration, fire prealert when threshold
      // is crossed (RF-25, RF-26).
      if (s.simulatePaused) {
        const pauseDurationSec = s.pauseStartedAt
          ? Math.floor((now - s.pauseStartedAt) / 1000)
          : 0;
        const anomaly = detectAnomaly({
          position: s.currentPosition,
          routeWaypoints: s.route.waypoints,
          pauseDurationSec,
          thresholds: s.thresholds,
        });
        const next: InternalState = { ...s, pauseDurationSec };
        if (anomaly === "pause") {
          return enterPrealert(next, "pause", now);
        }
        return next;
      }

      // Advance the simulation by one tick.
      const elapsedSec = s.elapsedSec + TICK_MS / 1000;
      if (elapsedSec >= s.track.totalDurationSec) {
        const finalPos = s.route.waypoints[s.route.waypoints.length - 1];
        return {
          ...s,
          tripState: "completed",
          elapsedSec: s.track.totalDurationSec,
          currentPosition: finalPos,
          traveledPath: [...s.traveledPath, finalPos],
        };
      }

      const newPosition = positionFromTrack(s.track, elapsedSec);
      const last = s.traveledPath[s.traveledPath.length - 1];
      const appendToPath = last
        ? haversineDistance(last, newPosition) > 2
        : true;
      const nextPath = appendToPath
        ? [...s.traveledPath, newPosition]
        : s.traveledPath;

      return {
        ...s,
        elapsedSec,
        currentPosition: newPosition,
        traveledPath: nextPath,
        pauseDurationSec: 0,
      };
    }

    case "FORCE_PREALERT":
      return enterPrealert(s, "manual", action.now);

    case "CONFIRM_OK": {
      if (s.tripState !== "prealert") return s;
      return {
        ...s,
        tripState: "in_progress",
        anomalyKind: null,
        prealertDeadline: null,
        simulatePaused: false,
        pauseStartedAt: null,
        pauseDurationSec: 0,
      };
    }

    case "ESCALATE_NOW": {
      if (s.tripState !== "prealert") return s;
      return escalate(s, s.anomalyKind ?? "manual");
    }

    case "TOGGLE_SIMULATED_PAUSE": {
      if (s.tripState !== "in_progress") return s;
      if (s.simulatePaused) {
        return {
          ...s,
          simulatePaused: false,
          pauseStartedAt: null,
          pauseDurationSec: 0,
        };
      }
      return {
        ...s,
        simulatePaused: true,
        pauseStartedAt: action.now,
        pauseDurationSec: 0,
      };
    }

    case "TRIGGER_DEVIATION": {
      if (s.tripState !== "in_progress") return s;
      const offRoute = offsetOffRoute(
        s.route.waypoints,
        s.currentPosition,
        DEVIATION_DEMO_METERS,
      );
      const next: InternalState = {
        ...s,
        currentPosition: offRoute,
        traveledPath: [...s.traveledPath, offRoute],
      };
      const anomaly = detectAnomaly({
        position: offRoute,
        routeWaypoints: s.route.waypoints,
        pauseDurationSec: 0,
        thresholds: s.thresholds,
      });
      return enterPrealert(next, anomaly ?? "deviation", action.now);
    }

    case "ARRIVE": {
      if (
        s.tripState === "completed" ||
        s.tripState === "cancelled" ||
        s.tripState === "alert"
      ) {
        return s;
      }
      const finalPos = s.route.waypoints[s.route.waypoints.length - 1];
      return {
        ...s,
        tripState: "completed",
        elapsedSec: s.track.totalDurationSec,
        currentPosition: finalPos,
        prealertDeadline: null,
      };
    }

    case "CANCEL": {
      if (s.tripState === "completed" || s.tripState === "cancelled") return s;
      return { ...s, tripState: "cancelled", prealertDeadline: null };
    }

    case "MARK_ALERT_RESOLVED": {
      if (s.tripState !== "alert") return s;
      return { ...s, tripState: "completed" };
    }

    case "UPDATE_THRESHOLDS":
      return { ...s, thresholds: action.thresholds };

    default:
      return s;
  }
}

// ---------------------------------------------------------------------------
// Context surface
// ---------------------------------------------------------------------------

export interface TripRuntimeContextValue {
  tripState: TripState;
  route: Route;
  recipient: Recipient | null;
  thresholds: Thresholds;
  currentPosition: LatLng;
  traveledPath: LatLng[];
  elapsedSec: number;
  totalDurationSec: number;
  distanceTraveledKm: number;
  distanceRemainingKm: number;
  estimatedRemainingSec: number;
  averageIsp: number;
  simulatePaused: boolean;
  pauseDurationSec: number;
  anomalyKind: AnomalyKind | null;
  prealertDeadline: number | null;
  prealertRemainingSec: number;
  alertPayload: AlertPayload | null;
  forcePrealert: () => void;
  confirmOk: () => void;
  escalateNow: () => void;
  toggleSimulatedPause: () => void;
  triggerDeviation: () => void;
  arrive: () => void;
  cancelTrip: () => void;
  markAlertResolved: () => void;
  updateThresholds: (t: Thresholds) => void;
}

const TripRuntimeContext = createContext<TripRuntimeContextValue | null>(null);

export interface TripRuntimeProviderProps {
  route: Route;
  recipient: Recipient | null;
  user: User;
  thresholds: Thresholds;
  children: ReactNode;
}

export function TripRuntimeProvider({
  route,
  recipient,
  user,
  thresholds,
  children,
}: TripRuntimeProviderProps) {
  const [state, dispatch] = useReducer(
    reducer,
    { route, recipient, user, thresholds },
    init,
  );

  // Independent render-clock used to animate the prealert countdown display
  // without spamming the reducer — the state is only for business logic.
  const [renderNow, setRenderNow] = useState<number>(() => Date.now());

  // Keep internal thresholds in sync if the profile changes them mid-trip.
  const lastThresholdsRef = useRef<Thresholds>(thresholds);
  useEffect(() => {
    if (
      thresholds.pauseThresholdSec !==
        lastThresholdsRef.current.pauseThresholdSec ||
      thresholds.deviationThresholdMeters !==
        lastThresholdsRef.current.deviationThresholdMeters
    ) {
      lastThresholdsRef.current = thresholds;
      dispatch({ type: "UPDATE_THRESHOLDS", thresholds });
    }
  }, [thresholds]);

  // Simulation tick — active while the trip is not terminated.
  useEffect(() => {
    const terminal =
      state.tripState === "completed" ||
      state.tripState === "cancelled" ||
      state.tripState === "alert";
    if (terminal) return undefined;
    const interval = window.setInterval(() => {
      dispatch({ type: "TICK", now: Date.now() });
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, [state.tripState]);

  // Countdown repaint clock — only runs while prealert is open.
  useEffect(() => {
    if (state.tripState !== "prealert") return undefined;
    const interval = window.setInterval(() => setRenderNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [state.tripState]);

  const forcePrealert = useCallback(
    () => dispatch({ type: "FORCE_PREALERT", now: Date.now() }),
    [],
  );
  const confirmOk = useCallback(() => dispatch({ type: "CONFIRM_OK" }), []);
  const escalateNow = useCallback(() => dispatch({ type: "ESCALATE_NOW" }), []);
  const toggleSimulatedPause = useCallback(
    () => dispatch({ type: "TOGGLE_SIMULATED_PAUSE", now: Date.now() }),
    [],
  );
  const triggerDeviation = useCallback(
    () => dispatch({ type: "TRIGGER_DEVIATION", now: Date.now() }),
    [],
  );
  const arrive = useCallback(() => dispatch({ type: "ARRIVE" }), []);
  const cancelTrip = useCallback(() => dispatch({ type: "CANCEL" }), []);
  const markAlertResolved = useCallback(
    () => dispatch({ type: "MARK_ALERT_RESOLVED" }),
    [],
  );
  const updateThresholds = useCallback(
    (next: Thresholds) =>
      dispatch({ type: "UPDATE_THRESHOLDS", thresholds: next }),
    [],
  );

  const value = useMemo<TripRuntimeContextValue>(() => {
    const totalKm = state.route.distanceKm;
    const fraction =
      state.track.totalDurationSec === 0
        ? 1
        : Math.min(1, state.elapsedSec / state.track.totalDurationSec);
    const distanceTraveledKm = totalKm * fraction;
    const prealertRemainingSec =
      state.prealertDeadline !== null
        ? Math.max(0, Math.ceil((state.prealertDeadline - renderNow) / 1000))
        : 0;

    return {
      tripState: state.tripState,
      route: state.route,
      recipient: state.recipient,
      thresholds: state.thresholds,
      currentPosition: state.currentPosition,
      traveledPath: state.traveledPath,
      elapsedSec: state.elapsedSec,
      totalDurationSec: state.track.totalDurationSec,
      distanceTraveledKm,
      distanceRemainingKm: Math.max(0, totalKm - distanceTraveledKm),
      estimatedRemainingSec: Math.max(
        0,
        state.track.totalDurationSec - state.elapsedSec,
      ),
      averageIsp: state.route.isp,
      simulatePaused: state.simulatePaused,
      pauseDurationSec: state.pauseDurationSec,
      anomalyKind: state.anomalyKind,
      prealertDeadline: state.prealertDeadline,
      prealertRemainingSec,
      alertPayload: state.alertPayload,
      forcePrealert,
      confirmOk,
      escalateNow,
      toggleSimulatedPause,
      triggerDeviation,
      arrive,
      cancelTrip,
      markAlertResolved,
      updateThresholds,
    };
  }, [
    state,
    renderNow,
    forcePrealert,
    confirmOk,
    escalateNow,
    toggleSimulatedPause,
    triggerDeviation,
    arrive,
    cancelTrip,
    markAlertResolved,
    updateThresholds,
  ]);

  return (
    <TripRuntimeContext.Provider value={value}>
      {children}
    </TripRuntimeContext.Provider>
  );
}

export function useTripRuntime(): TripRuntimeContextValue {
  const ctx = useContext(TripRuntimeContext);
  if (!ctx) {
    throw new Error("useTripRuntime must be used within a TripRuntimeProvider");
  }
  return ctx;
}
