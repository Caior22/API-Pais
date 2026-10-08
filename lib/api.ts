// Camada de acesso à CountriesNow API (https://countriesnow.space)
// A URL base vem da variável de ambiente NEXT_PUBLIC_API_URL (.env.local).

export type CountryBasic = {
  name: string;
  flag?: string; // URL da bandeira (imagem)
  unicodeFlag?: string; // emoji da bandeira
  currency?: string;
  dialCode?: string;
};

export type PopulationPoint = { year: number; value: number };

export type Country = CountryBasic & {
  capital: string | null;
  iso2: string | null;
  iso3: string | null;
  population: number | null;
  populationYear: number | null;
  populationHistory: PopulationPoint[];
  lat: number | null;
  lng: number | null;
};

const REVALIDATE = 60 * 60 * 24; // 24h de cache

function baseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "Variável NEXT_PUBLIC_API_URL não configurada. Crie o arquivo .env.local (veja o README)."
    );
  }
  return url.replace(/\/$/, "");
}

async function request<T>(path: string, body?: Record<string, string>): Promise<T | null> {
  const url = `${baseUrl()}${path}`;
  try {
    const res = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.error) return null;
    return json.data as T;
  } catch {
    return null;
  }
}

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// A API usa nomes em inglês; aceitamos alguns nomes em português.
const ALIASES: Record<string, string> = {
  brasil: "brazil",
  alemanha: "germany",
  franca: "france",
  espanha: "spain",
  italia: "italy",
  japao: "japan",
  china: "china",
  india: "india",
  russia: "russia",
  canada: "canada",
  mexico: "mexico",
  "estados unidos": "united states",
  eua: "united states",
  "reino unido": "united kingdom",
  inglaterra: "united kingdom",
  argentina: "argentina",
  chile: "chile",
  peru: "peru",
  colombia: "colombia",
  uruguai: "uruguay",
  paraguai: "paraguay",
  bolivia: "bolivia",
  venezuela: "venezuela",
  equador: "ecuador",
  suica: "switzerland",
  suecia: "sweden",
  noruega: "norway",
  dinamarca: "denmark",
  holanda: "netherlands",
  "paises baixos": "netherlands",
  belgica: "belgium",
  grecia: "greece",
  turquia: "turkey",
  egito: "egypt",
  marrocos: "morocco",
  "africa do sul": "south africa",
  angola: "angola",
  mocambique: "mozambique",
  australia: "australia",
  "nova zelandia": "new zealand",
  "coreia do sul": "south korea",
  "coreia do norte": "north korea",
  tailandia: "thailand",
  vietna: "vietnam",
  filipinas: "philippines",
  indonesia: "indonesia",
  polonia: "poland",
  irlanda: "ireland",
  islandia: "iceland",
  finlandia: "finland",
  "arabia saudita": "saudi arabia",
  "emirados arabes": "united arab emirates",
  "cabo verde": "cape verde",
};

export async function getCountryList(): Promise<CountryBasic[] | null> {
  const data = await request<CountryBasic[]>(
    "/countries/info?returns=currency,flag,unicodeFlag,dialCode"
  );
  if (!data) return null;
  return data.map((c) => ({
    ...c,
    name: c.name.trim(),
    flag: c.flag?.trim() || undefined,
    dialCode: c.dialCode?.trim() || undefined,
  }));
}

export async function searchCountries(query: string): Promise<CountryBasic[] | null> {
  const list = await getCountryList();
  if (!list) return null;

  const raw = normalize(query);
  const term = ALIASES[raw] ?? raw;
  if (!term) return [];

  return list
    .filter((c) => normalize(c.name).includes(term))
    .sort((a, b) => {
      const an = normalize(a.name);
      const bn = normalize(b.name);
      const score = (n: string) => (n === term ? 0 : n.startsWith(term) ? 1 : 2);
      return score(an) - score(bn) || an.localeCompare(bn);
    });
}

type CapitalData = { name: string; capital: string; iso2: string; iso3: string };
type PopulationData = { country: string; populationCounts: { year: number; value: number }[] };
type PositionData = { name: string; iso2: string; long: number | string; lat: number | string };

export async function enrichCountry(basic: CountryBasic): Promise<Country> {
  const [capitalData, populationData, positions] = await Promise.all([
    request<CapitalData>("/countries/capital", { country: basic.name }),
    request<PopulationData>("/countries/population", { country: basic.name }),
    request<PositionData[]>("/countries/positions"),
  ]);

  const history = (populationData?.populationCounts ?? [])
    .filter((p) => typeof p.value === "number" && p.value > 0)
    .map((p) => ({ year: p.year, value: p.value }));
  const last = history[history.length - 1];

  const iso2 = capitalData?.iso2 ?? null;
  const position = iso2 ? positions?.find((p) => p.iso2 === iso2) : undefined;

  return {
    ...basic,
    capital: capitalData?.capital?.trim() || null,
    iso2,
    iso3: capitalData?.iso3 ?? null,
    population: last?.value ?? null,
    populationYear: last?.year ?? null,
    populationHistory: history,
    lat: position ? Number(position.lat) : null,
    lng: position ? Number(position.long) : null,
  };
}

export async function getCountryDetails(name: string): Promise<Country | null> {
  const list = await getCountryList();
  if (!list) return null;
  const wanted = normalize(name);
  const basic =
    list.find((c) => normalize(c.name) === wanted) ??
    list.find((c) => normalize(c.name) === (ALIASES[wanted] ?? "")) ;
  if (!basic) return null;
  return enrichCountry(basic);
}
