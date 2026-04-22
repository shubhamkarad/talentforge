import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Lightbulb, MessageCircle, Sparkles, XCircle } from 'lucide-react';
import { EDGE_FUNCTIONS_BASE, SUPABASE_ANON_KEY, useJob } from '@forge/data-client';
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

export const Route = createFileRoute('/_app/interview/$jobId')({
  component: InterviewPrepPage,
});

interface PrepResult {
  job_summary: {
    title: string;
    company: string;
    key_focus_areas: string[];
  };
  interview_tips: Array<{ category: string; tips: string[] }>;
  common_questions: Array<{
    question: string;
    type: 'behavioral' | 'technical' | 'situational' | 'cultural';
    difficulty: 'easy' | 'medium' | 'hard';
    what_theyre_looking_for: string;
    sample_structure: string;
  }>;
  personalized_talking_points: Array<{
    strength: string;
    how_to_present: string;
    relevant_experience: string;
  }>;
  red_flags_to_avoid: string[];
  questions_to_ask: string[];
}

function InterviewPrepPage() {
  const { jobId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const job = useJob(jobId);
  const [prep, setPrep] = useState<PrepResult | null>(null);

  const generate = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${EDGE_FUNCTIONS_BASE}/interview-prep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          candidate_id: user.id,
          job_id: jobId,
          mode: 'prepare',
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `interview-prep failed (${res.status})`);
      }
      const { data } = (await res.json()) as { success: boolean; data: PrepResult };
      return data;
    },
    onSuccess: (data) => {
      setPrep(data);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Prep failed');
    },
  });

  // Auto-kick off generation on first mount.
  useEffect(() => {
    if (!prep && !generate.isPending && job.data) {
      generate.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.data]);

  if (job.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-4 h-96 w-full" />
      </div>
    );
  }

  if (!job.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h2 className="text-lg font-semibold">Job not found</h2>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/applications">Back to applications</Link>
        </Button>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const j = job.data as any;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader
        title="Interview prep"
        subtitle={
          <>
            <span className="text-foreground font-medium">{j.title}</span>
            {j.companies?.name ? (
              <>
                {' '}
                at <span className="text-foreground font-medium">{j.companies.name}</span>
              </>
            ) : null}
          </>
        }
        actions={
          prep ? (
            <Button
              variant="outline"
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
            >
              <Sparkles className="size-4" />
              {generate.isPending ? 'Regenerating…' : 'Regenerate'}
            </Button>
          ) : null
        }
      />

      {generate.isPending && !prep ? (
        <Card>
          <CardContent className="text-muted-foreground px-6 py-12 text-center text-sm">
            <Sparkles className="text-primary mx-auto size-6 animate-pulse" />
            <p className="mt-3">Tailoring prep materials for this role — a few seconds…</p>
          </CardContent>
        </Card>
      ) : prep ? (
        <div className="space-y-6">
          <FocusAreas data={prep.job_summary} />
          <InterviewTips data={prep.interview_tips} />
          <CommonQuestions data={prep.common_questions} />
          <TalkingPoints data={prep.personalized_talking_points} />
          <RedFlags data={prep.red_flags_to_avoid} />
          <QuestionsToAsk data={prep.questions_to_ask} />
        </div>
      ) : (
        <Card>
          <CardContent className="text-muted-foreground px-6 py-12 text-center text-sm">
            Couldn't generate prep. Try again:
            <Button onClick={() => generate.mutate()} className="ml-3">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function FocusAreas({ data }: { data: PrepResult['job_summary'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What they'll probe</CardTitle>
        <CardDescription>The areas most likely to come up in the loop.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-wrap gap-2">
          {data.key_focus_areas.map((a, i) => (
            <li key={i}>
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                {a}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function InterviewTips({ data }: { data: PrepResult['interview_tips'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tips</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {data.map((cat, i) => (
          <div key={i}>
            <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
              {cat.category}
            </div>
            <ul className="space-y-1.5 text-sm">
              {cat.tips.map((t, j) => (
                <li key={j} className="flex gap-2">
                  <span className="bg-primary mt-1 size-1.5 shrink-0 rounded-full" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const Q_TYPE_TONE: Record<string, string> = {
  behavioral: 'bg-sky-100 text-sky-900',
  technical: 'bg-violet-100 text-violet-900',
  situational: 'bg-emerald-100 text-emerald-900',
  cultural: 'bg-amber-100 text-amber-900',
};

const DIFFICULTY_TONE: Record<string, string> = {
  easy: 'bg-success/20 text-success-foreground',
  medium: 'bg-warning/20 text-warning-foreground',
  hard: 'bg-destructive/20 text-destructive-foreground',
};

function CommonQuestions({ data }: { data: PrepResult['common_questions'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="text-primary size-4" /> Questions to expect
        </CardTitle>
        <CardDescription>Mix of types and difficulties.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((q, i) => (
          <div key={i} className="border-border bg-card rounded-lg border p-4">
            <div className="mb-2 flex flex-wrap gap-1.5">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                  Q_TYPE_TONE[q.type] ?? 'bg-muted',
                )}
              >
                {q.type}
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                  DIFFICULTY_TONE[q.difficulty] ?? 'bg-muted',
                )}
              >
                {q.difficulty}
              </span>
            </div>
            <div className="text-sm font-semibold">{q.question}</div>
            <p className="text-muted-foreground mt-2 text-xs">
              <span className="font-medium">What they're after:</span> {q.what_theyre_looking_for}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              <span className="font-medium">Answer shape:</span> {q.sample_structure}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TalkingPoints({ data }: { data: PrepResult['personalized_talking_points'] }) {
  if (data.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-primary size-4" /> Your talking points
        </CardTitle>
        <CardDescription>Strengths from your profile — how to articulate each.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((tp, i) => (
          <div key={i} className="border-border bg-card rounded-lg border p-4">
            <div className="font-semibold">{tp.strength}</div>
            <p className="text-muted-foreground mt-1 text-sm">{tp.how_to_present}</p>
            <p className="text-muted-foreground mt-2 text-xs italic">
              Reference: {tp.relevant_experience}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RedFlags({ data }: { data: string[] }) {
  if (data.length === 0) return null;
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="text-destructive size-4" /> Don't
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5 text-sm">
          {data.map((r, i) => (
            <li key={i} className="flex gap-2">
              <AlertTriangle className="text-destructive mt-0.5 size-3.5 shrink-0" />
              <span className="text-muted-foreground">{r}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function QuestionsToAsk({ data }: { data: string[] }) {
  if (data.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions you should ask them</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2 text-sm">
          {data.map((q, i) => (
            <li key={i} className="flex gap-3">
              <span className="bg-primary/10 text-primary grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{q}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
