import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CountryCard from "@/components/CountryCard";
import LocationMap from "@/components/LocationMap";
import PopulationChart from "@/components/PopulationChart";
import { getCountryByName } from "@/lib/countries";
import { formatCoords } from "@/lib/format";

interface PageProps {
  params: { name: string };
}

function decode(name: string) {
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const country = await getCountryByName(decode(params.name)).catch(() => null);
  return { title: country ? country.namePt : "País" };
}

export default async function PaisPage({ params }: PageProps) {
  const country = await getCountryByName(decode(params.name));
  if (!country) notFound();

  return (
    <div className="container detail">
      <Link href="/" className="back">
        ← Voltar à busca
      </Link>

      <CountryCard country={country} variant="detail" />

      <div className="detail__grid">
        <section className="panel">
          <h2 className="panel__title">Evolução da população</h2>
          <PopulationChart data={country.history} />
        </section>

        <section className="panel">
          <h2 className="panel__title">Localização</h2>
          <LocationMap lat={country.lat} lng={country.lng} />
        </section>
      </div>

      <div className="detail__grid">
        <section className="panel">
          <h2 className="panel__title">Identificação</h2>
          <dl className="facts">
            <div>
              <dt>Nome em inglês</dt>
              <dd>{country.name}</dd>
            </div>
            <div>
              <dt>Códigos ISO</dt>
              <dd>
                {country.iso2} · {country.iso3}
              </dd>
            </div>
            <div>
              <dt>Coordenadas</dt>
              <dd>{formatCoords(country.lat, country.lng)}</dd>
            </div>
            <div>
              <dt>Bandeira</dt>
              <dd>
                <span aria-hidden="true">{country.flagEmoji}</span>{" "}
                <a href={country.flagSvg} target="_blank" rel="noreferrer">
                  abrir SVG
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <h2 className="panel__title">
            Estados e províncias
            {country.states.length > 0 && <span className="badge">{country.states.length}</span>}
          </h2>
          {country.states.length > 0 ? (
            <ul className="tags">
              {country.states.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">Nenhuma divisão administrativa cadastrada na API.</p>
          )}
        </section>
      </div>
    </div>
  );
}
