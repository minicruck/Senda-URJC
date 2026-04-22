import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  IncidentCategory,
  ServiceAssignee,
  Ticket,
  TicketStatus,
} from "../types/incidents";

export interface TicketsTableProps {
  tickets: Ticket[];
  onAssign?: (id: string, assignee: ServiceAssignee) => void;
  onClose?: (id: string, resolutionNote?: string) => void;
  emptyKey: string;
  showAssignActions?: boolean;
}

const CATEGORY_BADGE: Record<IncidentCategory, string> = {
  lighting: "bg-yellow-100 text-yellow-800",
  feeling: "bg-purple-100 text-purple-800",
  obstacle: "bg-orange-100 text-orange-800",
  accessibility: "bg-blue-100 text-blue-800",
};

const STATUS_BADGE: Record<TicketStatus, string> = {
  open: "bg-gray-200 text-gray-800",
  assigned_security: "bg-red-100 text-red-800",
  assigned_maintenance: "bg-amber-100 text-amber-800",
  closed: "bg-green-100 text-green-800",
};

function truncate(text: string | undefined, length: number): string {
  if (!text) return "";
  return text.length <= length ? text : `${text.slice(0, length - 1)}…`;
}

export default function TicketsTable({
  tickets,
  onAssign,
  onClose,
  emptyKey,
  showAssignActions = false,
}: TicketsTableProps) {
  const { t, i18n } = useTranslation();
  const [closeDialogFor, setCloseDialogFor] = useState<string | null>(null);
  const [closeNote, setCloseNote] = useState<string>("");

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage, {
        dateStyle: "short",
        timeStyle: "short",
      }),
    [i18n.resolvedLanguage],
  );

  if (tickets.length === 0) {
    return (
      <div className="rounded border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600">
        {t(emptyKey)}
      </div>
    );
  }

  const confirmClose = (id: string): void => {
    onClose?.(id, closeNote);
    setCloseDialogFor(null);
    setCloseNote("");
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <ul className="divide-y divide-gray-200">
        {tickets.map((ticket: Ticket) => {
          const canAssign = showAssignActions && ticket.status === "open";
          const canClose = ticket.status !== "closed";
          return (
            <li key={ticket.id} className="p-3 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CATEGORY_BADGE[ticket.category]}`}
                  >
                    {t(`incident.categories.${ticket.category}.label`)}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_BADGE[ticket.status]}`}
                  >
                    {t(`tickets.status.${ticket.status}`)}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {dateFormatter.format(new Date(ticket.createdAt))}
                  </span>
                </div>
                <span className="text-[11px] text-gray-500">
                  {ticket.location.lat.toFixed(5)},{" "}
                  {ticket.location.lng.toFixed(5)}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-800">
                {ticket.description ? (
                  truncate(ticket.description, 100)
                ) : (
                  <em className="text-gray-400">
                    {t("tickets.noDescription")}
                  </em>
                )}
              </p>

              <p className="mt-1 text-[11px] text-gray-500">
                {t("tickets.byAuthor", {
                  name: ticket.createdBy.displayName,
                  email: ticket.createdBy.email,
                })}
              </p>

              {ticket.resolutionNote && ticket.status === "closed" && (
                <p className="mt-1 rounded bg-green-50 px-2 py-1 text-[11px] text-green-900">
                  {t("tickets.resolutionNote")}: {ticket.resolutionNote}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {canAssign && (
                  <>
                    <button
                      type="button"
                      onClick={() => onAssign?.(ticket.id, "security")}
                      className="min-h-tap rounded border border-urjc-red px-3 py-1 text-xs font-semibold text-urjc-red hover:bg-urjc-red hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red"
                    >
                      {t("tickets.actions.assignSecurity")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onAssign?.(ticket.id, "maintenance")}
                      className="min-h-tap rounded border border-amber-600 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                    >
                      {t("tickets.actions.assignMaintenance")}
                    </button>
                  </>
                )}
                {canClose && (
                  <button
                    type="button"
                    onClick={() => setCloseDialogFor(ticket.id)}
                    className="min-h-tap rounded border border-green-600 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                  >
                    {t("tickets.actions.close")}
                  </button>
                )}
              </div>

              {closeDialogFor === ticket.id && (
                <div className="mt-3 rounded border border-green-200 bg-green-50 p-3">
                  <label
                    className="block text-xs font-semibold text-green-900"
                    htmlFor={`note-${ticket.id}`}
                  >
                    {t("tickets.closeNoteLabel")}
                  </label>
                  <textarea
                    id={`note-${ticket.id}`}
                    value={closeNote}
                    onChange={(e) => setCloseNote(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded border border-green-300 bg-white p-2 text-sm focus:border-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => confirmClose(ticket.id)}
                      className="min-h-tap rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                    >
                      {t("tickets.actions.confirmClose")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCloseDialogFor(null);
                        setCloseNote("");
                      }}
                      className="min-h-tap rounded border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red"
                    >
                      {t("incident.cancel")}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
