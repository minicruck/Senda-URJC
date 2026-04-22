import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { purgeExpiredData, RETENTION_MAX_AGE_MS } from "./retention";

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

describe("purgeExpiredData", () => {
  beforeEach(() => {
    stubLocalStorage();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does nothing when there is no data stored", () => {
    expect(() => purgeExpiredData()).not.toThrow();
    expect(localStorage.getItem("senda.tickets")).toBeNull();
    expect(localStorage.getItem("senda.alerts")).toBeNull();
  });

  it("keeps tickets and alerts whose timestamps are within the window", () => {
    const now = Date.now();
    const tickets = [
      { id: "t1", createdAt: now - 1_000 },
      { id: "t2", createdAt: now - 60_000 },
    ];
    const alerts = [{ id: "a1", triggeredAt: now - 5_000 }];
    localStorage.setItem("senda.tickets", JSON.stringify(tickets));
    localStorage.setItem("senda.alerts", JSON.stringify(alerts));

    purgeExpiredData();

    const storedTickets = JSON.parse(
      localStorage.getItem("senda.tickets") ?? "[]",
    );
    const storedAlerts = JSON.parse(
      localStorage.getItem("senda.alerts") ?? "[]",
    );
    expect(storedTickets).toHaveLength(2);
    expect(storedAlerts).toHaveLength(1);
  });

  it("removes tickets older than the retention window", () => {
    const now = Date.now();
    const tickets = [
      { id: "t-old", createdAt: now - RETENTION_MAX_AGE_MS - 1_000 },
      { id: "t-new", createdAt: now - 1_000 },
    ];
    localStorage.setItem("senda.tickets", JSON.stringify(tickets));

    purgeExpiredData();

    const stored = JSON.parse(localStorage.getItem("senda.tickets") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("t-new");
  });

  it("removes alerts older than the retention window (by triggeredAt)", () => {
    const now = Date.now();
    const alerts = [
      { id: "a-old", triggeredAt: now - RETENTION_MAX_AGE_MS - 1_000 },
      { id: "a-new", triggeredAt: now - 1_000 },
    ];
    localStorage.setItem("senda.alerts", JSON.stringify(alerts));

    purgeExpiredData();

    const stored = JSON.parse(localStorage.getItem("senda.alerts") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("a-new");
  });

  it("emits 'senda:storage' after actually removing data", () => {
    const now = Date.now();
    localStorage.setItem(
      "senda.tickets",
      JSON.stringify([
        { id: "t-old", createdAt: now - RETENTION_MAX_AGE_MS - 1_000 },
      ]),
    );

    const listener = vi.fn();
    window.addEventListener("senda:storage", listener as EventListener);
    purgeExpiredData();
    window.removeEventListener("senda:storage", listener as EventListener);

    expect(listener).toHaveBeenCalled();
  });

  it("does not emit when no data was removed", () => {
    const now = Date.now();
    localStorage.setItem(
      "senda.tickets",
      JSON.stringify([{ id: "t-new", createdAt: now - 1_000 }]),
    );

    const listener = vi.fn();
    window.addEventListener("senda:storage", listener as EventListener);
    purgeExpiredData();
    window.removeEventListener("senda:storage", listener as EventListener);

    expect(listener).not.toHaveBeenCalled();
  });
});
