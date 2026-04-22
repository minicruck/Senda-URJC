import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { EndpointKind, LatLng, Route } from "../types/route";
import { isWithinCoverage } from "../services/coverage";
import { calculateRoutes } from "../services/routing";

export interface RoutePlannerState {
  origin: LatLng | null;
  destination: LatLng | null;
  /** Which endpoint a map click will place next. */
  nextEndpoint: EndpointKind;
  routes: Route[];
  activeRouteId: string | null;
  /** i18n key of the current error message, if any. */
  errorKey: string | null;
}

export interface RoutePlannerActions {
  /** Returns true if the endpoint was accepted (inside coverage). */
  setEndpoint: (kind: EndpointKind, point: LatLng) => boolean;
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
  nextEndpoint: "origin",
  routes: [],
  activeRouteId: null,
  errorKey: null,
};

const RoutePlannerContext = createContext<ContextValue | null>(null);

export function RoutePlannerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RoutePlannerState>(INITIAL_STATE);

  const setEndpoint = useCallback<RoutePlannerActions["setEndpoint"]>(
    (kind, point) => {
      if (!isWithinCoverage(point)) {
        setState((s) => ({ ...s, errorKey: "errors.outOfCoverage" }));
        return false;
      }
      setState((s) => {
        const origin = kind === "origin" ? point : s.origin;
        const destination = kind === "destination" ? point : s.destination;

        // Auto-advance the click selector until both endpoints are set.
        let nextEndpoint: EndpointKind = s.nextEndpoint;
        if (kind === "origin" && !s.destination) nextEndpoint = "destination";
        else if (kind === "destination" && !s.origin) nextEndpoint = "origin";

        return {
          ...s,
          origin,
          destination,
          nextEndpoint,
          errorKey: null,
          // Any endpoint change invalidates the previously computed routes.
          routes: [],
          activeRouteId: null,
        };
      });
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
      setState((s) => ({
        ...s,
        origin: kind === "origin" ? null : s.origin,
        destination: kind === "destination" ? null : s.destination,
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
    setState(INITIAL_STATE);
  }, []);

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
