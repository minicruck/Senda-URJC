export interface KpiCardProps {
  label: string;
  value: number | string;
  emphasis?: "default" | "urgent";
  hint?: string;
}

/**
 * Single-number KPI card used in the admin stats dashboard.
 */
export default function KpiCard({
  label,
  value,
  emphasis = "default",
  hint,
}: KpiCardProps) {
  const emphasised = emphasis === "urgent";
  return (
    <article
      className={`rounded-lg border bg-white p-4 shadow-sm ${
        emphasised ? "border-urjc-red" : "border-gray-200"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p
        className={`mt-1 text-3xl font-bold tabular-nums ${
          emphasised ? "text-urjc-red" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </article>
  );
}
