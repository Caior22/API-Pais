import Link from "next/link";
import type { CountrySummary } from "@/lib/countries";
import { currencyLabel, formatNumber } from "@/lib/format";

interface CountryCardProps {
  country: CountrySummary;
  /** "compact": card da lista de resultados. "detail": cabeçalho da página do país. */
  variant?: "compact" | "detail";
}

export default function CountryCard({ country, variant = "compact" }: CountryCardProps) {
  const href = `/pais/${encodeURIComponent(country.name)}`;
  const population =
    country.population !== null
      ? `${formatNumber(country.population)}${country.populationYear ? ` (${country.populationYear})` : ""}`
      : "—";

  const facts = [
    { label: "Capital", value: country.capital ?? "—" },
    { label: "População", value: population },
    { label: "Moeda", value: currencyLabel(country.currency) },
  ];

  const flag = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="flag"
      src={country.flagSvg}
      alt={`Bandeira de ${country.namePt}`}
      loading="lazy"
    />
  );

  if (variant === "detail") {
    return (
      <section className="hero-card">
        <div className="hero-card__flag">{flag}</div>
        <div className="hero-card__body">
          <p className="eyebrow">
            <span aria-hidden="true">{country.flagEmoji}</span> {country.iso2} · {country.iso3}
          </p>
          <h1 className="display">{country.namePt}</h1>
          {country.namePt !== country.name && <p className="muted">{country.name}</p>}
          <dl className="facts facts--row">
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    );
  }

  return (
    <article className="card">
      <div className="card__flag">
        {flag}
        <span className="card__emoji" aria-hidden="true">
          {country.flagEmoji}
        </span>
      </div>
      <div className="card__body">
        <h3 className="card__title">
          <Link href={href} className="card__link">
            {country.namePt}
          </Link>
        </h3>
        {country.namePt !== country.name && <p className="muted small">{country.name}</p>}
        <dl className="facts">
          {facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
        <span className="card__cta" aria-hidden="true">
          Ver detalhes <span className="arrow">→</span>
        </span>
      </div>
    </article>
  );
}
