import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '~/components/app-shell';

// Placeholder — Step 7.5 replaces with the job detail + apply flow.
export const Route = createFileRoute('/_app/jobs/$jobId')({
  component: JobDetailStub,
});

function JobDetailStub() {
  const { jobId } = Route.useParams();
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader title="Job detail" subtitle={`id: ${jobId}`} />
      <p className="text-sm text-muted-foreground">Scaffolded. Detail UI arrives in Step 7.5.</p>
    </div>
  );
}
