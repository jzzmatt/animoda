# Animoda

Discover Nature. Design Your Style.

Animoda is an AI-powered fashion platform for animal-inspired design, personal visualisation, and manufacturing requests with professional couturiers. It does not manage shipping or delivery.

This repository is in **Phase 1**. The running page is the design foundation, not the public website. See [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md).

## Develop

```bash
npm install
npm run dev
```

Open the foundation review at `/`.

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Copy `.env.example` when later phases need Supabase or an AI provider. Phase 1 does not read those values.
