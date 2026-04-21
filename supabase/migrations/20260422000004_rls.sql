-- Talentforge — row-level security
-- RLS is the authorization spine. The service-role key (edge functions only)
-- bypasses RLS entirely. Every policy below applies to anon + authenticated.
--
-- Policy naming: <table>_<operation>_<scope>
-- Where operation ∈ {select, insert, update, delete} and
--       scope     ∈ {own, employer, candidate, applicants, public, ...}
--
-- Note: we do NOT grant candidates SELECT on match_scores — those scores are
-- for employer triage only. Candidates see only their aggregate % via other paths.

begin;

-- ----------------------------------------------------------------------------
-- enable RLS on every table
-- ----------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.user_roles          enable row level security;
alter table public.companies           enable row level security;
alter table public.candidate_profiles  enable row level security;
alter table public.jobs                enable row level security;
alter table public.applications        enable row level security;
alter table public.match_scores        enable row level security;
alter table public.career_predictions  enable row level security;
alter table public.message_threads     enable row level security;
alter table public.messages            enable row level security;
alter table public.notifications       enable row level security;
alter table public.saved_jobs          enable row level security;
alter table public.job_views           enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

-- Employers can view the profile of anyone who applied to a job they own.
create policy profiles_select_applicants on public.profiles
  for select to authenticated
  using (
    exists (
      select 1
        from public.applications a
        join public.jobs j on j.id = a.job_id
        where a.candidate_id = profiles.id
          and j.employer_id = (select auth.uid())
    )
  );

create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ----------------------------------------------------------------------------
-- user_roles (read-only from clients; writes happen via auth hook)
-- ----------------------------------------------------------------------------
create policy user_roles_select_own on public.user_roles
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- companies: publicly readable, employer-owned writes
-- ----------------------------------------------------------------------------
create policy companies_select_public on public.companies
  for select to anon, authenticated
  using (true);

create policy companies_insert_own on public.companies
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and (select public.get_user_role()) = 'employer'
  );

create policy companies_update_own on public.companies
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy companies_delete_own on public.companies
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- candidate_profiles
-- ----------------------------------------------------------------------------
create policy candidate_profiles_select_own on public.candidate_profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy candidate_profiles_select_applicants on public.candidate_profiles
  for select to authenticated
  using (
    exists (
      select 1
        from public.applications a
        join public.jobs j on j.id = a.job_id
        where a.candidate_id = candidate_profiles.id
          and j.employer_id = (select auth.uid())
    )
  );

create policy candidate_profiles_update_own on public.candidate_profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ----------------------------------------------------------------------------
-- jobs: public board + employer-owned writes
-- ----------------------------------------------------------------------------
-- Anyone (including anon) can read active published jobs.
create policy jobs_select_public on public.jobs
  for select to anon, authenticated
  using (status = 'active' and published_at is not null);

-- Owners can read their own jobs in any status.
create policy jobs_select_own on public.jobs
  for select to authenticated
  using (employer_id = (select auth.uid()));

create policy jobs_insert_own on public.jobs
  for insert to authenticated
  with check (
    employer_id = (select auth.uid())
    and (select public.get_user_role()) = 'employer'
  );

create policy jobs_update_own on public.jobs
  for update to authenticated
  using (employer_id = (select auth.uid()))
  with check (employer_id = (select auth.uid()));

create policy jobs_delete_own on public.jobs
  for delete to authenticated
  using (employer_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- applications
-- ----------------------------------------------------------------------------
create policy applications_select_own_candidate on public.applications
  for select to authenticated
  using (candidate_id = (select auth.uid()));

create policy applications_select_own_employer on public.applications
  for select to authenticated
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = applications.job_id
        and jobs.employer_id = (select auth.uid())
    )
  );

create policy applications_insert_candidate on public.applications
  for insert to authenticated
  with check (
    candidate_id = (select auth.uid())
    and (select public.get_user_role()) = 'candidate'
  );

create policy applications_update_employer on public.applications
  for update to authenticated
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = applications.job_id
        and jobs.employer_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.jobs
      where jobs.id = applications.job_id
        and jobs.employer_id = (select auth.uid())
    )
  );

create policy applications_update_own_candidate on public.applications
  for update to authenticated
  using (candidate_id = (select auth.uid()))
  with check (candidate_id = (select auth.uid()));

create policy applications_delete_own on public.applications
  for delete to authenticated
  using (candidate_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- match_scores — EMPLOYER ONLY READS
-- Candidates never see their own scores. Edge function writes via service_role.
-- ----------------------------------------------------------------------------
create policy match_scores_select_employer on public.match_scores
  for select to authenticated
  using (
    exists (
      select 1
        from public.applications a
        join public.jobs j on j.id = a.job_id
        where a.candidate_id = match_scores.candidate_id
          and a.job_id       = match_scores.job_id
          and j.employer_id  = (select auth.uid())
    )
  );
-- No insert/update/delete policies: writes happen only via service_role.

-- ----------------------------------------------------------------------------
-- career_predictions — candidate reads their own; service_role writes
-- ----------------------------------------------------------------------------
create policy career_predictions_select_own on public.career_predictions
  for select to authenticated
  using (candidate_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- message_threads — participants read/create/update
-- ----------------------------------------------------------------------------
create policy message_threads_select_participant on public.message_threads
  for select to authenticated
  using (
    employer_id = (select auth.uid())
    or candidate_id = (select auth.uid())
  );

create policy message_threads_insert_participant on public.message_threads
  for insert to authenticated
  with check (
    employer_id = (select auth.uid())
    or candidate_id = (select auth.uid())
  );

create policy message_threads_update_participant on public.message_threads
  for update to authenticated
  using (
    employer_id = (select auth.uid())
    or candidate_id = (select auth.uid())
  );

-- ----------------------------------------------------------------------------
-- messages — participants only; senders can mark read
-- ----------------------------------------------------------------------------
create policy messages_select_participant on public.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.message_threads t
      where t.id = messages.thread_id
        and (t.employer_id = (select auth.uid())
             or t.candidate_id = (select auth.uid()))
    )
  );

create policy messages_insert_participant on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.message_threads t
      where t.id = messages.thread_id
        and (t.employer_id = (select auth.uid())
             or t.candidate_id = (select auth.uid()))
    )
  );

create policy messages_update_participant on public.messages
  for update to authenticated
  using (
    exists (
      select 1 from public.message_threads t
      where t.id = messages.thread_id
        and (t.employer_id = (select auth.uid())
             or t.candidate_id = (select auth.uid()))
    )
  );

-- ----------------------------------------------------------------------------
-- notifications — per-user feed
-- ----------------------------------------------------------------------------
create policy notifications_select_own on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy notifications_delete_own on public.notifications
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- saved_jobs — candidate-owned bookmarks
-- ----------------------------------------------------------------------------
create policy saved_jobs_select_own on public.saved_jobs
  for select to authenticated
  using (candidate_id = (select auth.uid()));

create policy saved_jobs_insert_own on public.saved_jobs
  for insert to authenticated
  with check (
    candidate_id = (select auth.uid())
    and (select public.get_user_role()) = 'candidate'
  );

create policy saved_jobs_update_own on public.saved_jobs
  for update to authenticated
  using (candidate_id = (select auth.uid()))
  with check (candidate_id = (select auth.uid()));

create policy saved_jobs_delete_own on public.saved_jobs
  for delete to authenticated
  using (candidate_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- job_views — analytics, open insert, employer-only read
-- ----------------------------------------------------------------------------
create policy job_views_insert_any on public.job_views
  for insert to anon, authenticated
  with check (true);

create policy job_views_select_employer on public.job_views
  for select to authenticated
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = job_views.job_id
        and jobs.employer_id = (select auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- realtime: subscribe the tables that drive live UI
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.applications;
alter publication supabase_realtime add table public.message_threads;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;

commit;
