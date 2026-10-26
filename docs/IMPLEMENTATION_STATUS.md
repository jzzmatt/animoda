# Animoda implementation status

## Project overview

- Product name: Animoda
- Tagline: Discover Nature. Design Your Style.
- Approved Stitch UI status: Approved designs live in the private Stitch project **Animoda Fashion Design System**, `projects/11446106471838367658`, updated 25 October 2026 at 10:50 UTC (11:50 Europe/London). The written design system uses Inter, light mode, forest green `#064E3B`, and roundness `ROUND_EIGHT`. A separate Stitch project, AzulSet, is unrelated and is not a source for Animoda.
- Current repository architecture: Greenfield Next.js App Router application. The initial commit contained only a one-line README. Phase 1 added the design-token layer, accessible UI primitives, and a foundation review page at `/`.
- Selected technology stack:
  - Next.js 16.4.3 (App Router, Turbopack)
  - React 19.3.1 and React DOM 19.3.1
  - TypeScript 6.0.3 with `strict`
  - Tailwind CSS 4.3.3
  - ESLint 10.13.0 with `eslint-config-next` 16.4.3
  - Vitest 5.0.5
- Important architecture decisions:
  - Keep the App Router. The repository had no existing framework to preserve.
  - Leave Cache Components off until a phase fetches or caches data. Next.js 16.4 enables them in `create-next-app`; this foundation has no cached data yet.
  - Follow the colour roles embedded in the generated Stitch screens for components. Keep the written brand hexes as extra tokens where they differ.
  - Use Inter for interface text. Use Playfair Display for the editorial italic, because the approved Studio screens load it and the landing tagline is set in a serif italic.
  - Use Material Symbols Outlined, the icon set in the approved screens. `next/font` does not ship that family, so the root layout loads the same Google Fonts stylesheet the screens use.
  - The foundation review now lives at `/foundation`. The public landing page is `/`.
  - Keep product localisation for Phase 9. This foundation review is in English, matching the approved screens. Portuguese remains the planned default language.
  - Keep secrets on the server. Phase 1 reads no credentials. `.env.example` lists later names with empty or non-secret placeholders. Phase 5 reads `OPENAI_API_KEY` and the optional `OPENAI_IMAGE_MODEL` on the server only. A missing key fails the job with a configuration message. `ANIMODA_IMAGE_PROVIDER=demo` is an explicit labelled demo and does not call OpenAI.

## Approved design mapping

Stitch screen inventory used as the UI source of truth:

| Screen | Stitch id | Phase |
| --- | --- | --- |
| Animoda — Landing Page | `bb5a18bbe54f4428aea65041113914bc` | 2 |
| Animoda — Landing Page (Dark Mode) | `68edc16cca97489f95d3d46a0491fcd4` | Public site. Obsidian Atelier edition, switched from the header. |
| Animal Catalogue & Discovery | `d83683226b7a44d89ef144a22837994f` | 3 |
| Animal Detail & Fashion Inspiration | `98257c77296b4199a7cd27c40b52e29d` | 3 |
| Studio Step 1 — Your Photograph | `d0cd90ea87224048aa443ea17cdba487` | 4 |
| Studio Step 2 — Choose Animal | `baea21b951dd44b9a329bd033ef1b951` | 4 |
| AI Fashion Suggestions | `bd956874f6a24242a59f93f87cbe2476` | 4 |
| AI Fashion Suggestions (Dark Mode) | `3b6bf4d9a4094ef8a63fb3ba25d90829` | 4. The same studio pages use the Obsidian Atelier tokens. |
| Studio Step 4 — Your Personalized Look | `045753140aac4ea7b117287e04c0e3c4` | 4 |
| Studio Step 5 — Next Steps & Couturier | `4439be6f0b954ffd91cdbb8125a045a6` | 4 for the review step; manufacturing detail continues in Phase 7 |
| Animoda Haute Couture Platform (mobile, 390px) | `7eae1b92b5944d19b4246c6ecf10bc7b` | Reference only. The screenshot resource is empty. |
| DESIGN.md | `17633587558025486899` | Design-system source, already reflected in the project theme |

Landing photographs used by the approved screen are vendored under `public/stitch/`. The wordmark is the cropped lockup `logo-lockup.png`. The stock profile photograph from the screen is not used.

Landing page sections, in the order of the approved HTML:

1. Editorial hero, with Create My Look and Explore Animals
2. Popular animals
3. Four-pillar process: Morphology Discovery, AI Fashion Studio, Virtual Try-On, Couturier Guild
4. Signature atelier pieces, with audience chips
5. Couturier guild spotlight
6. Closing banner
7. Footer: Discoveries, Couture House, newsletter, Privacy Charter, Terms of Service, Ethical Sourcing, Atelier Network

Public paths named in the screens: `discover`, `animal-catalog`, `marketplace`, `studio`, `couturiers`, `how-it-works`, `wishlist`, `create-look`, `studio-step-1` through `studio-step-5`, `privacy`, `legal`, `ethical-sourcing`, `contact`.

There is no dedicated Stitch screen for the geographic explorer, My Creations, authentication, the couturier dashboard, quotations, or administration. Those phases still follow the product specification and reuse these visual primitives.

## Phase tracking

### Phase 1 — Repository assessment and UI foundation

- Status: APPROVED
- Scope: Inspect the repository and Stitch designs, record architecture, add design tokens and reusable primitives, write this status document, list missing credentials, and plan Phase 2.
- Completed work:
  - Confirmed the repository had no application code, routes, database, or tests.
  - Read the Animoda Stitch project, its design system, the landing page HTML, and the Studio Step 1 HTML.
  - Added screen colour roles, type scale, spacing, shadows, and the written brand hexes.
  - Added primitives used by those screens: button, icon button, chip, badge, media card, text field, studio stepper, and wordmark.
  - Added a foundation review at `/` so the primitives can be checked together.
  - Recorded the Phase 2 plan below.
- Files created or modified:
  - `README.md`
  - `.env.example`
  - `.gitignore`
  - `package.json`
  - `package-lock.json`
  - `tsconfig.json`
  - `next.config.ts`
  - `postcss.config.mjs`
  - `eslint.config.mjs`
  - `vitest.config.ts`
  - `app/globals.css`
  - `app/layout.tsx`
  - `app/page.tsx`
  - `app/icon.svg`
  - `src/design/tokens.ts`
  - `src/design/tokens.test.ts`
  - `src/lib/cn.ts`
  - `src/foundation/copy.ts`
  - `src/components/ui/icon.tsx`
  - `src/components/ui/button.tsx`
  - `src/components/ui/icon-button.tsx`
  - `src/components/ui/chip.tsx`
  - `src/components/ui/badge.tsx`
  - `src/components/ui/media-card.tsx`
  - `src/components/ui/text-field.tsx`
  - `src/components/ui/stepper.tsx`
  - `src/components/ui/wordmark.tsx`
  - `src/components/ui/primitives.test.tsx`
  - `src/components/foundation/foundation-gallery.tsx`
  - `docs/IMPLEMENTATION_STATUS.md`
- Database or configuration changes: None. No Supabase project, migration, or storage bucket was created.
- Tests and build results (25 October 2026, Europe/London):
  - `npm test`: 9 tests passed (token integrity and primitive markup).
  - `npx tsc --noEmit`: passed.
  - `npx eslint .`: passed with no warnings.
  - `npx next build`: passed. Static routes `/` and `/icon.svg`.
  - Browser check against the dev server in headless Chrome: desktop 1440px and mobile 390px had no horizontal overflow. Choosing Women updated the audience status and `aria-pressed`. Choosing step 4 moved `aria-current`. The specimen favorite control announced that nothing was stored. Material Symbols Outlined loaded. The production build was run after these checks; the dev-only Next.js badge is absent from production.
- Known issues: See the register below.
- Missing credentials or external configuration: See the credentials section below.
- Outstanding tasks: None in this phase.
- Approval state and date: Approved on 25 October 2026 at 11:12 Europe/London, when the next phase was explicitly approved.

### Phase 2 — Public website and navigation

- Status: APPROVED
- Scope: Landing page, public navigation and footer, marketplace preview, featured designs, featured couturiers, responsive layout, SEO metadata, and public informational pages.
- Completed work:
  - Replaced `/` with the light landing page in the approved section order: hero, fauna rail, four pillars, signature pieces, couturier spotlight, closing banner, footer.
  - Moved the design-foundation review to `/foundation`.
  - Added the sticky public header, an accessible menu below the desktop breakpoint, and the footer with legal links.
  - Added public pages for the marketplace preview, couturiers, how it works, privacy, terms, and ethics.
  - Added forthcoming destinations for animals, studio, wishlist, account, and notices so approved navigation has a real page. The animals page also shows the eight landing specimens.
  - Vendored the landing photographs and the cropped wordmark. Sample prices, houses, counts, and fit figures stay labelled as illustrative. The newsletter form discards the address in the browser.
  - Set English SEO titles and an Open Graph description. User-facing landing strings live in `src/content/site.ts` for Phase 9. Portuguese remains the planned default and was not invented here.
- Files created or modified:
  - `README.md`
  - `app/layout.tsx`
  - `app/page.tsx`
  - `app/foundation/page.tsx`
  - `app/marketplace/page.tsx`
  - `app/couturiers/page.tsx`
  - `app/how-it-works/page.tsx`
  - `app/privacy/page.tsx`
  - `app/terms/page.tsx`
  - `app/ethics/page.tsx`
  - `app/animals/page.tsx`
  - `app/studio/page.tsx`
  - `app/wishlist/page.tsx`
  - `app/account/page.tsx`
  - `app/notices/page.tsx`
  - `src/content/site.ts`
  - `src/content/site.test.ts`
  - `src/components/layout/public-shell.tsx`
  - `src/components/layout/site-header.tsx`
  - `src/components/layout/site-footer.tsx`
  - `src/components/public/editorial-image.tsx`
  - `src/components/public/text-page.tsx`
  - `src/components/landing/landing-page.tsx`
  - `src/components/landing/hero.tsx`
  - `src/components/landing/animal-rail.tsx`
  - `src/components/landing/pillars.tsx`
  - `src/components/landing/lookbook.tsx`
  - `src/components/landing/couturier-spotlight.tsx`
  - `src/components/landing/closing-banner.tsx`
  - `src/components/landing/landing.test.tsx`
  - `public/stitch/` (landing photographs and `logo-lockup.png`)
  - `docs/IMPLEMENTATION_STATUS.md`
- Database or configuration changes: None. No Supabase project, migration, storage bucket, or environment secret was created.
- Tests and build results (25 October 2026, Europe/London):
  - `npm test`: 15 tests passed (tokens, primitives, audience filter, landing markup, header routes, footer).
  - `npx tsc --noEmit`: passed.
  - `npx eslint .`: passed with no warnings.
  - `npx next build`: passed. Static routes `/`, `/account`, `/animals`, `/couturiers`, `/ethics`, `/foundation`, `/how-it-works`, `/marketplace`, `/notices`, `/privacy`, `/studio`, `/terms`, `/wishlist`, and `/icon.svg`.
  - Browser check against the dev server in headless Chrome: desktop 1440px and mobile 390px had no horizontal overflow. Women hid the other sample cards. Unisex showed the empty state. Marking a look announced that no wishlist was saved. Newsletter submit showed that the address was not stored. Marketplace states the three offer kinds, and Details lands on `#zebra-gown`. Mobile menu opened and reached Animal Catalog. The Paris stamp stays inside the 390px width. The dev-only Next.js badge is absent from production.
- Known issues: See the register below.
- Missing credentials or external configuration: None required for this labelled preview. The credentials table is unchanged.
- Outstanding tasks: None in this phase.
- Approval state and date: Approved on 25 October 2026 at 13:13 Europe/London, when the next phase was explicitly approved.

### Phase 3 — Animal catalogue and geographic discovery

- Status: AWAITING APPROVAL
- Scope: Catalogue, search, filters, animal profile, fashion inspiration, geographic explorer, wildlife data, attribution, and a labelled development dataset if the live source is unavailable.
- Completed work:
  - Replaced the Phase 2 notice at `/animals` with the light catalogue from the approved Animal Catalogue screen: search, class, region-tag, and colour filters, and species cards.
  - Added a profile at `/animals/[slug]` from the approved Animal Detail screen: taxonomy, design reading, swatches, gallery, sample fashion directions, and a habitat tab.
  - Wired taxonomy, distribution rows, and occurrence points to the public GBIF API. Each profile quotes the GBIF species page. A development snapshot captured on 25 October 2026 is used when a live request fails.
  - Added a MapLibre occurrence map with the keyless OpenFreeMap Liberty style. A country filter, including the Democratic Republic of the Congo, filters occurrence records. The page states that a selected country does not mark a species as native. Plains zebra distribution rows do not list that country.
  - Kept the landing “Viper” tile honest: the photograph is Corallus caninus, the emerald tree boa. The tiger lookbook species has a profile. Marine Life and Oceania were real empty states in this curated sample. Marine Life was filled later; Oceania is still empty.
  - Left Studio generation, accounts, and the live marketplace closed.
- Files created or modified:
  - `app/animals/page.tsx`
  - `app/animals/[slug]/page.tsx`
  - `app/api/wildlife/[slug]/route.ts`
  - `src/content/catalogue.ts`
  - `src/content/catalogue.test.ts`
  - `src/content/wildlife-snapshot.json`
  - `src/content/site.ts`
  - `src/server/wildlife.ts`
  - `src/components/catalogue/catalogue-browser.tsx`
  - `src/components/catalogue/animal-profile.tsx`
  - `src/components/catalogue/habitat-panel.tsx`
  - `src/components/catalogue/occurrence-map.tsx`
  - `src/components/landing/animal-rail.tsx`
  - `src/components/landing/lookbook.tsx`
  - `public/maplibre-gl-worker.js`
  - `public/stitch/animal-penguin.jpg`
  - `public/stitch/animal-zebra-savanna.jpg`
  - `public/stitch/zebra-look-gown.jpg`
  - `public/stitch/zebra-look-tuxedo.jpg`
  - `public/stitch/zebra-look-kids.jpg`
  - `public/stitch/zebra-look-trench.jpg`
  - `package.json`
  - `package-lock.json`
  - `README.md`
  - `docs/IMPLEMENTATION_STATUS.md`
- Database or configuration changes: None. No Supabase project was created. GBIF and OpenFreeMap need no key.
- Tests and build results (25 October 2026, Europe/London):
  - `npm test`: 18 tests passed, including the plains-zebra country caution.
  - `npm run typecheck`: passed.
  - `npm run lint`: passed with no warnings.
  - `npm run build`: passed. `/animals` is static. Ten species profiles are prerendered. `/api/wildlife/[slug]` stays dynamic.
  - Browser check in headless Chrome: desktop 1440px and mobile 390px had no horizontal overflow. Searching “viper” showed only the emerald tree boa. Marine Life showed the empty state. The plains zebra habitat tab loaded a live GBIF map, and the Democratic Republic of the Congo filter showed 14 occurrence coordinates with the native-range caution. The map worker loaded. The dev-only Next.js badge is absent from production.
- Known issues: See the register below.
- Missing credentials: None for GBIF or the map style. The other credentials are unchanged.
- Outstanding tasks: None in this phase.
- Approval state and date: Approved on 25 October 2026 at 19:16 Europe/London, when the next phase was explicitly requested.

### Phase 4 — Simplified Animoda Studio

- Status: APPROVED
- Scope: The five-step guided journey, session state, back navigation, validation, loading, and failure recovery. UI and workflow review before any real provider work.
- Completed work:
  - Replaced the studio notice with the five Stitch steps: photograph, animal, sample directions, selected design, and next steps.
  - Kept the visit in this browser. A portrait is not uploaded. Refresh can restore a compressed copy from session storage.
  - Added audience choices for women, men, girls, boys, and unisex. Girls and boys receive only age-appropriate children’s directions.
  - Sample directions come from the catalogue. Regenerating reports that a concept provider is not connected and leaves the list unchanged.
  - The try-on step keeps the selected design beside the portrait. Requesting a preview loads, then reports that the try-on provider is not connected. Retrying returns the same result. The selected design does not change.
  - Saving and a quotation note stay in this visit. Neither contacts a couturier, creates a price, nor arranges shipping.
  - Removed the screen claims of 99.4% fit accuracy, biometric measurement, guaranteed ateliers, and sample prices from the journey.
- Files created or modified: the studio routes under `app/studio/`, `src/components/studio/`, `src/studio/`, the catalogue and animal links into the studio, and this status document.
- Database or configuration changes: None. No provider key, Supabase project, or uploaded portrait store was created.
- Tests and build results (25 October 2026, about 19:25 Europe/London):
  - `npm test`: 24 passed, including audience separation, step gates, and the disconnected try-on result.
  - `npm run typecheck`: passed.
  - `npm run lint`: passed.
  - `npm run build`: passed. `/studio`, `/studio/animal`, `/studio/suggestions`, `/studio/look`, and `/studio/next` are static.
  - Browser check: a first visit with no saved edition uses Obsidian Atelier. Uploading a photograph, choosing Women and plains zebra, and selecting the gown reaches the selected-design step. Regenerating reports that the concept provider is not connected. Requesting a try-on reports that the provider is not connected. Noting a quotation says no atelier received it. Girls see the children’s zebra direction and not the gown. Desktop 1440px and a 390px phone had no horizontal overflow.
- Missing credentials: A concept provider and a try-on provider were absent when this phase shipped. Phase 5 now uses OpenAI through server environment variables.
- Outstanding tasks: None in this phase.
- Approval state and date: Approved on 26 October 2026 at 04:52 Europe/London, when the next phase was explicitly requested.

### Phase 5 — Real AI integration

- Status: AWAITING APPROVAL
- Scope: OpenAI as the only image provider for fashion concepts and virtual try-on, with a modular provider boundary, server credentials, job lifecycle, quotas, and an explicit labelled demo. The earlier labelled-mock job lifecycle was approved on 26 October 2026 at 05:38 Europe/London. This revision replaces that mock with OpenAI and waits for approval. Phase 6 has not started.
- Completed work:
  - Kept `POST /api/studio/jobs` and `GET /api/studio/jobs/[id]`. Added `GET /api/studio/jobs/[id]/image` for a visit-scoped generated image. Records live in the server process. A restart clears them. There is no durable private store in this phase.
  - OpenAI is the image provider, through `src/server/fashion-image-provider.ts` and the official `openai` package. Concepts use image generation, or image editing when a catalogue reference file exists. Try-on uses image editing with the photograph and the selected garment. The model is `OPENAI_IMAGE_MODEL`, defaulting to `gpt-image-2.5-sunburst`. The call does not send `response_format` or `input_fidelity`. The server checks `models.retrieve` once per process before generating.
  - A missing `OPENAI_API_KEY` fails the job as Configuration. No image request is sent, quota is not spent, and no image is invented. The retired names `FASHION_CONCEPT_API_KEY` and `VIRTUAL_TRY_ON_API_KEY` are ignored. `ANIMODA_IMAGE_PROVIDER=demo` is the only labelled demo, and it does not call OpenAI or invent an image.
  - A concept job can return up to two generated images for the current catalogue directions. The selected direction id is not replaced. Girls and boys still receive only children’s directions, and the prompt asks for age-appropriate covered clothing. Animal markings are a creative reference, not animal-skin material.
  - A try-on accepts a JPG, PNG, or WebP data URL up to 8MB, with edges from 64 to 4096, and only on the try-on request. The photograph is not stored on the job after the call. An unchanged photograph or garment is discarded. The page says the result is an AI visualization, not a guaranteed finished garment, measurement, or fit.
  - Generated bytes are served only to the same visit, with `Cache-Control: private, no-store`. One visit cannot read another visit’s job or image. Each visit may run 8 concept jobs and 8 try-on jobs in process memory.
  - The client waits up to 180 seconds. Same-origin job image paths are shown. External URLs and data URLs in a job response are dropped.
- Files created or modified:
  - `app/api/studio/jobs/route.ts`
  - `app/api/studio/jobs/[id]/route.ts`
  - `app/api/studio/jobs/[id]/image/route.ts`
  - `src/server/studio-jobs.ts`
  - `src/server/studio-jobs.test.ts`
  - `src/server/fashion-image-provider.ts`
  - `src/server/fashion-image-provider.test.ts`
  - `src/server/portrait-input.ts`
  - `src/server/portrait-input.test.ts`
  - `src/server/client-boundary.test.ts`
  - `src/studio/jobs-client.ts`
  - `src/studio/jobs-client.test.ts`
  - `src/studio/use-studio-job.ts`
  - `src/components/studio/suggestions-step.tsx`
  - `src/components/studio/look-step.tsx`
  - `app/privacy/page.tsx`
  - `next.config.ts`
  - `package.json`
  - `package-lock.json`
  - `.env.example`
  - `README.md`
  - `docs/IMPLEMENTATION_STATUS.md`
- Database or configuration changes: None. No Supabase project, storage bucket, or production deploy. On 26 October 2026 at about 10:13 Europe/London, a local `OPENAI_API_KEY` was placed in the gitignored `.env`. `.env.example` stays an empty placeholder. `models.retrieve` succeeded for `gpt-image-2.5-sunburst`. No concept or try-on image was generated in that check.
- Tests and build results (26 October 2026, about 09:10 Europe/London):
  - `npm test`: 47 passed. Coverage includes portrait validation, the missing-key failure, the explicit labelled demo, mocked OpenAI concept and try-on bytes, an unchanged try-on being discarded, a missing model, a rate-limit message that does not keep a key, visit isolation for the image route, and a client-source scan that rejects `OPENAI_API_KEY` and the OpenAI SDK import.
  - `npm run typecheck`: passed.
  - `npm run lint`: passed.
  - `npm run build`: passed. `/api/studio/jobs`, `/api/studio/jobs/[id]`, and `/api/studio/jobs/[id]/image` are dynamic. The studio pages stay static.
  - The production client chunks do not contain `OPENAI_API_KEY`. A substring `sk-` appears only inside the CSS property `mask-type`.
  - Browser check against the local server, Obsidian Atelier, about 09:22 Europe/London: uploading a photograph, choosing Women and plains zebra, and regenerating shows “Configuration · Failed” and “Set OPENAI_API_KEY. No image request was sent”. The catalogue gown and trench stay. No OpenAI visualization is shown. The try-on request shows the same configuration failure, leaves the portrait and the selected gown separate, and does not show a try-on image. Quota stays at 8 of 8 because a missing key does not spend a job. Desktop and a 390px width had no horizontal overflow. Framing practices stay beside the photo controls. A live OpenAI image was not requested, because this environment has no `OPENAI_API_KEY`.
- Required account configuration: `OPENAI_API_KEY` is set in the local gitignored `.env`. `models.retrieve` returned `gpt-image-2.5-sunburst` on 26 October 2026 at about 10:13 Europe/London, so that model is available to the account. Image generation still needs billing for each live job. The first live job calls `models.retrieve` again inside the server process and fails closed if the model is missing. Do not put the key in `NEXT_PUBLIC_*`, `.env.example`, or the repository.
- Known limitations: Images and the in-flight photograph exist only in process memory. A restart deletes them. There is no retention job beyond evicting old visits from that memory. The try-on does not measure the body and does not confirm that a garment can be made. Quality is `medium` for concepts and `high` for try-on, both at `1024x1536` JPEG. At most two concepts are requested per job. `models.retrieve` has succeeded for `gpt-image-2.5-sunburst`. A live concept or try-on image has not been generated yet, so this check does not show a finished visualization.
- Outstanding tasks: Approval of this revision. A live check against the OpenAI account once a key is configured. Phase 6 private storage is not part of this work.
- Approval state and date: The labelled-mock slice was approved on 26 October 2026 at 05:38 Europe/London. The OpenAI provider revision is awaiting approval. Phase 6 has not started.

### Phase 6 — Authentication, database, and private gallery

- Status: NOT STARTED
- Scope: Supabase Auth, profiles, migrations, RLS, private photo storage, My Creations, deletion, and quotas.
- Completed work: None.
- Approval state and date: Not approved.

### Phase 7 — Marketplace and manufacturing requests

- Status: NOT STARTED
- Scope: Public marketplace, design detail, publication consent, manufacturing requests, design snapshots, and request history. No shipping.
- Completed work: None.
- Approval state and date: Not approved.

### Phase 8 — Couturier and administrator workflows

- Status: NOT STARTED
- Scope: Couturier application and approval, dashboard, accept and decline, quotations and revisions, customer responses, notifications, and administration.
- Completed work: None.
- Approval state and date: Not approved.

### Phase 9 — PWA, localization, and production hardening

- Status: NOT STARTED
- Scope: Installable PWA, offline shell, Portuguese, English, and French, accessibility, security review, performance, automated tests, production build, and deployment documentation. No production deploy without a separate authorization.
- Completed work: None.
- Approval state and date: Not approved.

## Remaining work

Phase 2, Phase 3, and Phase 4 are approved. The studio photo step shows the Framing practices list beside the photograph controls. Capture and upload start directly. Phase 5 now uses OpenAI for concepts and try-on and is awaiting approval of that revision. Phase 6, authentication and the private gallery, has not started. Without `OPENAI_API_KEY`, a studio job fails with a configuration message and does not invent an image. The Marine Life browse group contains the requested fishes. Pothos is not in that group. Insects, reptiles, and birds from the supplied list are in those groups.

The Phase 2 plan that was executed:

1. Re-read this document and the landing screen `bb5a18bbe54f4428aea65041113914bc`.
2. Move the foundation review from `/` to `/foundation`.
3. Build the light landing page in the approved section order, using the Phase 1 primitives and the Stitch spacing, type, and colour roles.
4. Build the sticky public header and footer from that screen: Discover, Animal Catalog, Marketplace, Studio, Couturiers, How It Works, Create My Look, and the footer legal links.
5. Add public informational pages named by the footer: Privacy Charter, Terms of Service, Ethical Sourcing, and How It Works. Keep the copy aligned with the screen and mark sample commercial claims as illustrative.
6. Show the marketplace preview and featured couturiers on the landing page. A public `/marketplace` and `/couturiers` page may repeat that same labelled development content. They are previews, not the Phase 7 marketplace or the Phase 8 dashboard.
7. For header destinations that belong to later phases (Studio, Animal Catalog, wishlist, account), add a short public page that names the phase which will provide them, so the approved navigation has a real destination.
8. Set public SEO metadata from the product description. Keep the active locale in English for this phase, with user-facing landing strings gathered in one module so Phase 9 can add Portuguese and French. Portuguese stays the planned default; Phase 2 does not invent a Portuguese translation of the Stitch screens.
9. Download approved Stitch photographs into the repository when the CDN URLs still resolve. Where a URL fails, use a labelled editorial placeholder in the existing card frame.
10. Treat prices, atelier counts, and named houses in the Stitch copy as illustrative development content.
11. Verify desktop and mobile in the browser, then run tests, lint, typecheck, and the production build.
12. Stop after Phase 2. Phase 3 began only after the explicit approval on 25 October 2026 at 13:13 Europe/London.

Later phases, in order: 4 Studio journey, 5 AI providers, 6 auth and private gallery, 7 marketplace and manufacturing requests, 8 couturier and administrator workflows, 9 PWA, localisation, and production hardening.

## Known issues and decisions

- Screen roles and written brand hexes differ. Components use the screen roles: primary `#003527`, primary container `#064E3B`, secondary `#934B19`, tertiary `#511F00`. The written brand earth `#8B4513` and terracotta `#F97316` are available as `brand-earth` and `brand-terracotta`. Forest `#064E3B`, gold `#D4A72C`, cream `#F8F3E8`, and white match both sources.
- The generated token `border-warm` is the invalid string `#E5DC Flora`. The stylesheet uses `border-warm-subtle` (`#E8DFC8`). Field borders use the DESIGN.md input colour `#D8CBB4`. Chip borders in the design prose use `#E2D9C5`; the landing chips themselves are fill-only, and the Chip primitive follows the landing chips.
- Generated screen radii match Tailwind defaults (`rounded-2xl` 1rem, `rounded-3xl` 1.5rem, full pills). The DESIGN.md radius scale is larger and was not what the screens emitted. Primitives follow the screens.
- Landing HTML applies `px-margin` (2.5rem) at every width. DESIGN.md also defines a 1rem mobile margin. Public pages use `px-margin-mobile` below the `md` breakpoint and `px-margin` from `md` up, because the approved screens are desktop canvases. The hero title uses the mobile display size below `md`.
- The public header and footer use the cropped Stitch wordmark at `public/stitch/logo-lockup.png`. The foundation review still uses the Studio circle mark. The downloaded profile photograph is not shipped.
- The approved landing navigation is hidden below the desktop canvas. Phase 2 adds a menu button below `xl` so the same destinations work on a phone. Create My Look, Wishlist, Notices, and Account are inside that menu.
- Landing copy keeps the screen’s editorial headlines, including “520+ Certified Ateliers” and “Days avg. Paris delivery”. The adjacent disclaimer states that those figures are samples. Pillar and closing copy says a try-on and a couturier request are not guarantees, payment, or delivery.
- The Unisex chip on the landing lookbook matches no sample card and shows an empty state. The studio offers women, men, girls, boys, and unisex as separate choices. Girls and boys see only directions labelled for children or youth.
- There is no production canonical URL, so the root layout sets no `metadataBase` and ships no sitemap.
- Studio Step 1 copy claims “99.4% Fit Accuracy” and precise anatomical mapping. Those claims do not ship. The studio does not measure a portrait or promise identity preservation.
- The landing audience chips stay All Pieces, Women, Men, Kids & Youth, and Unisex, matching the approved landing screen. The studio offers women, men, girls, boys, and unisex as distinct choices.
- The public site has two editions from Stitch. Light uses the Animoda Couture Ecosystem tokens. Dark uses Obsidian Atelier (`assets/4576187f175d4c1e9d740a6ca318e505`) and the dark landing screen `68edc16cca97489f95d3d46a0491fcd4`. The header toggle stores the choice as `animoda-theme`. The first visit uses the Obsidian Atelier edition. A script applies a saved choice before paint, and the document element allows that attribute to differ from the server HTML. Editorial photographs are the original Stitch files and are served at quality 90. Below the `lg` breakpoint the header keeps the wordmark, the edition toggle, and a menu; search and account sit inside that menu. Touch targets in the menu, filters, and newsletter are at least 44px.
- The geographic explorer has no approved Stitch screen. Phase 3 uses the habitat tab on the animal profile: MapLibre, the catalogue type scale, and forest occurrence dots.
- Map tiles use the keyless OpenFreeMap Liberty style, `https://tiles.openfreemap.org/styles/liberty`. The MapLibre worker is served from `public/maplibre-gl-worker.js` because the Next.js dev server did not load the package worker URL.
- Wildlife records come from the public GBIF API with no key. Occurrence points and distribution rows are quoted with their source. A country filter does not create a native-range polygon. The curated browse tags (Africa, Asia, and the rest) are labels on this sample, not range maps.
- The landing photograph labelled Viper is catalogued as Corallus caninus. GBIF places that species in class Squamata. The Reptiles chip is the screen’s group name.
- Marine Life lists the requested fishes. Pothos was removed from that chip. Halfmoon male betta is Betta splendens, a freshwater fish; halfmoon is a tail shape and male is the sex. Black moor, fantail, and shubunkin are varieties of the freshwater goldfish Carassius auratus and share GBIF usage key 4286942. Livebearers is the family Poeciliidae, and the photograph is one guppy. Mandarin fish on this card is the marine dragonet Synchiropus splendidus. The freshwater perch Siniperca chuatsi is a different species. Moorish idol is Zanclus cornutus. Picasso triggerfish is Rhinecanthus aculeatus. Rusty parrotfish is Scarus ferrugineus, not Scarus rubroviolaceus.
- The supplied insect, reptile, and bird list is in those catalogue groups. Army green moth is the oleander hawk-moth, Daphnis nerii. Calligrapher beetle on this card is Calligrapha philadelphica. Thorny cricket is Cosmoderus femoralis; the photograph is a museum specimen of the related species Cosmoderus erinaceus because an openly licensed photograph of C. femoralis was not available. Rainbow bright chameleon is the panther chameleon, Furcifer pardalis. Phoenix rooster is a long-tailed breed of Gallus gallus, not a separate wild species. Majestic eagle is a descriptive label for the bald eagle, Haliaeetus leucocephalus. Ploughshare tortoise is Astrochelys yniphora, and GBIF places it in class Testudines while the catalogue chip is Reptiles. Victoria crowned pigeon uses the Oceania browse tag. Stock-photo search links from the list were not downloaded. Photographs are openly licensed Wikimedia Commons files, credited on the card. GBIF currently returns no class for the catalogue fishes, so the profile omits a blank class.
- Material Symbols require a request to Google Fonts at runtime. A later phase can self-host the subset if offline icon rendering becomes a requirement.
- OpenAI is the only image provider in this revision. `OPENAI_API_KEY` is server-only. It is set in the local gitignored `.env` and is empty in `.env.example`. `models.retrieve` succeeded for `gpt-image-2.5-sunburst` on 26 October 2026 at about 10:13 Europe/London. `OPENAI_IMAGE_MODEL` defaults to `gpt-image-2.5-sunburst`. A missing key fails the job and sends no request. `ANIMODA_IMAGE_PROVIDER=demo` is an explicit labelled demo. The portrait stays in the browser until a try-on request. A job does not replace the selected catalogue design. Generated images stay in process memory and are not published. The visit quota is process memory, not an account quota. The try-on is a visualization, not a measurement or a manufacturing specification.

## External credentials still required

| Later phase | Name | State |
| --- | --- | --- |
| 6 | `NEXT_PUBLIC_SUPABASE_URL` | Absent |
| 6 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Absent |
| 6 | `SUPABASE_SERVICE_ROLE_KEY` | Absent. Server only. |
| 5 | `OPENAI_API_KEY` | Set in the local gitignored `.env`. Empty in `.env.example`. Server only. A missing value fails the job and sends no request. |
| 5 | `OPENAI_IMAGE_MODEL` | Optional. Defaults to `gpt-image-2.5-sunburst` when empty. Availability to the account is not confirmed until a key is set. |
| 5 | `ANIMODA_IMAGE_PROVIDER` | Unset. Set to `demo` only for an explicit labelled demo that does not call OpenAI. |
| 3 | Wildlife source | In use. Public GBIF, no key. A labelled snapshot covers a failed request. |
| 3 | MapLibre style | In use. OpenFreeMap Liberty, no key. |

No credential was invented or stored.
