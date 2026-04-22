import type { ReactNode } from "react";

export interface DonutSlice {
  key: string;
  label: string;
  count: number;
  color: string;
}

export interface StatusDonutProps {
  slices: DonutSlice[];
  ariaLabel: string;
  totalLabel: string;
}

/**
 * SVG donut chart with legend. Pure SVG, no chart library.
 */
export default function StatusDonut({
  slices,
  ariaLabel,
  totalLabel,
}: StatusDonutProps) {
  const total = slices.reduce(
    (acc: number, s: DonutSlice): number => acc + s.count,
    0,
  );
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 80;
  const innerR = 50;

  const arcs: ReactNode[] = [];
  let cumulative = 0;

  if (total > 0) {
    for (const slice of slices) {
      if (slice.count === 0) continue;
      const frac = slice.count / total;
      if (frac >= 1) {
        // Whole pie: render full outer disc as a single circle.
        arcs.push(
          <circle
            key={slice.key}
            cx={cx}
            cy={cy}
            r={outerR}
            fill={slice.color}
          />,
        );
        cumulative += frac;
        continue;
      }
      const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      const endAngle = (cumulative + frac) * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + outerR * Math.cos(startAngle);
      const y1 = cy + outerR * Math.sin(startAngle);
      const x2 = cx + outerR * Math.cos(endAngle);
      const y2 = cy + outerR * Math.sin(endAngle);
      const largeArc = frac > 0.5 ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      arcs.push(<path key={slice.key} d={d} fill={slice.color} />);
      cumulative += frac;
    }
  } else {
    arcs.push(<circle key="empty" cx={cx} cy={cy} r={outerR} fill="#E5E7EB" />);
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="shrink-0"
      >
        {arcs}
        <circle cx={cx} cy={cy} r={innerR} fill="#FFFFFF" />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="22"
          fontWeight="700"
          fill="#111827"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fill="#6B7280"
        >
          {totalLabel}
        </text>
      </svg>

      <ul className="flex flex-col gap-1 text-sm">
        {slices.map((s: DonutSlice) => {
          const pct = total === 0 ? 0 : Math.round((s.count / total) * 100);
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-3 w-3 shrink-0 rounded"
                style={{ backgroundColor: s.color }}
              />
              <span className="flex-1 text-gray-700">{s.label}</span>
              <span className="tabular-nums text-xs text-gray-500">
                {s.count} ({pct}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
