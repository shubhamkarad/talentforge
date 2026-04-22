import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Bookmark, BookmarkCheck, Building2, Clock, MapPin, Send } from 'lucide-react';
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  REMOTE_TYPE_LABELS,
  formatDate,
  formatSalaryRange,
} from '@forge/shared';
import {
  useCreateApplication,
  useHasApplied,
  useJob,
  useMatchScore,
  useToggleSaveJob,
  useIsJobSaved,
} from '@forge/data-client';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ScoreRing,
  Skeleton,
  Textarea,
  toast,
} from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';

export const Route = createFileRoute('/_app/jobs/$jobId')({
  component: JobDetailPage,
});

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const { user } = Route.useRouteContext();

  const job = useJob(jobId);
  const score = useMatchScore(user.id, jobId);
  const applied = useHasApplied(user.id, jobId);
  const savedState = useIsJobSaved(user.id, jobId);
  const toggle = useToggleSaveJob();

  if (job.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="mt-4 h-96 w-full" />
      </div>
    );
  }

  if (!job.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h2 className="text-lg font-semibold">Job not found</h2>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/jobs">Back to jobs</Link>
        </Button>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const j = job.data as any;
  const company = j.companies ?? {};

  async function handleSaveToggle() {
    try {
      await toggle.toggle(user.id, jobId, !!savedState.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  }

  const hasApplied = !!applied.data;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title={j.title}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <Building2 className="size-3.5" />
            <span className="text-foreground font-medium">{company.name ?? '—'}</span>
            {j.location ? (
              <>
                · <MapPin className="size-3.5" /> {j.location}
              </>
            ) : null}
          </span>
        }
        actions={
          <>
            <Button variant="outline" onClick={handleSaveToggle} disabled={toggle.isPending}>
              {savedState.data ? (
                <>
                  <BookmarkCheck className="size-4" /> Saved
                </>
              ) : (
                <>
                  <Bookmark className="size-4" /> Save
                </>
              )}
            </Button>
            {hasApplied ? (
              <Badge variant="secondary">Applied · {applied.data?.status}</Badge>
            ) : (
              <ApplyDialog candidateId={user.id} jobId={jobId} jobTitle={j.title} />
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <OverviewCard job={j} />
          <DescriptionCard description={j.description} />
          {j.requirements?.length ? (
            <BulletCard title="Requirements" items={j.requirements} />
          ) : null}
          {j.responsibilities?.length ? (
            <BulletCard title="Responsibilities" items={j.responsibilities} />
          ) : null}
          {j.nice_to_have?.length ? (
            <BulletCard title="Nice to have" items={j.nice_to_have} />
          ) : null}
          {j.benefits?.length ? <BulletCard title="Benefits" items={j.benefits} /> : null}
        </div>

        <aside className="space-y-6">
          <MatchCard score={score.data} />
          <CompanyCard company={company} />
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

function OverviewCard({
  job,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  job: any;
}) {
  const remoteLabel = job.remote_type ? REMOTE_TYPE_LABELS[job.remote_type] : undefined;
  const typeLabel = job.employment_type ? EMPLOYMENT_TYPE_LABELS[job.employment_type] : undefined;
  const levelLabel = job.experience_level
    ? EXPERIENCE_LEVEL_LABELS[job.experience_level]
    : undefined;
  const skills: string[] = job.skills_required ?? [];
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <div className="flex flex-wrap gap-1.5">
          {remoteLabel ? <Badge>{remoteLabel}</Badge> : null}
          {typeLabel ? <Badge variant="secondary">{typeLabel}</Badge> : null}
          {levelLabel ? <Badge variant="secondary">{levelLabel}</Badge> : null}
          {job.show_salary ? (
            <Badge variant="outline">
              {formatSalaryRange(
                job.salary_min,
                job.salary_max,
                job.salary_currency,
                job.salary_period,
              )}
            </Badge>
          ) : null}
        </div>
        {skills.length ? (
          <div>
            <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Skills
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Clock className="size-3.5" />
          Posted {formatDate(job.published_at ?? job.created_at)}
        </div>
      </CardContent>
    </Card>
  );
}

function DescriptionCard({ description }: { description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About the role</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function BulletCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-muted-foreground list-disc space-y-1.5 pl-5 text-sm">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function MatchCard({
  score,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  score: any;
}) {
  if (!score) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your fit</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Calculating — open the jobs browse once and come back if this still says so after a few
            seconds.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your fit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center py-2">
          <ScoreRing value={score.overall_score} size={140} strokeWidth={11} label="match" />
        </div>
        {score.summary ? <p className="text-muted-foreground text-sm">{score.summary}</p> : null}
        <Breakdown label="Skills" value={score.skills_score} />
        <Breakdown label="Experience" value={score.experience_score} />
      </CardContent>
    </Card>
  );
}

function Breakdown({ label, value }: { label: string; value: number | null | undefined }) {
  const pct = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : null;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{pct == null ? '—' : `${pct}%`}</span>
      </div>
      <div className="bg-muted mt-1 h-1.5 overflow-hidden rounded-full">
        <div className="bg-primary h-full transition-all" style={{ width: `${pct ?? 0}%` }} />
      </div>
    </div>
  );
}

function CompanyCard({
  company,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  company: any;
}) {
  if (!company?.id) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>About {company.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {company.description ? (
          <p className="text-muted-foreground line-clamp-6">{company.description}</p>
        ) : null}
        {company.industry ? (
          <div className="text-muted-foreground text-xs">{company.industry}</div>
        ) : null}
        {company.website ? (
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="text-primary text-xs hover:underline"
          >
            {company.website.replace(/^https?:\/\//, '')}
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Apply dialog
// ---------------------------------------------------------------------------

function ApplyDialog({
  candidateId,
  jobId,
  jobTitle,
}: {
  candidateId: string;
  jobId: string;
  jobTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const create = useCreateApplication();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const row = await create.mutateAsync({
        candidate_id: candidateId,
        job_id: jobId,
        cover_letter: coverLetter || null,
        portfolio_url: portfolioUrl || null,
      });
      toast.success('Application sent.');
      setOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigate({ to: '/applications/$applicationId', params: { applicationId: (row as any).id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Application failed');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Send className="size-4" /> Apply
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to {jobTitle}</DialogTitle>
          <DialogDescription>
            We'll send your profile along with whatever you write here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Cover letter (optional)</label>
            <Textarea
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Why you, why this role — a few short paragraphs."
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Portfolio URL (optional)</label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://..."
              className="border-input focus-visible:ring-ring mt-1.5 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Sending…' : 'Send application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
