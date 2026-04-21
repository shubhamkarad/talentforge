import { z } from 'zod';

const skillLevel = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
const employmentType = z.enum([
  'full-time', 'part-time', 'contract', 'internship', 'freelance',
]);
const companySize = z.enum([
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+',
]);

export const skillSchema = z.object({
  name:  z.string().min(1, 'Skill name is required'),
  level: skillLevel.optional(),
  years: z.number().int().min(0).optional(),
});

export const experienceSchema = z.object({
  company:     z.string().min(1),
  title:       z.string().min(1),
  location:    z.string().optional(),
  startDate:   z.string(),
  endDate:     z.string().nullable(),
  current:     z.boolean().default(false),
  description: z.string().optional(),
});

export const educationSchema = z.object({
  institution:  z.string().min(1),
  degree:       z.string().min(1),
  fieldOfStudy: z.string().optional(),
  startDate:    z.string(),
  endDate:      z.string().nullable(),
  current:      z.boolean().default(false),
  gpa:          z.number().min(0).max(4).optional(),
});

// Applies to any profile regardless of role.
export const updateProfileSchema = z.object({
  fullName:  z.string().min(2).max(100).optional(),
  phone:     z.string().max(20).optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateCandidateProfileSchema = z.object({
  headline:              z.string().max(200).optional(),
  bio:                   z.string().max(2_000).optional(),
  skills:                z.array(skillSchema).optional(),
  experience:            z.array(experienceSchema).optional(),
  education:             z.array(educationSchema).optional(),
  experienceYears:       z.number().int().min(0).optional(),
  linkedinUrl:           z.string().url().optional().or(z.literal('')),
  githubUrl:             z.string().url().optional().or(z.literal('')),
  portfolioUrl:          z.string().url().optional().or(z.literal('')),
  preferredLocations:    z.array(z.string()).optional(),
  preferredJobTypes:     z.array(employmentType).optional(),
  salaryExpectationMin:  z.number().int().positive().optional(),
  salaryExpectationMax:  z.number().int().positive().optional(),
  salaryCurrency:        z.string().optional(),
  noticePeriodDays:      z.number().int().min(0).optional(),
  openToWork:            z.boolean().optional(),
  openToRemote:          z.boolean().optional(),
});

export const updateCompanySchema = z.object({
  name:                z.string().min(2).max(200),
  description:         z.string().max(5_000).optional(),
  website:             z.string().url().optional().or(z.literal('')),
  logoUrl:             z.string().url().optional().or(z.literal('')),
  industry:            z.string().optional(),
  size:                companySize.optional(),
  foundedYear:         z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  headquarters:        z.string().optional(),
  cultureDescription:  z.string().max(2_000).optional(),
  benefits:            z.array(z.string()).optional(),
  socialLinks: z
    .object({
      linkedin: z.string().url().optional().or(z.literal('')),
      twitter:  z.string().url().optional().or(z.literal('')),
      facebook: z.string().url().optional().or(z.literal('')),
    })
    .optional(),
});

export type SkillInput = z.infer<typeof skillSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateCandidateProfileInput = z.infer<typeof updateCandidateProfileSchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
