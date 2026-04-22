import { Link, createFileRoute } from '@tanstack/react-router';
import { Bookmark, BookmarkMinus, Briefcase } from 'lucide-react';
import { formatRelativeTime, formatSalaryRange } from '@forge/shared';
import { useSavedJobs, useUnsaveJob } from '@forge/data-client';
import { Badge, Button, Card, CardContent, Skeleton, toast } from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';

export const Route = createFileRoute('/_app/saved')({
  component: SavedJobsPage,
});

function SavedJobsPage() {
  const { user } = Route.useRouteContext();
  const { data, isLoading } = useSavedJobs(user.id);
  const unsave = useUnsaveJob();

  async function handleUnsave(jobId: string) {
    try {
      await unsave.mutateAsync({ candidateId: user.id, jobId });
      toast.success('Removed from saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unsave failed');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader title="Saved jobs" subtitle="Bookmarks you can come back to." />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="bg-primary/10 text-primary grid size-12 place-items-center rounded-full">
              <Bookmark className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No saved jobs yet</h3>
              <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
                Bookmark jobs from the browse page to come back to them later.
              </p>
            </div>
            <Button asChild>
              <Link to="/jobs">Browse jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(data as any[]).map((row) => (
            <SavedRow
              key={row.id}
              row={row}
              onUnsave={() => handleUnsave(row.jobs?.id)}
              isUnsaving={unsave.isPending}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SavedRow({
  row,
  onUnsave,
  isUnsaving,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any;
  onUnsave: () => void;
  isUnsaving: boolean;
}) {
  const job = row.jobs ?? {};
  const company = job.companies ?? {};
  return (
    <li>
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-md">
            <Briefcase className="size-4" />
          </div>
          <Link
            to="/jobs/$jobId"
            params={{ jobId: job.id }}
            className="min-w-0 flex-1 hover:underline"
          >
            <div className="truncate font-semibold">{job.title}</div>
            <div className="text-muted-foreground mt-0.5 truncate text-sm">
              {company.name ?? '—'}
              {job.location ? ` · ${job.location}` : ''}
            </div>
            <div className="text-muted-foreground mt-1 flex gap-2 text-xs">
              {job.show_salary ? (
                <Badge variant="outline">
                  {formatSalaryRange(
                    job.salary_min,
                    job.salary_max,
                    job.salary_currency,
                    job.salary_period,
                  )}
                </Badge>
              ) : null}
              <span>Saved {formatRelativeTime(row.created_at)}</span>
            </div>
          </Link>
          <Button variant="outline" size="sm" onClick={onUnsave} disabled={isUnsaving}>
            <BookmarkMinus className="size-4" /> Unsave
          </Button>
        </CardContent>
      </Card>
    </li>
  );
}
