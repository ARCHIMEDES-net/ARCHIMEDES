alter table public.organizations drop constraint organizations_license_plan_allowed;
alter table public.organizations add constraint organizations_license_plan_allowed check (license_plan is null or license_plan in ('paid_monthly','paid_annual','classroom_free_12m','competition_prize_12m','kridla_free_2027'));
alter table public.organizations add constraint organizations_kridla_terms check (license_plan is distinct from 'kridla_free_2027' or (org_type='child_home' and billing_status='not_applicable' and license_started_at is not null and license_valid_until is not null and license_started_at < license_valid_until and license_valid_until = timestamptz '2027-12-31 23:59:59.999999 Europe/Prague'));
do $migration$
declare definition text; original text;
begin
 select pg_get_functiondef('public.get_my_organizations(uuid[])'::regprocedure) into original;
 definition := replace(original, 'when parent.status = ''active''', 'when child.license_plan is distinct from ''kridla_free_2027'' and parent.status = ''active''');
 if definition=original then raise exception 'Expected organization license fallback not found'; end if;
 execute definition;
 select pg_get_functiondef('public.has_access_program(uuid)'::regprocedure) into original;
 definition := replace(original, 'and organization.status = ''active''', 'and organization.status = ''active'' and (organization.license_plan is distinct from ''kridla_free_2027'' or (organization.license_status = ''active'' and organization.license_valid_until >= now()))');
 if definition=original then raise exception 'Expected program predicate not found'; end if;
 execute definition;
end $migration$;
comment on constraint organizations_kridla_terms on public.organizations is 'Křídla pro budoucnost: child homes have free full-program access through 31 December 2027 inclusive (Europe/Prague). Memorandum confirmation is recorded in contract_status; early admission may be explicitly authorized by the platform owner.';