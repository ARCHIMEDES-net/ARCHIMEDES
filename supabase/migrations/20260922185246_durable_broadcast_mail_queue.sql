create table public.broadcast_mail_jobs (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade,
 kind text not null check(kind in ('invitation','reminder_1440','reminder_30')), occurrence text not null default '',
 state text not null default 'active' check(state in ('active','complete','cancelled')), priority int not null default 0,
 next_run_at timestamptz not null default now(), expires_at timestamptz not null,
 created_by uuid references auth.users(id), created_at timestamptz not null default now(),
 unique(event_id,kind,occurrence)
);
create index broadcast_mail_jobs_due on public.broadcast_mail_jobs(state,priority desc,next_run_at);
create table public.broadcast_mail_batches (
 id uuid primary key default gen_random_uuid(), job_id uuid not null references public.broadcast_mail_jobs(id) on delete cascade,
 payload jsonb not null, event_signature text not null, first_attempt_at timestamptz not null default now(),
 state text not null default 'sending' check(state in ('sending','retry','accepted','rejected','failed','review')),
 lease_token uuid not null, lease_until timestamptz not null, next_attempt_at timestamptz not null default now(),
 attempts int not null default 1, error_code text, accepted_at timestamptz
);
create index broadcast_mail_batches_job on public.broadcast_mail_batches(job_id,state);
create table public.broadcast_mail_items (
 id uuid primary key default gen_random_uuid(), job_id uuid not null references public.broadcast_mail_jobs(id) on delete cascade,
 email text not null check(email=lower(trim(email))), state text not null default 'pending'
 check(state in ('pending','sending','accepted','skipped','failed','review')),
 batch_id uuid references public.broadcast_mail_batches(id), provider_message_id text, error_code text,
 unique(job_id,email)
);
create index broadcast_mail_items_batch on public.broadcast_mail_items(batch_id);
create table public.broadcast_mail_worker_state (
 singleton boolean primary key default true check(singleton), last_run_at timestamptz not null default now(),
 last_success_at timestamptz, error_code text
);
alter table public.broadcast_mail_jobs enable row level security;
alter table public.broadcast_mail_batches enable row level security;
alter table public.broadcast_mail_items enable row level security;
alter table public.broadcast_mail_worker_state enable row level security;
revoke all on public.broadcast_mail_jobs,public.broadcast_mail_batches,public.broadcast_mail_items,public.broadcast_mail_worker_state from anon,authenticated;
grant all on public.broadcast_mail_jobs,public.broadcast_mail_batches,public.broadcast_mail_items,public.broadcast_mail_worker_state to service_role;

create function public.broadcast_mail_email_allowed(p_event uuid,p_kind text,p_email text) returns boolean
language sql stable security invoker set search_path='' as $$
 select not exists(select 1 from public.profiles p left join public.notification_channel_preferences n on n.profile_id=p.id
 where lower(p.email)=p_email and (p.is_active is false or p.email_notifications_enabled is false or n.email_enabled is false))
 and (p_kind='invitation' or exists(select 1 from public.event_reminder_subscriptions r
 join public.profiles p on p.id=r.profile_id left join public.notification_channel_preferences n on n.profile_id=p.id
 where r.event_id=p_event and r.enabled and lower(p.email)=p_email
 and case when p_kind='reminder_1440' then coalesce(n.day_before_enabled,true) else coalesce(n.thirty_minutes_before_enabled,true) end));
$$;

create function public.enqueue_broadcast_mail(p_event_id uuid,p_emails text[],p_admin_id uuid) returns uuid
language plpgsql security invoker set search_path='' as $$
declare v_job uuid; v_start timestamptz;
begin
 if coalesce(cardinality(p_emails),0) not between 1 and 1000 then raise exception 'Expected 1 to 1000 recipients'; end if;
 select e.starts_at into v_start from public.events e join public.broadcast_sessions s on s.event_id=e.id
 where e.id=p_event_id and e.is_published and s.is_published and s.status='scheduled' and e.starts_at>now();
 if v_start is null then raise exception 'Vysílání musí být zveřejněné, připravené a v budoucnosti.'; end if;
 perform pg_advisory_xact_lock(hashtextextended('broadcast-mail:'||p_event_id::text,0));
 insert into public.broadcast_mail_jobs(event_id,kind,expires_at,created_by) values(p_event_id,'invitation',v_start,p_admin_id)
 on conflict(event_id,kind,occurrence) do update set state='active',next_run_at=now(),expires_at=excluded.expires_at
 returning id into v_job;
 update public.broadcast_mail_items set state='skipped',error_code='recipient_removed'
 where job_id=v_job and state in ('pending','failed') and not(email=any(p_emails));
 insert into public.broadcast_mail_items(job_id,email,state)
 select v_job,lower(trim(x)),case when exists(select 1 from public.broadcast_invitation_recipients r
 join public.broadcast_invitation_batches b on b.id=r.batch_id where r.event_id=p_event_id and r.email=lower(trim(x)) and b.accepted_at is not null) then 'accepted' when exists(select 1 from public.broadcast_invitation_recipients r where r.event_id=p_event_id and r.email=lower(trim(x))) then 'review' else 'pending' end
 from (select distinct unnest(p_emails) x) addresses
 on conflict(job_id,email) do update set state=case when broadcast_mail_items.state in ('skipped','failed') then 'pending' else broadcast_mail_items.state end,
 error_code=case when broadcast_mail_items.state in ('skipped','failed') then null else broadcast_mail_items.error_code end;
 return v_job;
end; $$;

create function public.queue_due_broadcast_reminders() returns integer language plpgsql security invoker set search_path='' as $$
declare v record; v_job uuid; v_added int; v_total int:=0;
begin
 for v in select e.id,e.starts_at,offsets.minutes from public.events e join public.broadcast_sessions s on s.event_id=e.id
 cross join (values(1440),(30)) offsets(minutes)
 where e.is_published and s.is_published and s.notifications_enabled and s.status='scheduled' and e.starts_at>now()
 and offsets.minutes=any(s.reminder_minutes) and now()>=e.starts_at-make_interval(mins=>offsets.minutes)
 and now()<e.starts_at-make_interval(mins=>offsets.minutes)+interval '15 minutes'
 loop
  insert into public.broadcast_mail_jobs(event_id,kind,occurrence,priority,expires_at)
  values(v.id,'reminder_'||v.minutes,v.starts_at::text,10,least(v.starts_at,v.starts_at-make_interval(mins=>v.minutes)+interval '15 minutes'))
  on conflict(event_id,kind,occurrence) do update set expires_at=excluded.expires_at returning id into v_job;
  insert into public.broadcast_mail_items(job_id,email)
  select distinct v_job,lower(trim(p.email)) from public.event_reminder_subscriptions r join public.profiles p on p.id=r.profile_id
  where r.event_id=v.id and r.enabled and nullif(trim(p.email),'') is not null
  and public.broadcast_mail_email_allowed(v.id,'reminder_'||v.minutes,lower(trim(p.email)))
  on conflict(job_id,email) do update set state='pending',error_code=null
  where broadcast_mail_items.state='skipped';
  get diagnostics v_added=row_count;
  if v_added>0 then update public.broadcast_mail_jobs set state='active',next_run_at=now() where id=v_job; end if;
  v_total:=v_total+v_added;
 end loop;
 return v_total;
end; $$;

create function public.claim_broadcast_mail_batch(p_job_id uuid,p_valid_emails text[],p_message jsonb,p_title text,p_starts timestamptz)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare j public.broadcast_mail_jobs%rowtype; b public.broadcast_mail_batches%rowtype; e record;
 v_signature text; v_payload jsonb; v_ids uuid[]; v_lease uuid:=gen_random_uuid();
begin
 perform pg_advisory_xact_lock(hashtextextended('broadcast-mail-job:'||p_job_id::text,0));
 select * into j from public.broadcast_mail_jobs where id=p_job_id;
 if j.id is null or j.state<>'active' then return jsonb_build_object('idle',true); end if;
 select ev.title,ev.starts_at,ev.is_published,s.is_published as session_published,s.status,s.notifications_enabled,s.reminder_minutes
 into e from public.events ev join public.broadcast_sessions s on s.event_id=ev.id where ev.id=j.event_id;
 if e is null or not e.is_published or not e.session_published or e.status<>'scheduled' or e.starts_at is null or e.starts_at<=now()
 or (j.kind<>'invitation' and (not e.notifications_enabled or not(split_part(j.kind,'_',2)::int=any(e.reminder_minutes)) or j.occurrence<>e.starts_at::text or j.expires_at<=now())) then
  update public.broadcast_mail_items set state='skipped',error_code='event_unavailable' where job_id=j.id and state='pending';
  update public.broadcast_mail_items set state='review',error_code='event_changed_after_attempt' where job_id=j.id and state='sending';
  update public.broadcast_mail_batches set state='review',error_code='event_changed_after_attempt' where job_id=j.id and state in ('retry','sending');
  update public.broadcast_mail_jobs set state='cancelled' where id=j.id;
  return jsonb_build_object('idle',true);
 end if;
 if e.title is distinct from p_title or e.starts_at is distinct from p_starts then return jsonb_build_object('refresh',true); end if;
 v_signature:=md5(coalesce(e.title,'')||'|'||e.starts_at::text);
 -- A request whose outcome is unknown can only be replayed verbatim, and only
 -- while its content and recipients remain valid. Otherwise isolate it for review.
 for b in select * from public.broadcast_mail_batches where job_id=j.id and state in ('sending','retry') order by first_attempt_at
 loop
  if b.lease_until>now() then return jsonb_build_object('idle',true); end if;
  if b.event_signature<>v_signature or b.first_attempt_at<now()-interval '23 hours' or b.attempts>=8
  or exists(select 1 from public.broadcast_mail_items i where i.batch_id=b.id and
   (not(i.email=any(p_valid_emails)) or not public.broadcast_mail_email_allowed(j.event_id,j.kind,i.email))) then
   update public.broadcast_mail_batches set state='review',error_code='changed_or_uncertain_delivery' where id=b.id;
   update public.broadcast_mail_items set state='review',error_code='changed_or_uncertain_delivery' where batch_id=b.id;
  elsif b.next_attempt_at<=now() then
   update public.broadcast_mail_batches set state='sending',lease_token=v_lease,lease_until=now()+interval '90 seconds',attempts=attempts+1 where id=b.id returning * into b;
   return to_jsonb(b);
  end if;
 end loop;
 update public.broadcast_mail_items i set state='skipped',error_code='recipient_disabled_or_removed'
 where i.job_id=j.id and i.state='pending' and
 (not(i.email=any(p_valid_emails)) or not public.broadcast_mail_email_allowed(j.event_id,j.kind,i.email));
 select array_agg(q.id order by q.email),jsonb_agg(p_message||jsonb_build_object('to',jsonb_build_array(q.email)) order by q.email)
 into v_ids,v_payload from (select id,email from public.broadcast_mail_items where job_id=j.id and state='pending' order by email limit 100) q;
 if coalesce(cardinality(v_ids),0)=0 then
  if not exists(select 1 from public.broadcast_mail_batches where job_id=j.id and state in ('sending','retry')) then
   update public.broadcast_mail_jobs set state='complete' where id=j.id;
  else
   update public.broadcast_mail_jobs set next_run_at=now()+interval '1 minute' where id=j.id;
  end if;
  return jsonb_build_object('idle',true);
 end if;
 insert into public.broadcast_mail_batches(job_id,payload,event_signature,lease_token,lease_until)
 values(j.id,v_payload,v_signature,v_lease,now()+interval '90 seconds') returning * into b;
 update public.broadcast_mail_items set state='sending',batch_id=b.id where id=any(v_ids);
 return to_jsonb(b);
end; $$;

create function public.finish_broadcast_mail_batch(p_batch_id uuid,p_lease uuid,p_outcome text,p_ids jsonb default '[]',p_error text default null)
returns boolean language plpgsql security invoker set search_path='' as $$
declare b public.broadcast_mail_batches%rowtype;
begin
 select * into b from public.broadcast_mail_batches where id=p_batch_id for update;
 if b.id is null or b.lease_token<>p_lease or b.state<>'sending' then return false; end if;
 if p_outcome='accepted' then
  if jsonb_array_length(p_ids)<>jsonb_array_length(b.payload) then raise exception 'Incomplete provider receipt'; end if;
  update public.broadcast_mail_batches set state='accepted',accepted_at=now(),lease_until=now(),error_code=null where id=b.id;
  update public.broadcast_mail_items i set state='accepted',provider_message_id=p_ids->>((m.ordinality-1)::int),error_code=null
  from jsonb_array_elements(b.payload) with ordinality m(message,ordinality)
  where i.batch_id=b.id and i.email=m.message->'to'->>0;
 elsif p_outcome='rate_limited' then
  update public.broadcast_mail_batches set state='rejected',lease_until=now(),error_code=p_error where id=b.id;
  update public.broadcast_mail_items set state='pending',batch_id=null,error_code=p_error where batch_id=b.id;
 elsif p_outcome='rejected' then
  update public.broadcast_mail_batches set state='failed',lease_until=now(),error_code=p_error where id=b.id;
  update public.broadcast_mail_items set state='failed',error_code=p_error where batch_id=b.id;
 elsif p_outcome='uncertain' then
  update public.broadcast_mail_batches set state='retry',lease_until=now(),next_attempt_at=now()+interval '2 minutes',error_code=p_error where id=b.id;
 else raise exception 'Invalid outcome'; end if;
 update public.broadcast_mail_jobs set next_run_at=case when p_outcome='rate_limited' then now()+interval '1 minute' else now() end where id=b.job_id;
 return true;
end; $$;

create function public.broadcast_mail_job_status(p_event_id uuid) returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('jobId',j.id,'state',j.state,'total',count(i.id),
 'pending',count(i.id) filter(where i.state in ('pending','sending')),
 'accepted',count(i.id) filter(where i.state='accepted'),'skipped',count(i.id) filter(where i.state='skipped'),
 'failed',count(i.id) filter(where i.state='failed'),'review',count(i.id) filter(where i.state='review'),
 'workerLastRun',(select last_success_at from public.broadcast_mail_worker_state where singleton))
 from public.broadcast_mail_jobs j left join public.broadcast_mail_items i on i.job_id=j.id
 where j.event_id=p_event_id and j.kind='invitation' group by j.id;
$$;

-- Keep existing row-level attendance and subscription permissions in force.
create function public.attend_event_with_reminder(p_event_id uuid,p_organization_id uuid,p_remind boolean)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.event_attendees(event_id,organization_id,user_id) values(p_event_id,p_organization_id,auth.uid())
 on conflict(event_id,user_id) where not excluded_admin_context do nothing;
 insert into public.event_reminder_subscriptions(event_id,profile_id,enabled) values(p_event_id,auth.uid(),p_remind)
 on conflict(event_id,profile_id) do update set enabled=excluded.enabled;
end; $$;
revoke all on function public.attend_event_with_reminder(uuid,uuid,boolean) from public,anon;
grant execute on function public.attend_event_with_reminder(uuid,uuid,boolean) to authenticated;
revoke all on function public.broadcast_mail_email_allowed(uuid,text,text),public.enqueue_broadcast_mail(uuid,text[],uuid),public.queue_due_broadcast_reminders(),public.claim_broadcast_mail_batch(uuid,text[],jsonb,text,timestamptz),public.finish_broadcast_mail_batch(uuid,uuid,text,jsonb,text),public.broadcast_mail_job_status(uuid) from public,anon,authenticated;
grant execute on function public.broadcast_mail_email_allowed(uuid,text,text),public.enqueue_broadcast_mail(uuid,text[],uuid),public.queue_due_broadcast_reminders(),public.claim_broadcast_mail_batch(uuid,text[],jsonb,text,timestamptz),public.finish_broadcast_mail_batch(uuid,uuid,text,jsonb,text),public.broadcast_mail_job_status(uuid) to service_role;
