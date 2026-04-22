import { useRef, useState } from 'react';
import { FileUp, Sparkles } from 'lucide-react';
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

export interface ExtractedProfile {
  headline?: string;
  bio?: string;
  skills?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  experience?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  education?: any[];
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
}

interface Props {
  onExtracted: (profile: ExtractedProfile) => void;
}

// Drop-in card that uploads a PDF to the extract-profile edge function and
// hands the parsed JSON back via onExtracted. Parent decides what to do with
// the data (usually: merge into form state, let user tweak before saving).
export function ResumeUpload({ onExtracted }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${EDGE_FUNCTIONS_BASE}/extract-profile`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `extract-profile failed (${res.status})`);
      }
      const { profile } = (await res.json()) as { success: boolean; profile: ExtractedProfile };
      onExtracted(profile);
      toast.success('Resume parsed. Review the fields and save.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not parse resume');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary size-4" /> Autofill from your resume
        </CardTitle>
        <CardDescription>
          PDF or text. We extract skills, experience, education, and links automatically — you can
          edit everything after.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,text/plain,.txt,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <Button onClick={() => inputRef.current?.click()} disabled={busy}>
          <FileUp className="size-4" />
          {busy ? 'Parsing…' : 'Upload resume'}
        </Button>
      </CardContent>
    </Card>
  );
}
