-- Blok A — sdílení dobré praxe (zadání 11. 7. 2026, návazné na krok 3)
--
-- Tento soubor je obnoven přesně ze záznamu
-- supabase_migrations.schema_migrations (version 20260711142939,
-- name blok_a_dobra_praxe). V živém projektu už je aplikovaný; do
-- repozitáře se vrací jako chybějící zdroj pravdy, nikoli k opětovnému
-- ručnímu spuštění nad produkcí.

create table if not exists best_practice_categories (
  code text primary key,
  label text not null,
  sort_order int not null
);

insert into best_practice_categories (code, label, sort_order) values
  ('obec', 'Obec', 1),
  ('spolek', 'Spolek', 2),
  ('skola', 'Škola', 3),
  ('seniori', 'Senioři', 4)
on conflict (code) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

alter table best_practice_categories enable row level security;

create policy "best_practice_categories_select_authenticated"
  on best_practice_categories for select
  to authenticated
  using (true);

create policy "best_practice_categories_write_admin"
  on best_practice_categories for all
  to authenticated
  using (is_admin())
  with check (is_admin());

create table if not exists best_practice_posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  author_user_id uuid not null references profiles(id),
  title text not null,
  body text not null,
  photo_paths text[] not null default '{}',
  category text not null references best_practice_categories(code),
  status text not null default 'pending'
    check (status = any (array['pending', 'approved', 'rejected'])),
  rejection_note text,
  is_featured boolean not null default false,
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint best_practice_posts_title_len check (char_length(title) <= 80),
  constraint best_practice_posts_body_len check (char_length(body) <= 2000),
  constraint best_practice_posts_photo_count check (
    array_length(photo_paths, 1) is null or array_length(photo_paths, 1) <= 5
  )
);

create unique index if not exists best_practice_posts_one_featured
  on best_practice_posts ((is_featured))
  where is_featured;

create index if not exists best_practice_posts_org_idx
  on best_practice_posts (organization_id);

create index if not exists best_practice_posts_status_idx
  on best_practice_posts (status);

alter table best_practice_posts enable row level security;

create policy "best_practice_posts_select_own_org"
  on best_practice_posts for select
  to authenticated
  using (is_org_admin(organization_id) or is_admin());

create policy "best_practice_posts_select_approved_authenticated"
  on best_practice_posts for select
  to authenticated
  using (status = 'approved');

create policy "best_practice_posts_select_featured_public"
  on best_practice_posts for select
  to anon
  using (status = 'approved' and is_featured);

create policy "best_practice_posts_insert_org_admin"
  on best_practice_posts for insert
  to authenticated
  with check (
    is_org_admin(organization_id)
    and status = 'pending'
    and is_featured = false
    and author_user_id = auth.uid()
  );

create policy "best_practice_posts_update_org_admin"
  on best_practice_posts for update
  to authenticated
  using (is_org_admin(organization_id) and status = 'pending')
  with check (is_org_admin(organization_id) and status = 'pending' and is_featured = false);

create policy "best_practice_posts_update_admin"
  on best_practice_posts for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "best_practice_posts_delete_org_admin"
  on best_practice_posts for delete
  to authenticated
  using (is_org_admin(organization_id) and status = 'pending');

create policy "best_practice_posts_delete_admin"
  on best_practice_posts for delete
  to authenticated
  using (is_admin());

create or replace function set_featured_best_practice_post(post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'Jen správce portálu může vybrat featured příspěvek.';
  end if;

  if not exists (
    select 1 from best_practice_posts
    where id = post_id and status = 'approved'
  ) then
    raise exception 'Featured může být jen schválený příspěvek.';
  end if;

  update best_practice_posts set is_featured = false where is_featured;
  update best_practice_posts
    set is_featured = true, updated_at = now()
    where id = post_id;
end;
$$;

create policy "dobra_praxe_upload_org_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'dobra-praxe'
    and is_org_admin((storage.foldername(name))[1]::uuid)
  );
