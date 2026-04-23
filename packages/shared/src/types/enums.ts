// Domain enums — values mirror the Postgres enum types defined in migration 0001.
// Keeping them as string unions rather than TS `enum` so they're tree-shakeable
// and erase at compile time.

export type UserRole = 'employer' | 'candidate' | 'admin';

export type JobStatus = 'draft' | 'active' | 'paused' | 'closed' | 'filled';

export type ApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'shortlisted'
  | 'interviewing'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export type ExperienceLevel =
  | 'entry'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'principal'
  | 'executive';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';

export type RemoteType = 'remote' | 'hybrid' | 'onsite';

export type SalaryPeriod = 'hour' | 'month' | 'year';

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type NotificationType =
  | 'application_received'
  | 'application_status_changed'
  | 'interview_scheduled'
  | 'job_match'
  | 'profile_view'
  | 'system';
