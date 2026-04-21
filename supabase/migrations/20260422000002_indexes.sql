-- Talentforge — indexes
-- Performance indexes for the schema defined in 20260422000001_schema.sql.
-- Skips columns already covered by PRIMARY KEY or UNIQUE constraints.

begin;

-- ----------------------------------------------------------------------------
-- profiles (id is PK — no extra index needed on it)
-- ----------------------------------------------------------------------------
create index profiles_role_idx   on public.profiles (role);
create index profiles_email_idx  on public.profiles (email);

-- user_roles.user_id is UNIQUE, so it already has an index — skip.

-- ----------------------------------------------------------------------------
-- companies
-- ----------------------------------------------------------------------------
create index companies_owner_id_idx  on public.companies (owner_id);
create index companies_industry_idx  on public.companies (industry);
-- companies.slug is UNIQUE → indexed by constraint

-- ----------------------------------------------------------------------------
-- candidate_profiles
-- ----------------------------------------------------------------------------
create index candidate_profiles_open_to_work_idx      on public.candidate_profiles (open_to_work);
create index candidate_profiles_experience_years_idx  on public.candidate_profiles (experience_years);
create index candidate_profiles_last_active_idx       on public.candidate_profiles (last_active_at desc);
create index candidate_profiles_skills_gin            on public.candidate_profiles using gin (skills);

-- ----------------------------------------------------------------------------
-- jobs: search / filter / sort paths
-- ----------------------------------------------------------------------------
create index jobs_company_id_idx        on public.jobs (company_id);
create index jobs_employer_id_idx       on public.jobs (employer_id);
create index jobs_status_idx            on public.jobs (status);
create index jobs_remote_type_idx       on public.jobs (remote_type);
create index jobs_employment_type_idx   on public.jobs (employment_type);
create index jobs_experience_level_idx  on public.jobs (experience_level);
create index jobs_location_idx          on public.jobs (location);
create index jobs_salary_range_idx      on public.jobs (salary_min, salary_max);
create index jobs_created_at_idx        on public.jobs (created_at desc);
create index jobs_published_at_idx      on public.jobs (published_at desc nulls last);

-- Partial index: the primary public-facing query is "active jobs, newest first".
create index jobs_active_published_idx on public.jobs (published_at desc)
  where status = 'active';

-- GIN indexes for full-text search and array-style skill matching.
create index jobs_fts_gin             on public.jobs using gin (fts);
create index jobs_skills_required_gin on public.jobs using gin (skills_required);

-- ----------------------------------------------------------------------------
-- applications
-- The UNIQUE (job_id, candidate_id) constraint already indexes job_id as the
-- leading column — no standalone job_id index needed.
-- ----------------------------------------------------------------------------
create index applications_candidate_id_idx  on public.applications (candidate_id);
create index applications_status_idx        on public.applications (status);
create index applications_applied_at_idx    on public.applications (applied_at desc);
create index applications_job_status_idx    on public.applications (job_id, status);

-- ----------------------------------------------------------------------------
-- match_scores + career_predictions
-- UNIQUE (candidate_id, job_id) on match_scores indexes candidate_id as leading.
-- ----------------------------------------------------------------------------
create index match_scores_job_id_idx         on public.match_scores (job_id);
create index match_scores_overall_score_idx  on public.match_scores (overall_score desc);
-- career_predictions.candidate_id is UNIQUE → indexed by constraint

-- ----------------------------------------------------------------------------
-- messaging
-- ----------------------------------------------------------------------------
create index message_threads_employer_id_idx     on public.message_threads (employer_id);
create index message_threads_candidate_id_idx    on public.message_threads (candidate_id);
create index message_threads_last_message_idx    on public.message_threads (last_message_at desc nulls last);
-- message_threads.application_id is UNIQUE → indexed by constraint

create index messages_thread_created_idx  on public.messages (thread_id, created_at desc);
create index messages_sender_id_idx       on public.messages (sender_id);

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
create index notifications_user_feed_idx  on public.notifications (user_id, created_at desc);
create index notifications_type_idx       on public.notifications (type);

-- Partial index: unread notifications per user (what the bell-icon count queries).
create index notifications_user_unread_idx on public.notifications (user_id)
  where read = false;

-- ----------------------------------------------------------------------------
-- saved_jobs + job_views
-- UNIQUE (candidate_id, job_id) on saved_jobs indexes candidate_id as leading.
-- ----------------------------------------------------------------------------
create index saved_jobs_job_id_idx  on public.saved_jobs (job_id);

create index job_views_job_id_idx      on public.job_views (job_id);
create index job_views_viewer_id_idx   on public.job_views (viewer_id);
create index job_views_created_at_idx  on public.job_views (created_at desc);

commit;
