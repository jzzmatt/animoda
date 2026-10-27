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
  - Keep secrets on the server. Phase 1 reads no credentials. `.env.example` lists the later names only. Phase 5 reads `FASHION_CONCEPT_API_KEY` and `VIRTUAL_TRY_ON_API_KEY` on the server only. Empty values run a labelled mock. A set value does not call a provider, because none has been chosen. Phase 6A reads `SUPABASE_URL` and `SUPABASE_SECRET_KEY`, or `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, on the server. The secret key is never a `NEXT_PUBLIC_` value.

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
- Missing credentials: A concept provider and a try-on provider were absent when this phase shipped. Phase 5 reads those server names.
- Outstanding tasks: None in this phase.
- Approval state and date: Approved on 26 October 2026 at 04:52 Europe/London, when the next phase was explicitly requested.

### Phase 5 — Real AI integration

- Status: APPROVED
- Scope: Concept provider, try-on provider, server credentials, job lifecycle, quotas, selected-design reference preservation, and a labelled mock when credentials are absent.
- Completed work:
  - Added server routes `POST /api/studio/jobs` and `GET /api/studio/jobs/[id]`. A job is queued, then running, then succeeded or failed. Records live in the server process. A restart clears them.
  - The server reads `FASHION_CONCEPT_API_KEY` and `VIRTUAL_TRY_ON_API_KEY` and does not return or log the values. Both are empty, so each accepted job is a labelled mock. A non-empty key fails that job with “Provider not chosen” and sends no request, because no provider API has been chosen.
  - A concept job returns the catalogue direction ids for the animal, audience, and silhouette. It does not add a design. The selected direction id is echoed and is not replaced. Girls and boys still receive only children’s directions.
  - A try-on job returns no composite. The route rejects a photograph. The portrait stays in this browser. The selected catalogue photograph remains the reference on the page.
  - Each visit may run 8 concept jobs and 8 try-on jobs. The counters are process memory, not an account quota. One visit cannot read another visit’s job.
  - Regenerating and requesting a preview show the job label, status, id, and remaining count. Saving and a quotation note stay in this visit.
- Files created or modified:
  - `app/api/studio/jobs/route.ts`
  - `app/api/studio/jobs/[id]/route.ts`
  - `src/server/studio-jobs.ts`
  - `src/server/studio-jobs.test.ts`
  - `src/studio/jobs-client.ts`
  - `src/studio/jobs-client.test.ts`
  - `src/studio/use-studio-job.ts`
  - `src/studio/session.ts`
  - `src/studio/session.test.ts`
  - `src/studio/studio-store.ts`
  - `src/components/studio/suggestions-step.tsx`
  - `src/components/studio/look-step.tsx`
  - `src/components/studio/studio-job-notice.tsx`
  - `src/content/site.ts`
  - `app/studio/suggestions/page.tsx`
  - `app/studio/look/page.tsx`
  - `.env.example`
  - `README.md`
  - `docs/IMPLEMENTATION_STATUS.md`
- Database or configuration changes: None. No provider account, Supabase project, or portrait store was created. The two Phase 5 keys remain empty.
- Tests and build results (26 October 2026, Europe/London):
  - `npm test`: 36 passed, including the mock lifecycle, the unchanged selected design, the absent composite, the key-without-provider failure, and the visit quota.
  - `npm run typecheck`: passed.
  - `npm run lint`: passed.
  - `npm run build`: passed. `/api/studio/jobs` and `/api/studio/jobs/[id]` are dynamic. The studio pages stay static.
  - Browser check in the visible Chrome window, Obsidian Atelier, about 05:16 Europe/London: uploading a photograph, choosing Women and plains zebra, and selecting the gown reaches the sample directions. Regenerating shows “Labelled mock · Succeeded”, leaves the two catalogue cards, and keeps the gown selected. The try-on request shows the same labelled success, says no composite was made, and the portrait and the catalogue gown stay separate images. The job requests carry the visit, the animal, the audience, and the selected design. Desktop width and a 390px layout had no horizontal overflow.
- Missing credentials: No concept provider and no try-on provider are chosen. The server keys are absent, so the labelled mock is what runs.
- Outstanding tasks: None in this phase.
- Approval state and date: Approved on 26 October 2026 at 05:38 Europe/London. Phase 6 has not started.

### Phase 6A — Supabase foundation

- Status: VERIFIED, awaiting approval. The migration is applied on project `slkvjqzcvrxlvqvieqpp`. A stored image was written and read back, then the probe was removed.
- Scope: Supabase configuration, the `animal_fashion_samples` and `fashion_sample_jobs` tables, the public `animoda-fashion-samples` bucket, row level security, server-side service access, and a protected completeness report. No image generation and no user accounts.
- Access model: The bucket is public so an approved catalogue image can load from its stored path after a refresh. `image_path` is the source of truth. `image_url` is only a cached public URL. Browser roles can select completed rows and cannot write them. The bucket has no browser write policy. The server secret uploads from the server. Portraits and try-on results are excluded.
- Completed work:
  - Added `supabase/migrations/20261026154153_animal_fashion_samples.sql`.
  - Added a server-only Supabase client, the sample path and report rules, and `GET /api/admin/fashion-samples`.
  - The server accepts `SUPABASE_URL` and `SUPABASE_SECRET_KEY` as well as the earlier names. A publishable key is rejected as the server credential.
  - The report route requires `FASHION_SAMPLE_ADMIN_TOKEN`. That name is still absent.
- Database or configuration changes: The migration was applied in the Animoda SQL editor. On 26 October 2026 at about 17:15 Africa/Luanda the secret key found `animal_fashion_samples` and `fashion_sample_jobs` in the Data API, both empty. The public bucket remains. A temporary probe row and PNG were saved, read back by the publishable key and the public URL, and then removed. Invalid style, a duplicate animal and style, a completed row without a path, and browser writes were all rejected. The publishable key cannot read jobs. MCP login for this project still requires authentication. No other project was changed.
- Tests and build results (26 October 2026, about 16:55 Africa/Luanda, code unchanged at the live check):
  - `npm test`: 60 passed, including the dashboard credential names and rejection of a publishable key.
  - `npm run typecheck`: passed.
  - `npm run lint`: passed.
  - `npm run build` was not rerun. No browser was used. No OpenAI image was requested.
  - Live check at about 17:15 Africa/Luanda: 0 sample rows, 0 jobs, and an empty bucket after the probe was removed. Expected catalogue samples remain 111.
- Missing configuration: `FASHION_SAMPLE_ADMIN_TOKEN` is still absent, so the report route stays closed. See `docs/supabase-foundation.md`.
- Approval state and date: Not approved.

### Phase 6.1 — Emerald tree boa pilot

- Status: VERIFIED, awaiting approval. Three real images were generated for `emerald-tree-boa` only, stored, and read back. No other animal was processed.
- Catalogue record: Emerald tree boa, `Corallus caninus`, slug `emerald-tree-boa`.
- Supabase: The existing project and migration were reused. No new migration was created. MCP access to this project still returns a permission error, so the pilot used the server secret key.
- Storage bucket: `animoda-fashion-samples`, public read, server write. Each object was retrieved from its public URL and checked as a PNG.
- Generated images: 3. Permanently stored and verified: 3. A second run skipped all three and did not call image generation again.
- Styles:
  - Formal Couture, `formal`, completed. `animals/emerald-tree-boa/formal/5d76449f-ff18-4952-a79d-7ed0f84becde.png`
  - Casual & Streetwear, `casual_street`, completed. `animals/emerald-tree-boa/casual_street/e4351352-0b11-4660-a88c-92d3d40ae613.png`
  - Youth Couture, `youth_couture`, completed. `animals/emerald-tree-boa/youth_couture/36135fa4-6106-49fd-9b16-7a0e88ffbda9.png`
- Model and prompt version: `gpt-image-2.5-sunburst`, `boa-pilot-1`. Quality `medium`, size `1024x1536`, PNG.
- Display: The emerald tree boa profile shows the three stored samples. Other animal pages do not query or show this section. Written catalogue directions remain separate and are not labelled as generated images.
- Tests (26 October 2026, about 17:32 Africa/Luanda): `npm test` 64 passed. `npm run typecheck` passed. `npm run lint` passed. `npm run build` passed. The emerald tree boa profile is a static page and its build output includes the three stored image paths. No browser automation. No deployment.
- Approval state and date: Not approved. Phase 6.2 has not started.

### Phase 6.2 — Remaining catalogue samples

- Status: VERIFIED, awaiting approval. The approved Emerald tree boa samples were left in place. The other catalogue animals now have three stored styles each.
- Catalogue: 37 animals. Expected samples: 111. Completed with a verified Storage object: 111. Pending: 0. Failed: 0. Duplicates: 0.
- One sample, Picasso bug casual streetwear, failed on the first pass with `sample_failed` and succeeded on the resume. The resume skipped the 110 samples that were already stored.
- Model: `gpt-image-2.5-sunburst`. New samples use prompt version `catalogue-1`. The three boa samples remain `boa-pilot-1`.
- Display: every catalogue animal profile shows its three stored styles. A missing file shows an unavailable state and is not labelled as a generated image.
- Verification (26 October 2026, about 18:16 Africa/Luanda): 111 completed rows, 37 animals, no duplicates, and every public object returned a PNG signature. `npm test` 63 passed. Typecheck, lint, and the production build passed. The zebra and Picasso bug pages include their stored image paths. No browser automation. No deployment.
- Approval state and date: Not approved. Phase 6C has not started.

### Phase 6B — Permanent AI fashion samples

- Status: COVERED BY PHASE 6.1 AND PHASE 6.2
- Scope: Generate three images for every catalogue animal (Formal Couture, Casual & Streetwear, Youth Couture), store the bytes in `animoda-fashion-samples`, and show those stored images in the catalogue. Expected count is 111 for the current 37 animals.
- Completed work: Phase 6.1 stored the Emerald tree boa. Phase 6.2 stored the remaining animals. All 111 objects were read back as PNG files.
- Approval state and date: Not approved.

### Phase 6C — User authentication and private gallery

- Status: NOT STARTED
- Scope: Supabase Auth, profiles, private photo storage, My Creations, deletion, and quotas. This waits until Phase 6A and Phase 6B are working and approved.
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

## Catalogue silhouette correction

- Status: AWAITING APPROVAL
- Root cause: The catalogue had no species-silhouette assets or shared resolver. Fashion direction photographs existed for the plains zebra (four of five directions) and the tiger (one direction). Only the plains zebra had a direction in Formal, Casual & Street, and Youth Couture. The other 35 animals had a written direction and no outline, so their silhouette frames stayed empty. There was no zebra-only render branch; the data was simply incomplete. Fashion photographs and animal thumbnails were left as they were.
- Completed work:
  - Added `AnimalSilhouette`, which resolves a local SVG from the scientific name. A new animal does not need a new conditional in that component.
  - Saved exact PhyloPic matches whose licenses allow reuse (CC0 or Public Domain Mark). Non-commercial files were not saved. Black moor, fantail, and shubunkin share the Carassius auratus silhouette because they are varieties of that species.
  - A missing or failed file shows “No silhouette is published for {name}”. It does not substitute the zebra outline, a material icon, or another animal’s photograph.
  - The catalogue, animal profile, studio animal step, and direction frames without a garment photograph show the silhouette. Zebra garment photographs still render on their direction cards.
  - In development, the catalogue states silhouette coverage for the whole catalogue.
- Animals audited: 37 catalogue entries, 35 scientific names.
- Valid species silhouettes before: 0.
- Valid species silhouettes after: 14 files, shown on 16 catalogue entries.
- Missing assets or licensing blockers: 21 scientific names. Betta splendens is CC BY-NC 3.0 and Pavo cristatus is CC BY-NC-SA 3.0, so those files were not copied. Giraffa camelopardalis and Poeciliidae have no exact reusable vector. The other 17 names have no PhyloPic node. No silhouette was invented.
- Files and assets: `src/components/catalogue/animal-silhouette.tsx`, `src/content/silhouettes.ts`, `src/content/silhouettes.json`, `src/content/silhouettes.test.tsx`, `public/silhouettes/*.svg`, and the catalogue, profile, and studio surfaces that render the component.
- Tests and build results (26 October 2026, about 14:34 Africa/Luanda):
  - `npm test`: 42 passed, including zebra and leopard resolving different files, the shared goldfish silhouette, the giraffe fallback, an external address being ignored, and coverage of 16 of 37 animals.
  - `npm run typecheck`: passed.
  - `npm run lint`: passed.
  - `npm run build`: passed. Animal profile pages stay static. Silhouette files are served from `public/silhouettes`.
- Approval state: Awaiting approval. Phase 6 has not started, and this correction was not deployed.

### Remaining catalogue silhouettes

- Status: AWAITING APPROVAL
- The 21 scientific names above had no exact reusable vector. Each now has the closest PhyloPic outline of the same kind of animal. The caption names that taxon as a related outline. A subspecies of the catalogue name, such as Gallus gallus domesticus for the phoenix rooster, is treated as the same animal.
- Non-commercial files were still not copied. The exact betta and Indian peafowl drawings stay unused. The betta uses Trichopsis schalleri. The peafowl uses Pavo muticus.
- Python bivittatus, used for the ball python, is CC BY 4.0 and keeps the attribution DS Biswas. The other new files are CC0 1.0.
- Coverage: 35 files, shown on all 37 catalogue entries. An unknown scientific name still shows “No silhouette is published for {name}”.
- Approval state and date: Not approved.

## Remaining work

Phase 2, Phase 3, Phase 4, and Phase 5 are approved. Every catalogue animal now has a local species silhouette. An exact reusable PhyloPic outline is used where one exists. Otherwise the outline is the closest reusable drawing of the same kind of animal, and the caption names that taxon. An unknown scientific name still shows a published missing state. The studio photo step shows the Framing practices list beside the photograph controls. Capture and upload start directly. Phase 6 is now split into 6A (Supabase foundation), 6B (permanent AI fashion samples), and 6C (authentication and the private gallery). Phase 6A is verified on project `slkvjqzcvrxlvqvieqpp`. Phase 6.1 and Phase 6.2 stored 111 fashion samples, three for each of the 37 catalogue animals. Phase 6C has not started. No concept provider and no try-on provider are chosen. Empty server keys run a labelled mock that keeps the selected catalogue design and makes no composite. The Marine Life browse group contains the requested fishes. Pothos is not in that group. Insects, reptiles, and birds from the supplied list are in those groups.

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
- No concept provider and no try-on provider are chosen. `FASHION_CONCEPT_API_KEY` and `VIRTUAL_TRY_ON_API_KEY` are server-only and empty. An empty value runs a labelled mock job. A set value fails the job and sends no request. The portrait stays in the browser. A job does not replace the selected catalogue design. The visit quota is process memory, not an account quota.

## External credentials still required

| Later phase | Name | State |
| --- | --- | --- |
| 6 | `NEXT_PUBLIC_SUPABASE_URL` | Absent |
| 6 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Absent |
| 6 | `SUPABASE_SERVICE_ROLE_KEY` | Absent. Server only. |
| 5 | `FASHION_CONCEPT_API_KEY` | Absent. Server only. An empty value runs the labelled mock. A value does not call a provider, because none is chosen. |
| 5 | `VIRTUAL_TRY_ON_API_KEY` | Absent. Server only. An empty value runs the labelled mock. A value does not call a provider, because none is chosen. |
| 3 | Wildlife source | In use. Public GBIF, no key. A labelled snapshot covers a failed request. |
| 3 | MapLibre style | In use. OpenFreeMap Liberty, no key. |

No credential was invented or stored.
