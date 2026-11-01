alter table public."Booking"
  add column if not exists vehicle_cc text;

create or replace function public.populate_booking_vehicle_cc()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched_cc text;
begin
  if nullif(btrim(new.vehicle_cc), '') is not null then
    return new;
  end if;

  matched_cc := substring(
    coalesce(new."bikeModel", '')
    from '(?i)([0-9]+\s*cc\s*&\s*above|[0-9]+\s*(?:to|-|–)\s*[0-9]+\s*cc|[0-9]+\s*cc)'
  );

  if nullif(btrim(matched_cc), '') is null then
    select vehicle.vehicle_cc
      into matched_cc
    from public."User_Vehicle" as vehicle
    where nullif(btrim(vehicle.vehicle_cc), '') is not null
      and length(regexp_replace(coalesce(new.phone, ''), '\D', '', 'g')) >= 10
      and right(regexp_replace(coalesce(vehicle."Phone_Number", ''), '\D', '', 'g'), 10)
        = right(regexp_replace(coalesce(new.phone, ''), '\D', '', 'g'), 10)
      and nullif(
        regexp_replace(lower(coalesce(vehicle."Vehicle_Name", '') || coalesce(vehicle."Vehicle_Model", '')), '[^a-z0-9]+', '', 'g'),
        ''
      ) is not null
      and regexp_replace(lower(coalesce(new."bikeModel", '')), '[^a-z0-9]+', '', 'g') like
        '%' || regexp_replace(lower(coalesce(vehicle."Vehicle_Name", '') || coalesce(vehicle."Vehicle_Model", '')), '[^a-z0-9]+', '', 'g') || '%'
    order by length(coalesce(vehicle."Vehicle_Name", '') || coalesce(vehicle."Vehicle_Model", '')) desc,
             vehicle.created_at desc
    limit 1;
  end if;

  new.vehicle_cc := nullif(btrim(matched_cc), '');
  return new;
end;
$$;

revoke all on function public.populate_booking_vehicle_cc() from public, anon, authenticated;

drop trigger if exists booking_populate_vehicle_cc on public."Booking";
create trigger booking_populate_vehicle_cc
before insert or update of phone, "bikeModel", vehicle_cc
on public."Booking"
for each row
execute function public.populate_booking_vehicle_cc();

update public."Booking"
set vehicle_cc = null
where nullif(btrim(vehicle_cc), '') is null;
