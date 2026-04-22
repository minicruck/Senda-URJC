import type { LatLng, Route } from "../types/route";
import type { TripPositionSample, TripTrack } from "../types/trip";
import { haversineDistance } from "./coverage";

/**
 * Discretises a route's polyline into a per-second track at the given
 * walking speed. The result is indexable by elapsed seconds during the
 * `/trip` simulation.
 */
export function buildTripTrack(route: Route, speedKmh: number): TripTrack {
  const waypoints = route.waypoints;
  if (waypoints.length < 2) {
    return {
      samples:
        waypoints.length === 1 ? [{ point: waypoints[0], atSec: 0 }] : [],
      totalDistanceMeters: 0,
      totalDurationSec: 0,
    };
  }

  const speedMps = (speedKmh * 1000) / 3600;
  const segmentDistances: number[] = [];
  let totalDistanceMeters = 0;
  for (let i = 1; i < waypoints.length; i += 1) {
    const d = haversineDistance(waypoints[i - 1], waypoints[i]);
    segmentDistances.push(d);
    totalDistanceMeters += d;
  }
  const totalDurationSec = Math.max(
    1,
    Math.ceil(totalDistanceMeters / speedMps),
  );

  const samples: TripPositionSample[] = [];
  for (let t = 0; t <= totalDurationSec; t += 1) {
    samples.push({
      point: positionAt(waypoints, segmentDistances, t * speedMps),
      atSec: t,
    });
  }
  return { samples, totalDistanceMeters, totalDurationSec };
}

function positionAt(
  waypoints: LatLng[],
  segmentDistances: number[],
  distanceFromStartMeters: number,
): LatLng {
  let remaining = Math.max(0, distanceFromStartMeters);
  for (let i = 0; i < segmentDistances.length; i += 1) {
    const segLen = segmentDistances[i];
    if (remaining <= segLen || i === segmentDistances.length - 1) {
      const fraction = segLen === 0 ? 0 : Math.min(1, remaining / segLen);
      const a = waypoints[i];
      const b = waypoints[i + 1];
      return {
        lat: a.lat + (b.lat - a.lat) * fraction,
        lng: a.lng + (b.lng - a.lng) * fraction,
      };
    }
    remaining -= segLen;
  }
  return waypoints[waypoints.length - 1];
}

/**
 * Minimum distance (m) from a point to any segment of the polyline.
 * Used by anomaly detection (`services/monitoring.ts`).
 */
export function distanceToRoute(point: LatLng, waypoints: LatLng[]): number {
  if (waypoints.length === 0) return Infinity;
  if (waypoints.length === 1) return haversineDistance(point, waypoints[0]);
  let min = Infinity;
  for (let i = 1; i < waypoints.length; i += 1) {
    const d = distanceToSegmentMeters(point, waypoints[i - 1], waypoints[i]);
    if (d < min) min = d;
  }
  return min;
}

/**
 * Distance from `point` to the segment [a, b] in metres, computed in a
 * local ENU projection centred on the segment midpoint. For campus-scale
 * distances the error is negligible.
 */
function distanceToSegmentMeters(point: LatLng, a: LatLng, b: LatLng): number {
  const midLat = (a.lat + b.lat) / 2;
  const mPerLat = 111_320;
  const mPerLng = 111_320 * Math.cos((midLat * Math.PI) / 180);

  const toXY = (p: LatLng): [number, number] => [
    (p.lng - a.lng) * mPerLng,
    (p.lat - a.lat) * mPerLat,
  ];
  const [px, py] = toXY(point);
  const [bx, by] = toXY(b);
  const lenSq = bx * bx + by * by;
  if (lenSq === 0) {
    return Math.hypot(px, py);
  }
  const t = Math.max(0, Math.min(1, (px * bx + py * by) / lenSq));
  const qx = t * bx;
  const qy = t * by;
  return Math.hypot(px - qx, py - qy);
}
