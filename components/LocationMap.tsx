import { formatCoords } from "@/lib/format";

const W = 600;
const H = 300;

/** Mapa-múndi esquemático (projeção equirretangular) com a posição do país. */
export default function LocationMap({ lat, lng }: { lat: number | null; lng: number | null }) {
  if (lat === null || lng === null) return <p className="muted">Posição indisponível.</p>;

  const px = ((lng + 180) / 360) * W;
  const py = ((90 - lat) / 180) * H;
  const meridians = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
  const parallels = [-60, -30, 0, 30, 60];

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Posição em ${formatCoords(lat, lng)}`}>
        <rect width={W} height={H} rx="14" className="map__bg" />
        {meridians.map((m) => (
          <line key={m} x1={((m + 180) / 360) * W} x2={((m + 180) / 360) * W} y1="0" y2={H} className="map__grid" />
        ))}
        {parallels.map((p) => (
          <line
            key={p}
            x1="0"
            x2={W}
            y1={((90 - p) / 180) * H}
            y2={((90 - p) / 180) * H}
            className={p === 0 ? "map__equator" : "map__grid"}
          />
        ))}
        <circle cx={px} cy={py} r="16" className="map__pulse" />
        <circle cx={px} cy={py} r="6" className="map__dot" />
      </svg>
      <figcaption className="muted small">{formatCoords(lat, lng)}</figcaption>
    </figure>
  );
}
