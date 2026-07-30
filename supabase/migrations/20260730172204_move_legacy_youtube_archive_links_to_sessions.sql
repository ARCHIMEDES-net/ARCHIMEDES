with youtube_events as (
  select e.id, e.stream_url, e.starts_at
  from public.events e
  where e.stream_url is not null
    and (
      e.stream_url ~* '^https?://(www\.)?youtu\.be/'
      or e.stream_url ~* '^https?://(www\.|m\.)?youtube\.com/'
    )
), existing as (
  select distinct on (bs.event_id)
    bs.id,
    bs.event_id
  from public.broadcast_sessions bs
  join youtube_events ye on ye.id = bs.event_id
  order by bs.event_id, bs.created_at desc
)
update public.broadcast_sessions bs
set
  recording_url = ye.stream_url,
  recording_status = 'published',
  status = 'finished',
  is_published = true,
  starts_at = coalesce(bs.starts_at, ye.starts_at),
  updated_at = now()
from youtube_events ye
join existing ex on ex.event_id = ye.id
where bs.id = ex.id;

insert into public.broadcast_sessions (
  event_id,
  status,
  platform,
  recording_url,
  recording_status,
  starts_at,
  is_published
)
select
  e.id,
  'finished',
  'legacy_youtube',
  e.stream_url,
  'published',
  e.starts_at,
  true
from public.events e
where e.stream_url is not null
  and (
    e.stream_url ~* '^https?://(www\.)?youtu\.be/'
    or e.stream_url ~* '^https?://(www\.|m\.)?youtube\.com/'
  )
  and not exists (
    select 1
    from public.broadcast_sessions bs
    where bs.event_id = e.id
  );

update public.events e
set stream_url = null,
    updated_at = now()
where e.stream_url is not null
  and (
    e.stream_url ~* '^https?://(www\.)?youtu\.be/'
    or e.stream_url ~* '^https?://(www\.|m\.)?youtube\.com/'
  );
