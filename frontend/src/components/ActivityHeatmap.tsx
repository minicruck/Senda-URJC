export interface HeatmapDay {
  key: string;
  label: string;
  count: number;
}

export interface ActivityHeatmapProps {
  days: HeatmapDay[];
  ariaLabel: string;
}

/**
 * Linear heatmap showing how many tickets were created per day. The cell
 * colour is interpolated between white (no activity) and the URJC red.
 */
export default function ActivityHeatmap({
  days,
  ariaLabel,
}: ActivityHeatmapProps) {
  const maxCount = Math.max(1, ...days.map((d: HeatmapDay): number => d.count));
  const cellSize = 40;
  const gap = 8;
  const rowWidth = days.length * cellSize + Math.max(0, days.length - 1) * gap;
  const rowHeight = cellSize + 22;

  const intensityColor = (count: number): string => {
    if (count === 0) return "#F3F4F6";
    const t = count / maxCount;
    // Interpolate from near-white (#FCE7E7) to URJC red (#C00000).
    const r = Math.round(252 + (192 - 252) * t);
    const g = Math.round(231 + (0 - 231) * t);
    const b = Math.round(231 + (0 - 231) * t);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${rowWidth} ${rowHeight}`}
      className="w-full"
      preserveAspectRatio="xMinYMin meet"
    >
      {days.map((d: HeatmapDay, i: number) => {
        const x = i * (cellSize + gap);
        const fill = intensityColor(d.count);
        const textColor =
          d.count === 0
            ? "#9CA3AF"
            : d.count > maxCount * 0.5
              ? "#FFFFFF"
              : "#111827";
        return (
          <g key={d.key}>
            <rect
              x={x}
              y={0}
              width={cellSize}
              height={cellSize}
              rx={6}
              fill={fill}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
            <text
              x={x + cellSize / 2}
              y={cellSize / 2 + 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill={textColor}
            >
              {d.count}
            </text>
            <text
              x={x + cellSize / 2}
              y={cellSize + 14}
              textAnchor="middle"
              fontSize="10"
              fill="#6B7280"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
