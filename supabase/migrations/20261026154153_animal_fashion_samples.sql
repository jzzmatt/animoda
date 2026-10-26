-- Animoda Phase 6A. Apply this only to the Animoda Supabase project.
-- It was not applied from this change: no Animoda project is configured.
-- Do not run it against another application's database.
--
-- Access model:
--   animoda-fashion-samples is a public bucket for approved catalogue images only.
--   The object path stored in animal_fashion_samples.image_path is the source of truth.
--   image_url is a cached public URL and may be rebuilt from that path.
--   Anonymous and authenticated clients may read completed catalogue rows.
--   They cannot insert, update, or delete rows, and they have no write policy on the bucket.
--   Uploads use the server service role, which bypasses RLS. The service role stays on the server.
--   User portraits and virtual try-on results do not belong in this bucket or these tables.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'animoda-fashion-samples',
  'animoda-fashion-samples',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do nothing;

create table public.animal_fashion_samples (
  id uuid primary key default gen_random_uuid(),
  animal_id text not null,
  style text not null,
  title text not null,
  description text not null,
  image_path text,
  image_url text,
  generation_status text not null default 'pending',
  generation_model text,
  prompt_version text not null,
  prompt_hash text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  generated_at timestamptz,
  error_code text,
  constraint animal_fashion_samples_animal_style_key unique (animal_id, style),
  constraint animal_fashion_samples_animal_id_slug check (animal_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint animal_fashion_samples_style_check check (style in ('formal', 'casual_street', 'youth_couture')),
  constraint animal_fashion_samples_title_check check (char_length(title) between 1 and 160),
  constraint animal_fashion_samples_description_check check (char_length(description) between 1 and 2000),
  constraint animal_fashion_samples_status_check check (
    generation_status in ('pending', 'generating', 'completed', 'failed')
  ),
  constraint animal_fashion_samples_model_check check (
    generation_model is null or char_length(generation_model) between 1 and 120
  ),
  constraint animal_fashion_samples_prompt_version_check check (char_length(prompt_version) between 1 and 40),
  constraint animal_fashion_samples_prompt_hash_check check (prompt_hash ~ '^[a-f0-9]{64}$'),
  constraint animal_fashion_samples_image_path_check check (
    image_path is null
    or image_path ~ '^animals/[a-z0-9]+(?:-[a-z0-9]+)*/(formal|casual_street|youth_couture)/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$'
  ),
  constraint animal_fashion_samples_completed_requires_path check (
    generation_status <> 'completed' or image_path is not null
  ),
  constraint animal_fashion_samples_error_code_check check (
    error_code is null or error_code ~ '^[a-z0-9_]{1,80}$'
  )
);

comment on table public.animal_fashion_samples is
  'Public catalogue fashion samples. animal_id is the code catalogue slug. Image bytes live in storage bucket animoda-fashion-samples.';

comment on column public.animal_fashion_samples.image_path is
  'Storage object path. This is the source of truth. Rebuild a public URL from it instead of regenerating an image.';

comment on column public.animal_fashion_samples.image_url is
  'Optional cached public URL. Never the only record of where the image is stored.';

create index animal_fashion_samples_status_idx
  on public.animal_fashion_samples (generation_status);

create table public.fashion_sample_jobs (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid not null references public.animal_fashion_samples (id) on delete cascade,
  status text not null,
  retry_count integer not null default 0,
  error_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  started_at timestamptz,
  finished_at timestamptz,
  constraint fashion_sample_jobs_status_check check (status in ('pending', 'generating', 'completed', 'failed')),
  constraint fashion_sample_jobs_retry_check check (retry_count >= 0 and retry_count <= 5),
  constraint fashion_sample_jobs_error_code_check check (
    error_code is null or error_code ~ '^[a-z0-9_]{1,80}$'
  )
);

comment on table public.fashion_sample_jobs is
  'Server-only generation attempts for catalogue samples. Not readable by the browser roles.';

create index fashion_sample_jobs_sample_idx
  on public.fashion_sample_jobs (sample_id, created_at desc);

create unique index fashion_sample_jobs_one_open_idx
  on public.fashion_sample_jobs (sample_id)
  where status in ('pending', 'generating');

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger animal_fashion_samples_touch_updated_at
  before update on public.animal_fashion_samples
  for each row execute function public.touch_updated_at();

create trigger fashion_sample_jobs_touch_updated_at
  before update on public.fashion_sample_jobs
  for each row execute function public.touch_updated_at();

alter table public.animal_fashion_samples enable row level security;
alter table public.fashion_sample_jobs enable row level security;

revoke insert, update, delete on table public.animal_fashion_samples from anon, authenticated;
grant select on table public.animal_fashion_samples to anon, authenticated;
revoke all on table public.fashion_sample_jobs from anon, authenticated;

create policy animal_fashion_samples_public_read_completed
  on public.animal_fashion_samples
  for select
  to anon, authenticated
  using (generation_status = 'completed');

create policy animoda_fashion_samples_public_read
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'animoda-fashion-samples');
