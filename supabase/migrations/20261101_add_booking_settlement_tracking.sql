alter table public."Booking"
  add column if not exists payments uuid[] not null default '{}'::uuid[],
  add column if not exists loss_amount numeric(12,2) not null default 0,
  add column if not exists loss_reason text,
  add column if not exists partner_payment_settled boolean not null default false,
  add column if not exists fixwheel_payment_settled boolean not null default false,
  add column if not exists settled_at timestamp with time zone;

alter table public."Booking"
  drop constraint if exists booking_loss_amount_nonnegative,
  add constraint booking_loss_amount_nonnegative check (loss_amount >= 0);

comment on column public."Booking".payments is
  'Payment transaction UUIDs recorded for settlement review.';
comment on column public."Booking".loss_amount is
  'Verified loss amount for the completed order, in INR.';
comment on column public."Booking".loss_reason is
  'Operational reason for any verified loss.';
comment on column public."Booking".partner_payment_settled is
  'True only after the partner payment side is confirmed settled.';
comment on column public."Booking".fixwheel_payment_settled is
  'True only after the FixWheel payment side is confirmed settled.';
comment on column public."Booking".settled_at is
  'Timestamp set when both settlement sides are confirmed.';
