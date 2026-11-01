create or replace function public.enforce_booking_payment_uuid_for_settlement()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (
    coalesce(new.settlement, '') = 'Done'
    or coalesce(new.payment_settled, '') = 'Done'
    or coalesce(new.partner_payment_settled, false)
    or coalesce(new.fixwheel_payment_settled, false)
  ) and coalesce(cardinality(new.payments), 0) = 0 then
    raise exception using
      errcode = '23514',
      message = 'A payment UUID is required before an order can be marked settled.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_booking_payment_uuid_for_settlement()
  from public, anon, authenticated;

drop trigger if exists booking_require_payment_uuid_for_settlement
  on public."Booking";

create trigger booking_require_payment_uuid_for_settlement
before insert or update of settlement, payment_settled,
  partner_payment_settled, fixwheel_payment_settled, payments
on public."Booking"
for each row
execute function public.enforce_booking_payment_uuid_for_settlement();
