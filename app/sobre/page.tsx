import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sobre" };

// ✏️ Preencha com os seus dados antes de entregar.
const ALUNO = {
  nome: "Caio Rodrigues",
  curso: "Analise de Sistemas — FAETERJ Barra Mansa",
};

export default function SobrePage() {
  return (
    <div className="container about">
      <Link href="/" className="back">
        ← Voltar para a página principal
      </Link>

      <p className="eyebrow">Sobre o projeto</p>
      <h1 className="display">WorldExplorer</h1>
      <p className="lead">
        Um portal de consulta de países que reúne capital, população, moeda e bandeira em uma
        interface limpa, construída com Next.js 14 e a CountriesNow API.
      </p>

      <dl className="panel facts about__facts">
        <div>
          <dt>Aluno</dt>
          <dd>{ALUNO.nome}</dd>
        </div>
         <div>
          <dt>Curso</dt>
          <dd>{ALUNO.curso}</dd>
        </div>
        <div>
          <dt>Disciplina</dt>
          <dd>Programação e Design para Web III · 2026/1</dd>
        </div>
      </dl>
    </div>
  );
}
