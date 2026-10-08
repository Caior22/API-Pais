import type { PopulationPoint } from "@/lib/countries";
import { formatCompact } from "@/lib/format";

const W = 640;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 52 };

export default function PopulationChart({ data }: { data: PopulationPoint[] }) {
  if (data.length < 2) return <p className="muted">Sem série histórica disponível.</p>;

  const min = Math.min(...data.map((d) => d.value));
  const max = Math.max(...data.map((d) => d.value));
  const span = max - min || 1;
  const lo = Math.max(0, min - span * 0.15);
  const hi = max + span * 0.1;

  const x = (i: number) => PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom);

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)},${H - PAD.bottom} L${x(0).toFixed(1)},${H - PAD.bottom} Z`;

  const ticks = [lo, (lo + hi) / 2, hi];
  const first = data[0];
  const last = data[data.length - 1];
  const growth = ((last.value - first.value) / first.value) * 100;

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`População de ${first.year} a ${last.year}`}>
        <defs>
          <linearGradient id="popFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="chart__grid" />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="chart__label">
              {formatCompact(t)}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#popFill)" />
        <path d={line} className="chart__line" />
        <circle cx={x(data.length - 1)} cy={y(last.value)} r="4.5" className="chart__dot" />
        <text x={PAD.left} y={H - 8} className="chart__label">
          {first.year}
        </text>
        <text x={W - PAD.right} y={H - 8} textAnchor="end" className="chart__label">
          {last.year}
        </text>
      </svg>
      <figcaption className="muted small">
        {growth >= 0 ? "Crescimento" : "Variação"} de{" "}
        <strong>
          {growth >= 0 ? "+" : ""}
          {growth.toFixed(1).replace(".", ",")}%
        </strong>{" "}
        entre {first.year} e {last.year}.
      </figcaption>
    </figure>
  );
}
