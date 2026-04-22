import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '~/components/app-shell';

// Placeholder — Step 7.5 replaces with the real browse + instant match UI.
export const Route = createFileRoute('/_app/jobs/')({
  component: JobsIndexStub,
});

function JobsIndexStub() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader title="Jobs" subtitle="Find roles that actually fit." />
      <p className="text-sm text-muted-foreground">Scaffolded. Real browsing arrives in Step 7.5.</p>
    </div>
  );
}
