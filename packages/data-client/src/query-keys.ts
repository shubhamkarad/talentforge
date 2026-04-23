// Centralized TanStack Query key factory. Improves over the demo's string-keyed
// approach by keeping all keys in one typed place — easier to grep, refactor,
// and invalidate related sets (e.g. `qk.jobs.all` clears every `jobs.*` query).

export const qk = {
  auth: ['auth'] as const,

  jobs: {
    all: ['jobs'] as const,
    byId: (id: string) => ['jobs', id] as const,
    byEmployer: (employerId: string) => ['jobs', 'employer', employerId] as const,
    publicList: (filters?: unknown) => ['jobs', 'public', filters] as const,
  },

  applications: {
    all: ['applications'] as const,
    byId: (id: string) => ['applications', id] as const,
    byEmployer: (employerId: string) => ['applications', 'employer', employerId] as const,
    byCandidate: (candidateId: string) => ['applications', 'candidate', candidateId] as const,
    exists: (candidateId: string, jobId: string) =>
      ['applications', 'exists', candidateId, jobId] as const,
  },

  profile: {
    candidate: (userId: string) => ['profile', 'candidate', userId] as const,
  },

  company: {
    byOwner: (ownerId: string) => ['company', 'owner', ownerId] as const,
  },

  matchScores: {
    all: (candidateId: string) => ['match-scores', candidateId] as const,
    one: (candidateId: string, jobId: string) => ['match-scores', candidateId, jobId] as const,
  },

  career: {
    forecast: (candidateId: string) => ['career', candidateId] as const,
  },

  notifications: {
    list: (userId: string) => ['notifications', userId] as const,
    unread: (userId: string) => ['notifications', userId, 'unread'] as const,
  },

  savedJobs: {
    list: (candidateId: string) => ['saved-jobs', candidateId] as const,
    has: (candidateId: string, jobId: string) => ['saved-jobs', candidateId, jobId] as const,
  },
} as const;
