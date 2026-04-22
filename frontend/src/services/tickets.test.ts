import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  appendTicket,
  assignTicket,
  closeTicket,
  loadTickets,
} from "./tickets";
import type { User } from "../auth/types";

const USER: User = {
  id: "u1",
  displayName: "Test User",
  email: "test@urjc.es",
  role: "user",
};

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

describe("tickets service", () => {
  beforeEach(() => {
    stubLocalStorage();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("loadTickets returns an empty array when nothing is stored", () => {
    expect(loadTickets()).toEqual([]);
  });

  it("appendTicket persists a ticket that loadTickets recovers", () => {
    const before = Date.now();
    const ticket = appendTicket({
      user: USER,
      category: "lighting",
      location: { lat: 40.336, lng: -3.875 },
    });
    const after = Date.now();

    expect(ticket.status).toBe("open");
    expect(ticket.category).toBe("lighting");
    expect(ticket.createdAt).toBeGreaterThanOrEqual(before);
    expect(ticket.createdAt).toBeLessThanOrEqual(after);
    expect(ticket.createdBy.email).toBe(USER.email);

    const loaded = loadTickets();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe(ticket.id);
  });

  it("assignTicket(id, 'security') sets status to 'assigned_security'", () => {
    const t = appendTicket({
      user: USER,
      category: "feeling",
      location: { lat: 40.336, lng: -3.875 },
    });
    assignTicket(t.id, "security");
    expect(loadTickets()[0].status).toBe("assigned_security");
    expect(loadTickets()[0].assignedTo).toBe("security");
  });

  it("assignTicket(id, 'maintenance') sets status to 'assigned_maintenance'", () => {
    const t = appendTicket({
      user: USER,
      category: "obstacle",
      location: { lat: 40.336, lng: -3.875 },
    });
    assignTicket(t.id, "maintenance");
    expect(loadTickets()[0].status).toBe("assigned_maintenance");
    expect(loadTickets()[0].assignedTo).toBe("maintenance");
  });

  it("closeTicket(id, 'note') sets status to 'closed' with resolutionNote and resolvedAt", () => {
    const t = appendTicket({
      user: USER,
      category: "accessibility",
      location: { lat: 40.336, lng: -3.875 },
    });
    closeTicket(t.id, "Fixed it");
    const [loaded] = loadTickets();
    expect(loaded.status).toBe("closed");
    expect(loaded.resolutionNote).toBe("Fixed it");
    expect(typeof loaded.resolvedAt).toBe("number");
  });

  it("loadTickets returns tickets ordered by createdAt descending", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-03-01T09:00:00Z"));
    const t1 = appendTicket({
      user: USER,
      category: "lighting",
      location: { lat: 40.336, lng: -3.875 },
    });
    vi.setSystemTime(new Date("2026-03-01T10:00:00Z"));
    const t2 = appendTicket({
      user: USER,
      category: "feeling",
      location: { lat: 40.336, lng: -3.875 },
    });
    vi.setSystemTime(new Date("2026-03-01T11:00:00Z"));
    const t3 = appendTicket({
      user: USER,
      category: "obstacle",
      location: { lat: 40.336, lng: -3.875 },
    });

    const loaded = loadTickets();
    expect(loaded.map((x) => x.id)).toEqual([t3.id, t2.id, t1.id]);
  });
});
