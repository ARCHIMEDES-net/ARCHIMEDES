-- Blok A — sdílení dobré praxe (zadání 11. 7. 2026, návazné na krok 3)
--
-- Kontext: obce/spolky/školy sdílejí vlastní příklady dobré praxe
-- (text + fotky). Veřejný web ukazuje jen JEDNU kurátorovanou ukázku
-- (is_featured), registrovaní uživatelé portálu vidí celý schválený
-- feed na /portal/dobra-praxe. Schvaluje Zuzana Novotná — v appce už
-- existuje jako jediný platform admin (viz platform_admins / is_admin()),
-- takže "Zuzana schvaluje" mapuju na existující is_admin(), žádná nová
-- role není potřeba.
--
-- Návaznost: spusťte 0001 a 0002 PŘED touhle migrací — používám
-- is_org_admin() (0001) a is_admin() (existující funkce, volaná appkou
-- přes supabase.rpc("is_admin")).
--
-- Spuštění: Supabase Dashboard -> SQL Editor -> vlož a spusť.
--
-- MANUÁLNÍ KROK MIMO SQL: v Storage vytvořte bucket "dobra-praxe" jako
-- PUBLIC (stejná konvence jako stávající "portal-posts" — appka čte
-- fotky přes getPublicUrl, bez RLS select policy na storage.objects).
-- RLS na storage.objects níže řeší jen INSERT (kdo smí nahrávat).

-- 1) Číselník kategorií — dědí se z org_type organizace (bod 3.4 zadání).
-- Samostatná tabulka od activity_categories (0002), protože jde o jiný
-- koncept (typ organizace, ne konkrétní činnost spolku).
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

-- 2) Příspěvky dobré praxe.
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
  rejection_note text, -- interní, autorovi se nezobrazuje (bod 3.2 zadání)
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

-- Jen jeden řádek napříč tabulkou smí mít is_featured = true (bod 3.3).
create unique index if not exists best_practice_posts_one_featured
  on best_practice_posts ((is_featured))
  where is_featured;

create index if not exists best_practice_posts_org_idx
  on best_practice_posts (organization_id);

create index if not exists best_practice_posts_status_idx
  on best_practice_posts (status);

alter table best_practice_posts enable row level security;

-- SELECT: vlastní organizace (jakýkoli status) + admin (jakýkoli status)
-- + kdokoli přihlášený smí číst schválené (feed na /portal/dobra-praxe)
-- + veřejnost (anon) smí číst jen featured schválený příspěvek.
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

-- INSERT: jen org_admin za vlastní organizaci, vždy jako pending a bez
-- featured (nemůže si sám schválit ani zveřejnit na webu).
create policy "best_practice_posts_insert_org_admin"
  on best_practice_posts for insert
  to authenticated
  with check (
    is_org_admin(organization_id)
    and status = 'pending'
    and is_featured = false
    and author_user_id = auth.uid()
  );

-- UPDATE: org_admin smí editovat vlastní příspěvek, jen dokud čeká na
-- schválení (bod 5 zadání — "dokud nejsou schválené"), a nemůže si
-- přitom sám změnit status/featured. Admin smí měnit cokoli (schválení,
-- zamítnutí, featured výběr).
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

-- DELETE: org_admin smí smazat vlastní příspěvek, jen dokud čeká na
-- schválení; admin smí smazat cokoli.
create policy "best_practice_posts_delete_org_admin"
  on best_practice_posts for delete
  to authenticated
  using (is_org_admin(organization_id) and status = 'pending');

create policy "best_practice_posts_delete_admin"
  on best_practice_posts for delete
  to authenticated
  using (is_admin());

-- 3) set_featured_best_practice_post — výběr featured musí odznačit
-- předchozí a označit nový v jedné transakci (jinak by unique index
-- výše na chvíli kolidoval). SECURITY DEFINER + explicitní is_admin()
-- kontrola uvnitř, protože UPDATE RLS pro org_adminy zakazuje
-- is_featured = true, takže tohle musí jít mimo běžnou RLS cestu.
create or replace function set_featured_best_practice_post(post_id uuid)
returns void
language plpgsql
security definer
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

-- 4) Storage RLS — jen INSERT (SELECT řeší bucket.public, viz
-- poznámka nahoře). Cesta objektu musí začínat organization_id/, aby šlo
-- ověřit is_org_admin() ze storage.foldername().
create policy "dobra_praxe_upload_org_admin"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'dobra-praxe'
    and is_org_admin((storage.foldername(name))[1]::uuid)
  );
