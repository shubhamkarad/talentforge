-- Talentforge — core schema
-- Defines enum types and the thirteen application tables.
-- Indexes, triggers, functions, RLS policies, and storage are in later migrations.

begin;

-- ----------------------------------------------------------------------------
-- extensions
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- enum types
-- ----------------------------------------------------------------------------
create type public.user_role           as enum ('employer', 'candidate', 'admin');
create type public.company_size        as enum ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+');
create type public.experience_level    as enum ('entry', 'junior', 'mid', 'senior', 'lead', 'principal', 'executive');
create type public.employment_type     as enum ('full-time', 'part-time', 'contract', 'internship', 'freelance');
create type public.remote_type         as enum ('remote', 'hybrid', 'onsite');
create type public.salary_period       as enum ('hour', 'month', 'year');
create type public.job_status          as enum ('draft', 'active', 'paused', 'closed', 'filled');
create type public.application_status  as enum (
  'pending', 'reviewing', 'shortlisted', 'interviewing',
  'offer', 'hired', 'rejected', 'withdrawn'
);
create type public.message_type        as enum ('text', 'system', 'interview_invite', 'offer', 'attachment');
create type public.thread_status       as enum ('active', 'archived', 'blocked');
create type public.notification_type   as enum (
  'application_received', 'application_status_changed',
  'new_message', 'interview_scheduled', 'job_match',
  'profile_view', 'system'
);

-- ----------------------------------------------------------------------------
-- users: profiles (1:1 with auth.users) + role cache for JWT hook
-- ----------------------------------------------------------------------------
create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  full_name             text,
  avatar_url            text,
  phone                 text,
  role                  public.user_role not null default 'candidate',
  onboarding_completed  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
comment on table public.profiles is 'Application profile linked 1:1 to auth.users.';

create table public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  role        public.user_role not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.user_roles is 'Role lookup used by the custom JWT auth hook.';

-- ----------------------------------------------------------------------------
-- company and candidate profiles
-- ----------------------------------------------------------------------------
create table public.companies (
  id                   uuid primary key default gen_random_uuid(),
  owner_id             uuid not null references public.profiles(id) on delete cascade,
  name                 text not null,
  slug                 text unique,
  description          text,
  website              text,
  logo_url             text,
  industry             text,
  size                 public.company_size,
  founded_year         integer,
  headquarters         text,
  culture_description  text,
  benefits             jsonb not null default '[]'::jsonb,
  social_links         jsonb not null default '{}'::jsonb,
  verified             boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
comment on table public.companies is 'Company profiles owned by employer accounts.';

create table public.candidate_profiles (
  id                      uuid primary key references public.profiles(id) on delete cascade,
  headline                text,
  bio                     text,
  skills                  jsonb not null default '[]'::jsonb,
  experience              jsonb not null default '[]'::jsonb,
  education               jsonb not null default '[]'::jsonb,
  certifications          jsonb not null default '[]'::jsonb,
  languages               jsonb not null default '[]'::jsonb,
  experience_years        integer,
  resume_url              text,
  resume_text             text,
  linkedin_url            text,
  github_url              text,
  portfolio_url           text,
  preferred_locations     jsonb not null default '[]'::jsonb,
  preferred_job_types     jsonb not null default '[]'::jsonb,
  salary_expectation_min  integer,
  salary_expectation_max  integer,
  salary_currency         text not null default 'USD',
  notice_period_days      integer,
  open_to_work            boolean not null default true,
  open_to_remote          boolean not null default true,
  profile_completeness    integer not null default 0 check (profile_completeness between 0 and 100),
  last_active_at          timestamptz not null default now(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
comment on table public.candidate_profiles is 'Extended profile data for candidate accounts.';

-- ----------------------------------------------------------------------------
-- jobs + applications
-- ----------------------------------------------------------------------------
create table public.jobs (
  id                    uuid primary key default gen_random_uuid(),
  company_id            uuid not null references public.companies(id) on delete cascade,
  employer_id           uuid not null references public.profiles(id) on delete cascade,
  title                 text not null,
  slug                  text,
  description           text not null,
  requirements          jsonb not null default '[]'::jsonb,
  responsibilities      jsonb not null default '[]'::jsonb,
  nice_to_have          jsonb not null default '[]'::jsonb,
  skills_required       jsonb not null default '[]'::jsonb,
  experience_level      public.experience_level,
  experience_years_min  integer,
  experience_years_max  integer,
  salary_min            integer,
  salary_max            integer,
  salary_currency       text not null default 'USD',
  salary_period         public.salary_period not null default 'year',
  show_salary           boolean not null default true,
  location              text,
  remote_type           public.remote_type,
  employment_type       public.employment_type,
  department            text,
  benefits              jsonb not null default '[]'::jsonb,
  application_deadline  timestamptz,
  status                public.job_status not null default 'draft',
  published_at          timestamptz,
  expires_at            timestamptz,
  views_count           integer not null default 0,
  applications_count    integer not null default 0,
  featured              boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  fts                   tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(location, '')), 'C')
  ) stored
);
comment on table public.jobs is 'Job postings. fts is a generated tsvector for full-text search.';

create table public.applications (
  id                uuid primary key default gen_random_uuid(),
  job_id            uuid not null references public.jobs(id) on delete cascade,
  candidate_id      uuid not null references public.profiles(id) on delete cascade,
  status            public.application_status not null default 'pending',
  cover_letter      text,
  resume_url        text,
  portfolio_url     text,
  answers           jsonb not null default '{}'::jsonb,
  source            text not null default 'direct',
  referral_code     text,
  employer_notes    text,
  rejection_reason  text,
  applied_at        timestamptz not null default now(),
  reviewed_at       timestamptz,
  shortlisted_at    timestamptz,
  rejected_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (job_id, candidate_id)
);
comment on table public.applications is 'Applications submitted by candidates for jobs.';

-- ----------------------------------------------------------------------------
-- AI-derived data (scores + forecasts). Populated by edge functions.
-- ----------------------------------------------------------------------------
create table public.match_scores (
  id                uuid primary key default gen_random_uuid(),
  candidate_id      uuid not null references public.profiles(id) on delete cascade,
  job_id            uuid not null references public.jobs(id) on delete cascade,
  overall_score     integer not null check (overall_score between 0 and 100),
  skills_score      integer check (skills_score between 0 and 100),
  experience_score  integer check (experience_score between 0 and 100),
  summary           text,
  strengths         jsonb not null default '[]'::jsonb,
  concerns          jsonb not null default '[]'::jsonb,
  model_used        text not null,
  calculated_at     timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  unique (candidate_id, job_id)
);
comment on table public.match_scores is 'AI candidate-job fit scores. Visible only to employers via RLS.';

create table public.career_predictions (
  id             uuid primary key default gen_random_uuid(),
  candidate_id   uuid not null unique references public.profiles(id) on delete cascade,
  prediction     jsonb not null,
  model_used     text not null,
  calculated_at  timestamptz not null default now(),
  created_at     timestamptz not null default now()
);
comment on table public.career_predictions is 'AI career-trajectory forecast cache per candidate.';

-- ----------------------------------------------------------------------------
-- messaging (one thread per application)
-- ----------------------------------------------------------------------------
create table public.message_threads (
  id                      uuid primary key default gen_random_uuid(),
  application_id          uuid not null unique references public.applications(id) on delete cascade,
  employer_id             uuid not null references public.profiles(id) on delete cascade,
  candidate_id            uuid not null references public.profiles(id) on delete cascade,
  last_message_at         timestamptz,
  employer_unread_count   integer not null default 0,
  candidate_unread_count  integer not null default 0,
  status                  public.thread_status not null default 'active',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
comment on table public.message_threads is 'Conversation thread — exactly one per application.';

create table public.messages (
  id            uuid primary key default gen_random_uuid(),
  thread_id     uuid not null references public.message_threads(id) on delete cascade,
  sender_id     uuid not null references public.profiles(id) on delete cascade,
  content       text not null,
  message_type  public.message_type not null default 'text',
  metadata      jsonb not null default '{}'::jsonb,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);
comment on table public.messages is 'Individual messages inside a thread.';

-- ----------------------------------------------------------------------------
-- notifications + engagement
-- ----------------------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        public.notification_type not null,
  title       text not null,
  body        text,
  data        jsonb not null default '{}'::jsonb,
  read        boolean not null default false,
  read_at     timestamptz,
  action_url  text,
  created_at  timestamptz not null default now()
);
comment on table public.notifications is 'Per-user notification feed.';

create table public.saved_jobs (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references public.profiles(id) on delete cascade,
  job_id        uuid not null references public.jobs(id) on delete cascade,
  notes         text,
  created_at    timestamptz not null default now(),
  unique (candidate_id, job_id)
);
comment on table public.saved_jobs is 'Candidate bookmarks for jobs.';

create table public.job_views (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid not null references public.jobs(id) on delete cascade,
  viewer_id    uuid references public.profiles(id) on delete set null,
  session_id   text,
  source       text,
  ip_hash      text,
  user_agent   text,
  created_at   timestamptz not null default now()
);
comment on table public.job_views is 'Raw view analytics for jobs.';

commit;
