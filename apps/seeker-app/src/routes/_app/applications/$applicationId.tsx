import { Link, createFileRoute } from '@tanstack/react-router';
import { Briefcase, Calendar, ExternalLink, Sparkles } from 'lucide-react';
import { APPLICATION_STATUS_LABELS, formatDate, formatRelativeTime } from '@forge/shared';
// RLS scopes rows by candidate on the DB side — useApplication works for
// candidates too: they only ever see their own applications.
import { useApplication } from '@forge/data-client';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  cn,
} from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';

export const Route = createFileRoute('/_app/applications/$applicationId')({
  component: ApplicationDetailPage,
});

function ApplicationDetailPage() {
  const { applicationId } = Route.useParams();
  const application = useApplication(applicationId);

  if (application.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-4 h-96 w-full" />
      </div>
    );
  }

  if (!application.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h2 className="text-lg font-semibold">Application not found</h2>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/applications">Back to applications</Link>
        </Button>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = application.data as any;
  const job = row.jobs ?? {};
  const company = job.companies ?? {};
  const statusLabel: string = APPLICATION_STATUS_LABELS[row.status] ?? row.status;
  // Show interview prep for any live application — candidates want to prep
  // early (before the interview is scheduled) or review after (offer stage).
  // Hide only when the application is dead (rejected or withdrawn).
  const canInterviewPrep = row.status !== 'rejected' && row.status !== 'withdrawn';

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader
        title={job.title ?? 'Application'}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <Briefcase className="size-3.5" /> {company.name ?? '—'}
            {' · '}
            applied {formatRelativeTime(row.applied_at)}
            {' · '}
            <Badge variant="secondary" className="ml-1">
              {statusLabel}
            </Badge>
          </span>
        }
        actions={
          <>
            {canInterviewPrep ? (
              <Button asChild variant="outline">
                <Link to="/interview/$jobId" params={{ jobId: job.id }}>
                  <Sparkles className="size-4" /> Interview prep
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="space-y-6">
        <StatusTimeline row={row} />
        {row.cover_letter ? (
          <Card>
            <CardHeader>
              <CardTitle>Your cover letter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {row.cover_letter}
              </p>
            </CardContent>
          </Card>
        ) : null}
        {job.id ? (
          <Card>
            <CardHeader>
              <CardTitle>Role you applied for</CardTitle>
              <CardDescription>
                {company.name ?? '—'}
                {job.location ? ` · ${job.location}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
                  <ExternalLink className="size-4" /> Open job posting
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Received' },
  { key: 'reviewing', label: 'Under review' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
] as const;

function StatusTimeline({
  row,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any;
}) {
  const statusIndex = TIMELINE_STEPS.findIndex((s) => s.key === row.status);
  const rejected = row.status === 'rejected' || row.status === 'withdrawn';
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-wrap gap-3 text-xs">
          {TIMELINE_STEPS.map((step, i) => {
            const reached = !rejected && i <= statusIndex;
            return (
              <li
                key={step.key}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1',
                  reached
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'inline-flex size-4 items-center justify-center rounded-full text-[10px] font-semibold',
                    reached ? 'bg-primary text-primary-foreground' : 'bg-muted',
                  )}
                >
                  {i + 1}
                </span>
                {step.label}
              </li>
            );
          })}
        </ol>
        {rejected ? (
          <div className="bg-muted/60 text-muted-foreground mt-4 rounded-md p-3 text-xs">
            <Calendar className="mr-1 inline size-3" />
            {row.status === 'rejected'
              ? `Not moving forward as of ${row.rejected_at ? formatDate(row.rejected_at) : 'recently'}.`
              : 'You withdrew this application.'}
            {row.rejection_reason ? (
              <div className="text-foreground mt-1">{row.rejection_reason}</div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
