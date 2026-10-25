# Animoda

Discover Nature. Design Your Style.

Animoda is an AI-powered fashion platform for animal-inspired design, personal visualisation, and manufacturing requests with professional couturiers. It does not manage shipping or delivery.

This repository is in **Phase 2**, awaiting approval. The public landing page is at `/`. The design foundation review remains at `/foundation`. See [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md).

## Develop

```bash
npm install
npm run dev
```

Open the landing page at `/`. Sample prices, atelier counts, and named houses are illustrative.

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Copy `.env.example` when later phases need Supabase or an AI provider. Phase 2 does not read those values.
