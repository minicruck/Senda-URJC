import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import TicketsTable from "../components/TicketsTable";
import AlertsTable from "../components/AlertsTable";
import { useTickets } from "../services/tickets";
import { useAlerts } from "../services/alerts";

type Tab = "tickets" | "alerts";

export default function AdminPage() {
  const { t } = useTranslation();
  const { tickets, assign, close } = useTickets();
  const { alerts, resolve } = useAlerts();
  const [tab, setTab] = useState<Tab>("tickets");

  const openCount = useMemo(
    () => tickets.filter((tk) => tk.status !== "closed").length,
    [tickets],
  );
  const activeAlertCount = useMemo(
    () => alerts.filter((a) => a.status === "active").length,
    [alerts],
  );

  return (
    <section className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-5xl lg:p-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("admin.heading")}
        </h1>
        <p className="mt-1 text-sm text-gray-600">{t("admin.description")}</p>
      </header>

      <div
        role="tablist"
        aria-label={t("admin.tabsLabel")}
        className="flex border-b border-gray-200"
      >
        <TabButton
          active={tab === "tickets"}
          onClick={() => setTab("tickets")}
          label={t("admin.tabs.tickets", { count: openCount })}
          panelId="panel-tickets"
        />
        <TabButton
          active={tab === "alerts"}
          onClick={() => setTab("alerts")}
          label={t("admin.tabs.alerts", { count: activeAlertCount })}
          panelId="panel-alerts"
        />
      </div>

      {tab === "tickets" ? (
        <div id="panel-tickets" role="tabpanel">
          <TicketsTable
            tickets={tickets}
            onAssign={assign}
            onClose={close}
            emptyKey="admin.noTickets"
            showAssignActions
          />
        </div>
      ) : (
        <div id="panel-alerts" role="tabpanel">
          <AlertsTable
            alerts={alerts}
            onResolve={resolve}
            emptyKey="admin.noAlerts"
          />
        </div>
      )}
    </section>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  panelId: string;
}

function TabButton({ active, onClick, label, panelId }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      onClick={onClick}
      className={`min-h-tap px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-urjc-red ${
        active
          ? "border-b-2 border-urjc-red text-urjc-red"
          : "border-b-2 border-transparent text-gray-600 hover:text-urjc-red"
      }`}
    >
      {label}
    </button>
  );
}
