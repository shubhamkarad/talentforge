import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import {
  useCandidateProfile,
  useUpdateCandidateProfile,
  useUpdateProfile,
} from '@forge/data-client';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Textarea,
  toast,
} from '@forge/design-system';
import { PageHeader } from '~/components/app-shell';
import { ResumeUpload, type ExtractedProfile } from '~/features/profile/resume-upload';

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
});

// The profile editor is intentionally flat-form-heavy — most people will land
// here right after resume upload, so making sure every extracted field has a
// review field is more important than fancy per-row editors.

interface ProfileForm {
  fullName: string;
  phone: string;
  headline: string;
  bio: string;
  skills: string; // one per line
  experienceJson: string; // JSON array edited as text
  educationJson: string; // JSON array edited as text
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  preferredLocations: string; // comma-separated
  salaryMin: string;
  salaryMax: string;
  noticeDays: string;
  openToWork: boolean;
  openToRemote: boolean;
}

const EMPTY_FORM: ProfileForm = {
  fullName: '',
  phone: '',
  headline: '',
  bio: '',
  skills: '',
  experienceJson: '[]',
  educationJson: '[]',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  preferredLocations: '',
  salaryMin: '',
  salaryMax: '',
  noticeDays: '',
  openToWork: true,
  openToRemote: true,
};

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const profile = useCandidateProfile(user.id);
  const updateAccount = useUpdateProfile();
  const updateCandidate = useUpdateCandidateProfile();

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});

  // Seed the form once the row loads.
  useEffect(() => {
    if (!profile.data) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = profile.data as any;
    const account = row.profiles ?? {};
    setForm({
      fullName: account.full_name ?? '',
      phone: account.phone ?? '',
      headline: row.headline ?? '',
      bio: row.bio ?? '',
      skills: Array.isArray(row.skills)
        ? row.skills
            .map((s: unknown) =>
              typeof s === 'string' ? s : ((s as { name?: string })?.name ?? ''),
            )
            .filter(Boolean)
            .join('\n')
        : '',
      experienceJson: JSON.stringify(row.experience ?? [], null, 2),
      educationJson: JSON.stringify(row.education ?? [], null, 2),
      linkedinUrl: row.linkedin_url ?? '',
      githubUrl: row.github_url ?? '',
      portfolioUrl: row.portfolio_url ?? '',
      preferredLocations: (row.preferred_locations ?? []).join(', '),
      salaryMin: row.salary_expectation_min?.toString() ?? '',
      salaryMax: row.salary_expectation_max?.toString() ?? '',
      noticeDays: row.notice_period_days?.toString() ?? '',
      openToWork: row.open_to_work ?? true,
      openToRemote: row.open_to_remote ?? true,
    });
  }, [profile.data]);

  function applyExtracted(ex: ExtractedProfile) {
    setForm((prev) => ({
      ...prev,
      headline: ex.headline ?? prev.headline,
      bio: ex.bio ?? prev.bio,
      skills: ex.skills?.length ? ex.skills.join('\n') : prev.skills,
      experienceJson: ex.experience?.length
        ? JSON.stringify(ex.experience, null, 2)
        : prev.experienceJson,
      educationJson: ex.education?.length
        ? JSON.stringify(ex.education, null, 2)
        : prev.educationJson,
      linkedinUrl: ex.linkedin_url ?? prev.linkedinUrl,
      githubUrl: ex.github_url ?? prev.githubUrl,
      portfolioUrl: ex.portfolio_url ?? prev.portfolioUrl,
    }));
  }

  function validate(): {
    experience: unknown[];
    education: unknown[];
    fieldErrors: Partial<Record<keyof ProfileForm, string>>;
  } {
    const fieldErrors: Partial<Record<keyof ProfileForm, string>> = {};

    // Required.
    if (!form.fullName.trim()) fieldErrors.fullName = 'Full name is required.';

    // JSON fields must parse as arrays.
    let experience: unknown[] = [];
    let education: unknown[] = [];
    try {
      const parsed = JSON.parse(form.experienceJson || '[]');
      if (!Array.isArray(parsed)) throw new Error('must be a JSON array');
      experience = parsed;
    } catch (err) {
      fieldErrors.experienceJson = 'Invalid JSON: ' + (err as Error).message;
    }
    try {
      const parsed = JSON.parse(form.educationJson || '[]');
      if (!Array.isArray(parsed)) throw new Error('must be a JSON array');
      education = parsed;
    } catch (err) {
      fieldErrors.educationJson = 'Invalid JSON: ' + (err as Error).message;
    }

    // Optional URLs — validated only if non-empty.
    const urlField = (value: string) => {
      if (!value) return undefined;
      try {
        const u = new URL(value);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error();
        return undefined;
      } catch {
        return 'Must be a valid http(s) URL.';
      }
    };
    const linkErr = urlField(form.linkedinUrl);
    if (linkErr) fieldErrors.linkedinUrl = linkErr;
    const ghErr = urlField(form.githubUrl);
    if (ghErr) fieldErrors.githubUrl = ghErr;
    const pfErr = urlField(form.portfolioUrl);
    if (pfErr) fieldErrors.portfolioUrl = pfErr;

    // Numeric fields.
    const numField = (value: string, label: string) => {
      if (!value) return undefined;
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0) return `${label} must be a non-negative number.`;
      return undefined;
    };
    const sMin = numField(form.salaryMin, 'Min salary');
    if (sMin) fieldErrors.salaryMin = sMin;
    const sMax = numField(form.salaryMax, 'Max salary');
    if (sMax) fieldErrors.salaryMax = sMax;
    const nd = numField(form.noticeDays, 'Notice period');
    if (nd) fieldErrors.noticeDays = nd;

    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) {
      fieldErrors.salaryMax = 'Max salary must be ≥ min salary.';
    }

    return { experience, education, fieldErrors };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const { experience, education, fieldErrors } = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    const skills = form.skills
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    try {
      await Promise.all([
        updateAccount.mutateAsync({
          userId: user.id,
          patch: {
            full_name: form.fullName || undefined,
            phone: form.phone || undefined,
          },
        }),
        updateCandidate.mutateAsync({
          userId: user.id,
          patch: {
            headline: form.headline || null,
            bio: form.bio || null,
            skills,
            experience,
            education,
            linkedin_url: form.linkedinUrl || null,
            github_url: form.githubUrl || null,
            portfolio_url: form.portfolioUrl || null,
            preferred_locations: form.preferredLocations
              ? form.preferredLocations
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
            salary_expectation_min: form.salaryMin ? Number(form.salaryMin) : null,
            salary_expectation_max: form.salaryMax ? Number(form.salaryMax) : null,
            notice_period_days: form.noticeDays ? Number(form.noticeDays) : null,
            open_to_work: form.openToWork,
            open_to_remote: form.openToRemote,
          },
        }),
      ]);
      toast.success('Profile saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  }

  const saving = updateAccount.isPending || updateCandidate.isPending;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        title="Your profile"
        subtitle="Match scores and career forecast are only as accurate as this page."
        actions={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="size-4" /> {saving ? 'Saving…' : 'Save'}
          </Button>
        }
      />

      {profile.isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <ResumeUpload onExtracted={applyExtracted} />

          <Card>
            <CardHeader>
              <CardTitle>About you</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Full name" error={errors.fullName}>
                <Input
                  value={form.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
              </Field>
              <Field label="Headline">
                <Input
                  placeholder="Senior full-stack engineer, infra focus"
                  value={form.headline}
                  onChange={(e) => setField('headline', e.target.value)}
                />
              </Field>
              <Field label="Bio">
                <Textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setField('bio', e.target.value)}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>One per line.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={6}
                placeholder={`TypeScript\nReact\nPostgres\nDocker`}
                value={form.skills}
                onChange={(e) => setField('skills', e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experience &amp; education</CardTitle>
              <CardDescription>
                Edited as JSON for now. The resume-upload flow populates these for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Experience (JSON)" error={errors.experienceJson}>
                <Textarea
                  rows={8}
                  value={form.experienceJson}
                  onChange={(e) => setField('experienceJson', e.target.value)}
                  className="font-mono text-xs"
                />
              </Field>
              <Field label="Education (JSON)" error={errors.educationJson}>
                <Textarea
                  rows={6}
                  value={form.educationJson}
                  onChange={(e) => setField('educationJson', e.target.value)}
                  className="font-mono text-xs"
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="LinkedIn" error={errors.linkedinUrl}>
                <Input
                  placeholder="https://linkedin.com/in/..."
                  value={form.linkedinUrl}
                  onChange={(e) => setField('linkedinUrl', e.target.value)}
                />
              </Field>
              <Field label="GitHub" error={errors.githubUrl}>
                <Input
                  placeholder="https://github.com/..."
                  value={form.githubUrl}
                  onChange={(e) => setField('githubUrl', e.target.value)}
                />
              </Field>
              <Field label="Portfolio" error={errors.portfolioUrl}>
                <Input
                  placeholder="https://..."
                  value={form.portfolioUrl}
                  onChange={(e) => setField('portfolioUrl', e.target.value)}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Preferred locations (comma-separated)">
                <Input
                  placeholder="Remote, Berlin, London"
                  value={form.preferredLocations}
                  onChange={(e) => setField('preferredLocations', e.target.value)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Salary expectation — min" error={errors.salaryMin}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={form.salaryMin}
                    onChange={(e) => setField('salaryMin', e.target.value)}
                  />
                </Field>
                <Field label="Salary expectation — max" error={errors.salaryMax}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={form.salaryMax}
                    onChange={(e) => setField('salaryMax', e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Notice period (days)" error={errors.noticeDays}>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.noticeDays}
                  onChange={(e) => setField('noticeDays', e.target.value)}
                />
              </Field>
              <div className="flex flex-col gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="border-input size-4 rounded"
                    checked={form.openToWork}
                    onChange={(e) => setField('openToWork', e.target.checked)}
                  />
                  Open to work
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="border-input size-4 rounded"
                    checked={form.openToRemote}
                    onChange={(e) => setField('openToRemote', e.target.checked)}
                  />
                  Open to remote
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="size-4" /> {saving ? 'Saving…' : 'Save profile'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  function setField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear any error for this field as the user types.
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
