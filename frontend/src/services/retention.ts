import { useEffect } from "react";

const STORAGE_EVENT = "senda:storage";
const TICKETS_KEY = "senda.tickets";
const ALERTS_KEY = "senda.alerts";

/** 24 hours in milliseconds. */
export const RETENTION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
/** How often the in-tab retention hook re-runs the purge (1 hour). */
const HOURLY_MS = 60 * 60 * 1000;

interface TimestampedItem {
  [key: string]: unknown;
}

function dispatchStorageEvent(key: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<{ key: string }>(STORAGE_EVENT, { detail: { key } }),
  );
}

/**
 * Purge in place a localStorage key that holds an array of items identified
 * by a numeric timestamp field. Returns true iff anything was removed.
 */
function purgeKey(
  key: string,
  timestampField: string,
  now: number,
  maxAgeMs: number,
): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return false;

    const items = parsed as TimestampedItem[];
    const kept = items.filter((item: TimestampedItem): boolean => {
      const value = item[timestampField];
      const t = typeof value === "number" ? value : Number(value);
      return Number.isFinite(t) && now - t <= maxAgeMs;
    });
    if (kept.length === items.length) return false;

    localStorage.setItem(key, JSON.stringify(kept));
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove tickets and alerts older than `maxAgeMs` from localStorage. Emits
 * the `senda:storage` custom event for each affected key so that any
 * mounted `useTickets` / `useAlerts` consumers refresh.
 * Implements RNF-18 in the prototype (local-storage variant).
 */
export function purgeExpiredData(
  maxAgeMs: number = RETENTION_MAX_AGE_MS,
): void {
  if (typeof localStorage === "undefined") return;
  const now = Date.now();
  const ticketsChanged = purgeKey(TICKETS_KEY, "createdAt", now, maxAgeMs);
  const alertsChanged = purgeKey(ALERTS_KEY, "triggeredAt", now, maxAgeMs);
  if (ticketsChanged) dispatchStorageEvent(TICKETS_KEY);
  if (alertsChanged) dispatchStorageEvent(ALERTS_KEY);
}

/**
 * React hook that runs the retention purge once on mount and then every
 * hour while the component stays alive. Intended to be mounted once at
 * the root of the application (e.g. in `App.tsx`).
 */
export function useDataRetention(
  maxAgeMs: number = RETENTION_MAX_AGE_MS,
): void {
  useEffect(() => {
    purgeExpiredData(maxAgeMs);
    const interval = window.setInterval(
      () => purgeExpiredData(maxAgeMs),
      HOURLY_MS,
    );
    return () => window.clearInterval(interval);
  }, [maxAgeMs]);
}
