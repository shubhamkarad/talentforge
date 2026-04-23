import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { EDGE_FUNCTIONS_BASE, SUPABASE_ANON_KEY } from '@forge/data-client';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
} from '@forge/design-system';

interface Props {
  candidateId: string;
  jobId: string;
  onGenerated: (letter: string) => void;
  disabled?: boolean;
}

// Candidate-side analogue of the recruiter's draft-with-AI panel. Calls the
// `draft-cover-letter` edge function and hands the result back to the parent
// so it can fill the cover-letter textarea. Allows regeneration — each click
// produces a fresh draft at a higher temperature.
export function CoverLetterAssistant({ candidateId, jobId, onGenerated, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_BASE}/draft-cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ candidate_id: candidateId, job_id: jobId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `draft-cover-letter failed (${res.status})`);
      }
      const { coverLetter } = (await res.json()) as { success: boolean; coverLetter: string };
      onGenerated(coverLetter);
      setHasGenerated(true);
      toast.success('Cover letter drafted. Tweak anything before you submit.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not draft cover letter');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="text-primary size-4" /> Cover letter, written for you
        </CardTitle>
        <CardDescription>
          We pull your profile + the job description and compose a personalized draft. Edit
          everything before you submit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant={hasGenerated ? 'outline' : 'default'}
          onClick={handleGenerate}
          disabled={loading || disabled}
          size="sm"
        >
          <Sparkles className="size-4" />
          {loading
            ? hasGenerated
              ? 'Regenerating…'
              : 'Drafting…'
            : hasGenerated
              ? 'Regenerate'
              : 'Generate with AI'}
        </Button>
      </CardContent>
    </Card>
  );
}
