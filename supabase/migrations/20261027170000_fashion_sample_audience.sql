-- Phase 6B.1. Not applied by this change.
-- Adds an optional audience so a later approved phase can store one canonical
-- Fashion Sample per animal, audience, and style. Existing rows stay audience-null.
-- Their files and metadata are not updated, deleted, or reassigned.
--
-- Rollback, only while every audience value is still null:
--   drop index if exists public.animal_fashion_samples_audience_style_key;
--   drop index if exists public.animal_fashion_samples_legacy_style_key;
--   alter table public.animal_fashion_samples drop constraint if exists animal_fashion_samples_audience_check;
--   alter table public.animal_fashion_samples drop column if exists audience;
--   alter table public.animal_fashion_samples
--     add constraint animal_fashion_samples_animal_style_key unique (animal_id, style);

alter table public.animal_fashion_samples
  add column if not exists audience text;

alter table public.animal_fashion_samples
  drop constraint if exists animal_fashion_samples_audience_check;

alter table public.animal_fashion_samples
  add constraint animal_fashion_samples_audience_check
  check (audience is null or audience in ('men', 'women', 'kids'));

comment on column public.animal_fashion_samples.audience is
  'Optional target audience. Null means the row has not been matched to Men, Women, or Kids.';

alter table public.animal_fashion_samples
  drop constraint if exists animal_fashion_samples_animal_style_key;

create unique index if not exists animal_fashion_samples_legacy_style_key
  on public.animal_fashion_samples (animal_id, style)
  where audience is null;

create unique index if not exists animal_fashion_samples_audience_style_key
  on public.animal_fashion_samples (animal_id, audience, style)
  where audience is not null;
