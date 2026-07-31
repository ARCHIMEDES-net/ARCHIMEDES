alter table public.leads
  drop constraint if exists leads_type_check;

alter table public.leads
  add constraint leads_type_check
  check (
    type = any (
      array[
        'obec'::text,
        'skola'::text,
        'senior'::text,
        'komunita'::text,
        'demo'::text,
        'classroom'::text
      ]
    )
  );

revoke execute on function public.get_portal_archive_events() from public;
revoke execute on function public.get_portal_archive_events() from anon;
grant execute on function public.get_portal_archive_events() to authenticated;
grant execute on function public.get_portal_archive_events() to service_role;
