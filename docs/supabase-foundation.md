# Supabase foundation

Phase 6A prepares permanent storage for catalogue fashion samples. The migration in `supabase/migrations/20261026154153_animal_fashion_samples.sql` is in version control and has not been applied to Postgres.

The gitignored `.env` now points at `https://slkvjqzcvrxlvqvieqpp.supabase.co` with `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`. The server reads those dashboard names as well as `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The secret key reaches the Data API and Storage. It cannot run SQL, and the Supabase management connection still has no permission on this project, so the migration was not applied. The other projects on that management account were not changed.

## Access model

`animoda-fashion-samples` is a public bucket for approved catalogue images only. A public URL is required so the catalogue can show an image after a refresh without minting a new signed URL. The PostgreSQL column `image_path` is the source of truth. `image_url` is only a cached copy of the public URL and can be rebuilt from the path.

Anonymous and authenticated clients can read rows whose `generation_status` is `completed`. They cannot insert, update, or delete those rows. The bucket has a public read policy for the `public` role and no write policy for browser roles. The server uploads with `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`, which bypasses row level security and must never be sent to the browser.

User portraits and virtual try-on results stay out of this bucket. Phase 6C will use a separate private store.

Object paths look like `animals/{animal_id}/{style}/{sample_id}.png`. `animal_id` is the catalogue slug. The catalogue file remains the source of animal descriptions. The database does not copy that catalogue.

`fashion_sample_jobs` records server-side attempts. Browser roles have no privileges on it. One sample can have only one pending or generating job.

## What was verified on 26 October 2026

The secret key listed the project, created the public bucket `animoda-fashion-samples`, uploaded a one-pixel PNG, and read those same bytes back from the public object URL. The probe object was then removed. An authenticated download afterwards reports that the object is gone. The bucket remains, with a 10 MB limit and PNG, JPEG, and WebP allowed. `public.animal_fashion_samples` is not in the schema cache. No catalogue image was generated.

## What is still required

Apply `supabase/migrations/20261026154153_animal_fashion_samples.sql` in the Animoda SQL editor, or add a database password or personal access token to the gitignored `.env` under a server-only name. Do not paste secrets into chat. The bucket insert is safe to run again.

`FASHION_SAMPLE_ADMIN_TOKEN` is still absent, so the report route stays closed. `OPENAI_API_KEY` is present and was not used. Phase 6B waits until a sample row can be saved and its stored object read back.
