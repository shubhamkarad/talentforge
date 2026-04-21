-- Talentforge — auth hook wiring
--
-- The "signup hook" in this project is a plain Postgres trigger on auth.users,
-- defined as public.handle_new_user() in 20260422000003_functions.sql. It runs
-- after every auth.users INSERT to:
--   1. mirror the new user into public.profiles
--   2. record their role in public.user_roles (used by RLS via get_user_role())
--   3. create a public.candidate_profiles row if the signup role was 'candidate'
--
-- This migration only wires explicit grants so the supabase_auth_admin role
-- can invoke the handler. The function itself is SECURITY DEFINER so it runs
-- with the postgres role's privileges at execution time, but being explicit
-- documents the dependency and avoids quiet failures when Supabase upgrades
-- tighten the default grants.

begin;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;

-- Allow the auth admin to write the three rows the handler produces.
-- These are no-ops under SECURITY DEFINER today but future-proof the flow.
grant select, insert on public.profiles           to supabase_auth_admin;
grant select, insert on public.user_roles         to supabase_auth_admin;
grant select, insert on public.candidate_profiles to supabase_auth_admin;

commit;
