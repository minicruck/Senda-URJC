import { useCallback, useEffect, useState } from "react";
import type { Contact, Thresholds, Volunteer } from "../types/trip";

const NAMESPACE = "senda.";
const KEYS = {
  contacts: `${NAMESPACE}contacts`,
  volunteers: `${NAMESPACE}volunteers`,
  thresholds: `${NAMESPACE}thresholds`,
} as const;

export const DEFAULT_THRESHOLDS: Thresholds = {
  pauseThresholdSec: 60,
  deviationThresholdMeters: 50,
};

export const PAUSE_THRESHOLD_RANGE = { min: 30, max: 300 } as const;
export const DEVIATION_THRESHOLD_RANGE = { min: 20, max: 200 } as const;

const SEED_CONTACTS: Contact[] = [
  { id: "seed-1", name: "Familia", phone: "+34 600 000 000" },
];

// Hardcoded volunteer directory — in production this comes from the backend.
export const MOCK_VOLUNTEERS: Volunteer[] = [
  { id: "vol-001", name: "Carlos Rivas", email: "carlos.rivas@urjc.es" },
  { id: "vol-002", name: "Lucía Vega", email: "lucia.vega@urjc.es" },
  { id: "vol-003", name: "Sergio Núñez", email: "sergio.nunez@urjc.es" },
];

const STORAGE_EVENT = "senda:storage";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(
      new CustomEvent<{ key: string }>(STORAGE_EVENT, { detail: { key } }),
    );
  } catch {
    // Quota exceeded or storage unavailable: swallow silently in prototype.
  }
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function loadContacts(): Contact[] {
  const stored = readJson<Contact[] | null>(KEYS.contacts, null);
  if (stored === null) {
    writeJson(KEYS.contacts, SEED_CONTACTS);
    return [...SEED_CONTACTS];
  }
  return stored;
}

export function saveContacts(contacts: Contact[]): void {
  writeJson(KEYS.contacts, contacts);
}

export function loadStoredVolunteers(): Volunteer[] {
  return readJson<Volunteer[]>(KEYS.volunteers, []);
}

export function saveStoredVolunteers(volunteers: Volunteer[]): void {
  writeJson(KEYS.volunteers, volunteers);
}

export function loadThresholds(): Thresholds {
  const stored = readJson<Partial<Thresholds> | null>(KEYS.thresholds, null);
  if (!stored) return { ...DEFAULT_THRESHOLDS };
  return {
    pauseThresholdSec: clampNumber(
      stored.pauseThresholdSec ?? DEFAULT_THRESHOLDS.pauseThresholdSec,
      PAUSE_THRESHOLD_RANGE.min,
      PAUSE_THRESHOLD_RANGE.max,
    ),
    deviationThresholdMeters: clampNumber(
      stored.deviationThresholdMeters ??
        DEFAULT_THRESHOLDS.deviationThresholdMeters,
      DEVIATION_THRESHOLD_RANGE.min,
      DEVIATION_THRESHOLD_RANGE.max,
    ),
  };
}

export function saveThresholds(thresholds: Thresholds): void {
  writeJson(KEYS.thresholds, thresholds);
}

/** Shared subscription to same-tab and cross-tab storage updates. */
function subscribeToKey(key: string, onChange: () => void): () => void {
  const localHandler = (e: Event): void => {
    const detail = (e as CustomEvent<{ key: string }>).detail;
    if (detail?.key === key) onChange();
  };
  const crossTabHandler = (e: StorageEvent): void => {
    if (e.key === key) onChange();
  };
  window.addEventListener(STORAGE_EVENT, localHandler);
  window.addEventListener("storage", crossTabHandler);
  return () => {
    window.removeEventListener(STORAGE_EVENT, localHandler);
    window.removeEventListener("storage", crossTabHandler);
  };
}

// ---------------------------------------------------------------------------
// Reactive hooks. Each one mirrors a localStorage entry and stays in sync
// across components and tabs.
// ---------------------------------------------------------------------------

export function useContacts(): [Contact[], (next: Contact[]) => void] {
  const [contacts, setContacts] = useState<Contact[]>(() => loadContacts());
  const update = useCallback((next: Contact[]): void => {
    setContacts(next);
    saveContacts(next);
  }, []);
  useEffect(
    () => subscribeToKey(KEYS.contacts, () => setContacts(loadContacts())),
    [],
  );
  return [contacts, update];
}

export function useStoredVolunteers(): [
  Volunteer[],
  (next: Volunteer[]) => void,
] {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(() =>
    loadStoredVolunteers(),
  );
  const update = useCallback((next: Volunteer[]): void => {
    setVolunteers(next);
    saveStoredVolunteers(next);
  }, []);
  useEffect(
    () =>
      subscribeToKey(KEYS.volunteers, () =>
        setVolunteers(loadStoredVolunteers()),
      ),
    [],
  );
  return [volunteers, update];
}

export function useThresholds(): [Thresholds, (next: Thresholds) => void] {
  const [thresholds, setThresholds] = useState<Thresholds>(() =>
    loadThresholds(),
  );
  const update = useCallback((next: Thresholds): void => {
    setThresholds(next);
    saveThresholds(next);
  }, []);
  useEffect(
    () =>
      subscribeToKey(KEYS.thresholds, () => setThresholds(loadThresholds())),
    [],
  );
  return [thresholds, update];
}
