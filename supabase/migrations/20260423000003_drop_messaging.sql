-- Retires the realtime messaging feature: drops the messages + message_threads
-- tables, their trigger/function, and the message_type + thread_status enums.
-- Also rebuilds notification_type without the 'new_message' member since the
-- only producer (handle_new_message trigger) is gone.
--
-- This is part of the swap documented in the root README — messaging was
-- removed in favour of the new AI Cover Letter Assistant on the apply form.

begin;

-- Drop triggers + function first (they reference the tables).
drop trigger if exists handle_new_message on public.messages;
drop function if exists public.handle_new_message();
drop trigger if exists set_updated_at_message_threads on public.message_threads;

-- Drop tables; CASCADE removes indexes, RLS policies, and inbound FKs.
drop table if exists public.messages cascade;
drop table if exists public.message_threads cascade;

-- Retire unused enum types.
drop type if exists public.message_type;
drop type if exists public.thread_status;

-- Strip 'new_message' from the notification_type enum by rebuilding it.
-- Postgres does not support `alter type ... drop value`, so we rename the old
-- enum, create the new one, and cast the column across. Any existing
-- 'new_message' rows get remapped to 'system' so the cast never fails.
alter type public.notification_type rename to notification_type_old;
create type public.notification_type as enum (
  'application_received',
  'application_status_changed',
  'interview_scheduled',
  'job_match',
  'profile_view',
  'system'
);

alter table public.notifications
  alter column type type public.notification_type
  using (
    case type::text
      when 'new_message' then 'system'
      else type::text
    end
  )::public.notification_type;

drop type public.notification_type_old;

commit;
