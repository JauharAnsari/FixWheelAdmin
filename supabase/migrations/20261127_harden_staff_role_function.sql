alter function public.get_staff_role() set search_path = '';

revoke execute on function public.get_staff_role() from public;
revoke execute on function public.get_staff_role() from anon;
grant execute on function public.get_staff_role() to authenticated;
