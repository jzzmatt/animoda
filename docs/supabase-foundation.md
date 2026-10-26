# Supabase foundation

Phase 6A prepares permanent storage for catalogue fashion samples. The migration in `supabase/migrations/20261026154153_animal_fashion_samples.sql` is in version control and has not been applied. This repository has no Animoda project URL or server key.

The requested project `slkvjqzcvrxlvqvieqpp` is not available to the connected Supabase account. Project, table, and migration reads for that reference returned a permission error on 26 October 2026. It does not appear in the account's project list. The databases that are available belong to other applications and were not changed. No new project was created.

## Access model

`animoda-fashion-samples` is a public bucket for approved catalogue images only. A public URL is required so the catalogue can show an image after a refresh without minting a new signed URL. The PostgreSQL column `image_path` is the source of truth. `image_url` is only a cached copy of the public URL and can be rebuilt from the path.

Anonymous and authenticated clients can read rows whose `generation_status` is `completed`. They cannot insert, update, or delete those rows. The bucket has a public read policy for the `public` role and no write policy for browser roles. The server uploads with `SUPABASE_SERVICE_ROLE_KEY`, which bypasses row level security and must never be sent to the browser.

User portraits and virtual try-on results stay out of this bucket. Phase 6C will use a separate private store.

Object paths look like `animals/{animal_id}/{style}/{sample_id}.png`. `animal_id` is the catalogue slug. The catalogue file remains the source of animal descriptions. The database does not copy that catalogue.

`fashion_sample_jobs` records server-side attempts. Browser roles have no privileges on it. One sample can have only one pending or generating job.

## What is still required

Grant this account access to project `slkvjqzcvrxlvqvieqpp`, or set these names in the gitignored `.env` file. Do not put the values in `.env.example` or in chat.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` for later browser reads of completed rows
- `SUPABASE_SERVICE_ROLE_KEY` for server writes and the storage check
- `FASHION_SAMPLE_ADMIN_TOKEN` before calling the report route
- `OPENAI_API_KEY` when Phase 6B generation is approved

After those values exist, apply the migration to the Animoda project only, then call `GET /api/admin/fashion-samples` with `Authorization: Bearer <FASHION_SAMPLE_ADMIN_TOKEN>`. The route reads rows and checks each object. It does not generate images. A sample counts as completed only when its row is valid and the object exists in the bucket.
