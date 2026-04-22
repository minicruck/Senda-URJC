import type { LatLng } from "../types/route";

export interface Campus {
  id: string;
  name: string;
  center: LatLng;
}

export const COVERAGE_RADIUS_METERS = 500;

// URJC campuses — approximate centers provided with the ERS/brief.
export const CAMPUSES: readonly Campus[] = [
  { id: "mostoles", name: "Móstoles", center: { lat: 40.336, lng: -3.875 } },
  { id: "alcorcon", name: "Alcorcón", center: { lat: 40.343, lng: -3.818 } },
  { id: "vicalvaro", name: "Vicálvaro", center: { lat: 40.404, lng: -3.65 } },
  {
    id: "fuenlabrada",
    name: "Fuenlabrada",
    center: { lat: 40.282, lng: -3.794 },
  },
  { id: "aranjuez", name: "Aranjuez", center: { lat: 40.032, lng: -3.604 } },
] as const;

const EARTH_RADIUS_METERS = 6_371_000;
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Great-circle distance (meters) between two geographic points.
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

export function distanceToNearestCampus(point: LatLng): {
  campus: Campus;
  distance: number;
} {
  let best: { campus: Campus; distance: number } = {
    campus: CAMPUSES[0],
    distance: Infinity,
  };
  for (const campus of CAMPUSES) {
    const distance = haversineDistance(point, campus.center);
    if (distance < best.distance) {
      best = { campus, distance };
    }
  }
  return best;
}

/**
 * Whether the point is within 500 m of any URJC campus (RF-14).
 */
export function isWithinCoverage(point: LatLng): boolean {
  return distanceToNearestCampus(point).distance <= COVERAGE_RADIUS_METERS;
}
