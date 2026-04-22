import { Link, createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Briefcase, FileText } from 'lucide-react';
import { APPLICATION_STATUS_LABELS, formatRelativeTime } from '@forge/shared';
import { useCandidateApplications } from '@forge/data-client';
import { Badge, Button, Card, CardContent, Skeleton, cn } from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';

export const Route = createFileRoute('/_app/applications/')({
  component: ApplicationsPage,
});

const STATUS_FILTERS = [
  'all',
  'pending',
  'reviewing',
  'shortlisted',
  'interviewing',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function ApplicationsPage() {
  const { user } = Route.useRouteContext();
  const { data, isLoading } = useCandidateApplications(user.id);
  const [filter, setFilter] = useState<StatusFilter>('all');

  const counts = useMemo(() => countByStatus(data), [data]);
  const rows = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.filter((a: any) => a.status === filter);
  }, [data, filter]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader title="Your applications" subtitle="Everything you've applied to." />

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => {
          const count = s === 'all' ? (data?.length ?? 0) : (counts[s] ?? 0);
          const active = filter === s;
          const label = s === 'all' ? 'All' : (APPLICATION_STATUS_LABELS[s] ?? s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
              <span
                className={cn(
                  'rounded-full px-1.5',
                  active ? 'bg-primary-foreground/20' : 'bg-muted',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState hasAny={(data?.length ?? 0) > 0} filter={filter} />
      ) : (
        <ul className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(rows as any[]).map((row) => (
            <ApplicationRow key={row.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ApplicationRow({
  row,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any;
}) {
  const job = row.jobs ?? {};
  const company = job.companies ?? {};
  const statusLabel: string = APPLICATION_STATUS_LABELS[row.status] ?? row.status;
  return (
    <li>
      <Link to="/applications/$applicationId" params={{ applicationId: row.id }} className="block">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-md">
              <Briefcase className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{job.title ?? 'Untitled role'}</div>
              <div className="text-muted-foreground mt-0.5 truncate text-sm">
                {company.name ?? '—'} · applied {formatRelativeTime(row.applied_at)}
              </div>
            </div>
            <Badge variant="secondary">{statusLabel}</Badge>
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}

function EmptyState({ hasAny, filter }: { hasAny: boolean; filter: StatusFilter }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="bg-primary/10 text-primary grid size-12 place-items-center rounded-full">
          <FileText className="size-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {hasAny ? `Nothing in ${filter}` : 'No applications yet'}
          </h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
            {hasAny ? 'Try another status filter.' : 'Browse jobs and apply to get started.'}
          </p>
        </div>
        {!hasAny ? (
          <Button asChild>
            <Link to="/jobs">Browse jobs</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countByStatus(data: any[] | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  (data ?? []).forEach((a) => {
    out[a.status] = (out[a.status] ?? 0) + 1;
  });
  return out;
}
