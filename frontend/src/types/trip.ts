import type { LatLng } from "./route";

export type TripState =
  | "preparing"
  | "in_progress"
  | "prealert"
  | "alert"
  | "completed"
  | "cancelled";

export type AnomalyKind = "pause" | "deviation" | "manual";

export type RecipientKind = "contact" | "volunteer";

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
}

export interface Recipient {
  id: string;
  kind: RecipientKind;
  name: string;
  /** Phone for contacts, email for volunteers. */
  details: string;
}

export interface Thresholds {
  pauseThresholdSec: number;
  deviationThresholdMeters: number;
}

export interface TripPositionSample {
  point: LatLng;
  /** Seconds from trip start at which this sample is reached. */
  atSec: number;
}

export interface TripTrack {
  samples: TripPositionSample[];
  totalDistanceMeters: number;
  totalDurationSec: number;
}

export interface AlertPayload {
  userName: string;
  userEmail: string;
  recipient: Recipient | null;
  lastKnownLocation: LatLng;
  destination: LatLng;
  routeWaypoints: LatLng[];
  routeLabel: string;
  triggeredAt: string;
  triggerReason: AnomalyKind | "timeout";
}
