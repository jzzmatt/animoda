# Phase 6B.1 — Fashion Sample audit

Audit date: 27 October 2026, 16:12 Africa/Luanda (2026-10-27T15:12:46.698Z).

The machine-readable result is [phase-6b1-fashion-sample-audit.json](./phase-6b1-fashion-sample-audit.json). Regenerate it with:

```bash
npx tsx scripts/audit-fashion-samples.ts
```

That script reads the gitignored server credentials, lists `animal_fashion_samples`, lists the `animoda-fashion-samples` bucket, and range-reads each referenced object. It rewrites only this JSON file. It does not insert, update, or delete database rows. It does not upload, overwrite, or delete Storage objects. It does not call an image-generation provider. It does not apply a migration.

## 1. Repository inspected

- Branch: `cursor/phase-6b1-fashion-samples-027a`
- Inspected commit: `c6dc42e9a70efac224d6c9c52701264d12e77124` (`origin/main` at the start of this phase, merge of pull request #11)
- Supabase project used for the read: `slkvjqzcvrxlvqvieqpp`
- The Supabase MCP project list for this run did not include that project. The audit used the existing server client and the configured secret key. No other Supabase project was queried. No new project was created. Credentials were not overwritten.

## 2. Actual animal count

37. That matches `src/content/catalogue.ts`.

## 3. Actual database sample-record count

111 rows in `public.animal_fashion_samples`.

Each animal has exactly one `formal`, one `casual_street`, and one `youth_couture` row. There is no audience column on the live table. Every inspected row was `completed`, pointed at `animals/{slug}/{style}/{id}.png`, and carried a generation model and a prompt version. The emerald tree boa rows use prompt version `boa-pilot-1`. The other rows use `catalogue-1`. The stored model is `gpt-image-2.5-sunburst`.

## 4. Storage verification

| Check | Result |
| --- | --- |
| Objects in `animoda-fashion-samples` | 111 |
| Rows whose `image_path` exists in that bucket | 111 |
| Objects with no database row | 0 |
| Public range read returned a PNG | 111 |
| HTTP status of those reads | 206 |
| PNG dimensions from IHDR | 1024×1536 on all 111 |

A sample is treated as retrievable when the public object URL returns a PNG signature on a range read of the first 32 bytes. That is the same check the application uses. It confirms the file is a PNG of the expected size. It is not a visual review of the garment.

## 5. Variant counts

Five target variants per animal is 185 slots.

| Assessment | Count |
| --- | --- |
| `reusable` | 37 |
| `missing` | 0 |
| `invalid` | 0 |
| `ambiguous` | 148 |

All 37 animals have the same shape: Kids · Youth Couture is `reusable`. Men · Formal Couture, Women · Formal Couture, Men · Casual & Streetwear, and Women · Casual & Streetwear are `ambiguous`. None of the 185 slots is ready as a full set. 37 of 185 are reusable.

## 6. Mapping

The live table is unique on `(animal_id, style)` and has no audience. Formal Couture and Casual & Streetwear prompts ask for “a person”. They do not name Men or Women. A filename or a style id is not enough to choose an audience.

Rules used by `assessAnimalVariants`:

- A completed Youth Couture row whose path matches, whose object exists, and whose PNG can be retrieved maps to Kids · Youth Couture (`legacy_youth`). The generation brief is for a child or young person and forbids an adult cut. Kids is the only Youth Couture audience.
- A Formal Couture or Casual & Streetwear row with no audience is `ambiguous` for both Men and Women, including when the file is missing or not a PNG. It is not assigned, and it is not treated as missing.
- An explicit `men`, `women`, or `kids` value, after the prepared migration exists, maps only to that audience. An unknown audience string becomes null. Two explicit rows for one slot are `ambiguous`.
- A slot with no row is `missing`. A row that is `pending` or `generating` is `invalid` for the audit and `preparing` in the interface. A completed row whose file is missing or not a PNG is `invalid`.

Phase 6B.2 plan from those rules:

| Plan | Count | Meaning |
| --- | --- | --- |
| Keep | 37 | Reusable Kids samples. Do not regenerate. |
| Hold for review | 148 | Ambiguous Men and Women slots. Do not generate a replacement. |
| Generate | 0 | No missing or failed slot. |
| Resume | 0 | No pending or generating row. |

The same stored formal image is the held record for both Men · Formal Couture and Women · Formal Couture. The same stored casual image is the held record for both casual slots. That is one image waiting for review, not two copies.

| Animal | Kids · Youth Couture | Formal Couture, held for Men and Women | Casual & Streetwear, held for Men and Women |
| --- | --- | --- | --- |
| plains-zebra | reusable `616f520f-b2c3-4694-9dde-65293a246ba5` | ambiguous `276c0801-f14e-4d71-8e41-bd34f845f514` | ambiguous `4947df1b-ffa5-41fc-a8f0-8012e9b26feb` |
| leopard | reusable `3c64ad35-fb9d-4c8e-871a-5bb81d96260c` | ambiguous `93ef24bb-ba85-470f-8677-ce991be785fc` | ambiguous `9fb88c75-6a89-476d-ad05-8770d8fefdf8` |
| african-elephant | reusable `57576064-2c2f-47aa-9a8e-ecc015a21fae` | ambiguous `0ec5bfe4-5a95-41e3-9910-d4ab1ca7e05f` | ambiguous `be01cd4f-0ee3-42b7-85c2-2115af97ff17` |
| lion | reusable `1506dbb2-da76-4f32-a4e2-d0914fe623b2` | ambiguous `8929a821-477d-435c-baa3-4b93aa4fa6c5` | ambiguous `d56ae2e4-1282-444e-9c2d-ae9401d770ec` |
| giraffe | reusable `9eab64ef-8adf-4022-9d37-46b4c2eed759` | ambiguous `d3a097c0-26ba-4624-ba5c-d6b13afe2859` | ambiguous `8881b8ae-1126-42b5-9034-ef9f88b470fb` |
| indian-peacock | reusable `2cd24eea-7081-4d63-8e76-59ccc6f6cfad` | ambiguous `c9f997fa-b6e6-49bd-928c-e643879ccf8c` | ambiguous `e9783cc2-eb5a-4346-b7ff-291d0b29b71e` |
| monarch-butterfly | reusable `e3a6d2c5-a9d7-4383-ba07-5a18d59df413` | ambiguous `7ca90ba9-04d2-49fc-9b16-48b6c2091032` | ambiguous `7fcab25a-99c7-4b37-8786-d4b9c8919185` |
| emperor-penguin | reusable `3f99252a-604a-433d-b667-253e0bbf9951` | ambiguous `dc69a8b4-6b43-4bdf-ab34-994b3b5dc7a0` | ambiguous `95d36ade-def4-4ee7-94c2-34dd76d2261c` |
| tiger | reusable `b32d6e02-1d63-4af4-93b9-18179bd6897c` | ambiguous `66711fc9-1593-4b4d-9360-85137bdc7483` | ambiguous `e9927a93-1e48-4390-b4b5-88f3401a5c2b` |
| emerald-tree-boa | reusable `36135fa4-6106-49fd-9b16-7a0e88ffbda9` | ambiguous `5d76449f-ff18-4952-a79d-7ed0f84becde` | ambiguous `e4351352-0b11-4660-a88c-92d3d40ae613` |
| halfmoon-male-betta | reusable `992a7d17-ae2b-4b06-b3a2-e1ce76f62bd1` | ambiguous `450d7c6a-cd9c-4c85-ab04-75c03b25e03c` | ambiguous `d4f84657-ab27-406f-bca6-3d239ebbba4d` |
| black-moor | reusable `de4fb459-9faa-4c1e-bd10-fb05c62e3307` | ambiguous `85bed809-b99f-4198-8002-51e2e7947212` | ambiguous `8a9e01e4-5ca9-49d3-8b3b-4fdf63cb34fd` |
| fantail | reusable `0a4f53fb-3eaa-4428-98a5-9611be94fcd9` | ambiguous `417113f4-2912-49f5-acd0-62fcacc73321` | ambiguous `fb1d5036-323b-4615-8179-1898ec9906c1` |
| shubunkin | reusable `df342850-e816-49a0-bdfd-334d96782369` | ambiguous `3b94b4e3-4e87-4cde-a8c7-6342dacc18ae` | ambiguous `64dbb639-21e9-4f75-9309-bb08b2eaf076` |
| livebearers | reusable `65bca5d3-c911-4bab-bcea-dfbd7c10ea6e` | ambiguous `5096b15d-634b-4035-9302-ed35ed87f940` | ambiguous `7612a2e6-d97f-4cf0-aad9-860650ab221d` |
| mandarin-fish | reusable `00716319-4dd5-423c-9f53-86ccaa85fa51` | ambiguous `370edead-d572-406e-88c5-3e91e76c5c6b` | ambiguous `4c4c44e5-ff60-45bd-9cf0-d8699831eed6` |
| moorish-idol | reusable `7b378d37-9b72-4a66-b213-c18d496284cc` | ambiguous `bc084791-47e9-4646-8ab3-25dbc04b0ce0` | ambiguous `bbdecb6c-f674-4656-99dc-d96ba3fab69b` |
| picasso-triggerfish | reusable `fe616854-efa5-4a91-9543-35fd90fcf0a7` | ambiguous `4ee05ffb-153a-424c-8d2e-16a61887fb0a` | ambiguous `ab1026bc-3506-4cab-8919-4836d3ac09b8` |
| rusty-parrotfish | reusable `22619ef8-d62b-4888-9d38-97df19f29ad9` | ambiguous `d23bf14a-66cf-4ef3-ab57-76daa2e8aefc` | ambiguous `446d7e80-6496-4d5a-a546-54da1bd10e1a` |
| an-erebus | reusable `7e84c26f-c800-4f24-b99d-3be37f899e4a` | ambiguous `ce68c276-da22-4248-ba55-38e58f866f00` | ambiguous `5e29ca6d-e802-4d6b-8f37-b2c46b57ff94` |
| army-green-moth | reusable `97186c08-bf35-45f6-9d9e-87b790a9c7d5` | ambiguous `ce642912-c4ca-4c14-8d24-a7ede85e6a82` | ambiguous `dacd9fcc-cc3f-47c4-8d28-30471d4f7b43` |
| hummingbird-hawk-moth | reusable `91066fc5-6f64-4785-b50d-49a9d350eb9e` | ambiguous `77258c1c-97dd-42f7-be4f-842cd255ee65` | ambiguous `b939deed-5450-4d35-9987-b70f319da843` |
| calligrapher-beetle | reusable `eaf4aa6f-5473-4368-a59f-1ca771d8184c` | ambiguous `40544940-aa0f-42e3-80b0-48374b59e037` | ambiguous `1571ee1e-b862-4dd7-8de5-5970695e38d6` |
| picasso-bug | reusable `7f776cf8-c37d-498f-b973-065bad498901` | ambiguous `531646c0-32f8-478c-8564-7734b93b2910` | ambiguous `58e8a58d-38c1-4308-a0f6-01b0165cb86e` |
| thorny-cricket | reusable `17c5415f-4ffd-4a76-84ce-9258aea3e857` | ambiguous `09d19bd6-1dd0-456d-a047-29d2bd5a1ca6` | ambiguous `df1abc79-b943-44e8-b894-95177bf66ea6` |
| horama-panthalon | reusable `e2ad1f1e-db0b-444f-8499-2b62bb6f7897` | ambiguous `41932dac-0baf-4bbc-8bf1-041b2b3818dd` | ambiguous `f6a6196c-ea97-4b67-8968-ecf181a3220e` |
| green-anaconda | reusable `c335801a-75ee-4418-82f1-4b6b29b0e07c` | ambiguous `1bf15d83-9c6a-47fc-8976-c4fb9ef85a60` | ambiguous `41c0f1ed-c2cd-4065-a00f-b56651cc3fb5` |
| ball-python | reusable `c3a88d59-ed93-4578-8f54-708e156ac50e` | ambiguous `7a0230f9-1492-4db3-b0ae-9f9b6e729c86` | ambiguous `81f206b7-e5b0-459f-806a-e7ef2d55e3c1` |
| ploughshare-tortoise | reusable `2739a501-9b9c-4d17-9e37-1e76310e4947` | ambiguous `3883d7b0-cdeb-4a70-9ae6-ea38cc91d9cf` | ambiguous `6cb78d54-8289-406e-aa11-1659f262ed4c` |
| rainbow-bright-chameleon | reusable `b80c12e6-3e00-4b53-8994-618b1d182cca` | ambiguous `e3a97f3e-3066-46e9-8112-6841b7b53f54` | ambiguous `5b83d73d-ec19-4cdb-b2bf-2e35ec1e3c70` |
| tokay-gecko | reusable `161549a2-b414-4ee4-bd4d-2a8e27402fe0` | ambiguous `72c77adf-fcd1-41f3-8779-a213ef5e5d2b` | ambiguous `846dd708-aca5-403e-8f52-afbd16242901` |
| scarlet-macaw | reusable `e4d31629-8cab-459d-8cce-5f22d0d3b250` | ambiguous `2cd5420f-2aee-4b8d-9134-25f4be4c687b` | ambiguous `fc901609-c9ac-404e-8d74-7eee1a9267c1` |
| victoria-crowned-pigeon | reusable `b5848825-bac4-4e30-8295-dabe543a287a` | ambiguous `7a0da4f2-3035-4fb6-a5ef-dd6bae554e04` | ambiguous `ac564c01-81fb-45cc-b7bb-9573461d5a21` |
| paradise-tanager | reusable `a64af34b-bd97-4ffb-90e8-591efccac24b` | ambiguous `9d8885cd-0ec9-45c1-ab2e-9c49d4fb5456` | ambiguous `713fa257-cbe0-41ea-9970-f5193f1758df` |
| phoenix-rooster | reusable `c46a9878-125f-4cfb-9e9e-95d8eb751975` | ambiguous `371c4e41-7b9d-475d-af28-22adaf357cb4` | ambiguous `7f4f50ad-dc2a-4d17-ac7b-3d943da4272f` |
| majestic-eagle | reusable `f21d8eb8-197a-4798-b62d-7ee6ae3da7b2` | ambiguous `4f556356-109f-41aa-a939-9939482d6810` | ambiguous `ef48b815-364a-40e9-a398-4d1926a43e91` |
| short-eared-owl | reusable `b60c3b4e-2540-460d-8a41-4484a06e919b` | ambiguous `dd03f5ef-6d54-4dc2-80bd-fbc0a1450ee6` | ambiguous `44e213e4-2fa2-46b9-a8a0-e7673d151433` |

### Visual spot check

Three emerald tree boa images were opened and looked at. The other 108 images were checked only as Storage objects and PNG headers. They were not visually assessed.

- Formal Couture, `animals/emerald-tree-boa/formal/5d76449f-ff18-4952-a79d-7ed0f84becde.png`: an adult woman in a floor-length green scale gown.
- Casual & Streetwear, `animals/emerald-tree-boa/casual_street/e4351352-0b11-4660-a88c-92d3d40ae613.png`: an adult man in a green scale jacket and trousers.
- Youth Couture, `animals/emerald-tree-boa/youth_couture/36135fa4-6106-49fd-9b16-7a0e88ffbda9.png`: a child in a green scale sweatshirt and skirt. The styling is age-appropriate.

Those two adult images are still `ambiguous`. One animal does not decide the other 36, and the stored prompts do not record an audience. The youth image supports the Kids mapping for this animal. The other 36 Kids mappings rest on the style id, the completed row, the PNG check, and the youth generation brief. They were not opened.

## 7. Files changed

Application and audit files for this phase:

- `src/content/fashion-samples.ts`
- `src/content/fashion-samples.test.ts`
- `src/server/fashion-samples/views.ts`
- `scripts/audit-fashion-samples.ts`
- `docs/reports/phase-6b1-fashion-sample-audit.json`
- `docs/reports/phase-6b1-fashion-sample-audit.md`
- `supabase/migrations/20261027170000_fashion_sample_audience.sql`
- `app/api/fashion-samples/[slug]/route.ts`
- `app/animals/[slug]/page.tsx`
- `app/api/studio/jobs/route.ts`
- `app/studio/page.tsx`
- `app/studio/animal/page.tsx`
- `app/studio/sample/page.tsx`
- `app/studio/photo/page.tsx`
- `app/studio/suggestions/page.tsx`
- `src/components/fashion/fashion-sample-board.tsx`
- `src/components/catalogue/animal-profile.tsx`
- `src/components/catalogue/persisted-fashion-samples.tsx`
- `src/components/studio/animal-step.tsx`
- `src/components/studio/fashion-sample-step.tsx`
- `src/components/studio/photo-step.tsx`
- `src/components/studio/look-step.tsx`
- `src/components/studio/next-step.tsx`
- `src/components/studio/blocked-step.tsx`
- `src/components/studio/studio-chrome.tsx`
- `src/components/studio/studio-job-notice.tsx`
- `src/components/studio/suggestions-step.tsx`
- `src/studio/session.ts`
- `src/studio/session.test.ts`
- `src/studio/studio-store.ts`
- `src/studio/studio-provider.tsx`
- `src/studio/use-studio-job.ts`
- `src/studio/jobs-client.ts`
- `src/studio/jobs-client.test.ts`
- `src/server/studio-jobs.ts`
- `src/server/studio-jobs.test.ts`
- `src/content/site.ts`
- `README.md`
- `docs/IMPLEMENTATION_STATUS.md`

`scripts/catalogue-fashion-samples.ts` can still generate images if someone passes `--generate` or `--regenerate`. It was not run.

## 8. Migrations

Created and not applied:

- `supabase/migrations/20261027170000_fashion_sample_audience.sql`

The migration adds a nullable `audience` check of `men`, `women`, or `kids`. It replaces the unique `(animal_id, style)` constraint with a partial unique index for audience-null rows and a partial unique index on `(animal_id, audience, style)` for rows that have an audience. It does not backfill audience, rewrite paths, or delete rows. Rollback comments are in the file and apply while every audience value is still null.

The live database still has the original unique `(animal_id, style)` constraint. The application does not select `audience`, so current reads keep working. Two Formal Couture rows for one animal cannot be stored until this migration is applied in a later approved step. The secret key used for the audit cannot run DDL.

## 9. Tests actually run

27 October 2026, about 16:24 Africa/Luanda:

- `npx eslint .`: passed.
- `npx tsc --noEmit`: passed.
- `npx vitest run`: 15 files, 81 tests passed. Coverage includes the audience and style matrix, the youth mapping, refusal to assign formal and casual rows, a broken PNG staying invalid, a generating row staying unavailable, the Phase 6B.2 plan holding ambiguous rows, Studio selection persistence, and studio jobs that do not call `ensureStoredAnimalSamples` or `runCatalogueFashionSamples`.
- `npx next build`: passed. `/api/fashion-samples/[slug]` and the studio job routes are dynamic. Animal profiles stay static.

No browser, Chrome, Edge, Playwright, Puppeteer, screenshot, or viewport check was run. No deployment.

## 10. Unresolved blockers

- 148 Men and Women slots are held. Phase 6B.2 has nothing safe to generate until those images are reviewed, or until an explicit decision says to leave the files in place and generate new audience-specific images beside them.
- The audience migration is not applied. New audience-specific rows cannot be inserted beside the current formal and casual rows until it is.
- Supabase MCP cannot see project `slkvjqzcvrxlvqvieqpp` from this run.
- Virtual try-on has no provider. A personalized request confirms the selected sample, stores no photograph, calls no provider, and records a failed job.
- `OPENAI_API_KEY` and `OPENAI_IMAGE_MODEL` stay server-side. `FASHION_CONCEPT_API_KEY`, `VIRTUAL_TRY_ON_API_KEY`, and `FASHION_SAMPLE_ADMIN_TOKEN` are not read.

## 11. Image generation

No image-generation call was made. `providerCalled` on the audit is false. Studio routes return before any catalogue runner. A request with `replaceStored` is rejected and does not confirm or generate. A mock job, only when `ANIMODA_MOCK_GENERATION=1`, says it does not count as a real Fashion Sample.

## 12. Storage objects

No Storage object was deleted or overwritten. Existing paths and row metadata were left as they were. The audit script and the application changes are read-only against the bucket.

## 13. Phase 6B.2 readiness

The application can name a missing or invalid variant by animal id, audience, and style through `planPhase6b2`. Reusable and ambiguous variants are excluded. A later approved run can read the catalogue, this audit, and the live table, generate only the generate and resume sets, store new PNGs, and verify them before marking them complete.

That set is empty today. Phase 6B.2 must not start from this report. It needs a separate approval, a reviewed decision on the 148 held images, and the audience migration applied before any new Men or Women row is inserted. This phase does not start Phase 6B.2, Phase 6C, Phase 7, or a deployment.
