"use client";

import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container empty">
      <p className="eyebrow">Algo deu errado</p>
      <h1 className="display">Não foi possível carregar o país</h1>
      <p className="lead">{error.message || "Tente novamente em instantes."}</p>
      <div className="actions">
        <button className="btn" onClick={reset}>
          Tentar de novo
        </button>
        <Link href="/" className="btn btn--ghost">
          Voltar à busca
        </Link>
      </div>
    </div>
  );
}
