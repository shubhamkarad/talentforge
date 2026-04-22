import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createJobSchema, type CreateJobInput } from '@forge/shared';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Textarea,
} from '@forge/design-system';
import { JOB_FORM_DEFAULTS, arrayToLines, linesToArray } from './converters';
import { AiDraftPanel } from './ai-draft-panel';

export type JobFormMode = 'create' | 'edit';

export interface JobFormSubmit {
  values: CreateJobInput;
  intent: 'draft' | 'publish';
}

interface Props {
  mode: JobFormMode;
  initial?: Partial<CreateJobInput>;
  company?: { name?: string | null; industry?: string | null } | null;
  submitting?: boolean;
  onSubmit: (args: JobFormSubmit) => void | Promise<void>;
}

// One form component, reused by /jobs/new (create) and /jobs/$jobId (edit).
// Edit mode hides the AI-draft panel and the "Publish" action — edits only
// patch existing rows; state transitions happen from the jobs list.
export function JobForm({ mode, initial, company, submitting, onSubmit }: Props) {
  const defaults: CreateJobInput = { ...JOB_FORM_DEFAULTS, ...initial };

  const form = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: defaults,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  function applyDraft(draft: Partial<CreateJobInput>) {
    // react-hook-form gives us setValue per field; walk the draft keys.
    (Object.keys(draft) as Array<keyof CreateJobInput>).forEach((k) => {
      const v = draft[k];
      if (v === undefined) return;
      setValue(k, v as never, { shouldDirty: true, shouldValidate: false });
    });
  }

  async function submit(intent: 'draft' | 'publish') {
    await handleSubmit(async (values) => {
      await onSubmit({ values, intent });
    })();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit('draft');
      }}
      className="space-y-6"
    >
      {mode === 'create' ? (
        <AiDraftPanel
          companyName={company?.name ?? undefined}
          companyIndustry={company?.industry ?? undefined}
          onApply={applyDraft}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>Title, team, and a description candidates actually read.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Title" error={errors.title?.message}>
            <Input placeholder="e.g. Senior Backend Engineer" {...register('title')} />
          </Field>
          <Field label="Department" error={errors.department?.message}>
            <Input placeholder="Engineering" {...register('department')} />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <Textarea
              rows={8}
              placeholder="Who's this role for, what will they ship, and why now?"
              {...register('description')}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Experience level" error={errors.experienceLevel?.message}>
              <Select {...register('experienceLevel')}>
                <option value="">Not specified</option>
                <option value="entry">Entry</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="principal">Principal</option>
                <option value="executive">Executive</option>
              </Select>
            </Field>
            <Field label="Employment type" error={errors.employmentType?.message}>
              <Select {...register('employmentType')}>
                <option value="">Not specified</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </Select>
            </Field>
            <Field label="Remote" error={errors.remoteType?.message}>
              <Select {...register('remoteType')}>
                <option value="">Not specified</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </Select>
            </Field>
          </div>
          <Field label="Location" error={errors.location?.message}>
            <Input placeholder="e.g. Remote · EU time zones, or San Francisco, CA" {...register('location')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compensation</CardTitle>
          <CardDescription>Leave blank if you prefer to discuss.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Min salary" error={errors.salaryMin?.message}>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="120000"
                {...register('salaryMin', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Max salary" error={errors.salaryMax?.message}>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="180000"
                {...register('salaryMax', { valueAsNumber: true })}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Currency">
              <Input maxLength={3} {...register('salaryCurrency')} />
            </Field>
            <Field label="Period">
              <Select {...register('salaryPeriod')}>
                <option value="year">Per year</option>
                <option value="month">Per month</option>
                <option value="hour">Per hour</option>
              </Select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 rounded border-input" {...register('showSalary')} />
            Show salary on the public job posting
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements &amp; responsibilities</CardTitle>
          <CardDescription>One per line. Keep them specific.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextareaList
            label="Required skills"
            error={errors.skillsRequired?.message}
            defaultValue={arrayToLines(defaults.skillsRequired)}
            onChange={(v) =>
              setValue('skillsRequired', linesToArray(v), { shouldValidate: true, shouldDirty: true })
            }
          />
          <TextareaList
            label="Requirements"
            error={errors.requirements?.message}
            defaultValue={arrayToLines(defaults.requirements)}
            onChange={(v) => setValue('requirements', linesToArray(v), { shouldDirty: true })}
          />
          <TextareaList
            label="Responsibilities"
            error={errors.responsibilities?.message}
            defaultValue={arrayToLines(defaults.responsibilities)}
            onChange={(v) => setValue('responsibilities', linesToArray(v), { shouldDirty: true })}
          />
          <TextareaList
            label="Nice to have"
            error={errors.niceToHave?.message}
            defaultValue={arrayToLines(defaults.niceToHave)}
            onChange={(v) => setValue('niceToHave', linesToArray(v), { shouldDirty: true })}
          />
          <TextareaList
            label="Benefits"
            error={errors.benefits?.message}
            defaultValue={arrayToLines(defaults.benefits)}
            onChange={(v) => setValue('benefits', linesToArray(v), { shouldDirty: true })}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => submit('draft')} disabled={submitting}>
          {mode === 'edit' ? 'Save changes' : 'Save draft'}
        </Button>
        {mode === 'create' ? (
          <Button type="button" onClick={() => submit('publish')} disabled={submitting}>
            Publish
          </Button>
        ) : null}
      </div>
    </form>
  );
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
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function TextareaList({
  label,
  error,
  defaultValue,
  onChange,
}: {
  label: string;
  error?: string;
  defaultValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} error={error}>
      <Textarea
        rows={4}
        defaultValue={defaultValue}
        onBlur={(e) => onChange(e.target.value)}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}
