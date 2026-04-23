-- Defense in depth: one email = one profile row.
--
-- Supabase's auth.users layer already rejects duplicate emails on signup, but
-- profiles is a separate table populated by the handle_new_user() trigger and
-- potentially by direct writes. Adding an explicit UNIQUE constraint here
-- guarantees we never end up with two profiles sharing an email, even if a
-- future admin-API path inserts rows directly.
--
-- Emails are normalised to lower-case via a functional index so 'User@Foo.com'
-- and 'user@foo.com' are treated as the same account.

begin;

-- Drop any rows with NULL email (there shouldn't be any — the column is NOT
-- NULL — but this makes the migration resilient if schema drift ever let one
-- through).
delete from public.profiles where email is null;

-- A functional unique index on lower(email). If the production DB already
-- contains case-variant duplicates, this migration will fail with a clear
-- error pointing at the duplicate — resolve by deleting the dupes in
-- auth.users (which cascades to profiles) before re-running.
create unique index if not exists profiles_email_unique_lower
  on public.profiles ((lower(email)));

commit;
