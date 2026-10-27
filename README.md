# Animoda

Discover Nature. Design Your Style.

Animoda is an AI-powered fashion platform for animal-inspired design, personal visualisation, and manufacturing requests with professional couturiers. It does not manage shipping or delivery.

**Phase 5** is approved. Phase 6A is verified on the Animoda Supabase project. Phase 6.1 and Phase 6.2 stored three images for each of the 37 catalogue animals. Phase 6B.1 presents those images as Fashion Samples and does not generate, delete, or overwrite them. Kids · Youth Couture can be selected. Men and Women variants stay unavailable until the stored images are reviewed. The audience migration is in the repository and has not been applied. Phase 6B.2 and Phase 6C have not started. The public landing page is at `/`. The animal catalogue is at `/animals`. The studio journey is at `/studio`. The design foundation review remains at `/foundation`. The first visit uses the Obsidian Atelier dark edition. The header can switch to the light edition. See [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) and [docs/reports/phase-6b1-fashion-sample-audit.md](docs/reports/phase-6b1-fashion-sample-audit.md).

## Develop

```bash
npm install
npm run dev
```

Open the landing page at `/`, the animal catalogue at `/animals`, and the studio at `/studio`. Sample prices, atelier counts, and named houses are illustrative. A selected country on an animal profile filters GBIF occurrence records. It does not mark a native range. The studio keeps a portrait in the browser. Choose an animal, then an available Fashion Sample. Personalized fashion does not upload the photograph and does not generate an image in this phase. Virtual try-on does not make a composite.

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Copy `.env.example` into the gitignored `.env` when Supabase is configured. Phase 6A reads `SUPABASE_URL` and `SUPABASE_SECRET_KEY`, or `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, on the server. The secret key must not use a `NEXT_PUBLIC_` name. The Phase 6A migration has been applied to the Animoda project. The Phase 6B.1 audience migration has not. See [docs/supabase-foundation.md](docs/supabase-foundation.md). Image generation reads `OPENAI_API_KEY` and `OPENAI_IMAGE_MODEL` on the server only. An empty model uses `gpt-image-2.5-flare`. `GET /api/admin/fashion-samples` stays closed because there is no account role yet. `scripts/catalogue-fashion-samples.ts` prints the sample report and generates only when `--generate` or `--regenerate` is passed. `npx tsx scripts/audit-fashion-samples.ts` rewrites the Fashion Sample audit JSON and does not generate images. Wildlife data comes from the public GBIF API, and the map uses OpenFreeMap.
