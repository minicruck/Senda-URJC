import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import TicketsTable from "../components/TicketsTable";
import { useTickets } from "../services/tickets";
import type { Ticket } from "../types/incidents";

export default function MaintenancePage() {
  const { t } = useTranslation();
  const { tickets, close } = useTickets();

  const assigned = useMemo<Ticket[]>(
    () =>
      tickets.filter(
        (tk: Ticket): boolean =>
          tk.status === "assigned_maintenance" ||
          (tk.assignedTo === "maintenance" && tk.status !== "closed"),
      ),
    [tickets],
  );

  return (
    <section className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-5xl lg:p-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("maintenance.heading")}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {t("maintenance.description")}
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          {t("maintenance.ticketsHeading", { count: assigned.length })}
        </h2>
        <TicketsTable
          tickets={assigned}
          onClose={close}
          emptyKey="maintenance.noTickets"
        />
      </section>
    </section>
  );
}
