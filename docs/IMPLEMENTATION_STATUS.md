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
  - Keep the foundation review at `/` until Phase 2 replaces it with the landing page and moves this review to `/foundation`.
  - Keep product localisation for Phase 9. This foundation review is in English, matching the approved screens. Portuguese remains the planned default language.
  - Keep secrets on the server. Phase 1 reads no credentials. `.env.example` lists the later names only.

## Approved design mapping

Stitch screen inventory used as the UI source of truth:

| Screen | Stitch id | Phase |
| --- | --- | --- |
| Animoda — Landing Page | `bb5a18bbe54f4428aea65041113914bc` | 2 |
| Animoda — Landing Page (Dark Mode) | `68edc16cca97489f95d3d46a0491fcd4` | Deferred. The design system colour mode is light. |
| Animal Catalogue & Discovery | `d83683226b7a44d89ef144a22837994f` | 3 |
| Animal Detail & Fashion Inspiration | `98257c77296b4199a7cd27c40b52e29d` | 3 |
| Studio Step 1 — Your Photograph | `d0cd90ea87224048aa443ea17cdba487` | 4 |
| Studio Step 2 — Choose Animal | `baea21b951dd44b9a329bd033ef1b951` | 4 |
| AI Fashion Suggestions | `bd956874f6a24242a59f93f87cbe2476` | 4 |
| AI Fashion Suggestions (Dark Mode) | `3b6bf4d9a4094ef8a63fb3ba25d90829` | Deferred with the light-mode decision |
| Studio Step 4 — Your Personalized Look | `045753140aac4ea7b117287e04c0e3c4` | 4 |
| Studio Step 5 — Next Steps & Couturier | `4439be6f0b954ffd91cdbb8125a045a6` | 4 for the review step; manufacturing detail continues in Phase 7 |
| Animoda Haute Couture Platform (mobile, 390px) | `7eae1b92b5944d19b4246c6ecf10bc7b` | Reference only. The screenshot resource is empty. |
| DESIGN.md | `17633587558025486899` | Design-system source, already reflected in the project theme |

Editorial images in the same project (zebra gown, tuxedo, overcoat, blazer, jaguar textile, UX collage) are reference photography for later screens. They are not vendored in Phase 1.

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

- Status: AWAITING APPROVAL
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
- Outstanding tasks: Approval of this phase. Phase 2 has not started.
- Approval state and date: Awaiting explicit approval. Not approved.

### Phase 2 — Public website and navigation

- Status: NOT STARTED
- Scope: Landing page, public navigation and footer, marketplace preview, featured designs, featured couturiers, responsive layout, SEO metadata, and public informational pages. Detailed plan is in Remaining work.
- Completed work: None.
- Files created or modified: None.
- Database or configuration changes: None.
- Tests and build results: None.
- Known issues: Inherited from Phase 1.
- Missing credentials: None required for labelled development content.
- Outstanding tasks: The whole phase, after approval.
- Approval state and date: Not approved.

### Phase 3 — Animal catalogue and geographic discovery

- Status: NOT STARTED
- Scope: Catalogue, search, filters, animal profile, fashion inspiration, geographic explorer, wildlife data, attribution, and a labelled development dataset if the live source is unavailable.
- Completed work: None.
- Approval state and date: Not approved.

### Phase 4 — Simplified Animoda Studio

- Status: NOT STARTED
- Scope: The five-step guided journey, session state, back navigation, validation, loading, and failure recovery. UI and workflow review before any real provider work.
- Completed work: None.
- Approval state and date: Not approved.

### Phase 5 — Real AI integration

- Status: NOT STARTED
- Scope: Concept provider, try-on provider, server credentials, job lifecycle, quotas, selected-design reference preservation, and a labelled mock when credentials are absent.
- Completed work: None.
- Approval state and date: Not approved.

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

Phase 2 plan, to be executed only after explicit approval:

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
12. Stop. Phase 3 stays closed until a separate approval.

Later phases, in order: 3 animal catalogue and map, 4 Studio journey, 5 AI providers, 6 auth and private gallery, 7 marketplace and manufacturing requests, 8 couturier and administrator workflows, 9 PWA, localisation, and production hardening.

## Known issues and decisions

- Screen roles and written brand hexes differ. Components use the screen roles: primary `#003527`, primary container `#064E3B`, secondary `#934B19`, tertiary `#511F00`. The written brand earth `#8B4513` and terracotta `#F97316` are available as `brand-earth` and `brand-terracotta`. Forest `#064E3B`, gold `#D4A72C`, cream `#F8F3E8`, and white match both sources.
- The generated token `border-warm` is the invalid string `#E5DC Flora`. The stylesheet uses `border-warm-subtle` (`#E8DFC8`). Field borders use the DESIGN.md input colour `#D8CBB4`. Chip borders in the design prose use `#E2D9C5`; the landing chips themselves are fill-only, and the Chip primitive follows the landing chips.
- Generated screen radii match Tailwind defaults (`rounded-2xl` 1rem, `rounded-3xl` 1.5rem, full pills). The DESIGN.md radius scale is larger and was not what the screens emitted. Primitives follow the screens.
- Landing HTML applies `px-margin` (2.5rem) at every width. DESIGN.md also defines a 1rem mobile margin. The foundation review uses the mobile margin below the `md` breakpoint because the approved screens are desktop canvases. Phase 2 should keep that mobile margin unless a mobile screen specifies otherwise.
- The landing wordmark is a remote raster. The Studio header builds the mark from a forest circle and the Material `spa` glyph. Phase 1 uses the Studio mark so the review does not depend on an expiring CDN URL. Phase 2 can archive the raster if it is still available.
- Studio Step 1 copy claims “99.4% Fit Accuracy” and precise anatomical mapping. That claim must not ship. The product must not promise identity preservation or perfect garment fidelity.
- The landing audience chips are All Pieces, Women, Men, Kids & Youth, and Unisex. The product specification also asks for girls’ and boys’ clothing as distinct choices. Phase 4 Studio settings should offer those choices. Phase 2 should keep the landing labels from the approved screen.
- Dark-mode landing and suggestions screens exist. The active theme stays light until a later phase audits dark tokens.
- The geographic explorer has no approved screen yet. Phase 3 needs an explicit MapLibre layout that still uses these tokens.
- Material Symbols require a request to Google Fonts at runtime. A later phase can self-host the subset if offline icon rendering becomes a requirement.
- No wildlife provider, map style, or AI provider is selected. GBIF is the likely public occurrence source because it needs no key; natural range must stay distinct from occurrences. The provider choice belongs to Phase 3 and Phase 5.

## External credentials still required

| Later phase | Name | State |
| --- | --- | --- |
| 6 | `NEXT_PUBLIC_SUPABASE_URL` | Absent |
| 6 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Absent |
| 6 | `SUPABASE_SERVICE_ROLE_KEY` | Absent. Server only. |
| 5 | Fashion concept provider and API key | Provider not chosen. Server only. |
| 5 | Virtual try-on provider and API key | Provider not chosen. Server only. |
| 3 | Wildlife source | Public GBIF needs no key. iNaturalist token only if that source is chosen. |
| 3 | MapLibre style | No tile-style URL or key chosen. |

No credential was invented or stored.
