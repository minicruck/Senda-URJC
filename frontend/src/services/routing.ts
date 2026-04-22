import type { LatLng, Route, SafetyLevel } from "../types/route";
import { haversineDistance } from "./coverage";

const WALKING_SPEED_KMH = 5;

// Metres per degree — latitude is ~constant (111,320 m); longitude depends
// on the cosine of the latitude. We use this to offset alternative routes
// perpendicular to the origin→destination chord in a visually consistent way.
const METERS_PER_DEG_LAT = 111_320;
function metersPerDegLng(latDeg: number): number {
  return 111_320 * Math.cos((latDeg * Math.PI) / 180);
}

/**
 * Generate three simulated route alternatives between `origin` and
 * `destination`, each with a random Perceived Safety Index (ISP) and the
 * corresponding simplified safety classification.
 *
 * The principal route is a straight chord; the two alternatives add one
 * mid-point waypoint perpendicular to the chord at ±20 % of its length.
 * The array is sorted by ISP descending (RF-04).
 *
 * This implementation is a placeholder for an OSRM-based calculation that
 * will land once the backend is in place.
 */
export function calculateRoutes(origin: LatLng, destination: LatLng): Route[] {
  const principalWaypoints: LatLng[] = [origin, destination];
  const alt1Waypoints: LatLng[] = [
    origin,
    perpendicularWaypoint(origin, destination, 0.2),
    destination,
  ];
  const alt2Waypoints: LatLng[] = [
    origin,
    perpendicularWaypoint(origin, destination, -0.2),
    destination,
  ];

  const routes: Route[] = [
    toRoute("principal", "principal", principalWaypoints),
    toRoute("alt-1", "alternative1", alt1Waypoints),
    toRoute("alt-2", "alternative2", alt2Waypoints),
  ];

  return routes.sort((a, b) => b.isp - a.isp);
}

export function classifySafety(isp: number): SafetyLevel {
  if (isp >= 70) return "high";
  if (isp >= 40) return "medium";
  return "low";
}

function toRoute(id: string, label: string, waypoints: LatLng[]): Route {
  const distanceMeters = totalDistance(waypoints);
  const distanceKm = distanceMeters / 1000;
  const durationMin = (distanceKm / WALKING_SPEED_KMH) * 60;
  const isp = randomInt(0, 100);
  return {
    id,
    label,
    waypoints,
    isp,
    safetyLevel: classifySafety(isp),
    distanceKm,
    durationMin,
  };
}

function totalDistance(waypoints: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < waypoints.length; i += 1) {
    total += haversineDistance(waypoints[i - 1], waypoints[i]);
  }
  return total;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Offset perpendicularly from the midpoint of the chord by `fraction` of
 * the chord length (positive = clockwise, negative = counter-clockwise).
 * The calculation is done in a local ENU-like projection so the offset
 * looks perpendicular on the rendered map.
 */
function perpendicularWaypoint(
  origin: LatLng,
  destination: LatLng,
  fraction: number,
): LatLng {
  const midLat = (origin.lat + destination.lat) / 2;
  const mPerLng = metersPerDegLng(midLat);

  const dxMeters = (destination.lng - origin.lng) * mPerLng;
  const dyMeters = (destination.lat - origin.lat) * METERS_PER_DEG_LAT;

  // Rotate 90° clockwise: (x, y) → (y, -x).
  const perpXMeters = dyMeters;
  const perpYMeters = -dxMeters;

  const offsetXMeters = perpXMeters * fraction;
  const offsetYMeters = perpYMeters * fraction;

  const midLng = (origin.lng + destination.lng) / 2;
  return {
    lat: midLat + offsetYMeters / METERS_PER_DEG_LAT,
    lng: midLng + offsetXMeters / mPerLng,
  };
}
