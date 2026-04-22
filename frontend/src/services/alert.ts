import type { User } from "../auth/types";
import type { LatLng } from "../types/route";
import type { AlertPayload, AnomalyKind, Recipient } from "../types/trip";

export interface BuildAlertInput {
  user: User;
  recipient: Recipient | null;
  lastKnownLocation: LatLng;
  destination: LatLng;
  routeWaypoints: LatLng[];
  routeLabel: string;
  triggerReason: AnomalyKind | "timeout";
}

/**
 * Compose the payload of an incident alert (RF-32). Contains all the
 * information the recipient and the Security Service need to locate and
 * identify the user, plus context about the trip.
 */
export function buildAlertPayload(input: BuildAlertInput): AlertPayload {
  return {
    userName: input.user.displayName,
    userEmail: input.user.email,
    recipient: input.recipient,
    lastKnownLocation: input.lastKnownLocation,
    destination: input.destination,
    routeWaypoints: input.routeWaypoints,
    routeLabel: input.routeLabel,
    triggeredAt: new Date().toISOString(),
    triggerReason: input.triggerReason,
  };
}
