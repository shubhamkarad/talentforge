import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '~/components/app-shell';

// Placeholder — Step 7.7 replaces with the interview-prep UI.
export const Route = createFileRoute('/_app/interview/$jobId')({
  component: InterviewStub,
});

function InterviewStub() {
  const { jobId } = Route.useParams();
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader title="Interview prep" subtitle={`For job ${jobId}`} />
      <p className="text-sm text-muted-foreground">Scaffolded. Real prep arrives in Step 7.7.</p>
    </div>
  );
}
