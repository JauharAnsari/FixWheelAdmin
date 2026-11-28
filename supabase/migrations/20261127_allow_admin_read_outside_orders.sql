drop policy if exists "outside_orders_admin_select" on public."Outside_Order";

create policy "outside_orders_admin_select"
on public."Outside_Order"
for select
to authenticated
using (public.get_staff_role() = 'admin');
