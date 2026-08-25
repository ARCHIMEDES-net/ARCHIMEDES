alter table public.registration_email_webhook_events
  add column if not exists recipient_email text,
  add column if not exists email_subject text,
  add column if not exists failure_reason text;

alter table public.registration_email_webhook_events
  drop constraint if exists registration_email_webhook_recipient_bounded,
  drop constraint if exists registration_email_webhook_subject_bounded,
  drop constraint if exists registration_email_webhook_failure_reason_bounded;

alter table public.registration_email_webhook_events
  add constraint registration_email_webhook_recipient_bounded
    check (recipient_email is null or length(recipient_email) between 3 and 320),
  add constraint registration_email_webhook_subject_bounded
    check (email_subject is null or length(email_subject) between 1 and 500),
  add constraint registration_email_webhook_failure_reason_bounded
    check (failure_reason is null or length(failure_reason) between 1 and 2000);

comment on column public.registration_email_webhook_events.recipient_email is
  'Recipient supplied by a signature-verified Resend lifecycle event; service-role only.';
comment on column public.registration_email_webhook_events.failure_reason is
  'Bounded diagnostic reason supplied by Resend for failed or bounced messages.';

create or replace function public.notify_registration_email_delivery_failure()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.delivery_status not in ('failed', 'bounced') then
    return new;
  end if;

  insert into public.user_notifications (
    profile_id,
    kind,
    title,
    body,
    target_path,
    available_at,
    dedupe_key
  )
  select
    p.id,
    'system',
    case new.delivery_status
      when 'bounced' then 'E-mail se vrátil jako nedoručitelný'
      else 'Odeslání e-mailu selhalo'
    end,
    concat_ws(
      E'\n',
      'ARCHIMEDES Live zaznamenal problém s doručením e-mailu.',
      'Příjemce: ' || coalesce(new.recipient_email, 'neuveden'),
      'Předmět: ' || coalesce(new.email_subject, 'neuveden'),
      'Důvod: ' || coalesce(new.failure_reason, 'Resend důvod neuvedl'),
      'ID zprávy: ' || new.provider_message_id
    ),
    '/portal/admin-start',
    now(),
    'registration-email-delivery-alert:' || new.event_id || ':' || p.id::text
  from public.profiles p
  where lower(btrim(p.email)) in (
      'antonin.koplik@eduvision.cz',
      'zuzana.novotna@archimedeslive.com'
    )
    and p.is_active is true
    and exists (
      select 1
      from public.platform_admins pa
      where pa.user_id = p.id
        and pa.role in ('admin', 'super_admin')
    )
  on conflict (dedupe_key) do nothing;

  return new;
end;
$$;

revoke all on function public.notify_registration_email_delivery_failure()
  from public, anon, authenticated;

drop trigger if exists registration_email_delivery_failure_notify
  on public.registration_email_webhook_events;

create trigger registration_email_delivery_failure_notify
after insert on public.registration_email_webhook_events
for each row execute function public.notify_registration_email_delivery_failure();

comment on function public.notify_registration_email_delivery_failure() is
  'Creates one deduplicated in-portal system alert for Antonin and Zuzana after a signature-verified Resend failed or bounced event.';
