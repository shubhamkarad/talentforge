import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';
import { useCompany, useCreateJob } from '@forge/data-client';
import { Card, CardContent, Skeleton, toast } from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';
import { JobForm, type JobFormSubmit } from '~/features/jobs/job-form';
import { formToDbInsert } from '~/features/jobs/converters';

export const Route = createFileRoute('/_app/jobs/new')({
  component: NewJobPage,
});

function NewJobPage() {
  const { user } = Route.useRouteContext();
  const company = useCompany(user.id);
  const createJob = useCreateJob();
  const navigate = useNavigate();

  async function handleSubmit({ values, intent }: JobFormSubmit) {
    if (!company.data) {
      toast.error('Set up your company profile before posting a job.');
      return;
    }
    const insert = {
      ...formToDbInsert(values, company.data.id, user.id),
      status: intent === 'publish' ? 'active' : 'draft',
      published_at: intent === 'publish' ? new Date().toISOString() : null,
    };
    try {
      const created = await createJob.mutateAsync(insert);
      toast.success(intent === 'publish' ? 'Job published.' : 'Draft saved.');
      navigate({ to: '/jobs/$jobId', params: { jobId: created.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save job');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        title="New job"
        subtitle="Describe the role — the AI draft button handles the boilerplate."
      />

      {company.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : !company.data ? (
        <MissingCompanyBanner />
      ) : null}

      <JobForm
        mode="create"
        company={company.data ?? null}
        submitting={createJob.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function MissingCompanyBanner() {
  return (
    <Card className="mb-6 border-warning/40 bg-warning/10">
      <CardContent className="flex items-start gap-3 p-4">
        <AlertTriangle className="mt-0.5 size-5 text-warning-foreground" />
        <div className="flex-1 text-sm">
          <div className="font-medium">Set up your company first</div>
          <p className="mt-1 text-muted-foreground">
            Jobs are posted under a company profile. Head to{' '}
            <Link to="/settings" className="font-medium text-primary hover:underline">
              settings
            </Link>
            {' '}to add yours, then come back here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
