import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '~/components/app-shell';

// Placeholder — Step 7.8 replaces with account/notification settings.
export const Route = createFileRoute('/_app/settings')({
  component: SettingsStub,
});

function SettingsStub() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader title="Settings" subtitle="Account and notifications." />
      <p className="text-sm text-muted-foreground">Scaffolded. Real settings arrive in Step 7.8.</p>
    </div>
  );
}
