# Animoda

Discover Nature. Design Your Style.

Animoda is an AI-powered fashion platform for animal-inspired design, personal visualisation, and manufacturing requests with professional couturiers. It does not manage shipping or delivery.

This repository is in **Phase 3**, awaiting approval. The public landing page is at `/`. The animal catalogue is at `/animals`. The design foundation review remains at `/foundation`. See [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md).

## Develop

```bash
npm install
npm run dev
```

Open the landing page at `/` and the animal catalogue at `/animals`. Sample prices, atelier counts, and named houses are illustrative. A selected country on an animal profile filters GBIF occurrence records. It does not mark a native range.

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Copy `.env.example` when later phases need Supabase or an AI provider. Phase 3 reads no secrets. Wildlife data comes from the public GBIF API, and the map uses OpenFreeMap.
