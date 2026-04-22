import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Search } from 'lucide-react';
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  REMOTE_TYPE_LABELS,
  formatRelativeTime,
  formatSalaryRange,
} from '@forge/shared';
import {
  useCalculateMatch,
  useMatchScores,
  usePublicJobs,
  type PublicJobFilters,
} from '@forge/data-client';
import {
  Badge,
  Card,
  CardContent,
  Input,
  ScoreRing,
  Select,
  Skeleton,
  Stagger,
  StaggerItem,
} from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';

export const Route = createFileRoute('/_app/jobs/')({
  component: JobsBrowsePage,
});

function JobsBrowsePage() {
  const { user } = Route.useRouteContext();
  const [filters, setFilters] = useState<PublicJobFilters>({});

  const jobs = usePublicJobs(filters);
  const scores = useMatchScores(user.id);
  const calculate = useCalculateMatch();

  // Whenever the job list changes, kick off score calculation for this candidate.
  // The edge function handles caching — only uncached pairs hit Cerebras.
  useEffect(() => {
    if (!jobs.data || jobs.data.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ids = (jobs.data as any[]).map((j) => j.id).filter(Boolean);
    if (ids.length === 0) return;
    calculate.mutate({ candidateId: user.id, jobIds: ids });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs.data]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Browse jobs"
        subtitle="Every role comes pre-graded against your profile."
      />

      <FiltersBar filters={filters} onChange={setFilters} />

      {jobs.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (jobs.data?.length ?? 0) === 0 ? (
        <EmptyState hasFilters={hasAnyFilter(filters)} />
      ) : (
        <Stagger as="ul" step={0.05} className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(jobs.data as any[]).map((job) => (
            <StaggerItem as="li" key={job.id}>
              <JobRow job={job} score={scores.data?.[job.id]} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {calculate.isPending && (jobs.data?.length ?? 0) > 0 ? (
        <p className="text-muted-foreground mt-4 text-center text-xs">
          Scoring your fit — this usually takes a few seconds.
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

function FiltersBar({
  filters,
  onChange,
}: {
  filters: PublicJobFilters;
  onChange: (next: PublicJobFilters) => void;
}) {
  return (
    <Card className="mb-6">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-5">
        <div className="relative sm:col-span-2">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by title"
            value={filters.search ?? ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
            className="pl-9"
          />
        </div>
        <Input
          placeholder="Location"
          value={filters.location ?? ''}
          onChange={(e) => onChange({ ...filters, location: e.target.value || undefined })}
        />
        <Select
          value={filters.remoteType ?? ''}
          onChange={(e) => onChange({ ...filters, remoteType: e.target.value || undefined })}
        >
          <option value="">Any remote</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-site</option>
        </Select>
        <Select
          value={filters.employmentType ?? ''}
          onChange={(e) => onChange({ ...filters, employmentType: e.target.value || undefined })}
        >
          <option value="">Any type</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="freelance">Freelance</option>
        </Select>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Job row
// ---------------------------------------------------------------------------

function JobRow({
  job,
  score,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  job: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  score?: any;
}) {
  const company = job.companies;
  const remoteLabel: string | undefined = job.remote_type
    ? REMOTE_TYPE_LABELS[job.remote_type]
    : undefined;
  const typeLabel: string | undefined = job.employment_type
    ? EMPLOYMENT_TYPE_LABELS[job.employment_type]
    : undefined;
  const levelLabel: string | undefined = job.experience_level
    ? EXPERIENCE_LEVEL_LABELS[job.experience_level]
    : undefined;

  return (
    <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="block">
      <Card className="group hover:border-primary/30 relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <div
          aria-hidden
          className="from-primary/5 pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        />
        <CardContent className="flex items-start gap-4 p-5">
          <div className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-md">
            <Briefcase className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{job.title}</div>
            <div className="text-muted-foreground mt-0.5 truncate text-sm">
              {company?.name ?? '—'}
              {job.location ? ` · ${job.location}` : ''}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {remoteLabel ? <Badge variant="secondary">{remoteLabel}</Badge> : null}
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
            <div className="text-muted-foreground mt-2 text-xs">
              Posted {formatRelativeTime(job.published_at ?? job.created_at)}
            </div>
          </div>
          <MatchBadge score={score?.overall_score} />
        </CardContent>
      </Card>
    </Link>
  );
}

function MatchBadge({ score }: { score?: number }) {
  if (typeof score !== 'number') {
    return (
      <div className="border-border text-muted-foreground flex size-14 flex-col items-center justify-center rounded-full border border-dashed">
        <MapPin className="size-4 opacity-40" />
      </div>
    );
  }
  return <ScoreRing value={score} size={64} strokeWidth={6} />;
}

// ---------------------------------------------------------------------------
// Empty
// ---------------------------------------------------------------------------

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="bg-primary/10 text-primary grid size-12 place-items-center rounded-full">
          <Briefcase className="size-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {hasFilters ? 'No jobs match those filters' : 'No active jobs right now'}
          </h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
            {hasFilters
              ? 'Try relaxing one or two filters.'
              : 'Check back soon — employers post roles daily.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function hasAnyFilter(f: PublicJobFilters): boolean {
  return !!(f.search || f.location || f.remoteType || f.employmentType || f.experienceLevel);
}
