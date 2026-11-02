alter table public."Booking"
  alter column payments drop default;

alter table public."Booking"
  alter column payments type text[]
  using payments::text[];

alter table public."Booking"
  alter column payments set default '{}'::text[];

comment on column public."Booking".payments is
  'Payment UUIDs or provider transaction references recorded for settlement review.';

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
      message = 'A payment reference is required before an order can be marked settled.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_booking_payment_uuid_for_settlement()
  from public, anon, authenticated;
