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
  public: {
    Tables: {
      articles: {
        Row: {
          content_ar: string
          content_en: string
          cover_image: string | null
          created_at: string
          featured: boolean
          id: string
          published: boolean
          title_ar: string
          title_en: string
        }
        Insert: {
          content_ar?: string
          content_en?: string
          cover_image?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          published?: boolean
          title_ar?: string
          title_en?: string
        }
        Update: {
          content_ar?: string
          content_en?: string
          cover_image?: string | null
          created_at?: string
          featured?: boolean
          id?: string
          published?: boolean
          title_ar?: string
          title_en?: string
        }
        Relationships: []
      }
      association_message: {
        Row: {
          content_ar: string
          content_en: string
          created_at: string
          id: string
          title_ar: string
          title_en: string
        }
        Insert: {
          content_ar?: string
          content_en?: string
          created_at?: string
          id?: string
          title_ar?: string
          title_en?: string
        }
        Update: {
          content_ar?: string
          content_en?: string
          created_at?: string
          id?: string
          title_ar?: string
          title_en?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          archived: boolean
          cover_image: string | null
          created_at: string
          description_ar: string
          description_en: string
          event_date: string | null
          id: string
          location: string | null
          summary_ar: string
          summary_en: string
          title_ar: string
          title_en: string
        }
        Insert: {
          archived?: boolean
          cover_image?: string | null
          created_at?: string
          description_ar?: string
          description_en?: string
          event_date?: string | null
          id?: string
          location?: string | null
          summary_ar?: string
          summary_en?: string
          title_ar?: string
          title_en?: string
        }
        Update: {
          archived?: boolean
          cover_image?: string | null
          created_at?: string
          description_ar?: string
          description_en?: string
          event_date?: string | null
          id?: string
          location?: string | null
          summary_ar?: string
          summary_en?: string
          title_ar?: string
          title_en?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          album: string
          caption_ar: string
          caption_en: string
          created_at: string
          id: string
          media_type: string
          media_url: string
        }
        Insert: {
          album?: string
          caption_ar?: string
          caption_en?: string
          created_at?: string
          id?: string
          media_type?: string
          media_url: string
        }
        Update: {
          album?: string
          caption_ar?: string
          caption_en?: string
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string
        }
        Relationships: []
      }
      guestbook: {
        Row: {
          approved: boolean
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          social_link: string | null
        }
        Insert: {
          approved?: boolean
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          social_link?: string | null
        }
        Update: {
          approved?: boolean
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          social_link?: string | null
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          background_image: string | null
          created_at: string
          id: string
          subtitle_ar: string
          subtitle_en: string
          title_ar: string
          title_en: string
        }
        Insert: {
          background_image?: string | null
          created_at?: string
          id?: string
          subtitle_ar?: string
          subtitle_en?: string
          title_ar?: string
          title_en?: string
        }
        Update: {
          background_image?: string | null
          created_at?: string
          id?: string
          subtitle_ar?: string
          subtitle_en?: string
          title_ar?: string
          title_en?: string
        }
        Relationships: []
      }
      history: {
        Row: {
          content_ar: string
          content_en: string
          created_at: string
          id: string
          sort_order: number
          title_ar: string
          title_en: string
        }
        Insert: {
          content_ar?: string
          content_en?: string
          created_at?: string
          id?: string
          sort_order?: number
          title_ar?: string
          title_en?: string
        }
        Update: {
          content_ar?: string
          content_en?: string
          created_at?: string
          id?: string
          sort_order?: number
          title_ar?: string
          title_en?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          contact_email: string | null
          created_at: string
          facebook: string | null
          google_maps: string | null
          id: string
          instagram: string | null
          logo: string | null
          waze: string | null
          whatsapp: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          facebook?: string | null
          google_maps?: string | null
          id?: string
          instagram?: string | null
          logo?: string | null
          waze?: string | null
          whatsapp?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          facebook?: string | null
          google_maps?: string | null
          id?: string
          instagram?: string | null
          logo?: string | null
          waze?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_videos: {
        Row: {
          created_at: string
          email: string | null
          id: string
          social_link: string | null
          status: string
          video_url: string
          visitor_name: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          social_link?: string | null
          status?: string
          video_url: string
          visitor_name: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          social_link?: string | null
          status?: string
          video_url?: string
          visitor_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor"
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
  public: {
    Enums: {
      app_role: ["admin", "editor"],
    },
  },
} as const
