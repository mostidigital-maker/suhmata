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
      albums: {
        Row: {
          category_id: string | null
          cover_image: string | null
          created_at: string
          description_ar: string
          description_en: string
          id: string
          slug: string
          sort_order: number
          title_ar: string
          title_en: string
        }
        Insert: {
          category_id?: string | null
          cover_image?: string | null
          created_at?: string
          description_ar?: string
          description_en?: string
          id?: string
          slug: string
          sort_order?: number
          title_ar?: string
          title_en?: string
        }
        Update: {
          category_id?: string | null
          cover_image?: string | null
          created_at?: string
          description_ar?: string
          description_en?: string
          id?: string
          slug?: string
          sort_order?: number
          title_ar?: string
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "albums_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_items: {
        Row: {
          category_id: string | null
          created_at: string
          description_ar: string
          description_en: string
          downloadable: boolean
          file_url: string
          id: string
          kind: string
          notes_ar: string
          notes_en: string
          published: boolean
          slug: string
          source: string | null
          thumbnail_url: string | null
          title_ar: string
          title_en: string
          year: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description_ar?: string
          description_en?: string
          downloadable?: boolean
          file_url: string
          id?: string
          kind?: string
          notes_ar?: string
          notes_en?: string
          published?: boolean
          slug: string
          source?: string | null
          thumbnail_url?: string | null
          title_ar?: string
          title_en?: string
          year?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description_ar?: string
          description_en?: string
          downloadable?: boolean
          file_url?: string
          id?: string
          kind?: string
          notes_ar?: string
          notes_en?: string
          published?: boolean
          slug?: string
          source?: string | null
          thumbnail_url?: string | null
          title_ar?: string
          title_en?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archive_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          category_id: string | null
          content_ar: string
          content_en: string
          cover_image: string | null
          created_at: string
          excerpt_ar: string
          excerpt_en: string
          featured: boolean
          id: string
          published: boolean
          published_at: string
          reading_minutes: number
          slug: string | null
          title_ar: string
          title_en: string
        }
        Insert: {
          category_id?: string | null
          content_ar?: string
          content_en?: string
          cover_image?: string | null
          created_at?: string
          excerpt_ar?: string
          excerpt_en?: string
          featured?: boolean
          id?: string
          published?: boolean
          published_at?: string
          reading_minutes?: number
          slug?: string | null
          title_ar?: string
          title_en?: string
        }
        Update: {
          category_id?: string | null
          content_ar?: string
          content_en?: string
          cover_image?: string | null
          created_at?: string
          excerpt_ar?: string
          excerpt_en?: string
          featured?: boolean
          id?: string
          published?: boolean
          published_at?: string
          reading_minutes?: number
          slug?: string | null
          title_ar?: string
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      categories: {
        Row: {
          created_at: string
          id: string
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name_ar?: string
          name_en?: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      contributions: {
        Row: {
          body: string | null
          contributor_name: string
          created_at: string
          email: string | null
          id: string
          kind: string
          media_url: string | null
          social_link: string | null
          status: string
          title: string | null
        }
        Insert: {
          body?: string | null
          contributor_name: string
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          media_url?: string | null
          social_link?: string | null
          status?: string
          title?: string | null
        }
        Update: {
          body?: string | null
          contributor_name?: string
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          media_url?: string | null
          social_link?: string | null
          status?: string
          title?: string | null
        }
        Relationships: []
      }
      event_media: {
        Row: {
          caption_ar: string
          caption_en: string
          created_at: string
          event_id: string
          id: string
          media_type: string
          media_url: string
          sort_order: number
        }
        Insert: {
          caption_ar?: string
          caption_en?: string
          created_at?: string
          event_id: string
          id?: string
          media_type?: string
          media_url: string
          sort_order?: number
        }
        Update: {
          caption_ar?: string
          caption_en?: string
          created_at?: string
          event_id?: string
          id?: string
          media_type?: string
          media_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
          slug: string | null
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
          slug?: string | null
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
          slug?: string | null
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
          album_id: string | null
          caption_ar: string
          caption_en: string
          created_at: string
          height: number | null
          id: string
          media_type: string
          media_url: string
          sort_order: number
          width: number | null
        }
        Insert: {
          album?: string
          album_id?: string | null
          caption_ar?: string
          caption_en?: string
          created_at?: string
          height?: number | null
          id?: string
          media_type?: string
          media_url: string
          sort_order?: number
          width?: number | null
        }
        Update: {
          album?: string
          album_id?: string | null
          caption_ar?: string
          caption_en?: string
          created_at?: string
          height?: number | null
          id?: string
          media_type?: string
          media_url?: string
          sort_order?: number
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      guestbook: {
        Row: {
          approved: boolean
          created_at: string
          email: string | null
          facebook: string | null
          hidden: boolean
          id: string
          instagram: string | null
          message: string
          name: string
          social_link: string | null
        }
        Insert: {
          approved?: boolean
          created_at?: string
          email?: string | null
          facebook?: string | null
          hidden?: boolean
          id?: string
          instagram?: string | null
          message: string
          name: string
          social_link?: string | null
        }
        Update: {
          approved?: boolean
          created_at?: string
          email?: string | null
          facebook?: string | null
          hidden?: boolean
          id?: string
          instagram?: string | null
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
      map_location_media: {
        Row: {
          caption_ar: string
          caption_en: string
          created_at: string
          id: string
          location_id: string
          media_url: string
          sort_order: number
        }
        Insert: {
          caption_ar?: string
          caption_en?: string
          created_at?: string
          id?: string
          location_id: string
          media_url: string
          sort_order?: number
        }
        Update: {
          caption_ar?: string
          caption_en?: string
          created_at?: string
          id?: string
          location_id?: string
          media_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "map_location_media_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "map_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      map_locations: {
        Row: {
          created_at: string
          description_ar: string
          description_en: string
          id: string
          kind: string
          name_ar: string
          name_en: string
          notes_ar: string
          notes_en: string
          pos_x: number
          pos_y: number
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description_ar?: string
          description_en?: string
          id?: string
          kind?: string
          name_ar?: string
          name_en?: string
          notes_ar?: string
          notes_en?: string
          pos_x?: number
          pos_y?: number
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description_ar?: string
          description_en?: string
          id?: string
          kind?: string
          name_ar?: string
          name_en?: string
          notes_ar?: string
          notes_en?: string
          pos_x?: number
          pos_y?: number
          slug?: string
          sort_order?: number
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
          map_embed_url: string | null
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
          map_embed_url?: string | null
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
          map_embed_url?: string | null
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
