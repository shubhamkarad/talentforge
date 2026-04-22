import { Link } from '@tanstack/react-router';
import { CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { APP_NAME } from '@forge/shared';
import { Card, CardContent, FadeIn, GradientOrb, GridBg } from '@forge/design-system';
import type { ReactNode } from 'react';

// Shared chrome for every auth route. Ambient background layers (grid + orbs)
// match the landing page; on desktop a decorative side panel shows what the
// user gets once they sign in so the page doesn't read like an empty void.
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative h-dvh overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <GridBg />
        <GradientOrb className="-top-40 -left-40" size="w-[520px] h-[520px]" />
        <GradientOrb
          className="-right-40 -bottom-40"
          size="w-[520px] h-[520px]"
          from="hsl(var(--accent) / 0.3)"
          via="hsl(var(--primary) / 0.15)"
        />
      </div>

      <header className="relative z-10 px-6 pt-5">
        <Link to="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
          <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]">
            <Zap className="size-4" />
          </span>
          {APP_NAME}
        </Link>
      </header>

      <main className="relative z-10 flex h-[calc(100dvh-56px)] items-center justify-center px-6 py-4">
        <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.05fr_minmax(340px,1fr)] lg:items-center">
          <SidePanel />

          <div className="w-full max-w-sm space-y-4 lg:mx-0 lg:ml-auto">
            <FadeIn>
              <div className="text-center lg:text-left">
                <span className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] font-medium tracking-[0.18em] uppercase">
                  <Sparkles className="size-3" /> Recruiter console
                </span>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
                {subtitle ? (
                  <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>
                ) : null}
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <Card className="border-border/60 bg-card/80 shadow-xl shadow-black/5 backdrop-blur">
                <CardContent className="p-5">{children}</CardContent>
              </Card>
            </FadeIn>
            {footer ? (
              <FadeIn delay={0.15}>
                <div className="text-center lg:text-left">{footer}</div>
              </FadeIn>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

const PITCHES = [
  'Draft a complete job posting from one sentence.',
  'Every applicant pre-scored against your spec.',
  'Realtime messaging, one thread per application.',
] as const;

function SidePanel() {
  return (
    <div className="hidden lg:block">
      <FadeIn>
        <p className="text-primary font-mono text-[11px] tracking-[0.18em] uppercase">
          Hire without the headache
        </p>
        <h2 className="mt-3 text-4xl leading-[1.15] font-bold tracking-tight">
          Spend your time on{' '}
          <span className="from-primary via-primary to-accent bg-gradient-to-br bg-clip-text pb-1 text-transparent">
            the right candidates.
          </span>
        </h2>
        <ul className="mt-8 space-y-3">
          {PITCHES.map((pitch, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
              <span className="text-muted-foreground">{pitch}</span>
            </li>
          ))}
        </ul>
        <div className="border-border bg-card/50 text-muted-foreground mt-10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-[0.18em] uppercase backdrop-blur">
          <span className="bg-primary size-1.5 animate-pulse rounded-full" />
          forged with cerebras
        </div>
      </FadeIn>
    </div>
  );
}
