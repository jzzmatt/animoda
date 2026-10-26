# Animoda

Discover Nature. Design Your Style.

Animoda is an AI-powered fashion platform for animal-inspired design, personal visualisation, and manufacturing requests with professional couturiers. It does not manage shipping or delivery.

This repository is in **Phase 5**, awaiting approval. The public landing page is at `/`. The animal catalogue is at `/animals`. The studio journey is at `/studio`. The design foundation review remains at `/foundation`. The first visit uses the Obsidian Atelier dark edition. The header can switch to the light edition. See [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md).

## Develop

```bash
npm install
npm run dev
```

Open the landing page at `/`, the animal catalogue at `/animals`, and the studio at `/studio`. Sample prices, atelier counts, and named houses are illustrative. A selected country on an animal profile filters GBIF occurrence records. It does not mark a native range. The studio keeps a portrait in the browser. Regenerating directions and requesting a try-on start a server job. With no provider key configured, that job is a labelled mock: the catalogue design stays the reference and no composite is made.

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Copy `.env.example` when a later phase needs Supabase. Phase 5 reads `FASHION_CONCEPT_API_KEY` and `VIRTUAL_TRY_ON_API_KEY` on the server only. Both are empty in this repository, so the studio runs the labelled mock. Wildlife data comes from the public GBIF API, and the map uses OpenFreeMap.
