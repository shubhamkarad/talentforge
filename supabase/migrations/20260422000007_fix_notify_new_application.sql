-- Fix: rename local RECORD variable to avoid collision with the table alias
-- used inside the SELECT. With both named `j`, PL/pgSQL left the variable
-- unassigned and the subsequent field access raised SQLSTATE 55000
-- ("record 'j' is not assigned yet"), which rolled back every new
-- application insert because the trigger fires in-transaction.

begin;

create or replace function public.notify_new_application()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  job_row record;
begin
  select j.title, j.employer_id, c.name as company_name
    into job_row
    from public.jobs j
    join public.companies c on c.id = j.company_id
    where j.id = new.job_id;

  -- If somehow the job row vanished, skip the notification rather than fail
  -- the whole application insert.
  if job_row.employer_id is null then
    return new;
  end if;

  insert into public.notifications (user_id, type, title, body, data, action_url)
  values (
    job_row.employer_id,
    'application_received',
    'New application received',
    'A new candidate applied for ' || job_row.title,
    jsonb_build_object(
      'application_id',  new.id,
      'job_id',          new.job_id,
      'candidate_id',    new.candidate_id
    ),
    '/applications/' || new.id
  );
  return new;
end;
$$;

commit;
