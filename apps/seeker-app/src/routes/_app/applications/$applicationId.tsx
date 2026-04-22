import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '~/components/app-shell';

// Placeholder — Step 7.6 replaces with the application detail page.
export const Route = createFileRoute('/_app/applications/$applicationId')({
  component: ApplicationDetailStub,
});

function ApplicationDetailStub() {
  const { applicationId } = Route.useParams();
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader title="Application" subtitle={`id: ${applicationId}`} />
      <p className="text-sm text-muted-foreground">Scaffolded. Detail UI arrives in Step 7.6.</p>
    </div>
  );
}
