import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { ExternalLink, Trash2 } from 'lucide-react';
import { useDeleteJob, useJob, useUpdateJob } from '@forge/data-client';
import {
  Badge,
  Button,
  Skeleton,
  toast,
} from '@forge/design-system';
import { JOB_STATUS_LABELS } from '@forge/shared';
import { PageHeader } from '~/components/app-shell';
import { JobForm, type JobFormSubmit } from '~/features/jobs/job-form';
import { dbRowToForm, formToDbInsert } from '~/features/jobs/converters';

export const Route = createFileRoute('/_app/jobs/$jobId')({
  component: EditJobPage,
});

function EditJobPage() {
  const { jobId } = Route.useParams();
  const { user } = Route.useRouteContext();

  const job = useJob(jobId);
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const navigate = useNavigate();

  async function handleSubmit({ values }: JobFormSubmit) {
    if (!job.data) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = job.data as any;
    const patch = formToDbInsert(values, row.company_id, user.id);
    try {
      await updateJob.mutateAsync({ id: jobId, ...patch });
      toast.success('Job updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update job');
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this job? Applications will be removed too.')) return;
    try {
      await deleteJob.mutateAsync(jobId);
      toast.success('Job deleted.');
      navigate({ to: '/jobs' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  if (job.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-4 h-96 w-full" />
      </div>
    );
  }

  if (!job.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h2 className="text-lg font-semibold">Job not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been deleted or you don't have access.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/jobs">Back to jobs</Link>
        </Button>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = job.data as any;
  const status = row.status as string;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        title={row.title || 'Untitled job'}
        subtitle={
          <>
            Status: <Badge variant="secondary" className="ml-1">{JOB_STATUS_LABELS[status] ?? status}</Badge>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/applications">
                <ExternalLink className="size-4" /> View applications
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleteJob.isPending}>
              <Trash2 className="size-4" /> Delete
            </Button>
          </>
        }
      />

      <JobForm
        mode="edit"
        initial={dbRowToForm(row)}
        company={row.companies}
        submitting={updateJob.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
