import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import KpiCard from "../components/KpiCard";
import CategoryBarChart, {
  type CategoryBarDatum,
} from "../components/CategoryBarChart";
import StatusDonut, { type DonutSlice } from "../components/StatusDonut";
import ActivityHeatmap, {
  type HeatmapDay,
} from "../components/ActivityHeatmap";
import { useTickets } from "../services/tickets";
import { useAlerts } from "../services/alerts";
import { INCIDENT_CATEGORIES } from "../types/incidents";
import type {
  AlertRecord,
  AlertReason,
  IncidentCategory,
  Ticket,
  TicketStatus,
} from "../types/incidents";

const STATUS_ORDER: readonly TicketStatus[] = [
  "open",
  "assigned_security",
  "assigned_maintenance",
  "closed",
] as const;

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: "#9CA3AF",
  assigned_security: "#DC2626",
  assigned_maintenance: "#F59E0B",
  closed: "#16A34A",
};

const REASON_ORDER: readonly AlertReason[] = [
  "pause",
  "deviation",
  "manual",
  "timeout",
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const HEATMAP_DAYS = 7;

export default function StatsPage() {
  const { t, i18n } = useTranslation();
  const { tickets } = useTickets();
  const { alerts } = useAlerts();

  const ticketsTotal = tickets.length;
  const ticketsOpen = tickets.filter(
    (tk: Ticket): boolean => tk.status !== "closed",
  ).length;
  const alertsTotal = alerts.length;
  const alertsActive = alerts.filter(
    (a: AlertRecord): boolean => a.status === "active",
  ).length;

  const categoryData = useMemo<CategoryBarDatum[]>(
    () =>
      INCIDENT_CATEGORIES.map(
        (cat: IncidentCategory): CategoryBarDatum => ({
          category: cat,
          label: t(`incident.categories.${cat}.label`),
          count: tickets.filter((tk: Ticket): boolean => tk.category === cat)
            .length,
        }),
      ),
    [tickets, t],
  );

  const statusSlices = useMemo<DonutSlice[]>(
    () =>
      STATUS_ORDER.map(
        (status: TicketStatus): DonutSlice => ({
          key: status,
          label: t(`tickets.status.${status}`),
          count: tickets.filter((tk: Ticket): boolean => tk.status === status)
            .length,
          color: STATUS_COLORS[status],
        }),
      ),
    [tickets, t],
  );

  const alertsByReason = useMemo<
    Array<{ reason: AlertReason; count: number }>
  >(() => {
    const counts = REASON_ORDER.map((reason: AlertReason) => ({
      reason,
      count: alerts.filter((a: AlertRecord): boolean => a.reason === reason)
        .length,
    }));
    return counts.sort((a, b) => b.count - a.count);
  }, [alerts]);

  const heatmapData = useMemo<HeatmapDay[]>(() => {
    const dayFormatter = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
      weekday: "short",
      day: "numeric",
    });
    const days: HeatmapDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = HEATMAP_DAYS - 1; i >= 0; i -= 1) {
      const day = new Date(today.getTime() - i * DAY_MS);
      const dayStart = day.getTime();
      const dayEnd = dayStart + DAY_MS;
      const count = tickets.filter(
        (tk: Ticket): boolean =>
          tk.createdAt >= dayStart && tk.createdAt < dayEnd,
      ).length;
      days.push({
        key: String(dayStart),
        label: dayFormatter.format(day),
        count,
      });
    }
    return days;
  }, [tickets, i18n.resolvedLanguage]);

  const maxReasonCount = Math.max(1, ...alertsByReason.map((r) => r.count));

  return (
    <section className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-5xl lg:p-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("stats.heading")}
        </h1>
        <p className="mt-1 text-sm text-gray-600">{t("stats.subheading")}</p>
      </header>

      <section
        aria-labelledby="stats-kpis-heading"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <h2 id="stats-kpis-heading" className="sr-only">
          {t("stats.kpiHeading")}
        </h2>
        <KpiCard label={t("stats.kpi.totalTickets")} value={ticketsTotal} />
        <KpiCard
          label={t("stats.kpi.openTickets")}
          value={ticketsOpen}
          emphasis={ticketsOpen > 0 ? "urgent" : "default"}
        />
        <KpiCard label={t("stats.kpi.totalAlerts")} value={alertsTotal} />
        <KpiCard
          label={t("stats.kpi.activeAlerts")}
          value={alertsActive}
          emphasis={alertsActive > 0 ? "urgent" : "default"}
        />
      </section>

      <section
        aria-labelledby="stats-category-heading"
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <h2
          id="stats-category-heading"
          className="text-lg font-semibold text-gray-900"
        >
          {t("stats.charts.byCategory")}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t("stats.charts.byCategoryHint")}
        </p>
        <div className="mt-3">
          <CategoryBarChart
            data={categoryData}
            ariaLabel={t("stats.charts.byCategoryAria", {
              summary: categoryData
                .map((d) => `${d.label}: ${d.count}`)
                .join(", "),
            })}
          />
        </div>
      </section>

      <section
        aria-labelledby="stats-status-heading"
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <h2
          id="stats-status-heading"
          className="text-lg font-semibold text-gray-900"
        >
          {t("stats.charts.byStatus")}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t("stats.charts.byStatusHint")}
        </p>
        <div className="mt-3">
          <StatusDonut
            slices={statusSlices}
            totalLabel={t("stats.charts.totalLabel")}
            ariaLabel={t("stats.charts.byStatusAria", {
              summary: statusSlices
                .map((s) => `${s.label}: ${s.count}`)
                .join(", "),
            })}
          />
        </div>
      </section>

      <section
        aria-labelledby="stats-reason-heading"
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <h2
          id="stats-reason-heading"
          className="text-lg font-semibold text-gray-900"
        >
          {t("stats.charts.byReason")}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t("stats.charts.byReasonHint")}
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {alertsByReason.map(({ reason, count }) => {
            const width = Math.round((count / maxReasonCount) * 100);
            return (
              <li key={reason} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-gray-700">
                  {t(`alerts.reasons.${reason}`)}
                </span>
                <span
                  className="h-3 rounded bg-urjc-red"
                  style={{
                    width: count === 0 ? "2px" : `${Math.max(2, width)}%`,
                  }}
                  aria-hidden
                />
                <span className="w-8 text-right text-sm font-semibold tabular-nums text-gray-900">
                  {count}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        aria-labelledby="stats-heatmap-heading"
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      >
        <h2
          id="stats-heatmap-heading"
          className="text-lg font-semibold text-gray-900"
        >
          {t("stats.charts.lastWeek")}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t("stats.charts.lastWeekHint")}
        </p>
        <div className="mt-3 overflow-x-auto">
          <ActivityHeatmap
            days={heatmapData}
            ariaLabel={t("stats.charts.lastWeekAria", {
              summary: heatmapData
                .map((d) => `${d.label}: ${d.count}`)
                .join(", "),
            })}
          />
        </div>
      </section>
    </section>
  );
}
