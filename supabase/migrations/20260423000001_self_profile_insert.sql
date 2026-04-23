-- Allow authenticated users to INSERT their own profiles / candidate_profiles
-- rows. Normally the handle_new_user() trigger creates these on signup, but
-- accounts that predate the trigger (or where the trigger failed silently) have
-- no row and no way to create one — every profile save blows up with PGRST116
-- "contains 0 rows" because .update() has nothing to match.
--
-- These policies make the frontend's .upsert() calls self-healing: if the row
-- exists, UPDATE fires; if not, INSERT fires. Both are scoped so a user can
-- only ever insert a row with their own auth.uid() as the primary key.

begin;

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy candidate_profiles_insert_own on public.candidate_profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

commit;
