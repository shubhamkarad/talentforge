// Map between the camelCase form state we use in React Hook Form + zod
// and the snake_case rows Supabase returns. Keeping all the field-name
// translation in one file so the form components stay free of naming noise.

import type { CreateJobInput } from '@forge/shared';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const JOB_FORM_DEFAULTS: CreateJobInput = {
  title: '',
  description: '',
  requirements: [],
  responsibilities: [],
  niceToHave: [],
  skillsRequired: [],
  benefits: [],
  salaryCurrency: 'USD',
  salaryPeriod: 'year',
  showSalary: true,
};

export function formToDbInsert(form: CreateJobInput, companyId: string, employerId: string) {
  return {
    employer_id: employerId,
    company_id: companyId,
    title: form.title,
    description: form.description,
    requirements: form.requirements ?? [],
    responsibilities: form.responsibilities ?? [],
    nice_to_have: form.niceToHave ?? [],
    skills_required: form.skillsRequired ?? [],
    benefits: form.benefits ?? [],
    experience_level: form.experienceLevel ?? null,
    experience_years_min: form.experienceYearsMin ?? null,
    experience_years_max: form.experienceYearsMax ?? null,
    salary_min: form.salaryMin ?? null,
    salary_max: form.salaryMax ?? null,
    salary_currency: form.salaryCurrency,
    salary_period: form.salaryPeriod,
    show_salary: form.showSalary,
    location: form.location ?? null,
    remote_type: form.remoteType ?? null,
    employment_type: form.employmentType ?? null,
    department: form.department ?? null,
    application_deadline: form.applicationDeadline ?? null,
  };
}

export function dbRowToForm(row: any): CreateJobInput {
  return {
    title: row.title ?? '',
    description: row.description ?? '',
    requirements: row.requirements ?? [],
    responsibilities: row.responsibilities ?? [],
    niceToHave: row.nice_to_have ?? [],
    skillsRequired: row.skills_required ?? [],
    benefits: row.benefits ?? [],
    experienceLevel: row.experience_level ?? undefined,
    experienceYearsMin: row.experience_years_min ?? undefined,
    experienceYearsMax: row.experience_years_max ?? undefined,
    salaryMin: row.salary_min ?? undefined,
    salaryMax: row.salary_max ?? undefined,
    salaryCurrency: row.salary_currency ?? 'USD',
    salaryPeriod: row.salary_period ?? 'year',
    showSalary: row.show_salary ?? true,
    location: row.location ?? undefined,
    remoteType: row.remote_type ?? undefined,
    employmentType: row.employment_type ?? undefined,
    department: row.department ?? undefined,
    applicationDeadline: row.application_deadline ?? undefined,
  };
}

// Textareas in the form hold one bullet per line. These helpers convert
// between the array shape the schema expects and the multi-line string the
// textarea renders.
export function linesToArray(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function arrayToLines(arr: string[] | undefined): string {
  return (arr ?? []).join('\n');
}
