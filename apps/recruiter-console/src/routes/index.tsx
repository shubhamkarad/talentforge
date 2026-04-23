import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowRight, Briefcase, MessagesSquare, Sparkles, Target, Zap } from 'lucide-react';
import { APP_NAME } from '@forge/shared';
import {
  Button,
  FadeIn,
  GradientOrb,
  GridBg,
  HoverLift,
  MagneticButton,
  ShineButton,
  Stagger,
  StaggerItem,
} from '@forge/design-system';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="border-border/60 bg-background/70 sticky top-0 z-30 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2 font-semibold tracking-tight">
          <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] transition-shadow group-hover:shadow-[0_0_0_5px_hsl(var(--primary)/0.25)]">
            <Zap className="size-4" />
          </span>
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup" className="group">
              Get started
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-56px)] items-center overflow-hidden px-6 py-10 sm:py-14">
      <GridBg />
      <GradientOrb className="top-0 left-1/2 -translate-x-1/2 -translate-y-1/3" />

      <div className="relative mx-auto w-full max-w-3xl text-center">
        <FadeIn>
          <span className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] font-medium tracking-[0.18em] uppercase">
            <Sparkles className="size-3" /> AI-assisted hiring · beta
          </span>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="mt-5 text-5xl leading-[1.2] font-bold tracking-tight sm:text-6xl sm:leading-[1.15]">
            Fill roles in{' '}
            <span className="from-primary via-primary to-accent bg-gradient-to-br bg-clip-text pb-1 text-transparent">
              days
            </span>
            , not quarters.
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg">
            {APP_NAME} drafts job postings, scores every applicant against your spec, and keeps the
            conversation moving — so the only thing you do is talk to the right people.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton>
              <ShineButton asChild size="lg">
                <Link to="/signup" className="group">
                  Create a company
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </ShineButton>
            </MagneticButton>
            <MagneticButton strength={0.25}>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">I have an account</Link>
              </Button>
            </MagneticButton>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="text-muted-foreground/70 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] tracking-[0.18em] uppercase">
            <span>· draft-job</span>
            <span>· score-fit</span>
            <span>· interview-prep</span>
            <span>· extract-profile</span>
            <span>· career-forecast</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Briefcase,
    title: 'Draft a posting in a sentence',
    body: 'Describe the role in one line. We fill in the description, requirements, skills, and a reasonable salary band — editable before publish.',
  },
  {
    icon: Target,
    title: 'Score every applicant instantly',
    body: "Each application lands with a 0–100 fit score, plus ranked strengths and concerns grounded in the candidate's actual experience.",
  },
  {
    icon: MessagesSquare,
    title: 'Close the loop in one place',
    body: 'Realtime messaging per application, status changes that notify the candidate automatically, a pipeline you actually want to live in.',
  },
] as const;

function Features() {
  return (
    <section className="border-border/60 bg-muted/30 relative border-y px-6 pt-12 pb-20">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-primary font-mono text-[11px] tracking-[0.18em] uppercase">
              Built for modern recruiting
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              The parts of recruiting you hate, automated.
            </h2>
            <p className="text-muted-foreground mt-3">
              Three things you do every day, now a single click each.
            </p>
          </div>
        </FadeIn>

        <Stagger step={0.08} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <StaggerItem key={title}>
              <HoverLift className="h-full">
                <div className="group border-border bg-card hover:border-primary/30 relative h-full overflow-hidden rounded-xl border p-6 shadow-sm transition-colors">
                  <div
                    aria-hidden
                    className="bg-primary/10 pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                  />
                  <div className="flex items-center justify-between">
                    <div className="bg-primary/10 text-primary grid size-10 place-items-center rounded-lg">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-muted-foreground font-mono text-[11px]">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{body}</p>
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: '01',
    title: 'Post a role',
    body: 'Type a sentence. Get a publish-ready job description in about ten seconds.',
  },
  {
    n: '02',
    title: 'Read the pipeline',
    body: 'Every applicant arrives pre-graded against the spec, with specific strengths and concerns.',
  },
  {
    n: '03',
    title: 'Move the best ones forward',
    body: 'Update a status and the candidate is notified. Open the thread. Keep things moving.',
  },
] as const;

function HowItWorks() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-primary font-mono text-[11px] tracking-[0.18em] uppercase">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              From brief to hire in three steps.
            </h2>
          </div>
        </FadeIn>

        <Stagger step={0.12} className="mt-16 grid gap-8 sm:grid-cols-3">
          {STEPS.map(({ n, title, body }) => (
            <StaggerItem key={n}>
              <div className="border-primary/40 relative border-l-2 pl-5">
                <div className="bg-primary absolute top-0 -left-[7px] size-3 rounded-full shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]" />
                <div className="text-primary font-mono text-xs font-semibold">{n}</div>
                <div className="mt-1 text-lg font-semibold">{title}</div>
                <p className="text-muted-foreground mt-2 text-sm">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeIn delay={0.2}>
          <div className="border-border from-card via-card to-primary/5 relative mt-20 overflow-hidden rounded-3xl border bg-gradient-to-br p-6 sm:p-10 lg:p-12">
            <div
              aria-hidden
              className="bg-primary/10 pointer-events-none absolute -top-24 -right-24 size-72 rounded-full blur-3xl"
            />
            <div
              aria-hidden
              className="bg-accent/10 pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full blur-3xl"
            />
            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="text-primary font-mono text-[11px] tracking-[0.18em] uppercase">
                  Ready when you are
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Skip the résumé pile.
                </h3>
                <p className="text-muted-foreground mt-3 max-w-md">
                  Free to start. Post your first role, watch AI grade the applicants, and see how
                  much hiring time you get back.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <ShineButton asChild size="lg">
                    <Link to="/signup" className="group">
                      Create your company
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </ShineButton>
                  <Button asChild size="lg" variant="ghost">
                    <Link to="/login">Sign in instead</Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center sm:gap-3">
                {[
                  { n: '10s', l: 'to draft a job' },
                  { n: '0–100', l: 'match score' },
                  { n: 'live', l: 'candidate chat' },
                ].map((stat) => (
                  <div
                    key={stat.l}
                    className="border-border bg-background/60 min-w-0 rounded-xl border p-3 backdrop-blur sm:p-4"
                  >
                    <div className="from-primary to-accent truncate bg-gradient-to-br bg-clip-text text-lg font-bold text-transparent sm:text-2xl">
                      {stat.n}
                    </div>
                    <div className="text-muted-foreground mt-1 text-[10px] leading-tight tracking-[0.08em] uppercase sm:text-[11px] sm:tracking-[0.12em]">
                      {stat.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-border/60 text-muted-foreground border-t px-6 py-8 text-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <span>
          © {new Date().getFullYear()} {APP_NAME}
          <span className="mx-2">·</span>
          <span className="font-mono text-[11px] tracking-[0.15em] uppercase">
            forged with cerebras
          </span>
        </span>
        <div className="flex gap-4">
          <Link to="/login" className="hover:text-foreground">
            Log in
          </Link>
          <Link to="/signup" className="hover:text-foreground">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
