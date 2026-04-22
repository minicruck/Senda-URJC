import type { LatLng } from "./route";

export type Role = "user" | "admin" | "security" | "maintenance";

export type IncidentCategory =
  | "lighting"
  | "feeling"
  | "obstacle"
  | "accessibility";

export type TicketStatus =
  | "open"
  | "assigned_security"
  | "assigned_maintenance"
  | "closed";

export type ServiceAssignee = "security" | "maintenance";

export interface TicketAuthor {
  id: string;
  displayName: string;
  email: string;
}

export interface Ticket {
  id: string;
  createdBy: TicketAuthor;
  category: IncidentCategory;
  description?: string;
  location: LatLng;
  createdAt: number;
  status: TicketStatus;
  assignedTo?: ServiceAssignee;
  resolvedAt?: number;
  resolutionNote?: string;
}

export type AlertStatus = "active" | "resolved";
export type AlertReason = "pause" | "deviation" | "manual" | "timeout";

export interface AlertRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  recipientName: string | null;
  reason: AlertReason;
  location: LatLng;
  destination: LatLng;
  routeLabel: string;
  triggeredAt: number;
  status: AlertStatus;
  resolvedAt?: number;
  resolutionNote?: string;
}

export const INCIDENT_CATEGORIES: readonly IncidentCategory[] = [
  "lighting",
  "feeling",
  "obstacle",
  "accessibility",
] as const;

export const ALL_ROLES: readonly Role[] = [
  "user",
  "admin",
  "security",
  "maintenance",
] as const;

export function rolePath(role: Role): string {
  switch (role) {
    case "user":
      return "/";
    case "admin":
      return "/admin";
    case "security":
      return "/security";
    case "maintenance":
      return "/maintenance";
  }
}
