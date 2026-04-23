import { createFileRoute, redirect } from '@tanstack/react-router';
import { supabase, useNotificationsRealtime } from '@forge/data-client';
import { AppShell } from '~/components/app-shell';

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
  useNotificationsRealtime(user.id);
  return <AppShell user={user} />;
}
