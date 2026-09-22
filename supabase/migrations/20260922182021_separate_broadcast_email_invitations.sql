-- Email invitation recipients must never reserve WebMeeting seats.
create table public.broadcast_invitation_batches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'array' and jsonb_array_length(payload) between 1 and 100),
  first_attempt_at timestamptz not null default now(),
  accepted_at timestamptz,
  provider_message_ids jsonb,
  created_by uuid not null references auth.users(id)
);
create index broadcast_invitation_batches_event_idx on public.broadcast_invitation_batches(event_id);
create table public.broadcast_invitation_recipients (
  event_id uuid not null references public.events(id) on delete cascade,
  email text not null check (email = lower(trim(email))),
  batch_id uuid not null references public.broadcast_invitation_batches(id) on delete cascade,
  primary key (event_id, email)
);
create index broadcast_invitation_recipients_batch_idx on public.broadcast_invitation_recipients(batch_id);
alter table public.broadcast_invitation_batches enable row level security;
alter table public.broadcast_invitation_recipients enable row level security;
revoke all on public.broadcast_invitation_batches, public.broadcast_invitation_recipients from anon, authenticated;
grant all on public.broadcast_invitation_batches, public.broadcast_invitation_recipients to service_role;

-- Serialize selection per event. Retrying returns the identical persisted payload
-- and idempotency key, including when the provider succeeded but the response was lost.
create function public.prepare_broadcast_invitation_batch(p_event_id uuid, p_emails text[], p_message jsonb, p_admin_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_batch public.broadcast_invitation_batches%rowtype;
  v_emails text[];
  v_payload jsonb;
  v_accepted integer;
begin
  if coalesce(cardinality(p_emails),0) not between 1 and 1000 then
    raise exception 'Expected 1 to 1000 recipients';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('broadcast-invitations:' || p_event_id::text, 0));
  select b.* into v_batch from public.broadcast_invitation_batches b
    where b.event_id=p_event_id and b.accepted_at is null
    order by b.first_attempt_at limit 1;
  if v_batch.id is not null then
    return to_jsonb(v_batch);
  end if;
  select array_agg(candidate.email order by candidate.email) into v_emails from (
    select distinct lower(trim(address)) as email from unnest(p_emails) address
    where not exists (
      select 1 from public.broadcast_invitation_recipients r
      where r.event_id=p_event_id and r.email=lower(trim(address))
    )
    and not exists (
      select 1 from public.profiles p left join public.notification_channel_preferences n on n.profile_id=p.id
      where lower(p.email)=lower(trim(address))
        and (p.is_active is false or p.email_notifications_enabled is false or n.email_enabled is false)
    )
    order by email limit 100
  ) candidate;
  if coalesce(cardinality(v_emails),0)=0 then
    select count(*) into v_accepted from public.broadcast_invitation_recipients r
      join public.broadcast_invitation_batches b on b.id=r.batch_id
      where r.event_id=p_event_id and b.accepted_at is not null
      and r.email=any(p_emails);
    return jsonb_build_object('done',true,'accepted',v_accepted,'total',cardinality(p_emails));
  end if;
  select jsonb_agg(p_message || jsonb_build_object('to',jsonb_build_array(email)) order by email)
    into v_payload from unnest(v_emails) email;
  insert into public.broadcast_invitation_batches(event_id,payload,created_by)
    values(p_event_id,v_payload,p_admin_id) returning * into v_batch;
  insert into public.broadcast_invitation_recipients(event_id,email,batch_id)
    select p_event_id,email,v_batch.id from unnest(v_emails) email;
  return to_jsonb(v_batch);
end;
$$;
revoke all on function public.prepare_broadcast_invitation_batch(uuid,text[],jsonb,uuid) from public, anon, authenticated;
grant execute on function public.prepare_broadcast_invitation_batch(uuid,text[],jsonb,uuid) to service_role;
