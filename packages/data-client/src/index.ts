// Client + shared keys
export { supabase, createBrowserClient, EDGE_FUNCTIONS_BASE, SUPABASE_ANON_KEY } from './client';
export { qk } from './query-keys';
export type { Database, Json } from './types/database';

// Hooks
export { useAuth, useUser, useSession } from './hooks/useAuth';
export { useRealtime } from './hooks/useRealtime';
export {
  useEmployerJobs,
  useJob,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  usePublicJobs,
  useTrackJobView,
  type PublicJobFilters,
} from './hooks/useJobs';
export { useCompany, useCreateCompany, useUpdateCompany } from './hooks/useCompany';
export {
  useEmployerApplications,
  useApplication,
  useCandidateApplications,
  useHasApplied,
  useCreateApplication,
  useUpdateApplication,
} from './hooks/useApplications';
export {
  useCandidateProfile,
  useCreateCandidateProfile,
  useProfile,
  useUpdateCandidateProfile,
  useUpdateProfile,
} from './hooks/useCandidateProfile';
export {
  useMatchScores,
  useMatchScore,
  useCalculateMatch,
  type MatchScoreRow,
} from './hooks/useMatchScores';
export {
  useCareerForecast,
  useGenerateCareerForecast,
} from './hooks/useCareerForecast';
export {
  useMessageThreads,
  useMessageThread,
  useMessages,
  useSendMessage,
  useMarkMessagesRead,
} from './hooks/useMessages';
export {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from './hooks/useNotifications';
export {
  useSavedJobs,
  useIsJobSaved,
  useSaveJob,
  useUnsaveJob,
  useToggleSaveJob,
} from './hooks/useSavedJobs';
