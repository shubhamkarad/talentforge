import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '~/components/app-shell';

// Placeholder — Step 7.6 replaces with the applications tracker.
export const Route = createFileRoute('/_app/applications/')({
  component: ApplicationsIndexStub,
});

function ApplicationsIndexStub() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader title="Applications" subtitle="Track everything you've applied to." />
      <p className="text-sm text-muted-foreground">Scaffolded. Real tracker arrives in Step 7.6.</p>
    </div>
  );
}
