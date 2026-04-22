import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { EndpointKind, LatLng, Route } from "../types/route";
import { isWithinCoverage } from "../services/coverage";
import { calculateRoutes } from "../services/routing";
import { reverseGeocode } from "../services/geocoding";

export interface RoutePlannerState {
  origin: LatLng | null;
  destination: LatLng | null;
  originLabel: string | null;
  destinationLabel: string | null;
  nextEndpoint: EndpointKind;
  routes: Route[];
  activeRouteId: string | null;
  errorKey: string | null;
}

export interface RoutePlannerActions {
  /**
   * Sets an endpoint. If `label` is provided (e.g. selected from the
   * autocomplete) it is stored verbatim; otherwise the hook fires a reverse-
   * geocoding request in the background and updates the label when it
   * resolves. Returns true if the endpoint was accepted (coverage OK).
   */
  setEndpoint: (kind: EndpointKind, point: LatLng, label?: string) => boolean;
  setNextEndpoint: (kind: EndpointKind) => void;
  clearEndpoint: (kind: EndpointKind) => void;
  computeRoutes: () => void;
  chooseRoute: (routeId: string) => void;
  clearError: () => void;
  reset: () => void;
}

type ContextValue = RoutePlannerState & RoutePlannerActions;

const INITIAL_STATE: RoutePlannerState = {
  origin: null,
  destination: null,
  originLabel: null,
  destinationLabel: null,
  nextEndpoint: "origin",
  routes: [],
  activeRouteId: null,
  errorKey: null,
};

const RoutePlannerContext = createContext<ContextValue | null>(null);

export function RoutePlannerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RoutePlannerState>(INITIAL_STATE);

  // One AbortController per endpoint so that rapid re-clicks don't race.
  const reverseControllersRef = useRef<
    Record<EndpointKind, AbortController | null>
  >({
    origin: null,
    destination: null,
  });

  const setEndpoint = useCallback<RoutePlannerActions["setEndpoint"]>(
    (kind, point, label) => {
      if (!isWithinCoverage(point)) {
        setState((s) => ({ ...s, errorKey: "errors.outOfCoverage" }));
        return false;
      }

      // Abort any in-flight reverse-geocoding request for this endpoint.
      reverseControllersRef.current[kind]?.abort();
      reverseControllersRef.current[kind] = null;

      setState((s) => {
        let nextEndpoint: EndpointKind = s.nextEndpoint;
        if (kind === "origin" && !s.destination) nextEndpoint = "destination";
        else if (kind === "destination" && !s.origin) nextEndpoint = "origin";

        return {
          ...s,
          origin: kind === "origin" ? point : s.origin,
          destination: kind === "destination" ? point : s.destination,
          originLabel: kind === "origin" ? (label ?? null) : s.originLabel,
          destinationLabel:
            kind === "destination" ? (label ?? null) : s.destinationLabel,
          nextEndpoint,
          errorKey: null,
          routes: [],
          activeRouteId: null,
        };
      });

      // Fire-and-forget reverse-geocoding when no explicit label was supplied.
      if (!label) {
        const controller = new AbortController();
        reverseControllersRef.current[kind] = controller;
        reverseGeocode(point, { signal: controller.signal })
          .then((address: string) => {
            if (controller.signal.aborted) return;
            setState((s) => ({
              ...s,
              originLabel: kind === "origin" ? address : s.originLabel,
              destinationLabel:
                kind === "destination" ? address : s.destinationLabel,
            }));
          })
          .catch(() => {
            // Silent: the input will fall back to coordinate display.
          });
      }

      return true;
    },
    [],
  );

  const setNextEndpoint = useCallback<RoutePlannerActions["setNextEndpoint"]>(
    (kind) => {
      setState((s) => ({ ...s, nextEndpoint: kind }));
    },
    [],
  );

  const clearEndpoint = useCallback<RoutePlannerActions["clearEndpoint"]>(
    (kind) => {
      reverseControllersRef.current[kind]?.abort();
      reverseControllersRef.current[kind] = null;
      setState((s) => ({
        ...s,
        origin: kind === "origin" ? null : s.origin,
        destination: kind === "destination" ? null : s.destination,
        originLabel: kind === "origin" ? null : s.originLabel,
        destinationLabel: kind === "destination" ? null : s.destinationLabel,
        routes: [],
        activeRouteId: null,
        errorKey: null,
      }));
    },
    [],
  );

  const computeRoutes = useCallback<
    RoutePlannerActions["computeRoutes"]
  >(() => {
    setState((s) => {
      if (!s.origin || !s.destination) {
        return { ...s, errorKey: "errors.missingEndpoints" };
      }
      const routes = calculateRoutes(s.origin, s.destination);
      return {
        ...s,
        routes,
        activeRouteId: routes[0]?.id ?? null,
        errorKey: null,
      };
    });
  }, []);

  const chooseRoute = useCallback<RoutePlannerActions["chooseRoute"]>(
    (routeId) => {
      setState((s) => ({ ...s, activeRouteId: routeId }));
    },
    [],
  );

  const clearError = useCallback<RoutePlannerActions["clearError"]>(() => {
    setState((s) => ({ ...s, errorKey: null }));
  }, []);

  const reset = useCallback<RoutePlannerActions["reset"]>(() => {
    reverseControllersRef.current.origin?.abort();
    reverseControllersRef.current.destination?.abort();
    reverseControllersRef.current.origin = null;
    reverseControllersRef.current.destination = null;
    setState(INITIAL_STATE);
  }, []);

  // Cancel in-flight reverse requests on unmount to avoid updating state
  // on a dismounted provider.
  useEffect(
    () => () => {
      reverseControllersRef.current.origin?.abort();
      reverseControllersRef.current.destination?.abort();
    },
    [],
  );

  const value = useMemo<ContextValue>(
    () => ({
      ...state,
      setEndpoint,
      setNextEndpoint,
      clearEndpoint,
      computeRoutes,
      chooseRoute,
      clearError,
      reset,
    }),
    [
      state,
      setEndpoint,
      setNextEndpoint,
      clearEndpoint,
      computeRoutes,
      chooseRoute,
      clearError,
      reset,
    ],
  );

  return (
    <RoutePlannerContext.Provider value={value}>
      {children}
    </RoutePlannerContext.Provider>
  );
}

export function useRoutePlanner(): ContextValue {
  const ctx = useContext(RoutePlannerContext);
  if (!ctx) {
    throw new Error(
      "useRoutePlanner must be used within a RoutePlannerProvider",
    );
  }
  return ctx;
}
