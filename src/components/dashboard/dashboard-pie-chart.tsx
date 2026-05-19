"use client";

export type PieSlice = {
  id: string;
  label: string;
  value: number;
  color: string;
  /** Optional formatted value shown in legend (e.g. currency) */
  displayValue?: string;
};

const CHART = { size: 176, outer: 72, inner: 44 };

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlice(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  startDeg: number,
  endDeg: number
) {
  if (endDeg - startDeg >= 359.99) {
    return [
      `M ${cx} ${cy - outer}`,
      `A ${outer} ${outer} 0 1 1 ${cx - 0.01} ${cy - outer}`,
      `L ${cx - 0.01} ${cy - inner}`,
      `A ${inner} ${inner} 0 1 0 ${cx} ${cy - inner}`,
      "Z",
    ].join(" ");
  }

  const large = endDeg - startDeg > 180 ? 1 : 0;
  const o1 = polar(cx, cy, outer, startDeg);
  const o2 = polar(cx, cy, outer, endDeg);
  const i2 = polar(cx, cy, inner, endDeg);
  const i1 = polar(cx, cy, inner, startDeg);

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${i1.x} ${i1.y}`,
    "Z",
  ].join(" ");
}

export function DashboardPieChart({
  slices,
  emptyMessage = "No data yet.",
  centerLabel,
}: {
  slices: PieSlice[];
  emptyMessage?: string;
  centerLabel?: string;
}) {
  const filtered = slices.filter((s) => s.value > 0);
  const total = filtered.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <p className="py-8 text-center text-sm text-neutral-500">{emptyMessage}</p>;
  }

  const { size, outer, inner } = CHART;
  const cx = size / 2;
  const cy = size / 2;

  let cursor = 0;
  const arcs = filtered.map((slice) => {
    const sweep = (slice.value / total) * 360;
    const start = cursor;
    const end = cursor + sweep;
    cursor = end;
    return {
      ...slice,
      path: donutSlice(cx, cy, outer, inner, start, end),
      percent: Math.round((slice.value / total) * 100),
    };
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="drop-shadow-sm"
          role="img"
          aria-label="Pie chart"
        >
          {arcs.map((arc) => (
            <path
              key={arc.id}
              d={arc.path}
              fill={arc.color}
              className="transition-opacity hover:opacity-90"
            >
              <title>
                {arc.label}: {arc.displayValue ?? arc.value} ({arc.percent}%)
              </title>
            </path>
          ))}
        </svg>
        {centerLabel && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
              Total
            </span>
            <span className="max-w-[72px] truncate text-sm font-semibold text-neutral-900">
              {centerLabel}
            </span>
          </div>
        )}
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {arcs.map((arc) => (
          <li key={arc.id} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: arc.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate font-medium text-neutral-800">
              {arc.label}
            </span>
            <span className="shrink-0 tabular-nums text-neutral-500">{arc.percent}%</span>
            <span className="shrink-0 font-medium tabular-nums text-neutral-700">
              {arc.displayValue ?? arc.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
