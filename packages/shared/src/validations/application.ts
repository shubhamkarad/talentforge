import { z } from 'zod';

const applicationStatus = z.enum([
  'pending',
  'reviewing',
  'shortlisted',
  'interviewing',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
]);

export const createApplicationSchema = z.object({
  jobId:         z.string().uuid(),
  coverLetter:   z.string().max(5_000).optional(),
  resumeUrl:     z.string().url().optional(),
  portfolioUrl:  z.string().url().optional(),
  answers:       z.record(z.string(), z.string()).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status:            applicationStatus,
  employerNotes:     z.string().max(2_000).optional(),
  rejectionReason:   z.string().max(500).optional(),
});

export const withdrawApplicationSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type WithdrawApplicationInput = z.infer<typeof withdrawApplicationSchema>;
