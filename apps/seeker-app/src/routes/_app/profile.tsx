import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '~/components/app-shell';

// Placeholder — Step 7.8 replaces with the profile editor + resume upload.
export const Route = createFileRoute('/_app/profile')({
  component: ProfileStub,
});

function ProfileStub() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader title="Profile" subtitle="Skills, experience, education, links." />
      <p className="text-sm text-muted-foreground">Scaffolded. Real editor arrives in Step 7.8.</p>
    </div>
  );
}
