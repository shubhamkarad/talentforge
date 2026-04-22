import { Link, createFileRoute } from '@tanstack/react-router';
import { ExternalLink, Mail, MessagesSquare, Phone } from 'lucide-react';
import {
  APPLICATION_STATUS_LABELS,
  formatDate,
  formatRelativeTime,
  initialsOf,
} from '@forge/shared';
import { useApplication, useUpdateApplication } from '@forge/data-client';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Skeleton,
  toast,
} from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';
import { ScorePanel, type MatchScoreData } from '~/features/applications/score-panel';

export const Route = createFileRoute('/_app/applications/$applicationId')({
  component: ApplicationDetailPage,
});

const STATUSES = [
  'pending',
  'reviewing',
  'shortlisted',
  'interviewing',
  'offer',
  'hired',
  'rejected',
] as const;

function ApplicationDetailPage() {
  const { applicationId } = Route.useParams();
  const application = useApplication(applicationId);
  const updateApplication = useUpdateApplication();

  if (application.isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Skeleton className="h-10 w-64" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!application.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h2 className="text-lg font-semibold">Application not found</h2>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/applications">Back to applications</Link>
        </Button>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = application.data as any;
  const candidate = row.profiles ?? {};
  const profile = candidate.candidate_profiles ?? {};
  const job = row.jobs ?? {};
  const score = row.match_score as MatchScoreData | null | undefined;

  const candidateName = candidate.full_name ?? 'Anonymous candidate';
  const statusLabel: string = APPLICATION_STATUS_LABELS[row.status] ?? row.status;

  async function changeStatus(next: string) {
    try {
      await updateApplication.mutateAsync({ id: applicationId, status: next });
      toast.success(`Moved to ${APPLICATION_STATUS_LABELS[next] ?? next}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Status change failed');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title={candidateName}
        subtitle={
          <>
            Applied for{' '}
            <span className="font-medium text-foreground">{job.title ?? 'this role'}</span>
            {' · '}
            {formatRelativeTime(row.applied_at)}
            {' · '}
            <Badge variant="secondary" className="ml-1">{statusLabel}</Badge>
          </>
        }
        actions={
          <>
            <Select
              value={row.status}
              onChange={(e) => changeStatus(e.target.value)}
              disabled={updateApplication.isPending}
              className="w-40"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {APPLICATION_STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </Select>
            <Button asChild variant="outline" size="sm">
              <Link to="/messages">
                <MessagesSquare className="size-4" /> Thread
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <CandidateCard candidate={candidate} profile={profile} />
          {row.cover_letter ? <CoverLetterCard text={row.cover_letter} /> : null}
          {profile.experience?.length ? (
            <ExperienceCard items={profile.experience} />
          ) : null}
          {profile.education?.length ? (
            <EducationCard items={profile.education} />
          ) : null}
          {profile.skills?.length ? (
            <SkillsCard items={profile.skills} />
          ) : null}
        </div>

        <aside className="space-y-6">
          <ScorePanel score={score ?? null} />
          <JobCard job={job} />
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

function CandidateCard({
  candidate,
  profile,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  candidate: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any;
}) {
  return (
    <Card>
      <CardContent className="flex gap-5 p-6">
        <Avatar className="size-14">
          <AvatarFallback className="text-base">{initialsOf(candidate.full_name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="text-xl font-semibold tracking-tight">{candidate.full_name ?? 'Anonymous'}</div>
          {profile.headline ? (
            <div className="text-sm text-muted-foreground">{profile.headline}</div>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {candidate.email ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" /> {candidate.email}
              </span>
            ) : null}
            {candidate.phone ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5" /> {candidate.phone}
              </span>
            ) : null}
            {profile.linkedin_url ? (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-1 hover:text-foreground">
                LinkedIn <ExternalLink className="size-3" />
              </a>
            ) : null}
            {profile.github_url ? (
              <a href={profile.github_url} target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-1 hover:text-foreground">
                GitHub <ExternalLink className="size-3" />
              </a>
            ) : null}
            {profile.portfolio_url ? (
              <a href={profile.portfolio_url} target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-1 hover:text-foreground">
                Portfolio <ExternalLink className="size-3" />
              </a>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CoverLetterCard({ text }: { text: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cover letter</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

function ExperienceCard({
  items,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((e, i) => (
          <div key={i}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{e.title ?? '—'}</span>
              {e.company ? (
                <span className="text-sm text-muted-foreground">· {e.company}</span>
              ) : null}
            </div>
            <div className="text-xs text-muted-foreground">
              {e.startDate ?? ''}
              {e.startDate && (e.endDate || e.current) ? ' – ' : ''}
              {e.current ? 'Present' : e.endDate ?? ''}
              {e.location ? ` · ${e.location}` : ''}
            </div>
            {e.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EducationCard({
  items,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {items.map((e, i) => (
          <div key={i}>
            <div className="font-medium">{e.degree ?? e.institution ?? '—'}</div>
            <div className="text-xs text-muted-foreground">
              {[e.institution, e.fieldOfStudy, e.year ?? e.endDate].filter(Boolean).join(' · ')}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SkillsCard({
  items,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {items.map((s, i) => {
            const name = typeof s === 'string' ? s : s?.name ?? String(s);
            return (
              <Badge key={`${name}-${i}`} variant="secondary">
                {name}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function JobCard({
  job,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  job: any;
}) {
  if (!job?.id) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="font-medium">{job.title}</div>
        {job.employer_id ? (
          <Link
            to="/jobs/$jobId"
            params={{ jobId: job.id }}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Open job <ExternalLink className="size-3" />
          </Link>
        ) : null}
        {job.created_at ? (
          <div className="text-xs text-muted-foreground">
            Posted {formatDate(job.created_at)}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
