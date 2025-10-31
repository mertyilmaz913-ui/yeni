export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          role: 'trader' | 'client';
          display_name: string;
          bio: string | null;
          avatar_url: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'trader' | 'client';
          display_name: string;
          bio?: string | null;
          avatar_url?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      traders: {
        Row: {
          id: string;
          user_id: string;
          price_per_minute: string;
          categories: string[];
          rating: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          price_per_minute?: string;
          categories?: string[];
          rating?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['traders']['Row']>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          client_id: string;
          trader_id: string;
          minutes: number;
          status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
          scheduled_at: string | null;
          estimated_cost: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          trader_id: string;
          minutes: number;
          status?: Database['public']['Tables']['bookings']['Row']['status'];
          scheduled_at?: string | null;
          estimated_cost: string;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Row']>;
        Relationships: [];
      };
      subscribers: {
        Row: {
          id: string;
          trader_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trader_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['subscribers']['Row']>;
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          booking_id: string;
          trader_id: string;
          client_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          trader_id: string;
          client_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['feedback']['Row']>;
        Relationships: [];
      };
    };
    Views: {
      trader_dashboard_metrics: {
        Row: {
          trader_id: string;
          total_minutes: number;
          total_revenue: string;
          active_subscribers: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
