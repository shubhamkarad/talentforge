-- Talentforge — storage buckets and object-level RLS
-- Three buckets: resumes, company-logos, job-attachments.
-- Resumes are stored under <uid>/<filename.ext> so ownership is derivable from
-- the object path alone — no extra metadata table needed.

begin;

-- ----------------------------------------------------------------------------
-- buckets
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  true,
  5242880, -- 5 MiB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-logos',
  'company-logos',
  true,
  2097152, -- 2 MiB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'job-attachments',
  'job-attachments',
  false,
  10485760, -- 10 MiB
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/zip'
  ]
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- resumes: owner-scoped writes, public reads (matches bucket.public = true)
-- Path convention: <auth.uid()>/<filename>
-- ----------------------------------------------------------------------------
create policy resumes_insert_own
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy resumes_update_own
  on storage.objects for update to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy resumes_delete_own
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy resumes_select_public
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'resumes');

-- ----------------------------------------------------------------------------
-- company-logos: employers upload, anyone can view
-- ----------------------------------------------------------------------------
create policy company_logos_insert_employer
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'company-logos'
    and (select public.get_user_role()) = 'employer'
  );

create policy company_logos_update_employer
  on storage.objects for update to authenticated
  using (
    bucket_id = 'company-logos'
    and (select public.get_user_role()) = 'employer'
  );

create policy company_logos_delete_employer
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'company-logos'
    and (select public.get_user_role()) = 'employer'
  );

create policy company_logos_select_public
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'company-logos');

-- ----------------------------------------------------------------------------
-- job-attachments: private bucket; owner-scoped writes and reads.
-- Path convention: <auth.uid()>/<filename>
-- ----------------------------------------------------------------------------
create policy job_attachments_insert_own
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'job-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy job_attachments_update_own
  on storage.objects for update to authenticated
  using (
    bucket_id = 'job-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy job_attachments_delete_own
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'job-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy job_attachments_select_own
  on storage.objects for select to authenticated
  using (
    bucket_id = 'job-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
