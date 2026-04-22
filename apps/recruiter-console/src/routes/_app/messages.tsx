import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '~/components/app-shell';

// Placeholder — Step 6.7 replaces with realtime messaging UI.
export const Route = createFileRoute('/_app/messages')({
  component: MessagesStub,
});

function MessagesStub() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader title="Messages" subtitle="One thread per application." />
      <p className="text-sm text-muted-foreground">Scaffolded. Real inbox arrives in Step 6.7.</p>
    </div>
  );
}
