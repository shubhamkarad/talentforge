import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { CreateJobInput } from '@forge/shared';
import { EDGE_FUNCTIONS_BASE, SUPABASE_ANON_KEY } from '@forge/data-client';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Textarea,
  toast,
} from '@forge/design-system';

interface Props {
  companyName?: string;
  companyIndustry?: string;
  onApply: (draft: Partial<CreateJobInput>) => void;
}

// Wraps the `draft-job` edge function behind a textarea + button. When the
// function returns, we map its camelCase output onto the form's field names
// (they already match, so this is mostly a straight pass-through).
export function AiDraftPanel({ companyName, companyIndustry, onApply }: Props) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleDraft() {
    if (prompt.trim().length < 5) {
      toast.error('Describe the role in at least a sentence.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_BASE}/draft-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          companyName,
          companyIndustry,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `draft-job failed (${res.status})`);
      }
      const { draft } = (await res.json()) as { success: boolean; draft: Partial<CreateJobInput> };
      onApply(draft);
      toast.success('Draft applied. Review and publish when you\'re ready.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Draft failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" /> Draft with AI
        </CardTitle>
        <CardDescription>
          Write one sentence about the role. Cerebras fills in the rest — you
          can edit every field afterwards.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          rows={3}
          placeholder="e.g. Senior backend engineer to own our payments service. Ruby/Rails, remote, ~$180k."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={handleDraft} disabled={loading}>
            <Sparkles className="size-4" />
            {loading ? 'Drafting…' : 'Generate draft'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
