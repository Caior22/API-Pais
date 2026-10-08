import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container empty">
      <p className="eyebrow">Erro 404</p>
      <h1 className="display">País não encontrado</h1>
      <p className="lead">Não achamos esse país na base da CountriesNow.</p>
      <Link href="/" className="btn">
        Voltar à busca
      </Link>
    </div>
  );
}
