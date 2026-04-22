import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import TicketsTable from "../components/TicketsTable";
import AlertsTable from "../components/AlertsTable";
import { useTickets } from "../services/tickets";
import { useAlerts } from "../services/alerts";
import type { AlertRecord, Ticket } from "../types/incidents";

export default function SecurityPage() {
  const { t } = useTranslation();
  const { tickets, close } = useTickets();
  const { alerts, resolve } = useAlerts();

  const assigned = useMemo<Ticket[]>(
    () =>
      tickets.filter(
        (tk: Ticket): boolean =>
          tk.status === "assigned_security" ||
          (tk.assignedTo === "security" && tk.status !== "closed"),
      ),
    [tickets],
  );

  const activeAlerts = useMemo<AlertRecord[]>(
    () => alerts.filter((a: AlertRecord): boolean => a.status === "active"),
    [alerts],
  );

  return (
    <section className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-5xl lg:p-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("security.heading")}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {t("security.description")}
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          {t("security.alertsHeading", { count: activeAlerts.length })}
        </h2>
        <AlertsTable
          alerts={activeAlerts}
          onResolve={resolve}
          emptyKey="security.noAlerts"
        />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          {t("security.ticketsHeading", { count: assigned.length })}
        </h2>
        <TicketsTable
          tickets={assigned}
          onClose={close}
          emptyKey="security.noTickets"
        />
      </section>
    </section>
  );
}
