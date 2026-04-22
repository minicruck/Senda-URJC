import { useCallback, useEffect, useState } from "react";
import type { AlertReason, AlertRecord, AlertStatus } from "../types/incidents";
import type { LatLng } from "../types/route";

const STORAGE_KEY = "senda.alerts";
const STORAGE_EVENT = "senda:storage";

function read(): AlertRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AlertRecord[]) : [];
  } catch {
    return [];
  }
}

function write(alerts: AlertRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    window.dispatchEvent(
      new CustomEvent<{ key: string }>(STORAGE_EVENT, {
        detail: { key: STORAGE_KEY },
      }),
    );
  } catch {
    /* swallow */
  }
}

function generateId(): string {
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadAlerts(): AlertRecord[] {
  return read().sort(
    (a: AlertRecord, b: AlertRecord): number => b.triggeredAt - a.triggeredAt,
  );
}

export function saveAlerts(alerts: AlertRecord[]): void {
  write(alerts);
}

export interface NewAlertInput {
  userId: string;
  userName: string;
  userEmail: string;
  recipientName: string | null;
  reason: AlertReason;
  location: LatLng;
  destination: LatLng;
  routeLabel: string;
}

export function appendAlert(input: NewAlertInput): AlertRecord {
  const record: AlertRecord = {
    id: generateId(),
    userId: input.userId,
    userName: input.userName,
    userEmail: input.userEmail,
    recipientName: input.recipientName,
    reason: input.reason,
    location: input.location,
    destination: input.destination,
    routeLabel: input.routeLabel,
    triggeredAt: Date.now(),
    status: "active",
  };
  write([record, ...read()]);
  return record;
}

export function updateAlert(id: string, patch: Partial<AlertRecord>): void {
  write(
    read().map(
      (a: AlertRecord): AlertRecord => (a.id === id ? { ...a, ...patch } : a),
    ),
  );
}

export function resolveAlert(id: string, resolutionNote?: string): void {
  const status: AlertStatus = "resolved";
  updateAlert(id, {
    status,
    resolvedAt: Date.now(),
    resolutionNote: resolutionNote?.trim() || undefined,
  });
}

function subscribe(onChange: () => void): () => void {
  const local = (e: Event): void => {
    const detail = (e as CustomEvent<{ key: string }>).detail;
    if (detail?.key === STORAGE_KEY) onChange();
  };
  const cross = (e: StorageEvent): void => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener(STORAGE_EVENT, local);
  window.addEventListener("storage", cross);
  return () => {
    window.removeEventListener(STORAGE_EVENT, local);
    window.removeEventListener("storage", cross);
  };
}

export interface UseAlertsApi {
  alerts: AlertRecord[];
  refresh: () => void;
  resolve: (id: string, note?: string) => void;
}

export function useAlerts(): UseAlertsApi {
  const [alerts, setAlerts] = useState<AlertRecord[]>(() => loadAlerts());
  const refresh = useCallback(() => setAlerts(loadAlerts()), []);

  useEffect(() => subscribe(refresh), [refresh]);

  const resolve = useCallback<UseAlertsApi["resolve"]>(
    (id, note) => {
      resolveAlert(id, note);
      refresh();
    },
    [refresh],
  );

  return { alerts, refresh, resolve };
}
