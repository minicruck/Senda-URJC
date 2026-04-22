import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appendAlert, loadAlerts, resolveAlert } from "./alerts";

function stubLocalStorage(): void {
  const store: Record<string, string> = {};
  vi.stubGlobal("localStorage", {
    getItem: (k: string): string | null => (k in store ? store[k] : null),
    setItem: (k: string, v: string): void => {
      store[k] = v;
    },
    removeItem: (k: string): void => {
      delete store[k];
    },
    clear: (): void => {
      for (const k of Object.keys(store)) delete store[k];
    },
  });
}

const BASE = {
  userId: "u1",
  userName: "Test User",
  userEmail: "test@urjc.es",
  recipientName: "Familia",
  reason: "manual" as const,
  location: { lat: 40.336, lng: -3.875 },
  destination: { lat: 40.337, lng: -3.874 },
  routeLabel: "principal",
};

describe("alerts service", () => {
  beforeEach(() => {
    stubLocalStorage();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("loadAlerts returns an empty array when nothing is stored", () => {
    expect(loadAlerts()).toEqual([]);
  });

  it("appendAlert persists a record with status 'active' and a recent triggeredAt", () => {
    const before = Date.now();
    const record = appendAlert(BASE);
    const after = Date.now();

    expect(record.status).toBe("active");
    expect(record.triggeredAt).toBeGreaterThanOrEqual(before);
    expect(record.triggeredAt).toBeLessThanOrEqual(after);

    const loaded = loadAlerts();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe(record.id);
  });

  it("resolveAlert(id) sets status to 'resolved' and stores resolvedAt", () => {
    const record = appendAlert(BASE);
    resolveAlert(record.id, "All good");
    const [loaded] = loadAlerts();
    expect(loaded.status).toBe("resolved");
    expect(loaded.resolutionNote).toBe("All good");
    expect(typeof loaded.resolvedAt).toBe("number");
  });

  it("loadAlerts returns records ordered by triggeredAt descending", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-03-01T09:00:00Z"));
    const a1 = appendAlert(BASE);
    vi.setSystemTime(new Date("2026-03-01T10:00:00Z"));
    const a2 = appendAlert(BASE);
    vi.setSystemTime(new Date("2026-03-01T11:00:00Z"));
    const a3 = appendAlert(BASE);

    const loaded = loadAlerts();
    expect(loaded.map((x) => x.id)).toEqual([a3.id, a2.id, a1.id]);
  });
});
