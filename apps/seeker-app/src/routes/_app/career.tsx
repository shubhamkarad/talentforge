import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '~/components/app-shell';

// Placeholder — Step 7.7 replaces with the career-forecast UI.
export const Route = createFileRoute('/_app/career')({
  component: CareerStub,
});

function CareerStub() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader title="Career" subtitle="1-, 3-, and 5-year forecast based on your profile." />
      <p className="text-sm text-muted-foreground">Scaffolded. Real forecast arrives in Step 7.7.</p>
    </div>
  );
}
