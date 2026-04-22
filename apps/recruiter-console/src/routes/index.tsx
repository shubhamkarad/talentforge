import { createFileRoute } from '@tanstack/react-router';
import { APP_NAME } from '@forge/shared';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary">
        Recruiter console
      </span>
      <h1 className="text-5xl font-bold tracking-tight">{APP_NAME}</h1>
      <p className="max-w-lg text-muted-foreground">
        Scaffold is live. Phase 6.2 will wire providers and layout; 6.3 adds
        authentication. For now, the router and design-system stylesheet are
        working — you should see the warm-amber brand color above.
      </p>
    </main>
  );
}
