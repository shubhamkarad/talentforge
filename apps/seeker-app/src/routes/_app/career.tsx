import { createFileRoute } from '@tanstack/react-router';
import {
  BookOpen,
  Compass,
  Download,
  RefreshCw,
  Route as RouteIcon,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { CareerForecast } from '@forge/shared';
import { formatCurrency, formatRelativeTime } from '@forge/shared';
import { useCareerForecast, useGenerateCareerForecast } from '@forge/data-client';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  cn,
  toast,
} from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';

export const Route = createFileRoute('/_app/career')({
  component: CareerPage,
});

function CareerPage() {
  const { user } = Route.useRouteContext();
  const forecast = useCareerForecast(user.id);
  const generate = useGenerateCareerForecast();

  async function handleGenerate(refresh = false) {
    try {
      await generate.mutateAsync({ candidateId: user.id, refresh });
      toast.success(refresh ? 'Forecast refreshed.' : 'Forecast generated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prediction = (forecast.data?.prediction ?? null) as CareerForecast | null;
  const calculatedAt = forecast.data?.calculated_at;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Your career map"
        subtitle="1-, 3-, and 5-year projections grounded in your actual profile."
        actions={
          prediction ? (
            <Button
              variant="outline"
              onClick={() => handleGenerate(true)}
              disabled={generate.isPending}
            >
              <RefreshCw className={cn('size-4', generate.isPending && 'animate-spin')} />
              {generate.isPending ? 'Refreshing…' : 'Refresh'}
            </Button>
          ) : null
        }
      />

      {forecast.isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : prediction ? (
        <ForecastView prediction={prediction} calculatedAt={calculatedAt} />
      ) : (
        <EmptyState generating={generate.isPending} onGenerate={() => handleGenerate(false)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state — no cached forecast yet
// ---------------------------------------------------------------------------

function EmptyState({ generating, onGenerate }: { generating: boolean; onGenerate: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="bg-primary/10 text-primary grid size-12 place-items-center rounded-full">
          <Compass className="size-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">No forecast yet</h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
            Hit generate — we'll read your profile, project the next five years, and call out the
            skills that would unlock the next level. Takes about ten seconds.
          </p>
        </div>
        <Button onClick={onGenerate} disabled={generating}>
          <Sparkles className="size-4" />
          {generating ? 'Generating…' : 'Generate my forecast'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Forecast view
// ---------------------------------------------------------------------------

// LLM output occasionally drops a field or renames one. Normalise once here so
// every child component can render without its own defensive checks.
function normalizeForecast(raw: CareerForecast): CareerForecast {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  return {
    current_assessment: {
      level: r.current_assessment?.level ?? 'Based on your profile',
      strengths: Array.isArray(r.current_assessment?.strengths)
        ? r.current_assessment.strengths
        : [],
      areas_for_growth: Array.isArray(r.current_assessment?.areas_for_growth)
        ? r.current_assessment.areas_for_growth
        : [],
    },
    predictions: Array.isArray(r.predictions) ? r.predictions : [],
    alternative_paths: Array.isArray(r.alternative_paths) ? r.alternative_paths : [],
    skills_to_develop: Array.isArray(r.skills_to_develop) ? r.skills_to_develop : [],
    recommended_actions: Array.isArray(r.recommended_actions) ? r.recommended_actions : [],
  };
}

function ForecastView({
  prediction,
  calculatedAt,
}: {
  prediction: CareerForecast;
  calculatedAt?: string;
}) {
  const safe = normalizeForecast(prediction);
  return (
    <div className="space-y-6">
      {calculatedAt ? (
        <p className="text-muted-foreground text-xs">
          Last generated {formatRelativeTime(calculatedAt)}
        </p>
      ) : null}

      <CurrentAssessment data={safe.current_assessment} />
      <Predictions data={safe.predictions} />
      <AlternativePaths data={safe.alternative_paths} />
      <SkillsToDevelop data={safe.skills_to_develop} />
      <RecommendedActions data={safe.recommended_actions} />
    </div>
  );
}

function CurrentAssessment({ data }: { data: CareerForecast['current_assessment'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Where you stand today</CardTitle>
        <CardDescription>{data.level}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="text-success-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Strengths
          </div>
          <ul className="space-y-1.5 text-sm">
            {data.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="bg-success mt-1 size-1.5 shrink-0 rounded-full" />
                <span className="text-muted-foreground">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-warning-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Areas for growth
          </div>
          <ul className="space-y-1.5 text-sm">
            {data.areas_for_growth.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="bg-warning mt-1 size-1.5 shrink-0 rounded-full" />
                <span className="text-muted-foreground">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function Predictions({ data }: { data: CareerForecast['predictions'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="text-primary size-4" /> Trajectory
        </CardTitle>
        <CardDescription>Projected roles at 1, 3, and 5 years.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {data.map((p, idx) => {
          const label = (p.timeframe ?? `slot_${idx}`).replace('_', ' ');
          const salaryMin = p.salary_range?.min;
          const salaryMax = p.salary_range?.max;
          const requirements = Array.isArray(p.key_requirements) ? p.key_requirements : [];
          return (
            <div key={p.timeframe ?? idx} className="border-border bg-card rounded-lg border p-4">
              <Badge variant="secondary" className="font-mono">
                {label}
              </Badge>
              <div className="mt-3 text-lg font-semibold">{p.likely_role ?? '—'}</div>
              <div className="text-muted-foreground mt-1 text-xs">
                {typeof p.probability === 'number' ? `${p.probability}% probability` : '—'}
              </div>
              {typeof salaryMin === 'number' && typeof salaryMax === 'number' ? (
                <div className="text-primary mt-3 text-sm font-medium tabular-nums">
                  {formatCurrency(salaryMin)} – {formatCurrency(salaryMax)}
                </div>
              ) : null}
              <ul className="text-muted-foreground mt-3 space-y-1 text-xs">
                {requirements.map((r, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span>•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function AlternativePaths({ data }: { data: CareerForecast['alternative_paths'] }) {
  if (data.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RouteIcon className="text-primary size-4" /> Alternative paths
        </CardTitle>
        <CardDescription>Adjacent trajectories worth considering.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((p, i) => (
          <div key={i} className="border-border bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{p.role}</span>
              <Badge variant="secondary">{p.fit_score}%</Badge>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">{p.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SkillsToDevelop({ data }: { data: CareerForecast['skills_to_develop'] }) {
  if (data.length === 0) return null;
  const toneFor = (imp: 'high' | 'medium' | 'low') =>
    imp === 'high'
      ? 'border-destructive/30 bg-destructive/5'
      : imp === 'medium'
        ? 'border-warning/30 bg-warning/5'
        : 'border-border bg-card';
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="text-primary size-4" /> Skills to develop
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((s, i) => {
          const resources = Array.isArray(s.resources) ? s.resources : [];
          return (
            <div key={i} className={cn('rounded-lg border p-4', toneFor(s.importance))}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{s.skill ?? '—'}</span>
                {s.importance ? (
                  <Badge variant="outline" className="uppercase">
                    {s.importance}
                  </Badge>
                ) : null}
              </div>
              {resources.length > 0 ? (
                <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                  {resources.map((r, j) => (
                    <li key={j} className="flex gap-1.5">
                      <span>•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function RecommendedActions({ data }: { data: CareerForecast['recommended_actions'] }) {
  if (data.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="text-primary size-4" /> What to do this quarter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {data.map((a, i) => (
            <li key={i} className="flex gap-3">
              <span className="bg-primary/10 text-primary grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold">
                {i + 1}
              </span>
              <span className="text-muted-foreground text-sm">{a}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
