import { z } from 'zod';

const experienceLevel = z.enum([
  'entry', 'junior', 'mid', 'senior', 'lead', 'principal', 'executive',
]);
const employmentType = z.enum([
  'full-time', 'part-time', 'contract', 'internship', 'freelance',
]);
const remoteType = z.enum(['remote', 'hybrid', 'onsite']);
const salaryPeriod = z.enum(['hour', 'month', 'year']);
const jobStatus = z.enum(['draft', 'active', 'paused', 'closed', 'filled']);

// ------- job drafting + editing -------

export const createJobSchema = z
  .object({
    title: z.string().min(3, 'Title is too short').max(200),
    description: z
      .string()
      .min(100, 'Description should be at least 100 characters')
      .max(10_000),
    requirements:      z.array(z.string()).default([]),
    responsibilities:  z.array(z.string()).default([]),
    niceToHave:        z.array(z.string()).default([]),
    skillsRequired:    z.array(z.string()).min(1, 'Add at least one required skill'),
    experienceLevel:   experienceLevel.optional(),
    experienceYearsMin: z.number().int().min(0).optional(),
    experienceYearsMax: z.number().int().min(0).optional(),
    salaryMin:         z.number().int().positive().optional(),
    salaryMax:         z.number().int().positive().optional(),
    salaryCurrency:    z.string().default('USD'),
    salaryPeriod:      salaryPeriod.default('year'),
    showSalary:        z.boolean().default(true),
    location:          z.string().optional(),
    remoteType:        remoteType.optional(),
    employmentType:    employmentType.optional(),
    department:        z.string().optional(),
    benefits:          z.array(z.string()).default([]),
    applicationDeadline: z.string().datetime().optional(),
  })
  .refine(
    (d) => !d.salaryMin || !d.salaryMax || d.salaryMin <= d.salaryMax,
    { message: 'Minimum salary cannot exceed the maximum', path: ['salaryMin'] },
  )
  .refine(
    (d) =>
      !d.experienceYearsMin ||
      !d.experienceYearsMax ||
      d.experienceYearsMin <= d.experienceYearsMax,
    { message: 'Minimum years cannot exceed the maximum', path: ['experienceYearsMin'] },
  );

// Loose "update" variant: every field optional, status can also be set.
export const updateJobSchema = z
  .object({ status: jobStatus.optional() })
  .merge(z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(100).max(10_000).optional(),
    requirements: z.array(z.string()).optional(),
    responsibilities: z.array(z.string()).optional(),
    niceToHave: z.array(z.string()).optional(),
    skillsRequired: z.array(z.string()).optional(),
    experienceLevel: experienceLevel.optional(),
    experienceYearsMin: z.number().int().min(0).optional(),
    experienceYearsMax: z.number().int().min(0).optional(),
    salaryMin: z.number().int().positive().optional(),
    salaryMax: z.number().int().positive().optional(),
    salaryCurrency: z.string().optional(),
    salaryPeriod: salaryPeriod.optional(),
    showSalary: z.boolean().optional(),
    location: z.string().optional(),
    remoteType: remoteType.optional(),
    employmentType: employmentType.optional(),
    department: z.string().optional(),
    benefits: z.array(z.string()).optional(),
    applicationDeadline: z.string().datetime().optional(),
  }));

// ------- browsing -------

export const searchJobsSchema = z.object({
  query:          z.string().optional(),
  location:       z.string().optional(),
  remoteType:     z.array(remoteType).optional(),
  employmentType: z.array(employmentType).optional(),
  experienceLevel: z.array(experienceLevel).optional(),
  salaryMin:      z.number().optional(),
  salaryMax:      z.number().optional(),
  skills:         z.array(z.string()).optional(),
  page:           z.number().int().min(1).default(1),
  limit:          z.number().int().min(1).max(100).default(20),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type SearchJobsInput = z.infer<typeof searchJobsSchema>;
