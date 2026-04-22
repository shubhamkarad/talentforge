import { Link, createFileRoute } from '@tanstack/react-router';
import {
  ArrowRight,
  Compass,
  FileText,
  MessagesSquare,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
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
              Sign up <ArrowRight className="size-4" />
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
          <Sparkles className="size-3" /> For job seekers
        </span>
        <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
          Stop guessing. Apply where you actually fit.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          {APP_NAME} reads your resume, grades every job you browse against it,
          and shows you exactly where you're strong and what's missing — before
          you burn an hour on the application.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/signup">
              Create your profile <ArrowRight className="size-4" />
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
    icon: Target,
    title: 'See a match score on every job',
    body: 'The moment you open a posting, a 0–100 fit score appears next to it — plus the 2–3 specific gaps that would tank your application.',
  },
  {
    icon: Compass,
    title: 'A five-year career map',
    body: 'Where does this role lead? What skills unlock the next level? Which adjacent paths fit your background? One page, grounded in your actual profile.',
  },
  {
    icon: MessagesSquare,
    title: 'Interview prep for the specific role',
    body: 'Once you get to the interview stage, get tailored questions, STAR-framed answer outlines, and red flags to avoid — not generic advice.',
  },
] as const;

function Features() {
  return (
    <section className="border-y border-border/60 bg-muted/30 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Everything a recruiter won't tell you
          </h2>
          <p className="mt-3 text-muted-foreground">
            Three tools you wish you had on your last job search.
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
    icon: FileText,
    title: 'Upload your resume',
    body: 'We extract your skills, experience, education, and links automatically. Tweak what we got wrong.',
  },
  {
    n: '02',
    icon: Target,
    title: 'Browse jobs — with match scores attached',
    body: 'Every job shows your fit %, plus the ranked strengths and gaps specific to that role.',
  },
  {
    n: '03',
    icon: MessagesSquare,
    title: 'Apply confidently, interview prepared',
    body: 'Status changes land in-app. Interview prep unlocks when you reach that stage.',
  },
] as const;

function HowItWorks() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">From profile to offer</h2>
        </div>
        <ol className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map(({ n, icon: Icon, title, body }) => (
            <li key={n} className="relative border-l-2 border-primary/40 pl-5">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-primary">
                <Icon className="size-3.5" /> {n}
              </div>
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
