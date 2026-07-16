-- Read-only inventura starých archivů. Nic nezapisuje ani nemění.
-- Výstup rozliší skutečný YouTube záznam, Google Meet určený pouze pro
-- živý vstup, jiný odkaz vyžadující ruční kontrolu a úplně chybějící URL.
with classified as (
  select
    e.id as event_id,
    e.title,
    e.starts_at,
    e.is_published,
    bs.status as broadcast_status,
    nullif(trim(bs.recording_url), '') as recording_url,
    nullif(trim(e.stream_url), '') as stream_url,
    nullif(trim(bs.viewer_url), '') as viewer_url,
    case
      when lower(coalesce(bs.recording_url, '')) ~
        '(youtube\.com|youtu\.be|youtube-nocookie\.com)'
        then 'RECORDING_YOUTUBE'
      when lower(coalesce(bs.recording_url, '')) ~ 'meet\.google\.com'
        then 'RECORDING_GOOGLE_MEET_INVALID'
      when nullif(trim(bs.recording_url), '') is not null
        then 'RECORDING_OTHER_REVIEW'
      when lower(coalesce(e.stream_url, '')) ~
        '(youtube\.com|youtu\.be|youtube-nocookie\.com)'
        then 'LEGACY_YOUTUBE_IN_STREAM_URL'
      when lower(coalesce(e.stream_url, '')) ~ 'meet\.google\.com'
        or lower(coalesce(bs.viewer_url, '')) ~ 'meet\.google\.com'
        then 'GOOGLE_MEET_ONLY_DO_NOT_ARCHIVE'
      when nullif(trim(e.stream_url), '') is not null
        or nullif(trim(bs.viewer_url), '') is not null
        then 'OTHER_LIVE_URL_REVIEW'
      else 'MISSING_RECORDING_URL'
    end as archive_classification
  from public.events e
  left join public.broadcast_sessions bs on bs.event_id = e.id
)
select
  event_id,
  title,
  starts_at,
  is_published,
  broadcast_status,
  recording_url,
  stream_url,
  viewer_url,
  archive_classification,
  count(*) over (partition by archive_classification) as classification_count
from classified
order by archive_classification, starts_at desc nulls last, title;
