// Supabase-generated database types.
//
// This file is a HAND-WRITTEN STUB for initial scaffolding. Regenerate it with
// the real, column-accurate types once the local Supabase stack is running:
//
//   pnpm supabase:start   # boots the local stack (needs Docker)
//   pnpm supabase:types   # writes to this file
//
// The stub uses `any` for Row/Insert/Update so hooks still typecheck, but you
// won't get autocomplete for columns until regenerated.

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableStub = { Row: any; Insert: any; Update: any; Relationships: [] };

export interface Database {
  public: {
    Tables: {
      profiles:             TableStub;
      user_roles:           TableStub;
      companies:            TableStub;
      candidate_profiles:   TableStub;
      jobs:                 TableStub;
      applications:         TableStub;
      match_scores:         TableStub;
      career_predictions:   TableStub;
      message_threads:      TableStub;
      messages:             TableStub;
      notifications:        TableStub;
      saved_jobs:           TableStub;
      job_views:            TableStub;
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: { Args: Record<string, never>; Returns: string };
    };
    Enums: {
      user_role: 'employer' | 'candidate' | 'admin';
      company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
      experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'executive';
      employment_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
      remote_type: 'remote' | 'hybrid' | 'onsite';
      salary_period: 'hour' | 'month' | 'year';
      job_status: 'draft' | 'active' | 'paused' | 'closed' | 'filled';
      application_status:
        | 'pending'
        | 'reviewing'
        | 'shortlisted'
        | 'interviewing'
        | 'offer'
        | 'hired'
        | 'rejected'
        | 'withdrawn';
      message_type: 'text' | 'system' | 'interview_invite' | 'offer' | 'attachment';
      thread_status: 'active' | 'archived' | 'blocked';
      notification_type:
        | 'application_received'
        | 'application_status_changed'
        | 'new_message'
        | 'interview_scheduled'
        | 'job_match'
        | 'profile_view'
        | 'system';
    };
    CompositeTypes: Record<string, never>;
  };
}
