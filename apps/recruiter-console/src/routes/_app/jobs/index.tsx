import { Link, createFileRoute } from '@tanstack/react-router';
import { Briefcase, Eye, Plus, Users } from 'lucide-react';
import { JOB_STATUS_LABELS, formatRelativeTime } from '@forge/shared';
import { useEmployerJobs } from '@forge/data-client';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
} from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';

export const Route = createFileRoute('/_app/jobs/')({
  component: JobsListPage,
});

const STATUS_TONE: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning'> = {
  active: 'success',
  draft: 'secondary',
  paused: 'warning',
  closed: 'outline',
  filled: 'outline',
};

function JobsListPage() {
  const { user } = Route.useRouteContext();
  const jobs = useEmployerJobs(user.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Jobs"
        subtitle="Everything you're hiring for, across every status."
        actions={
          <Button asChild>
            <Link to="/jobs/new">
              <Plus className="size-4" /> New job
            </Link>
          </Button>
        }
      />

      {jobs.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : jobs.data && jobs.data.length > 0 ? (
        <ul className="space-y-3">
          {jobs.data.map((job) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <JobRow key={(job as any).id} job={job} />
          ))}
        </ul>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function JobRow({ job }: { job: any }) {
  const statusLabel: string = JOB_STATUS_LABELS[job.status] ?? job.status;
  const tone = STATUS_TONE[job.status] ?? 'secondary';
  const company = job.companies?.name ?? '—';

  return (
    <li>
      <Link
        to="/jobs/$jobId"
        params={{ jobId: job.id }}
        className="block"
      >
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-6 p-5">
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
              <Briefcase className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold">{job.title}</span>
                <Badge variant={tone}>{statusLabel}</Badge>
              </div>
              <div className="mt-1 truncate text-sm text-muted-foreground">
                {company} · updated {formatRelativeTime(job.updated_at ?? job.created_at)}
              </div>
            </div>
            <div className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
              <span className="inline-flex items-center gap-1">
                <Users className="size-4" />
                {job.applications_count ?? 0}
                <span className="text-xs">
                  {(job.applications_count ?? 0) === 1 ? 'application' : 'applications'}
                </span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="size-4" />
                {job.views_count ?? 0}
                <span className="text-xs">views</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Briefcase className="size-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">No jobs yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Post your first role in under a minute — describe it in a sentence
            and AI drafts the full posting.
          </p>
        </div>
        <Button asChild>
          <Link to="/jobs/new">
            <Plus className="size-4" /> Create your first job
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
