import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowRight, Compass, FileText, MessagesSquare, Sparkles, Target, Zap } from 'lucide-react';
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
              Sign up
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
            <Sparkles className="size-3" /> For job seekers · beta
          </span>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="mt-5 text-5xl leading-[1.2] font-bold tracking-tight sm:text-6xl sm:leading-[1.15]">
            Stop guessing.
            <br />
            Apply where you{' '}
            <span className="from-primary via-primary to-accent bg-gradient-to-br bg-clip-text pb-1 text-transparent">
              actually fit
            </span>
            .
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg">
            {APP_NAME} reads your resume, grades every job you browse against it, and shows you
            exactly where you're strong and what's missing — before you burn an hour on the
            application.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-8 flex items-center justify-center gap-3">
            <MagneticButton>
              <ShineButton asChild size="lg">
                <Link to="/signup" className="group">
                  Create your profile
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
            <span>· match-scores</span>
            <span>· career-forecast</span>
            <span>· interview-prep</span>
            <span>· resume-parsing</span>
          </div>
        </FadeIn>
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
    <section className="border-border/60 bg-muted/30 relative border-y px-6 pt-12 pb-20">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-primary font-mono text-[11px] tracking-[0.18em] uppercase">
              For candidates
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything a recruiter won't tell you.
            </h2>
            <p className="text-muted-foreground mt-3">
              Three tools you wish you had on your last job search.
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
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-primary font-mono text-[11px] tracking-[0.18em] uppercase">
              From profile to offer
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps to your next role.
            </h2>
          </div>
        </FadeIn>

        <Stagger step={0.12} className="mt-16 grid gap-8 sm:grid-cols-3">
          {STEPS.map(({ n, icon: Icon, title, body }) => (
            <StaggerItem key={n}>
              <div className="border-primary/40 relative border-l-2 pl-5">
                <div className="bg-primary absolute top-0 -left-[7px] size-3 rounded-full shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]" />
                <div className="text-primary flex items-center gap-2 font-mono text-xs font-semibold">
                  <Icon className="size-3.5" /> {n}
                </div>
                <div className="mt-1 text-lg font-semibold">{title}</div>
                <p className="text-muted-foreground mt-2 text-sm">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeIn delay={0.2}>
          <div className="border-border from-card via-card to-primary/5 relative mt-20 overflow-hidden rounded-3xl border bg-gradient-to-br p-12">
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
                  Free to start
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Stop applying blind.
                </h3>
                <p className="text-muted-foreground mt-3 max-w-md">
                  Upload your resume, browse with match scores, and only spend time on roles where
                  you actually stand a chance.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <ShineButton asChild size="lg">
                    <Link to="/signup" className="group">
                      Create your profile
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </ShineButton>
                  <Button asChild size="lg" variant="ghost">
                    <Link to="/login">Sign in instead</Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { n: '0–100', l: 'fit score' },
                  { n: '1/3/5', l: 'year forecast' },
                  { n: 'STAR', l: 'interview prep' },
                ].map((stat) => (
                  <div
                    key={stat.l}
                    className="border-border bg-background/60 rounded-xl border p-4 backdrop-blur"
                  >
                    <div className="from-primary to-accent bg-gradient-to-br bg-clip-text text-2xl font-bold text-transparent">
                      {stat.n}
                    </div>
                    <div className="text-muted-foreground mt-1 text-[11px] tracking-[0.12em] uppercase">
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
