import { useCallback, useEffect, useState } from "react";
import type {
  IncidentCategory,
  ServiceAssignee,
  Ticket,
  TicketStatus,
} from "../types/incidents";
import type { LatLng } from "../types/route";
import type { User } from "../auth/types";

const STORAGE_KEY = "senda.tickets";
const STORAGE_EVENT = "senda:storage";

function read(): Ticket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Ticket[]) : [];
  } catch {
    return [];
  }
}

function write(tickets: Ticket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(
      new CustomEvent<{ key: string }>(STORAGE_EVENT, {
        detail: { key: STORAGE_KEY },
      }),
    );
  } catch {
    /* quota exceeded / unavailable: swallow */
  }
}

function generateId(): string {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadTickets(): Ticket[] {
  return read().sort(
    (a: Ticket, b: Ticket): number => b.createdAt - a.createdAt,
  );
}

export function saveTickets(tickets: Ticket[]): void {
  write(tickets);
}

export interface NewTicketInput {
  user: User;
  category: IncidentCategory;
  description?: string;
  location: LatLng;
}

export function appendTicket(input: NewTicketInput): Ticket {
  const ticket: Ticket = {
    id: generateId(),
    createdBy: {
      id: input.user.id,
      displayName: input.user.displayName,
      email: input.user.email,
    },
    category: input.category,
    description: input.description?.trim() || undefined,
    location: input.location,
    createdAt: Date.now(),
    status: "open",
  };
  write([ticket, ...read()]);
  return ticket;
}

export function updateTicket(id: string, patch: Partial<Ticket>): void {
  write(
    read().map((t: Ticket): Ticket => (t.id === id ? { ...t, ...patch } : t)),
  );
}

export function assignTicket(id: string, assignee: ServiceAssignee): void {
  const status: TicketStatus =
    assignee === "security" ? "assigned_security" : "assigned_maintenance";
  updateTicket(id, { status, assignedTo: assignee });
}

export function closeTicket(id: string, resolutionNote?: string): void {
  updateTicket(id, {
    status: "closed",
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

export interface UseTicketsApi {
  tickets: Ticket[];
  refresh: () => void;
  create: (input: NewTicketInput) => Ticket;
  assign: (id: string, assignee: ServiceAssignee) => void;
  close: (id: string, resolutionNote?: string) => void;
}

export function useTickets(): UseTicketsApi {
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  const refresh = useCallback(() => setTickets(loadTickets()), []);

  useEffect(() => subscribe(refresh), [refresh]);

  const create = useCallback<UseTicketsApi["create"]>(
    (input) => {
      const ticket = appendTicket(input);
      refresh();
      return ticket;
    },
    [refresh],
  );
  const assign = useCallback<UseTicketsApi["assign"]>(
    (id, assignee) => {
      assignTicket(id, assignee);
      refresh();
    },
    [refresh],
  );
  const close = useCallback<UseTicketsApi["close"]>(
    (id, note) => {
      closeTicket(id, note);
      refresh();
    },
    [refresh],
  );

  return { tickets, refresh, create, assign, close };
}
