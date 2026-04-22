import type { LatLng } from "../types/route";
import type { AnomalyKind, Thresholds } from "../types/trip";
import { distanceToRoute } from "./trip";

export interface MonitoringInput {
  position: LatLng;
  routeWaypoints: LatLng[];
  pauseDurationSec: number;
  thresholds: Thresholds;
}

/**
 * Classifies the current runtime snapshot as an anomaly (pause or
 * deviation) or as normal. Pure function — safe to call inside reducers.
 * Priority: deviation > pause.
 */
export function detectAnomaly(input: MonitoringInput): AnomalyKind | null {
  const { position, routeWaypoints, pauseDurationSec, thresholds } = input;

  if (routeWaypoints.length >= 2) {
    const deviation = distanceToRoute(position, routeWaypoints);
    if (deviation > thresholds.deviationThresholdMeters) {
      return "deviation";
    }
  }

  if (pauseDurationSec >= thresholds.pauseThresholdSec) {
    return "pause";
  }

  return null;
}
