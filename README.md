# Animoda

Discover Nature. Design Your Style.

Animoda is an AI-powered fashion platform for animal-inspired design, personal visualisation, and manufacturing requests with professional couturiers. It does not manage shipping or delivery.

**Phase 5** is approved. Phase 6A is verified on the Animoda Supabase project. Phase 6.1 stored three Emerald tree boa fashion samples and is awaiting approval. Phase 6.2, the remaining animals, and Phase 6C, accounts and the private gallery, have not started. The public landing page is at `/`. The animal catalogue is at `/animals`. The studio journey is at `/studio`. The design foundation review remains at `/foundation`. The first visit uses the Obsidian Atelier dark edition. The header can switch to the light edition. See [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md).

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

Copy `.env.example` into the gitignored `.env` when Supabase is configured. Phase 6A reads `SUPABASE_URL` and `SUPABASE_SECRET_KEY`, or `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, on the server. The secret key must not use a `NEXT_PUBLIC_` name. The sample report is `GET /api/admin/fashion-samples` and it also requires `FASHION_SAMPLE_ADMIN_TOKEN`. The migration has been applied to the Animoda project. See [docs/supabase-foundation.md](docs/supabase-foundation.md). Phase 5 reads `FASHION_CONCEPT_API_KEY` and `VIRTUAL_TRY_ON_API_KEY` on the server only. Both are empty in this repository, so the studio runs the labelled mock. Wildlife data comes from the public GBIF API, and the map uses OpenFreeMap.
