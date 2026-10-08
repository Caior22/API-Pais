# 🌍 WorldExplorer

Portal de consulta de países feito com **Next.js 14 (App Router)** e **TypeScript**, consumindo a
[Countries & Cities API (CountriesNow)](https://documenter.getpostman.com/view/1134062/T1LJjU52).
A API é gratuita e não exige chave.

> Projeto da prova prática de *Programação e Design para Web III* — FAETERJ Barra Mansa, 2026/1.

## O que o app faz

- **Busca** por país em português ou inglês (`brasil`, `japão`, `egypt`, `BR`…), com sugestões rápidas.
- **Cards** com bandeira (SVG + emoji), capital, população e moeda.
- **Página dedicada** (`/pais/[name]`) com gráfico de população 1960–2018, mapa de localização,
  códigos ISO, coordenadas e lista de estados/províncias.
- **Sobre** (`/sobre`) com os dados do aluno.
- Tema claro/escuro automático, layout responsivo, estados de carregamento, erro e “não encontrado”.

## Como configurar a variável de ambiente

Crie o arquivo `.env.local` na raiz do projeto (há um modelo em `.env.example`):

```bash
cp .env.example .env.local
```

Conteúdo:

```env
NEXT_PUBLIC_API_URL=https://countriesnow.space/api/v0.1
```

O `.env.local` já está no `.gitignore`. A URL base só é lida em `lib/countries.ts`,
nunca fica escrita direto nos componentes.

## Como rodar localmente

Requer Node.js 18.17 ou superior.

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>. Para gerar a versão de produção: `npm run build && npm start`.

## Estrutura

```
worldexplorer/
├── app/
│   ├── layout.tsx            # layout raiz (cabeçalho, rodapé)
│   ├── page.tsx              # tela principal com busca
│   ├── globals.css           # tema e estilos
│   ├── sobre/page.tsx        # rota estática /sobre
│   └── pais/[name]/
│       ├── page.tsx          # rota dinâmica /pais/:name
│       ├── loading.tsx · error.tsx · not-found.tsx
├── components/
│   ├── SearchBar.tsx         # campo de busca + botão
│   ├── CountryCard.tsx       # exibição do país (card e cabeçalho)
│   ├── PopulationChart.tsx   # gráfico SVG da população
│   └── LocationMap.tsx       # mapa-múndi esquemático
├── lib/
│   ├── countries.ts          # acesso à API (única leitura de NEXT_PUBLIC_API_URL)
│   └── format.ts             # formatação de números, moedas e coordenadas
├── .env.local                # NEXT_PUBLIC_API_URL
└── README.md
```

## Sobre a troca de API (RestCountries → CountriesNow)

A RestCountries saiu do ar, então o projeto usa a CountriesNow. Ela **não fornece** região,
sub-região, idiomas nem fusos horários, por isso esses campos foram substituídos por dados
que a API oferece:

| Requisito original            | Na CountriesNow                                        |
| ----------------------------- | ------------------------------------------------------ |
| nome oficial                  | nome em português (via `Intl`) + nome em inglês da API |
| capital                       | `/countries/capital`                                   |
| população                     | `/countries/population` (último ano: 2018)             |
| bandeira (emoji + SVG)        | `/countries/flag/unicode` e `/countries/flag/images`   |
| região                        | *indisponível* → coordenadas (`/countries/positions`)  |
| sub-região, idiomas, fusos    | *indisponíveis* → ISO, estados (`/countries/states`), série histórica |
| moedas                        | `/countries/currency`                                  |

A API não tem busca por nome, então o app baixa as listas (com cache) e filtra localmente.
Se a busca por população de um país falhar, ele usa a lista completa como plano B.

Antes de entregar, edite os seus dados em `app/sobre/page.tsx` (nome, matrícula e curso).
