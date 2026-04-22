import { Link, createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import { Bell, Bookmark, Briefcase, FileText, User } from 'lucide-react';
import type { ComponentType } from 'react';
import { formatRelativeTime } from '@forge/shared';
import {
  useCandidateApplications,
  useCandidateProfile,
  useNotifications,
  useSavedJobs,
} from '@forge/data-client';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CountUp,
  FadeIn,
  Skeleton,
  Stagger,
  StaggerItem,
} from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';
import { ProfileSetupModal } from '~/components/profile-setup-modal';

export const Route = createFileRoute('/_app/dashboard')({
  component: SeekerDashboardPage,
});

function SeekerDashboardPage() {
  const { user } = Route.useRouteContext();
  const profile = useCandidateProfile(user.id);
  const applications = useCandidateApplications(user.id);
  const savedJobs = useSavedJobs(user.id);
  const notifications = useNotifications(user.id);

  const stats = useMemo(() => computeStats(applications.data), [applications.data]);
  const completeness = profile.data?.profile_completeness ?? 0;

  const firstName =
    (user.user_metadata?.full_name as string | undefined)?.split(/\s+/)[0] ??
    user.email?.split('@')[0] ??
    'there';

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader title={`Welcome, ${firstName}.`} subtitle="Your search at a glance." />

      <Stagger step={0.06} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <MetricCard
            icon={FileText}
            label="Applications"
            value={stats.total}
            loading={applications.isLoading}
            hint={stats.active > 0 ? `${stats.active} still active` : 'nothing in flight'}
          />
        </StaggerItem>
        <StaggerItem>
          <MetricCard
            icon={Briefcase}
            label="In interview"
            value={stats.interviewing}
            loading={applications.isLoading}
            hint={
              stats.offer > 0
                ? `${stats.offer} offer${stats.offer > 1 ? 's' : ''} pending`
                : 'keep applying'
            }
            tone="warning"
          />
        </StaggerItem>
        <StaggerItem>
          <MetricCard
            icon={Bookmark}
            label="Saved jobs"
            value={savedJobs.data?.length ?? 0}
            loading={savedJobs.isLoading}
            hint={(savedJobs.data?.length ?? 0) === 0 ? 'browse to bookmark' : 'ready to apply'}
          />
        </StaggerItem>
        <StaggerItem>
          <ProfileCompletenessCard loading={profile.isLoading} value={completeness} />
        </StaggerItem>
      </Stagger>

      <FadeIn delay={0.2}>
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <RecentApplicationsCard
            loading={applications.isLoading}
            rows={(applications.data ?? []).slice(0, 6)}
          />
          <NotificationsCard
            loading={notifications.isLoading}
            rows={(notifications.data ?? []).slice(0, 5)}
          />
        </section>
      </FadeIn>

      <ProfileSetupModal userId={user.id} profile={profile.data} loading={profile.isLoading} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

function MetricCard({
  icon: Icon,
  label,
  value,
  loading,
  hint,
  tone = 'default',
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  loading?: boolean;
  hint?: string;
  tone?: 'default' | 'warning';
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div
          className={
            tone === 'warning'
              ? 'bg-warning/15 text-warning-foreground grid size-9 place-items-center rounded-md'
              : 'bg-primary/10 text-primary grid size-9 place-items-center rounded-md'
          }
        >
          <Icon className="size-4" />
        </div>
        <div className="text-muted-foreground mt-4 text-sm">{label}</div>
        <div className="mt-1 text-3xl font-semibold tabular-nums">
          {loading ? <Skeleton className="h-8 w-16" /> : <CountUp value={value} />}
        </div>
        {hint ? <div className="text-muted-foreground mt-1 text-xs">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}

function ProfileCompletenessCard({ loading, value }: { loading: boolean; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="bg-primary/10 text-primary grid size-9 place-items-center rounded-md">
          <User className="size-4" />
        </div>
        <div className="text-muted-foreground mt-4 text-sm">Profile completeness</div>
        <div className="mt-1 text-3xl font-semibold tabular-nums">
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <CountUp value={value} />%
            </>
          )}
        </div>
        <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
          <div className="bg-primary h-full transition-all" style={{ width: `${value}%` }} />
        </div>
        {value < 100 ? (
          <Button asChild size="sm" variant="outline" className="mt-3 w-full">
            <Link to="/profile">Finish profile</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RecentApplicationsCard({
  loading,
  rows,
}: {
  loading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[];
}) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Your applications</CardTitle>
        <CardDescription>Latest six, newest first.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 px-6 pb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="bg-muted text-muted-foreground mx-auto grid size-10 place-items-center rounded-full">
              <Briefcase className="size-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold">No applications yet</h3>
            <p className="text-muted-foreground mx-auto mt-1 max-w-xs text-xs">
              Find your first role and we'll track it here.
            </p>
            <Button asChild size="sm" className="mt-3">
              <Link to="/jobs">Browse jobs</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-border/70 divide-y">
            {rows.map((row) => {
              const title = row.jobs?.title ?? 'Untitled role';
              const company = row.jobs?.companies?.name;
              return (
                <li key={row.id}>
                  <Link
                    to="/applications/$applicationId"
                    params={{ applicationId: row.id }}
                    className="hover:bg-muted/40 flex items-center gap-4 px-6 py-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{title}</div>
                      <div className="text-muted-foreground truncate text-xs">
                        {company ? `${company} · ` : ''}applied {formatRelativeTime(row.applied_at)}
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {row.status}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function NotificationsCard({
  loading,
  rows,
}: {
  loading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Most recent five.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 px-6 pb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="bg-muted text-muted-foreground mx-auto grid size-10 place-items-center rounded-full">
              <Bell className="size-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold">You're all caught up</h3>
            <p className="text-muted-foreground mx-auto mt-1 max-w-xs text-xs">
              Employer updates and new messages will show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-border/70 divide-y">
            {rows.map((n) => (
              <li key={n.id} className="flex items-start gap-3 px-6 py-3 text-sm">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    n.read ? 'bg-muted' : 'bg-primary'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{n.title}</div>
                  {n.body ? (
                    <div className="text-muted-foreground line-clamp-2 text-xs">{n.body}</div>
                  ) : null}
                  <div className="text-muted-foreground mt-0.5 text-[10px]">
                    {formatRelativeTime(n.created_at)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface SeekerStats {
  total: number;
  active: number;
  interviewing: number;
  offer: number;
}

function computeStats(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applications: any[] | undefined,
): SeekerStats {
  let total = 0;
  let active = 0;
  let interviewing = 0;
  let offer = 0;
  (applications ?? []).forEach((a) => {
    total += 1;
    if (['pending', 'reviewing', 'shortlisted', 'interviewing', 'offer'].includes(a.status)) {
      active += 1;
    }
    if (a.status === 'interviewing') interviewing += 1;
    if (a.status === 'offer') offer += 1;
  });
  return { total, active, interviewing, offer };
}
