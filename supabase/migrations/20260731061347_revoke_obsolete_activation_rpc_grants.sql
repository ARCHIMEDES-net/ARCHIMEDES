revoke execute on function public.activate_customer_with_admin(uuid, uuid, text, text, boolean)
from anon, authenticated;

revoke execute on function public.activate_municipality_with_admin(uuid, uuid, text, text, boolean)
from anon, authenticated;

grant execute on function public.activate_customer_with_admin(uuid, uuid, text, text, boolean)
to service_role;

grant execute on function public.activate_municipality_with_admin(uuid, uuid, text, text, boolean)
to service_role;
