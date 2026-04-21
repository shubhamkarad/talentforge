-- Talentforge — functions and triggers
-- Side-effects on the core schema: timestamp maintenance, counter upkeep,
-- slug generation, profile-completeness calc, and notification fan-out.
-- SECURITY DEFINER + SET search_path are applied from the start on everything
-- that writes across tables (counters / notifications).

begin;

-- ----------------------------------------------------------------------------
-- generic: keep updated_at current on BEFORE UPDATE
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.user_roles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.companies
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.candidate_profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.applications
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.message_threads
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- RLS helper: lookup the caller's role via the user_roles cache
-- ----------------------------------------------------------------------------
create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.user_roles where user_id = (select auth.uid());
$$;

-- ----------------------------------------------------------------------------
-- auth hook: on auth.users INSERT, create profile + role + (maybe) candidate
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role public.user_role := coalesce(
    nullif(new.raw_user_meta_data->>'role', ''),
    'candidate'
  )::public.user_role;
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new_role
  );

  insert into public.user_roles (user_id, role)
  values (new.id, new_role);

  if new_role = 'candidate' then
    insert into public.candidate_profiles (id) values (new.id);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- counters: keep jobs.applications_count and jobs.views_count in sync
-- ----------------------------------------------------------------------------
create or replace function public.bump_job_applications_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.jobs
      set applications_count = applications_count + 1
      where id = new.job_id;
  elsif tg_op = 'DELETE' then
    update public.jobs
      set applications_count = greatest(applications_count - 1, 0)
      where id = old.job_id;
  end if;
  return null;
end;
$$;

create trigger bump_job_applications_count
  after insert or delete on public.applications
  for each row execute function public.bump_job_applications_count();

create or replace function public.bump_job_views_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.jobs
    set views_count = views_count + 1
    where id = new.job_id;
  return null;
end;
$$;

create trigger bump_job_views_count
  after insert on public.job_views
  for each row execute function public.bump_job_views_count();

-- ----------------------------------------------------------------------------
-- slugs: derive url-friendly slugs for jobs and companies when missing
-- ----------------------------------------------------------------------------
create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.generate_job_slug()
returns trigger
language plpgsql
as $$
declare
  base_slug text := public.slugify(new.title);
  candidate text;
  suffix    int  := 0;
begin
  if base_slug = '' then
    base_slug := 'job';
  end if;
  candidate := base_slug;
  while exists (select 1 from public.jobs j where j.slug = candidate and j.id <> new.id) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix;
  end loop;
  new.slug := candidate;
  return new;
end;
$$;

create trigger generate_job_slug_ins
  before insert on public.jobs
  for each row
  when (new.slug is null or new.slug = '')
  execute function public.generate_job_slug();

create trigger generate_job_slug_upd
  before update of title on public.jobs
  for each row
  when (new.slug is null or new.slug = '' or old.title is distinct from new.title)
  execute function public.generate_job_slug();

create or replace function public.generate_company_slug()
returns trigger
language plpgsql
as $$
declare
  base_slug text := public.slugify(new.name);
  candidate text;
  suffix    int  := 0;
begin
  if base_slug = '' then
    base_slug := 'company';
  end if;
  candidate := base_slug;
  while exists (select 1 from public.companies c where c.slug = candidate and c.id <> new.id) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix;
  end loop;
  new.slug := candidate;
  return new;
end;
$$;

create trigger generate_company_slug_ins
  before insert on public.companies
  for each row
  when (new.slug is null or new.slug = '')
  execute function public.generate_company_slug();

create trigger generate_company_slug_upd
  before update of name on public.companies
  for each row
  when (new.slug is null or new.slug = '' or old.name is distinct from new.name)
  execute function public.generate_company_slug();

-- ----------------------------------------------------------------------------
-- profile completeness: scored 0–100 from presence of key fields
-- ----------------------------------------------------------------------------
create or replace function public.calc_profile_completeness()
returns trigger
language plpgsql
as $$
declare
  score int := 0;
begin
  -- identity (30)
  if coalesce(new.headline, '') <> '' then score := score + 10; end if;
  if coalesce(new.bio, '') <> ''       then score := score + 10; end if;
  if new.resume_url is not null        then score := score + 10; end if;
  -- skills (20)
  if jsonb_array_length(coalesce(new.skills, '[]'::jsonb)) > 0  then score := score + 10; end if;
  if jsonb_array_length(coalesce(new.skills, '[]'::jsonb)) >= 5 then score := score + 10; end if;
  -- experience (20)
  if jsonb_array_length(coalesce(new.experience, '[]'::jsonb)) > 0 then score := score + 20; end if;
  -- education (10)
  if jsonb_array_length(coalesce(new.education, '[]'::jsonb)) > 0 then score := score + 10; end if;
  -- preferences + links (20)
  if new.salary_expectation_min is not null then score := score + 5; end if;
  if jsonb_array_length(coalesce(new.preferred_locations, '[]'::jsonb)) > 0 then score := score + 5; end if;
  if new.linkedin_url is not null or new.github_url is not null or new.portfolio_url is not null then
    score := score + 10;
  end if;
  new.profile_completeness := least(score, 100);
  return new;
end;
$$;

create trigger calc_profile_completeness
  before insert or update on public.candidate_profiles
  for each row execute function public.calc_profile_completeness();

-- ----------------------------------------------------------------------------
-- notifications: fan out on application events and new messages
-- ----------------------------------------------------------------------------
create or replace function public.notify_new_application()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  j record;
begin
  select j.title, j.employer_id, c.name as company_name
    into j
    from public.jobs j
    join public.companies c on c.id = j.company_id
    where j.id = new.job_id;

  insert into public.notifications (user_id, type, title, body, data, action_url)
  values (
    j.employer_id,
    'application_received',
    'New application received',
    'A new candidate applied for ' || j.title,
    jsonb_build_object(
      'application_id', new.id,
      'job_id', new.job_id,
      'candidate_id', new.candidate_id
    ),
    '/applications/' || new.id
  );
  return new;
end;
$$;

create trigger notify_new_application
  after insert on public.applications
  for each row execute function public.notify_new_application();

create or replace function public.handle_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  job_title text;
  msg       text;
begin
  if old.status is distinct from new.status then
    select title into job_title from public.jobs where id = new.job_id;

    msg := case new.status
      when 'reviewing'    then 'Your application is being reviewed'
      when 'shortlisted'  then 'You have been shortlisted!'
      when 'interviewing' then 'You have been selected for an interview'
      when 'offer'        then 'You received an offer!'
      when 'hired'        then 'Congratulations on the new role!'
      when 'rejected'     then 'Your application was not selected'
      else 'Your application status was updated'
    end;

    insert into public.notifications (user_id, type, title, body, data, action_url)
    values (
      new.candidate_id,
      'application_status_changed',
      'Application update: ' || job_title,
      msg,
      jsonb_build_object(
        'application_id', new.id,
        'job_id', new.job_id,
        'old_status', old.status,
        'new_status', new.status
      ),
      '/applications/' || new.id
    );

    if new.status = 'reviewing' and old.status = 'pending' then
      new.reviewed_at := now();
    elsif new.status = 'shortlisted' then
      new.shortlisted_at := now();
    elsif new.status = 'rejected' then
      new.rejected_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger handle_application_status_change
  before update on public.applications
  for each row execute function public.handle_application_status_change();

create or replace function public.handle_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  t record;
  recipient uuid;
begin
  select employer_id, candidate_id into t
    from public.message_threads
    where id = new.thread_id;

  update public.message_threads
    set last_message_at = now(),
        employer_unread_count  = employer_unread_count
          + case when new.sender_id = t.candidate_id then 1 else 0 end,
        candidate_unread_count = candidate_unread_count
          + case when new.sender_id = t.employer_id  then 1 else 0 end
    where id = new.thread_id;

  recipient := case when new.sender_id = t.employer_id then t.candidate_id else t.employer_id end;

  insert into public.notifications (user_id, type, title, body, data, action_url)
  values (
    recipient,
    'new_message',
    'New message',
    left(new.content, 100) || case when length(new.content) > 100 then '…' else '' end,
    jsonb_build_object(
      'thread_id', new.thread_id,
      'message_id', new.id,
      'sender_id', new.sender_id
    ),
    '/messages/' || new.thread_id
  );
  return new;
end;
$$;

create trigger handle_new_message
  after insert on public.messages
  for each row execute function public.handle_new_message();

commit;
