"use client";

import { FormEvent, useEffect, useState } from "react";

interface SearchBarProps {
  /** Valor inicial / sincronizado com a URL (?q=). */
  initialValue?: string;
  loading?: boolean;
  suggestions?: string[];
  onSearch: (query: string) => void;
}

export default function SearchBar({
  initialValue = "",
  loading = false,
  suggestions = [],
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  // Mantém o campo em dia quando a URL muda (botão voltar, chips, etc.).
  useEffect(() => setValue(initialValue), [initialValue]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSearch(value);
  }

  return (
    <div className="search">
      <form className="search__form" onSubmit={handleSubmit} role="search">
        <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          className="search__input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Digite o nome de um país…"
          aria-label="Nome do país"
          autoComplete="off"
          autoFocus
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="chips" aria-label="Sugestões de busca">
          <span className="chips__label">Experimente</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="chip"
              onClick={() => {
                setValue(s);
                onSearch(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
