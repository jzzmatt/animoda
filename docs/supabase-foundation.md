# Supabase foundation

Phase 6A prepares permanent storage for catalogue fashion samples. The migration in `supabase/migrations/20261026154153_animal_fashion_samples.sql` is in version control. It was applied in the Animoda SQL editor and then checked through the server secret key on 26 October 2026.

The gitignored `.env` points at `https://slkvjqzcvrxlvqvieqpp.supabase.co` with `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`. The server reads those dashboard names as well as `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The MCP login for this project still requires authentication, so the check used the secret key rather than the management connection.

## Access model

`animoda-fashion-samples` is a public bucket for approved catalogue images only. A public URL is required so the catalogue can show an image after a refresh without minting a new signed URL. The PostgreSQL column `image_path` is the source of truth. `image_url` is only a cached copy of the public URL and can be rebuilt from the path.

Anonymous and authenticated clients can read rows whose `generation_status` is `completed`. They cannot insert, update, or delete those rows. The bucket has a public read policy for the `public` role and no write policy for browser roles. The server uploads with `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`, which bypasses row level security and must never be sent to the browser.

User portraits and virtual try-on results stay out of this bucket. Phase 6C will use a separate private store.

Object paths look like `animals/{animal_id}/{style}/{sample_id}.png`. `animal_id` is the catalogue slug. The catalogue file remains the source of animal descriptions. The database does not copy that catalogue.

`fashion_sample_jobs` records server-side attempts. Browser roles have no privileges on it. One sample can have only one pending or generating job.

## What was verified on 26 October 2026 at about 17:15 Africa/Luanda

Both tables are in the Data API and both are empty. The public bucket `animoda-fashion-samples` is present, limited to 10 MB, and allows PNG, JPEG, and WebP. Its root is empty.

A temporary `phase6a-probe` row was written with the secret key and then removed. The checks were:

- An unknown style was rejected.
- A second row for the same animal and style was rejected by the unique constraint.
- A completed row without an image path was rejected.
- The publishable key could not see the pending row, could not insert, and could not read `fashion_sample_jobs`.
- After the PNG was uploaded and the row was marked completed, the publishable key returned that row and the public URL returned the same 70 bytes.
- Deleting the row removed the job. The file was removed. The table, the job table, and the bucket were empty again.

The temporary probe was removed. The bucket now holds 111 completed catalogue samples, three styles for each of the 37 animals. `FASHION_SAMPLE_ADMIN_TOKEN` is still absent, so `GET /api/admin/fashion-samples` stays closed. Phase 6C has not started.
