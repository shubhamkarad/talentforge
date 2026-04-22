import { Link, createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { APPLICATION_STATUS_LABELS, formatRelativeTime, initialsOf } from '@forge/shared';
import { useEmployerApplications } from '@forge/data-client';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  cn,
  Skeleton,
} from '@forge/design-system';
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
  const { data, isLoading } = useEmployerApplications(user.id);
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
      <PageHeader
        title="Applications"
        subtitle="Every applicant across every role, with AI fit scores."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => {
          const count = s === 'all' ? data?.length ?? 0 : counts[s] ?? 0;
          const active = filter === s;
          const label = s === 'all' ? 'All' : APPLICATION_STATUS_LABELS[s] ?? s;
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
              <span className={cn('rounded-full px-1.5', active ? 'bg-primary-foreground/20' : 'bg-muted')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState filter={filter} hasAny={(data?.length ?? 0) > 0} />
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
  const name = row.profiles?.full_name ?? 'Anonymous candidate';
  const jobTitle = row.jobs?.title ?? 'Untitled role';
  const companyName = row.jobs?.companies?.name;
  const score: number | undefined = row.match_score?.overall_score;
  const statusLabel: string = APPLICATION_STATUS_LABELS[row.status] ?? row.status;

  return (
    <li>
      <Link to="/applications/$applicationId" params={{ applicationId: row.id }} className="block">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <Avatar className="size-10">
              <AvatarFallback>{initialsOf(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold">{name}</span>
                <Badge variant="secondary">{statusLabel}</Badge>
              </div>
              <div className="mt-1 truncate text-sm text-muted-foreground">
                {jobTitle}
                {companyName ? ` · ${companyName}` : ''} · applied {formatRelativeTime(row.applied_at)}
              </div>
            </div>
            {typeof score === 'number' ? (
              <div className="text-right">
                <div className="text-2xl font-semibold tabular-nums text-primary">{score}%</div>
                <div className="text-xs text-muted-foreground">match</div>
              </div>
            ) : (
              <div className="text-right text-xs text-muted-foreground">no score</div>
            )}
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}

function EmptyState({ filter, hasAny }: { filter: StatusFilter; hasAny: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Users className="size-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {hasAny ? `No applications in ${filter}` : 'No applications yet'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {hasAny
              ? 'Try a different status filter.'
              : 'Post an active job and applicants will show up here with AI match scores.'}
          </p>
        </div>
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
