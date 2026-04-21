// App-wide constants. Avoid re-exporting enum *values* — those live in Postgres
// enum types and are best consumed as string literals via the types module.

export const APP_NAME = 'Talentforge';

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  jobs: '/jobs',
  newJob: '/jobs/new',
  applications: '/applications',
  messages: '/messages',
  saved: '/saved',
  profile: '/profile',
  career: '/career',
  settings: '/settings',
} as const;

export const STORAGE_BUCKETS = {
  resumes: 'resumes',
  companyLogos: 'company-logos',
  jobAttachments: 'job-attachments',
} as const;

// Match-score bands used for color-coding and labels in the UI.
// Values are the lower bound (inclusive) of each band.
export const MATCH_SCORE_BANDS = {
  excellent: 85,
  good: 70,
  fair: 50,
} as const;

export const JOB_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  closed: 'Closed',
  filled: 'Filled',
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  reviewing: 'Under review',
  shortlisted: 'Shortlisted',
  interviewing: 'Interview stage',
  offer: 'Offer extended',
  hired: 'Hired',
  rejected: 'Not selected',
  withdrawn: 'Withdrawn',
};

export const REMOTE_TYPE_LABELS: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
};

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
};

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  entry: 'Entry level',
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  lead: 'Lead',
  principal: 'Principal',
  executive: 'Executive',
};
