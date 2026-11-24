alter table public."Booking"
add column if not exists cancellation_date timestamp with time zone;

comment on column public."Booking".cancellation_date is
'Admin-editable date and time when the booking was cancelled. Historical rows may be null and fall back to createdAt in reports.';
