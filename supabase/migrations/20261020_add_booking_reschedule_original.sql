alter table public."Booking"
  add column if not exists reschedule_original jsonb;

comment on column public."Booking".reschedule_original is
  'Original bookingDate and preferredSlot captured before the first reschedule so it can be undone safely.';
