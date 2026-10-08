"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CountryCard from "@/components/CountryCard";
import SearchBar from "@/components/SearchBar";
import { searchCountries, type CountrySummary } from "@/lib/countries";

const SUGGESTIONS = ["Brasil", "Japão", "Egito", "Canadá", "Portugal", "Austrália", "Argentina", "Índia"];

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; results: CountrySummary[] }
  | { status: "error"; message: string };

function Explorer() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const [state, setState] = useState<State>({ status: "idle" });

  // A busca fica na URL (?q=), então o botão "voltar" do navegador restaura os resultados.
  useEffect(() => {
    if (!query.trim()) {
      setState({ status: "idle" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    searchCountries(query)
      .then((results) => !cancelled && setState({ status: "done", results }))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Erro inesperado.",
          }),
      );
    return () => {
      cancelled = true;
    };
  }, [query]);

  function handleSearch(value: string) {
    const q = value.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <p className="eyebrow">Atlas interativo</p>
          <h1 className="display">
            Explore o mundo,
            <br />
            <em>um país por vez.</em>
          </h1>
          <p className="lead">
            Capital, população, moeda e bandeira de qualquer país — pesquise em português ou em inglês.
          </p>
          <SearchBar
            initialValue={query}
            loading={state.status === "loading"}
            suggestions={SUGGESTIONS}
            onSearch={handleSearch}
          />
        </div>
      </section>

      <section className="container results" aria-live="polite">
        {state.status === "loading" && (
          <div className="grid" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card card--skeleton" />
            ))}
          </div>
        )}

        {state.status === "error" && (
          <div className="notice notice--error">
            <strong>Não foi possível buscar agora.</strong>
            <span>{state.message}</span>
          </div>
        )}

        {state.status === "done" && state.results.length === 0 && (
          <div className="notice">
            <strong>Nenhum país encontrado para “{query}”.</strong>
            <span>Confira a grafia ou tente o nome em inglês.</span>
          </div>
        )}

        {state.status === "done" && state.results.length > 0 && (
          <>
            <p className="results__count">
              {state.results.length} {state.results.length === 1 ? "resultado" : "resultados"} para “{query}”
            </p>
            <div className="grid">
              {state.results.map((c) => (
                <CountryCard key={c.iso2} country={c} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Explorer />
    </Suspense>
  );
}
