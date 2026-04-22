export interface LatLng {
  lat: number;
  lng: number;
}

export type SafetyLevel = "high" | "medium" | "low";

export type EndpointKind = "origin" | "destination";

export interface Route {
  id: string;
  /** Internal i18n key stem (e.g. "principal", "alternative1"). */
  label: string;
  waypoints: LatLng[];
  /** Perceived Safety Index, 0–100. */
  isp: number;
  safetyLevel: SafetyLevel;
  distanceKm: number;
  durationMin: number;
}

export interface GeocodeSuggestion {
  id: string;
  displayName: string;
  point: LatLng;
}
