import { createFileRoute, redirect } from '@tanstack/react-router';
import { supabase } from '@forge/data-client';
import { AppShell } from '~/components/app-shell';

// Pathless layout + auth guard for every recruiter-only route.
// The beforeLoad runs on the client before mount, so unauthenticated visits to
// /dashboard etc. go straight to /login with a `redirect` search param instead
// of rendering the protected page first and then bouncing.
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
    return { session: data.session, user: data.session.user };
  },
  component: AppRoute,
});

function AppRoute() {
  const { user } = Route.useRouteContext();
  return <AppShell user={user} />;
}
