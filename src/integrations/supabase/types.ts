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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bible_plan: {
        Row: {
          created_at: string | null
          day_number: number
          id: string
          new_testament: string | null
          old_testament: string | null
          psalm: string | null
        }
        Insert: {
          created_at?: string | null
          day_number: number
          id?: string
          new_testament?: string | null
          old_testament?: string | null
          psalm?: string | null
        }
        Update: {
          created_at?: string | null
          day_number?: number
          id?: string
          new_testament?: string | null
          old_testament?: string | null
          psalm?: string | null
        }
        Relationships: []
      }
      bible_plan_progress: {
        Row: {
          completed_at: string | null
          day_number: number
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          day_number: number
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          day_number?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_plan_progress_day_number_fkey"
            columns: ["day_number"]
            isOneToOne: false
            referencedRelation: "bible_plan"
            referencedColumns: ["day_number"]
          },
        ]
      }
      devotional_reactions: {
        Row: {
          created_at: string | null
          devotional_id: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          devotional_id: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          devotional_id?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_reactions_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
        ]
      }
      devotionals: {
        Row: {
          closing_prayer: string | null
          content: string
          created_at: string | null
          header_image_url: string | null
          id: string
          published_date: string
          reflection_1: string | null
          reflection_2: string | null
          reflection_3: string | null
          title: string
          verse: string | null
          verse_reference: string | null
        }
        Insert: {
          closing_prayer?: string | null
          content: string
          created_at?: string | null
          header_image_url?: string | null
          id?: string
          published_date: string
          reflection_1?: string | null
          reflection_2?: string | null
          reflection_3?: string | null
          title: string
          verse?: string | null
          verse_reference?: string | null
        }
        Update: {
          closing_prayer?: string | null
          content?: string
          created_at?: string | null
          header_image_url?: string | null
          id?: string
          published_date?: string
          reflection_1?: string | null
          reflection_2?: string | null
          reflection_3?: string | null
          title?: string
          verse?: string | null
          verse_reference?: string | null
        }
        Relationships: []
      }
      prayer_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          prayer_request_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          prayer_request_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          prayer_request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_comments_prayer_request_id_fkey"
            columns: ["prayer_request_id"]
            isOneToOne: false
            referencedRelation: "prayer_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_comments_prayer_request_id_fkey"
            columns: ["prayer_request_id"]
            isOneToOne: false
            referencedRelation: "public_prayer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_reactions: {
        Row: {
          created_at: string | null
          id: string
          prayer_request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          prayer_request_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          prayer_request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_reactions_prayer_request_id_fkey"
            columns: ["prayer_request_id"]
            isOneToOne: false
            referencedRelation: "prayer_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_reactions_prayer_request_id_fkey"
            columns: ["prayer_request_id"]
            isOneToOne: false
            referencedRelation: "public_prayer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          prayer_count: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          prayer_count?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          prayer_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          file_url: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_free: boolean | null
          is_published: boolean | null
          payhip_link: string | null
          price_usd: number | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_free?: boolean | null
          is_published?: boolean | null
          payhip_link?: string | null
          price_usd?: number | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_free?: boolean | null
          is_published?: boolean | null
          payhip_link?: string | null
          price_usd?: number | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      saved_devotionals: {
        Row: {
          created_at: string | null
          devotional_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          devotional_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          devotional_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_devotionals_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          daily_verse: string | null
          daily_verse_reference: string | null
          id: number
          ko_fi_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_verse?: string | null
          daily_verse_reference?: string | null
          id?: number
          ko_fi_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_verse?: string | null
          daily_verse_reference?: string | null
          id?: number
          ko_fi_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      prayer_comments_public: {
        Row: {
          content: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          prayer_request_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prayer_comments_prayer_request_id_fkey"
            columns: ["prayer_request_id"]
            isOneToOne: false
            referencedRelation: "prayer_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_comments_prayer_request_id_fkey"
            columns: ["prayer_request_id"]
            isOneToOne: false
            referencedRelation: "public_prayer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      public_prayer_requests: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          is_anonymous: boolean | null
          prayer_count: number | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          prayer_count?: number | null
          user_id?: never
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          prayer_count?: number | null
          user_id?: never
        }
        Relationships: []
      }
    }
    Functions: {
      admin_get_users: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          id: string
        }[]
      }
      has_role:
        | {
            Args: { _role: Database["public"]["Enums"]["app_role"] }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.has_role(_role => text), public.has_role(_role => app_role). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { _role: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.has_role(_role => text), public.has_role(_role => app_role). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
