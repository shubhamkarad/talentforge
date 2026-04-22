import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '~/components/app-shell';

// Placeholder — Step 7.5 replaces with the saved-jobs list.
export const Route = createFileRoute('/_app/saved')({
  component: SavedStub,
});

function SavedStub() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader title="Saved" subtitle="Jobs you've bookmarked." />
      <p className="text-sm text-muted-foreground">Scaffolded. Real list arrives in Step 7.5.</p>
    </div>
  );
}
