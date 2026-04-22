import { Link, createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import { ArrowRight, Briefcase, Clock, Eye, MessagesSquare, Plus, Users } from 'lucide-react';
import type { ComponentType } from 'react';
import { formatRelativeTime } from '@forge/shared';
import {
  useEmployerApplications,
  useEmployerJobs,
  useMessageThreads,
} from '@forge/data-client';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();

  const jobs         = useEmployerJobs(user.id);
  const applications = useEmployerApplications(user.id);
  const threads      = useMessageThreads(user.id, 'employer');

  const stats = useMemo(() => computeStats(jobs.data, applications.data), [jobs.data, applications.data]);
  const unreadThreads = useMemo(() => countUnreadThreads(threads.data), [threads.data]);

  const firstName =
    (user.user_metadata?.full_name as string | undefined)?.split(/\s+/)[0] ??
    user.email?.split('@')[0] ??
    'there';

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title={`${greet()}, ${firstName}.`}
        subtitle="Your pipeline at a glance."
        actions={
          <Button asChild>
            <Link to="/jobs/new">
              <Plus className="size-4" /> New job
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Briefcase}
          label="Active jobs"
          value={stats.activeJobs}
          loading={jobs.isLoading}
          hint={stats.draftJobs > 0 ? `${stats.draftJobs} draft` : 'nothing in draft'}
        />
        <MetricCard
          icon={Clock}
          label="New applications"
          value={stats.pending}
          loading={applications.isLoading}
          tone="warning"
          hint="waiting for review"
        />
        <MetricCard
          icon={Users}
          label="In pipeline"
          value={stats.inPipeline}
          loading={applications.isLoading}
          hint="reviewing → interviewing"
        />
        <MetricCard
          icon={Eye}
          label="Job views (total)"
          value={stats.totalViews}
          loading={jobs.isLoading}
          hint={stats.totalViews === 0 ? 'publish a role to start' : 'across all jobs'}
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <RecentApplicationsCard
          loading={applications.isLoading}
          rows={(applications.data ?? []).slice(0, 6)}
        />
        <ThreadsCard loading={threads.isLoading} unread={unreadThreads} />
      </section>
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
        <div className="flex items-center justify-between">
          <div
            className={
              tone === 'warning'
                ? 'grid size-9 place-items-center rounded-md bg-warning/15 text-warning-foreground'
                : 'grid size-9 place-items-center rounded-md bg-primary/10 text-primary'
            }
          >
            <Icon className="size-4" />
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-semibold tabular-nums">
          {loading ? <Skeleton className="h-8 w-16" /> : value.toLocaleString()}
        </div>
        {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
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
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Recent applications</CardTitle>
          <CardDescription>The latest six across all your jobs.</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/applications">
            View all <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-2 px-6 pb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Users}
            headline="No applications yet"
            body="Once you publish a job, every applicant will show up here with an AI match score."
            cta={{ to: '/jobs/new', label: 'Post your first job' }}
          />
        ) : (
          <ul className="divide-y divide-border/70">
            {rows.map((row) => {
              const jobTitle = row.jobs?.title ?? 'Untitled role';
              const name = row.profiles?.full_name ?? 'Anonymous candidate';
              const score: number | undefined = row.match_score?.overall_score;
              return (
                <li key={row.id} className="flex items-center gap-4 px-6 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {jobTitle} · applied {formatRelativeTime(row.applied_at)}
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {row.status}
                  </Badge>
                  {typeof score === 'number' ? (
                    <span className="w-10 text-right text-sm font-semibold tabular-nums text-primary">
                      {score}%
                    </span>
                  ) : (
                    <span className="w-10 text-right text-xs text-muted-foreground">—</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ThreadsCard({ loading, unread }: { loading: boolean; unread: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>Threads waiting on a reply.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums">{unread}</span>
            <span className="text-sm text-muted-foreground">unread</span>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Each application has one conversation thread with the candidate.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
          <Link to="/messages">
            <MessagesSquare className="size-4" /> Open inbox
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  headline,
  body,
  cta,
}: {
  icon: ComponentType<{ className?: string }>;
  headline: string;
  body: string;
  cta?: { to: '/jobs/new'; label: string };
}) {
  return (
    <div className="px-6 py-10 text-center">
      <div className="mx-auto grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{headline}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {cta ? (
        <Button asChild size="sm" className="mt-4">
          <Link to={cta.to}>{cta.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface DashboardStats {
  activeJobs: number;
  draftJobs: number;
  pending: number;
  inPipeline: number;
  totalViews: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeStats(jobs: any[] | undefined, applications: any[] | undefined): DashboardStats {
  let activeJobs = 0;
  let draftJobs = 0;
  let totalViews = 0;
  (jobs ?? []).forEach((j) => {
    if (j.status === 'active') activeJobs += 1;
    if (j.status === 'draft') draftJobs += 1;
    totalViews += j.views_count ?? 0;
  });
  let pending = 0;
  let inPipeline = 0;
  (applications ?? []).forEach((a) => {
    if (a.status === 'pending') pending += 1;
    if (a.status === 'reviewing' || a.status === 'shortlisted' || a.status === 'interviewing') {
      inPipeline += 1;
    }
  });
  return { activeJobs, draftJobs, pending, inPipeline, totalViews };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countUnreadThreads(threads: any[] | undefined): number {
  return (threads ?? []).reduce(
    (acc, t) => acc + (t.employer_unread_count > 0 ? 1 : 0),
    0,
  );
}

function greet(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
