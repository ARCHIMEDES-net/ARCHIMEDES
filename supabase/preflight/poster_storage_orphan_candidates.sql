-- READ ONLY: inventory potential poster orphans for manual review.
-- This report never deletes or updates Storage objects or event rows.
-- A missing direct event reference is not proof that an object is unused:
-- verify public pages, hidden pages, emails, documents and manually copied URLs.

with poster_objects as (
  select
    object.id,
    object.name as object_path,
    object.created_at,
    object.updated_at,
    object.last_accessed_at,
    greatest(
      object.created_at,
      coalesce(object.updated_at, object.created_at),
      coalesce(object.last_accessed_at, object.created_at)
    ) as last_known_activity_at,
    coalesce((object.metadata ->> 'size')::bigint, 0) as size_bytes,
    object.metadata ->> 'mimetype' as mime_type
  from storage.objects object
  where object.bucket_id = 'posters'
), direct_event_references as (
  select
    poster.id as object_id,
    count(distinct event.id) as event_reference_count,
    array_agg(distinct event.id) filter (where event.id is not null) as event_ids
  from poster_objects poster
  left join public.events event
    on event.poster_path = poster.object_path
    or split_part(coalesce(event.poster_url, ''), '?', 1)
      like '%/storage/v1/object/public/posters/' || poster.object_path
  group by poster.id
)
select
  poster.object_path,
  poster.created_at,
  poster.updated_at,
  poster.last_accessed_at,
  poster.last_known_activity_at,
  poster.size_bytes,
  poster.mime_type,
  reference.event_reference_count,
  coalesce(reference.event_ids, array[]::uuid[]) as event_ids,
  poster.last_known_activity_at < now() - interval '90 days' as older_than_90_days,
  case
    when reference.event_reference_count > 0 then 'direct_event_reference'
    when poster.last_known_activity_at >= now() - interval '90 days' then 'retain_recent_unlinked'
    else 'manual_review_required'
  end as review_status,
  'Do not delete automatically; verify repository, public/hidden pages, emails and copied URLs.'
    as required_manual_check
from poster_objects poster
join direct_event_references reference on reference.object_id = poster.id
order by
  (reference.event_reference_count = 0) desc,
  poster.last_known_activity_at asc,
  poster.object_path;
