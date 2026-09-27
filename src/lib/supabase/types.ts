export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'generating' | 'active' | 'completed';
export type ResourceType = 'youtube_video' | 'web_article' | 'doc_page';
export type ActivityType = 'lesson_completed' | 'quiz_completed' | 'flashcard_reviewed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          topic: string;
          difficulty_level: DifficultyLevel;
          weekly_hours_allocated: number;
          status: CourseStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          topic: string;
          difficulty_level: DifficultyLevel;
          weekly_hours_allocated?: number;
          status?: CourseStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          topic?: string;
          difficulty_level?: DifficultyLevel;
          weekly_hours_allocated?: number;
          status?: CourseStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          estimated_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          order_index: number;
          estimated_minutes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          order_index?: number;
          estimated_minutes?: number;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          order_index: number;
          objectives: Json;
          search_queries: Json;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          order_index: number;
          objectives?: Json;
          search_queries?: Json;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          order_index?: number;
          objectives?: Json;
          search_queries?: Json;
          is_completed?: boolean;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          id: string;
          lesson_id: string;
          type: ResourceType;
          title: string;
          url: string;
          external_id: string | null;
          channel_or_author: string | null;
          duration_seconds: number | null;
          summary_markdown: string | null;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          type: ResourceType;
          title: string;
          url: string;
          external_id?: string | null;
          channel_or_author?: string | null;
          duration_seconds?: number | null;
          summary_markdown?: string | null;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          type?: ResourceType;
          title?: string;
          url?: string;
          external_id?: string | null;
          channel_or_author?: string | null;
          duration_seconds?: number | null;
          summary_markdown?: string | null;
          is_completed?: boolean;
        };
        Relationships: [];
      };
      youtube_search_cache: {
        Row: {
          query_hash: string;
          query_text: string;
          results: Json;
          cached_at: string;
        };
        Insert: {
          query_hash: string;
          query_text: string;
          results: Json;
          cached_at?: string;
        };
        Update: {
          query_hash?: string;
          query_text?: string;
          results?: Json;
          cached_at?: string;
        };
        Relationships: [];
      };
      flashcards: {
        Row: {
          id: string;
          lesson_id: string;
          user_id: string;
          front: string;
          back: string;
          repetitions: number;
          interval_days: number;
          ease_factor: number;
          next_review_at: string;
          last_reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          user_id: string;
          front: string;
          back: string;
          repetitions?: number;
          interval_days?: number;
          ease_factor?: number;
          next_review_at?: string;
          last_reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          user_id?: string;
          front?: string;
          back?: string;
          repetitions?: number;
          interval_days?: number;
          ease_factor?: number;
          next_review_at?: string;
          last_reviewed_at?: string | null;
        };
        Relationships: [];
      };
      quizzes: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          title?: string;
        };
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question: string;
          options: Json;
          correct_option_index: number;
          explanation: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question: string;
          options: Json;
          correct_option_index: number;
          explanation: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question?: string;
          options?: Json;
          correct_option_index?: number;
          explanation?: string;
        };
        Relationships: [];
      };
      quiz_submissions: {
        Row: {
          id: string;
          quiz_id: string;
          user_id: string;
          score: number;
          answers: Json;
          completed_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          user_id: string;
          score: number;
          answers: Json;
          completed_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          user_id?: string;
          score?: number;
          answers?: Json;
          completed_at?: string;
        };
        Relationships: [];
      };
      study_activity_logs: {
        Row: {
          id: string;
          user_id: string;
          activity_date: string;
          activity_type: ActivityType;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_date?: string;
          activity_type: ActivityType;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_date?: string;
          activity_type?: ActivityType;
          metadata?: Json;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
