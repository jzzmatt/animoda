# Animoda

Discover Nature. Design Your Style.

Animoda is an AI-powered fashion platform for animal-inspired design, personal visualisation, and manufacturing requests with professional couturiers. It does not manage shipping or delivery.

**Phase 5** is approved. Phase 6 has not started. The public landing page is at `/`. The animal catalogue is at `/animals`. The studio journey is at `/studio`. The design foundation review remains at `/foundation`. The first visit uses the Obsidian Atelier dark edition. The header can switch to the light edition. See [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md).

## Develop

```bash
npm install
npm run dev
```

Open the landing page at `/`, the animal catalogue at `/animals`, and the studio at `/studio`. Sample prices, atelier counts, and named houses are illustrative. A selected country on an animal profile filters GBIF occurrence records. It does not mark a native range. The studio keeps a portrait in the browser until a try-on is requested. Regenerating concepts and requesting a try-on start a server job. OpenAI is the image provider. Without `OPENAI_API_KEY`, the job fails with a configuration message and does not invent an image. `ANIMODA_IMAGE_PROVIDER=demo` is an explicit labelled demo and does not call OpenAI.

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Copy `.env.example` when this server should call OpenAI or a later phase needs Supabase. Phase 5 reads `OPENAI_API_KEY` and the optional `OPENAI_IMAGE_MODEL` on the server only. Both are empty in this repository. Wildlife data comes from the public GBIF API, and the map uses OpenFreeMap.
