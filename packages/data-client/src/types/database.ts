export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      applications: {
        Row: {
          answers: Json
          applied_at: string
          candidate_id: string
          cover_letter: string | null
          created_at: string
          employer_notes: string | null
          id: string
          job_id: string
          portfolio_url: string | null
          referral_code: string | null
          rejected_at: string | null
          rejection_reason: string | null
          resume_url: string | null
          reviewed_at: string | null
          shortlisted_at: string | null
          source: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          answers?: Json
          applied_at?: string
          candidate_id: string
          cover_letter?: string | null
          created_at?: string
          employer_notes?: string | null
          id?: string
          job_id: string
          portfolio_url?: string | null
          referral_code?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          shortlisted_at?: string | null
          source?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          answers?: Json
          applied_at?: string
          candidate_id?: string
          cover_letter?: string | null
          created_at?: string
          employer_notes?: string | null
          id?: string
          job_id?: string
          portfolio_url?: string | null
          referral_code?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          shortlisted_at?: string | null
          source?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profiles: {
        Row: {
          bio: string | null
          certifications: Json
          created_at: string
          education: Json
          experience: Json
          experience_years: number | null
          github_url: string | null
          headline: string | null
          id: string
          languages: Json
          last_active_at: string
          linkedin_url: string | null
          notice_period_days: number | null
          open_to_remote: boolean
          open_to_work: boolean
          portfolio_url: string | null
          preferred_job_types: Json
          preferred_locations: Json
          profile_completeness: number
          resume_text: string | null
          resume_url: string | null
          salary_currency: string
          salary_expectation_max: number | null
          salary_expectation_min: number | null
          skills: Json
          updated_at: string
        }
        Insert: {
          bio?: string | null
          certifications?: Json
          created_at?: string
          education?: Json
          experience?: Json
          experience_years?: number | null
          github_url?: string | null
          headline?: string | null
          id: string
          languages?: Json
          last_active_at?: string
          linkedin_url?: string | null
          notice_period_days?: number | null
          open_to_remote?: boolean
          open_to_work?: boolean
          portfolio_url?: string | null
          preferred_job_types?: Json
          preferred_locations?: Json
          profile_completeness?: number
          resume_text?: string | null
          resume_url?: string | null
          salary_currency?: string
          salary_expectation_max?: number | null
          salary_expectation_min?: number | null
          skills?: Json
          updated_at?: string
        }
        Update: {
          bio?: string | null
          certifications?: Json
          created_at?: string
          education?: Json
          experience?: Json
          experience_years?: number | null
          github_url?: string | null
          headline?: string | null
          id?: string
          languages?: Json
          last_active_at?: string
          linkedin_url?: string | null
          notice_period_days?: number | null
          open_to_remote?: boolean
          open_to_work?: boolean
          portfolio_url?: string | null
          preferred_job_types?: Json
          preferred_locations?: Json
          profile_completeness?: number
          resume_text?: string | null
          resume_url?: string | null
          salary_currency?: string
          salary_expectation_max?: number | null
          salary_expectation_min?: number | null
          skills?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_predictions: {
        Row: {
          calculated_at: string
          candidate_id: string
          created_at: string
          id: string
          model_used: string
          prediction: Json
        }
        Insert: {
          calculated_at?: string
          candidate_id: string
          created_at?: string
          id?: string
          model_used: string
          prediction: Json
        }
        Update: {
          calculated_at?: string
          candidate_id?: string
          created_at?: string
          id?: string
          model_used?: string
          prediction?: Json
        }
        Relationships: [
          {
            foreignKeyName: "career_predictions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          benefits: Json
          created_at: string
          culture_description: string | null
          description: string | null
          founded_year: number | null
          headquarters: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          owner_id: string
          size: Database["public"]["Enums"]["company_size"] | null
          slug: string | null
          social_links: Json
          updated_at: string
          verified: boolean
          website: string | null
        }
        Insert: {
          benefits?: Json
          created_at?: string
          culture_description?: string | null
          description?: string | null
          founded_year?: number | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          size?: Database["public"]["Enums"]["company_size"] | null
          slug?: string | null
          social_links?: Json
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          benefits?: Json
          created_at?: string
          culture_description?: string | null
          description?: string | null
          founded_year?: number | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          size?: Database["public"]["Enums"]["company_size"] | null
          slug?: string | null
          social_links?: Json
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_views: {
        Row: {
          created_at: string
          id: string
          ip_hash: string | null
          job_id: string
          session_id: string | null
          source: string | null
          user_agent: string | null
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          job_id: string
          session_id?: string | null
          source?: string | null
          user_agent?: string | null
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          job_id?: string
          session_id?: string | null
          source?: string | null
          user_agent?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_views_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_deadline: string | null
          applications_count: number
          benefits: Json
          company_id: string
          created_at: string
          department: string | null
          description: string
          employer_id: string
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null
          experience_years_max: number | null
          experience_years_min: number | null
          expires_at: string | null
          featured: boolean
          fts: unknown
          id: string
          location: string | null
          nice_to_have: Json
          published_at: string | null
          remote_type: Database["public"]["Enums"]["remote_type"] | null
          requirements: Json
          responsibilities: Json
          salary_currency: string
          salary_max: number | null
          salary_min: number | null
          salary_period: Database["public"]["Enums"]["salary_period"]
          show_salary: boolean
          skills_required: Json
          slug: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          application_deadline?: string | null
          applications_count?: number
          benefits?: Json
          company_id: string
          created_at?: string
          department?: string | null
          description: string
          employer_id: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          experience_years_max?: number | null
          experience_years_min?: number | null
          expires_at?: string | null
          featured?: boolean
          fts?: unknown
          id?: string
          location?: string | null
          nice_to_have?: Json
          published_at?: string | null
          remote_type?: Database["public"]["Enums"]["remote_type"] | null
          requirements?: Json
          responsibilities?: Json
          salary_currency?: string
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: Database["public"]["Enums"]["salary_period"]
          show_salary?: boolean
          skills_required?: Json
          slug?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          application_deadline?: string | null
          applications_count?: number
          benefits?: Json
          company_id?: string
          created_at?: string
          department?: string | null
          description?: string
          employer_id?: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          experience_years_max?: number | null
          experience_years_min?: number | null
          expires_at?: string | null
          featured?: boolean
          fts?: unknown
          id?: string
          location?: string | null
          nice_to_have?: Json
          published_at?: string | null
          remote_type?: Database["public"]["Enums"]["remote_type"] | null
          requirements?: Json
          responsibilities?: Json
          salary_currency?: string
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: Database["public"]["Enums"]["salary_period"]
          show_salary?: boolean
          skills_required?: Json
          slug?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_scores: {
        Row: {
          calculated_at: string
          candidate_id: string
          concerns: Json
          created_at: string
          experience_score: number | null
          id: string
          job_id: string
          model_used: string
          overall_score: number
          skills_score: number | null
          strengths: Json
          summary: string | null
        }
        Insert: {
          calculated_at?: string
          candidate_id: string
          concerns?: Json
          created_at?: string
          experience_score?: number | null
          id?: string
          job_id: string
          model_used: string
          overall_score: number
          skills_score?: number | null
          strengths?: Json
          summary?: string | null
        }
        Update: {
          calculated_at?: string
          candidate_id?: string
          concerns?: Json
          created_at?: string
          experience_score?: number | null
          id?: string
          job_id?: string
          model_used?: string
          overall_score?: number
          skills_score?: number | null
          strengths?: Json
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_scores_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_scores_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          application_id: string
          candidate_id: string
          candidate_unread_count: number
          created_at: string
          employer_id: string
          employer_unread_count: number
          id: string
          last_message_at: string | null
          status: Database["public"]["Enums"]["thread_status"]
          updated_at: string
        }
        Insert: {
          application_id: string
          candidate_id: string
          candidate_unread_count?: number
          created_at?: string
          employer_id: string
          employer_unread_count?: number
          id?: string
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["thread_status"]
          updated_at?: string
        }
        Update: {
          application_id?: string
          candidate_id?: string
          candidate_unread_count?: number
          created_at?: string
          employer_id?: string
          employer_unread_count?: number
          id?: string
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["thread_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          metadata: Json
          read_at: string | null
          sender_id: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json
          read_at?: string | null
          sender_id: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json
          read_at?: string | null
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          data: Json
          id: string
          read: boolean
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read?: boolean
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read?: boolean
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          job_id: string
          notes: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          job_id: string
          notes?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          job_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      slugify: { Args: { input: string }; Returns: string }
    }
    Enums: {
      application_status:
        | "pending"
        | "reviewing"
        | "shortlisted"
        | "interviewing"
        | "offer"
        | "hired"
        | "rejected"
        | "withdrawn"
      company_size:
        | "1-10"
        | "11-50"
        | "51-200"
        | "201-500"
        | "501-1000"
        | "1000+"
      employment_type:
        | "full-time"
        | "part-time"
        | "contract"
        | "internship"
        | "freelance"
      experience_level:
        | "entry"
        | "junior"
        | "mid"
        | "senior"
        | "lead"
        | "principal"
        | "executive"
      job_status: "draft" | "active" | "paused" | "closed" | "filled"
      message_type:
        | "text"
        | "system"
        | "interview_invite"
        | "offer"
        | "attachment"
      notification_type:
        | "application_received"
        | "application_status_changed"
        | "new_message"
        | "interview_scheduled"
        | "job_match"
        | "profile_view"
        | "system"
      remote_type: "remote" | "hybrid" | "onsite"
      salary_period: "hour" | "month" | "year"
      thread_status: "active" | "archived" | "blocked"
      user_role: "employer" | "candidate" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: [
        "pending",
        "reviewing",
        "shortlisted",
        "interviewing",
        "offer",
        "hired",
        "rejected",
        "withdrawn",
      ],
      company_size: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
      employment_type: [
        "full-time",
        "part-time",
        "contract",
        "internship",
        "freelance",
      ],
      experience_level: [
        "entry",
        "junior",
        "mid",
        "senior",
        "lead",
        "principal",
        "executive",
      ],
      job_status: ["draft", "active", "paused", "closed", "filled"],
      message_type: [
        "text",
        "system",
        "interview_invite",
        "offer",
        "attachment",
      ],
      notification_type: [
        "application_received",
        "application_status_changed",
        "new_message",
        "interview_scheduled",
        "job_match",
        "profile_view",
        "system",
      ],
      remote_type: ["remote", "hybrid", "onsite"],
      salary_period: ["hour", "month", "year"],
      thread_status: ["active", "archived", "blocked"],
      user_role: ["employer", "candidate", "admin"],
    },
  },
} as const
