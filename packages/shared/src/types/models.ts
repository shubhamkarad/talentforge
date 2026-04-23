// Domain models — camelCase mirror of the Postgres schema (snake_case in the DB).
// Auto-generated DB types live in `@forge/data-client`; this file is the
// hand-authored "business object" shape consumed by UI and validation layers.

import type {
  ApplicationStatus,
  CompanySize,
  EmploymentType,
  ExperienceLevel,
  JobStatus,
  NotificationType,
  RemoteType,
  SalaryPeriod,
  SkillLevel,
  UserRole,
} from './enums';

// ----- identity -----

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  role: UserRole;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  name: string;
  level?: SkillLevel;
  years?: number;
}

export interface Experience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  gpa?: number;
}

export interface CandidateProfile {
  id: string;
  headline: string | null;
  bio: string | null;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  certifications: string[];
  languages: string[];
  experienceYears: number | null;
  resumeUrl: string | null;
  resumeText: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  preferredLocations: string[];
  preferredJobTypes: EmploymentType[];
  salaryExpectationMin: number | null;
  salaryExpectationMax: number | null;
  salaryCurrency: string;
  noticePeriodDays: number | null;
  openToWork: boolean;
  openToRemote: boolean;
  profileCompleteness: number;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

// ----- company + jobs -----

export interface Company {
  id: string;
  ownerId: string;
  name: string;
  slug: string | null;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  industry: string | null;
  size: CompanySize | null;
  foundedYear: number | null;
  headquarters: string | null;
  cultureDescription: string | null;
  benefits: string[];
  socialLinks: SocialLinks;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  [key: string]: string | undefined;
}

export interface Job {
  id: string;
  companyId: string;
  employerId: string;
  title: string;
  slug: string | null;
  description: string;
  requirements: string[];
  responsibilities: string[];
  niceToHave: string[];
  skillsRequired: string[];
  experienceLevel: ExperienceLevel | null;
  experienceYearsMin: number | null;
  experienceYearsMax: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod;
  showSalary: boolean;
  location: string | null;
  remoteType: RemoteType | null;
  employmentType: EmploymentType | null;
  department: string | null;
  benefits: string[];
  applicationDeadline: string | null;
  status: JobStatus;
  publishedAt: string | null;
  expiresAt: string | null;
  viewsCount: number;
  applicationsCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  // hydrated relations (optional, populated by join)
  company?: Company;
}

// ----- applications + AI -----

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeUrl: string | null;
  portfolioUrl: string | null;
  answers: Record<string, string>;
  source: string;
  referralCode: string | null;
  employerNotes: string | null;
  rejectionReason: string | null;
  appliedAt: string;
  reviewedAt: string | null;
  shortlistedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // hydrated relations
  job?: Job;
  candidate?: Profile;
  matchScore?: MatchScore;
}

// A single strength or concern bullet produced by the score-fit edge function.
export interface MatchInsight {
  title: string;
  explanation: string;
}

export interface MatchScore {
  id: string;
  candidateId: string;
  jobId: string;
  overallScore: number;
  skillsScore: number | null;
  experienceScore: number | null;
  summary: string | null;
  strengths: MatchInsight[];
  concerns: MatchInsight[];
  modelUsed: string;
  calculatedAt: string;
  createdAt: string;
}

// Full career-forecast JSON returned by the career-forecast edge function and
// cached verbatim in career_predictions.prediction.
export interface CareerForecast {
  current_assessment: {
    level: string;
    strengths: string[];
    areas_for_growth: string[];
  };
  predictions: Array<{
    timeframe: '1_year' | '3_year' | '5_year';
    likely_role: string;
    probability: number;
    salary_range: { min: number; max: number };
    key_requirements: string[];
  }>;
  alternative_paths: Array<{
    role: string;
    description: string;
    fit_score: number;
  }>;
  skills_to_develop: Array<{
    skill: string;
    importance: 'high' | 'medium' | 'low';
    resources: string[];
  }>;
  recommended_actions: string[];
}

export interface CareerPrediction {
  id: string;
  candidateId: string;
  prediction: CareerForecast;
  modelUsed: string;
  calculatedAt: string;
  createdAt: string;
}

// ----- engagement -----

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  read: boolean;
  readAt: string | null;
  actionUrl: string | null;
  createdAt: string;
}

export interface SavedJob {
  id: string;
  candidateId: string;
  jobId: string;
  notes: string | null;
  createdAt: string;
}
