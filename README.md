# Animoda

Discover Nature. Design Your Style.

Animoda is an AI-powered fashion platform for animal-inspired design, personal visualisation, and manufacturing requests with professional couturiers. It does not manage shipping or delivery.

**Phase 5** is approved. Phase 6A is verified on the Animoda Supabase project. Phase 6.1 and Phase 6.2 stored three fashion samples for each of the 37 catalogue animals. Phase 6C, accounts and the private gallery, has not started. The public landing page is at `/`. The animal catalogue is at `/animals`. The studio journey is at `/studio`. The design foundation review remains at `/foundation`. The first visit uses the Obsidian Atelier dark edition. The header can switch to the light edition. See [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md).

## Develop

```bash
npm install
npm run dev
```

Open the landing page at `/`, the animal catalogue at `/animals`, and the studio at `/studio`. Sample prices, atelier counts, and named houses are illustrative. A selected country on an animal profile filters GBIF occurrence records. It does not mark a native range. The studio keeps a portrait in the browser. Regenerating directions and requesting a try-on start a server job. A mock job finishes as mock completed: the catalogue design stays the reference and no composite is made. Real image generation uses the server-only `OPENAI_API_KEY` and, in this phase, only confirms the stored Emerald tree boa pilot.

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Copy `.env.example` into the gitignored `.env` when Supabase is configured. Phase 6A reads `SUPABASE_URL` and `SUPABASE_SECRET_KEY`, or `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, on the server. The secret key must not use a `NEXT_PUBLIC_` name. The sample report is `GET /api/admin/fashion-samples` and it also requires `FASHION_SAMPLE_ADMIN_TOKEN`. The migration has been applied to the Animoda project. See [docs/supabase-foundation.md](docs/supabase-foundation.md). Image generation reads `OPENAI_API_KEY` and `OPENAI_IMAGE_MODEL` on the server only. `FASHION_CONCEPT_API_KEY` and `VIRTUAL_TRY_ON_API_KEY` are not sent to a provider. An empty concept or try-on key finishes that studio job as mock completed. Wildlife data comes from the public GBIF API, and the map uses OpenFreeMap.
