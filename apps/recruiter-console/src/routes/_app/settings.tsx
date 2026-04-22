import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '~/components/app-shell';

// Placeholder — Step 6.8 replaces with account + company profile editors.
export const Route = createFileRoute('/_app/settings')({
  component: SettingsStub,
});

function SettingsStub() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader title="Settings" subtitle="Account and company profile." />
      <p className="text-sm text-muted-foreground">Scaffolded. Real settings arrive in Step 6.8.</p>
    </div>
  );
}
