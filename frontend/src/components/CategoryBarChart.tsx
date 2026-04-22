import type { IncidentCategory } from "../types/incidents";

export interface CategoryBarDatum {
  category: IncidentCategory;
  count: number;
  label: string;
}

export interface CategoryBarChartProps {
  data: CategoryBarDatum[];
  ariaLabel: string;
}

const CATEGORY_COLORS: Record<IncidentCategory, string> = {
  lighting: "#EAB308",
  feeling: "#7C3AED",
  obstacle: "#F97316",
  accessibility: "#2563EB",
};

/**
 * Horizontal bar chart for incident counts by category.
 * Pure SVG, no chart library. Accessible via role="img" + aria-label.
 */
export default function CategoryBarChart({
  data,
  ariaLabel,
}: CategoryBarChartProps) {
  const maxCount = Math.max(
    1,
    ...data.map((d: CategoryBarDatum): number => d.count),
  );
  const width = 320;
  const labelWidth = 120;
  const valueWidth = 36;
  const chartWidth = width - labelWidth - valueWidth;
  const barHeight = 22;
  const gap = 10;
  const height = data.length * (barHeight + gap);

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="xMinYMin meet"
    >
      {data.map((d: CategoryBarDatum, i: number) => {
        const y = i * (barHeight + gap);
        const w = (d.count / maxCount) * chartWidth;
        return (
          <g key={d.category}>
            <text x={0} y={y + barHeight * 0.7} fontSize="12" fill="#374151">
              {d.label}
            </text>
            <rect
              x={labelWidth}
              y={y}
              width={Math.max(2, w)}
              height={barHeight}
              rx={4}
              fill={CATEGORY_COLORS[d.category]}
              opacity={d.count === 0 ? 0.25 : 1}
            />
            <text
              x={labelWidth + Math.max(2, w) + 6}
              y={y + barHeight * 0.7}
              fontSize="12"
              fontWeight={600}
              fill="#111827"
            >
              {d.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
