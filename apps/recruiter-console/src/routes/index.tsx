import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowRight, Briefcase, MessagesSquare, Sparkles, Target, Zap } from 'lucide-react';
import { APP_NAME } from '@forge/shared';
import { Button } from '@forge/design-system';

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
    <header className="border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </span>
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">
              Get started <ArrowRight className="size-4" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute inset-x-0 -top-40 -z-10 mx-auto h-[540px] max-w-4xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-3xl"
      />
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
          <Sparkles className="size-3" /> AI-assisted hiring
        </span>
        <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
          Fill roles in days, not quarters.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          {APP_NAME} drafts job postings, scores every applicant against your
          spec, and keeps the conversation moving — so the only thing you do is
          talk to the right people.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/signup">
              Create a company <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">I have an account</Link>
          </Button>
        </div>
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
    body: 'Each application lands with a 0–100 fit score, plus ranked strengths and concerns grounded in the candidate\'s actual experience.',
  },
  {
    icon: MessagesSquare,
    title: 'Close the loop in one place',
    body: 'Realtime messaging per application, status changes that notify the candidate automatically, a pipeline you actually want to live in.',
  },
] as const;

function Features() {
  return (
    <section className="border-y border-border/60 bg-muted/30 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            The parts of recruiting you hate, automated
          </h2>
          <p className="mt-3 text-muted-foreground">
            Three things you do every day, now a single click each.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
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
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
        </div>
        <ol className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map(({ n, title, body }) => (
            <li key={n} className="relative border-l-2 border-primary/40 pl-5">
              <div className="text-xs font-mono font-semibold text-primary">{n}</div>
              <div className="mt-1 text-lg font-semibold">{title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60 px-6 py-8 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <span>© {new Date().getFullYear()} {APP_NAME}</span>
        <div className="flex gap-4">
          <Link to="/login" className="hover:text-foreground">Log in</Link>
          <Link to="/signup" className="hover:text-foreground">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}
