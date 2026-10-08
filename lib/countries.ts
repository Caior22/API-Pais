/**
 * Camada de acesso à CountriesNow API (https://countriesnow.space).
 * A URL base vem de NEXT_PUBLIC_API_URL (.env.local) — nunca fica fixa no código.
 *
 * Esta API não possui um endpoint "buscar por nome" com todos os dados, então
 * montamos um índice com as listas (bandeira, capital, moeda, posição, emoji)
 * e filtramos localmente. A população vem de um endpoint por país.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL;

/* ------------------------------------------------------------------ tipos */

export interface PopulationPoint {
  year: number;
  value: number;
}

/** Dados básicos de um país (vêm das listas da API). */
export interface CountryBase {
  name: string; // nome em inglês, como a API devolve (usado nas rotas)
  namePt: string; // nome em português (Intl.DisplayNames)
  iso2: string;
  iso3: string;
  flagSvg: string;
  flagEmoji: string;
  capital: string | null;
  currency: string | null;
  lat: number | null;
  lng: number | null;
}

/** País + último dado de população disponível. */
export interface CountrySummary extends CountryBase {
  population: number | null;
  populationYear: number | null;
}

/** País completo, usado na página dedicada. */
export interface Country extends CountrySummary {
  history: PopulationPoint[];
  states: string[];
}

interface Envelope<T> {
  error: boolean;
  msg: string;
  data: T;
}

interface FlagRow {
  name: string;
  flag: string;
  iso2: string;
  iso3: string;
}
interface CapitalRow {
  name: string;
  capital: string;
  iso2: string;
}
interface UnicodeRow {
  iso2: string;
  unicodeFlag: string;
}
interface CurrencyRow {
  iso2: string;
  currency: string;
}
interface PositionRow {
  iso2: string;
  lat: number;
  long: number;
}
interface PopulationRow {
  country: string;
  iso3: string;
  populationCounts: PopulationPoint[];
}
interface StatesData {
  states: { name: string; state_code?: string }[];
}

/* ------------------------------------------------------------ HTTP helper */

function url(path: string): string {
  if (!BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_URL não definida. Crie o arquivo .env.local (veja o README).",
    );
  }
  return `${BASE}${path}`;
}

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`A API respondeu com erro ${res.status}.`);
  const json = (await res.json()) as Envelope<T>;
  if (json.error) throw new Error(json.msg || "Erro ao consultar a API.");
  return json.data;
}

async function get<T>(path: string, cache: "default" | "no-store" = "default") {
  const res = await fetch(
    url(path),
    cache === "no-store"
      ? { cache: "no-store" }
      : { next: { revalidate: 60 * 60 * 24 } },
  );
  return unwrap<T>(res);
}

async function post<T>(path: string, body: unknown) {
  const res = await fetch(url(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: 60 * 60 * 24 },
  });
  return unwrap<T>(res);
}

/* ----------------------------------------------------------------- índice */

const INDEX_TTL = 60 * 60 * 1000;
let indexCache: { at: number; promise: Promise<CountryBase[]> } | null = null;

function portugueseName(iso2: string, fallback: string): string {
  try {
    return new Intl.DisplayNames(["pt-BR"], { type: "region" }).of(iso2) ?? fallback;
  } catch {
    return fallback;
  }
}

async function buildIndex(): Promise<CountryBase[]> {
  const [flags, capitals, unicode, currencies, positions] = await Promise.allSettled([
    get<FlagRow[]>("/countries/flag/images"),
    get<CapitalRow[]>("/countries/capital"),
    get<UnicodeRow[]>("/countries/flag/unicode"),
    get<CurrencyRow[]>("/countries/currency"),
    get<PositionRow[]>("/countries/positions"),
  ]);

  // A lista de bandeiras é a base do índice: sem ela não há o que mostrar.
  if (flags.status === "rejected") throw flags.reason;

  const rows = <T,>(r: PromiseSettledResult<T[]>): T[] =>
    r.status === "fulfilled" ? r.value : [];
  const byIso = <T extends { iso2: string }>(list: T[]) =>
    new Map(list.map((item) => [item.iso2, item] as const));

  const capitalMap = byIso(rows(capitals));
  const unicodeMap = byIso(rows(unicode));
  const currencyMap = byIso(rows(currencies));
  const positionMap = byIso(rows(positions));

  return flags.value
    .filter((f) => f.iso2)
    .map((f) => {
      const pos = positionMap.get(f.iso2);
      return {
        name: f.name,
        namePt: portugueseName(f.iso2, f.name),
        iso2: f.iso2,
        iso3: f.iso3,
        flagSvg: f.flag,
        flagEmoji: unicodeMap.get(f.iso2)?.unicodeFlag ?? "🏳️",
        capital: capitalMap.get(f.iso2)?.capital || null,
        currency: currencyMap.get(f.iso2)?.currency || null,
        lat: pos?.lat ?? null,
        lng: pos?.long ?? null,
      } satisfies CountryBase;
    })
    .sort((a, b) => a.namePt.localeCompare(b.namePt, "pt-BR"));
}

function getIndex(): Promise<CountryBase[]> {
  if (!indexCache || Date.now() - indexCache.at > INDEX_TTL) {
    const promise = buildIndex();
    indexCache = { at: Date.now(), promise };
    // Se falhar, não guarda o erro: a próxima chamada tenta de novo.
    promise.catch(() => {
      if (indexCache?.promise === promise) indexCache = null;
    });
  }
  return indexCache.promise;
}

/* --------------------------------------------------------------- população */

let allPopulation: Promise<Map<string, PopulationPoint[]>> | null = null;

/** Plano B: baixa a lista completa (grande) e indexa por ISO3. */
function getAllPopulation() {
  if (!allPopulation) {
    allPopulation = get<PopulationRow[]>("/countries/population", "no-store")
      .then(
        (list) =>
          new Map(list.map((row) => [row.iso3, row.populationCounts ?? []] as const)),
      )
      .catch((err) => {
        allPopulation = null;
        throw err;
      });
  }
  return allPopulation;
}

export async function getPopulationHistory(
  country: Pick<CountryBase, "name" | "iso3">,
): Promise<PopulationPoint[]> {
  try {
    const data = await post<PopulationRow>("/countries/population", {
      country: country.name,
    });
    if (data?.populationCounts?.length) return data.populationCounts;
  } catch {
    /* cai no plano B abaixo */
  }
  try {
    return (await getAllPopulation()).get(country.iso3) ?? [];
  } catch {
    return [];
  }
}

function latest(history: PopulationPoint[]) {
  const valid = history.filter((p) => typeof p.value === "number");
  return valid.length ? valid[valid.length - 1] : null;
}

async function toSummary(base: CountryBase): Promise<CountrySummary> {
  const last = latest(await getPopulationHistory(base));
  return {
    ...base,
    population: last?.value ?? null,
    populationYear: last?.year ?? null,
  };
}

/* ------------------------------------------------------------------ busca */

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Busca países pelo nome (em português ou inglês), ou pelo código ISO.
 * Ex.: "brasil", "brazil", "BR", "japao".
 */
export async function searchCountries(query: string, limit = 9): Promise<CountrySummary[]> {
  const q = normalize(query);
  if (!q) return [];

  const index = await getIndex();
  const ranked = index
    .map((c) => {
      const names = [normalize(c.name), normalize(c.namePt)];
      const codes = [c.iso2.toLowerCase(), c.iso3.toLowerCase()];
      let rank = -1;
      if (names.includes(q) || codes.includes(q)) rank = 0;
      else if (names.some((n) => n.startsWith(q))) rank = 1;
      else if (q.length >= 2 && names.some((n) => n.includes(q))) rank = 2;
      return { c, rank };
    })
    .filter((x) => x.rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map((x) => x.c);

  return Promise.all(ranked.map(toSummary));
}

/* ------------------------------------------------------- página do país */

async function getStates(name: string): Promise<string[]> {
  try {
    const data = await post<StatesData>("/countries/states", { country: name });
    return (data?.states ?? []).map((s) => s.name).filter(Boolean);
  } catch {
    return [];
  }
}

/** Busca um país específico (nome em inglês ou português) com todos os detalhes. */
export async function getCountryByName(name: string): Promise<Country | null> {
  const q = normalize(name);
  const index = await getIndex();
  const base = index.find((c) => normalize(c.name) === q || normalize(c.namePt) === q);
  if (!base) return null;

  const [history, states] = await Promise.all([
    getPopulationHistory(base),
    getStates(base.name),
  ]);
  const last = latest(history);
  return {
    ...base,
    history,
    states,
    population: last?.value ?? null,
    populationYear: last?.year ?? null,
  };
}
