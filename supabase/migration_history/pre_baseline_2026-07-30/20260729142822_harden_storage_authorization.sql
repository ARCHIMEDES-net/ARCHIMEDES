-- Public buckets serve objects through their public URLs without a SELECT
-- policy. Object-table SELECT policies also permit listing object names and
-- metadata, so keep that capability limited to platform administrators.

-- Posters are managed only through platform-admin event screens.
drop policy if exists "Authenticated delete posters 1sk75qe_0" on storage.objects;
drop policy if exists "Authenticated delete posters 1sk75qe_1" on storage.objects;
drop policy if exists "Authenticated update posters 1sk75qe_0" on storage.objects;
drop policy if exists "Authenticated update posters 1sk75qe_1" on storage.objects;
drop policy if exists "Authenticated upload posters 1sk75qe_0" on storage.objects;
drop policy if exists "Public read posters 1sk75qe_0" on storage.objects;

create policy "posters_admin_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'posters' and public.is_admin());

create policy "posters_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'posters' and public.is_admin());

create policy "posters_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'posters' and public.is_admin())
  with check (bucket_id = 'posters' and public.is_admin());

create policy "posters_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'posters' and public.is_admin());

-- Worksheets are uploaded from the same platform-admin event screens.
drop policy if exists "Authenticated delete worksheets" on storage.objects;
drop policy if exists "Authenticated update worksheets" on storage.objects;
drop policy if exists "Authenticated upload worksheets" on storage.objects;
drop policy if exists "Public read worksheets" on storage.objects;

create policy "worksheets_admin_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'worksheets' and public.is_admin());

create policy "worksheets_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'worksheets' and public.is_admin());

create policy "worksheets_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'worksheets' and public.is_admin())
  with check (bucket_id = 'worksheets' and public.is_admin());

create policy "worksheets_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'worksheets' and public.is_admin());

-- Announcements are an admin-managed legacy bucket. Preserve the capability
-- while removing write access from ordinary authenticated users.
drop policy if exists "announcements_storage_delete_auth" on storage.objects;
drop policy if exists "announcements_storage_insert_auth" on storage.objects;
drop policy if exists "announcements_storage_read_public" on storage.objects;
drop policy if exists "announcements_storage_update_auth" on storage.objects;

create policy "announcements_admin_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'announcements' and public.is_admin());

create policy "announcements_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'announcements' and public.is_admin());

create policy "announcements_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'announcements' and public.is_admin())
  with check (bucket_id = 'announcements' and public.is_admin());

create policy "announcements_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'announcements' and public.is_admin());

-- Remove the duplicate unrestricted marketplace policy. New uploads use the
-- existing user-id-prefixed policy, while the owner-based delete policy keeps
-- historical object paths removable by their original uploader.
drop policy if exists "storage_marketplace_insert" on storage.objects;
drop policy if exists "mp_storage_read_auth" on storage.objects;

create policy "marketplace_admin_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'marketplace' and public.is_admin());

-- Other public media buckets do not need object-table listing for public URL
-- delivery. Keep SELECT only for admins so existing upsert flows still work.
drop policy if exists "portal_posts_public_read" on storage.objects;
drop policy if exists "schools_public_read" on storage.objects;

create policy "portal_posts_admin_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'portal-posts' and public.is_admin());

create policy "schools_admin_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'schools' and public.is_admin());

-- Enforce the file constraints already communicated by the active upload UIs
-- at the storage boundary, where a modified client cannot bypass them.
update storage.buckets
set
  file_size_limit = 7340032,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
where id = 'posters';

update storage.buckets
set
  file_size_limit = 15728640,
  allowed_mime_types = array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/octet-stream'
  ]
where id = 'worksheets';

update storage.buckets
set
  file_size_limit = 7340032,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
where id = 'marketplace';
