export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      attendances: {
        Row: {
          date_added: string | null
          guest_name: string | null
          id: number
          phone_number: string | null
          status: string | null
          wedding_id: number
        }
        Insert: {
          date_added?: string | null
          guest_name?: string | null
          id?: number
          phone_number?: string | null
          status?: string | null
          wedding_id: number
        }
        Update: {
          date_added?: string | null
          guest_name?: string | null
          id?: number
          phone_number?: string | null
          status?: string | null
          wedding_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "attendances_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      customized_invitations: {
        Row: {
          canvas_size: Json
          created_at: string
          design_name: string
          elements: Json
          id: number
          is_published: boolean
          slug: string | null
          updated_at: string
          user_id: number | null
        }
        Insert: {
          canvas_size?: Json
          created_at?: string
          design_name: string
          elements?: Json
          id?: number
          is_published?: boolean
          slug?: string | null
          updated_at?: string
          user_id?: number | null
        }
        Update: {
          canvas_size?: Json
          created_at?: string
          design_name?: string
          elements?: Json
          id?: number
          is_published?: boolean
          slug?: string | null
          updated_at?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customized_invitations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      event_attendances: {
        Row: {
          date_added: string | null
          event_id: number
          guest_name: string | null
          id: number
          phone_number: string | null
          status: string | null
        }
        Insert: {
          date_added?: string | null
          event_id: number
          guest_name?: string | null
          id?: number
          phone_number?: string | null
          status?: string | null
        }
        Update: {
          date_added?: string | null
          event_id?: number
          guest_name?: string | null
          id?: number
          phone_number?: string | null
          status?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          attendance_deadline: string | null
          background_color: string | null
          background_image: string | null
          background_music: string | null
          date_added: string | null
          description1: string | null
          description2: string | null
          email: string | null
          event_date: string | null
          event_name: string
          id: number
          language: string | null
          location_text: string | null
          location_url: string | null
          max_attendance: number | null
          mobile_background_image: string | null
          phone_number: string | null
          slug: string | null
          subtitle: string | null
          updated_at: string | null
          user_id: number | null
          wish_account: string | null
        }
        Insert: {
          attendance_deadline?: string | null
          background_color?: string | null
          background_image?: string | null
          background_music?: string | null
          date_added?: string | null
          description1?: string | null
          description2?: string | null
          email?: string | null
          event_date?: string | null
          event_name: string
          id?: number
          language?: string | null
          location_text?: string | null
          location_url?: string | null
          max_attendance?: number | null
          mobile_background_image?: string | null
          phone_number?: string | null
          slug?: string | null
          subtitle?: string | null
          updated_at?: string | null
          user_id?: number | null
          wish_account?: string | null
        }
        Update: {
          attendance_deadline?: string | null
          background_color?: string | null
          background_image?: string | null
          background_music?: string | null
          date_added?: string | null
          description1?: string | null
          description2?: string | null
          email?: string | null
          event_date?: string | null
          event_name?: string
          id?: number
          language?: string | null
          location_text?: string | null
          location_url?: string | null
          max_attendance?: number | null
          mobile_background_image?: string | null
          phone_number?: string | null
          slug?: string | null
          subtitle?: string | null
          updated_at?: string | null
          user_id?: number | null
          wish_account?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string | null
          module_id: number
          module_name: string
        }
        Insert: {
          created_at?: string | null
          module_id?: number
          module_name: string
        }
        Update: {
          created_at?: string | null
          module_id?: number
          module_name?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_add: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          module_id: number
          role_id: number
        }
        Insert: {
          can_add?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          module_id: number
          role_id: number
        }
        Update: {
          can_add?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          module_id?: number
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          role_id: number
          role_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          role_id?: number
          role_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          role_id?: number
          role_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          can_add: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          id: number
          module_id: number
          user_id: number
        }
        Insert: {
          can_add?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          id?: number
          module_id: number
          user_id: number
        }
        Update: {
          can_add?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          id?: number
          module_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          name: string
          password: string
          phone: string | null
          role_id: number | null
          updated_at: string | null
          user_id: number
        }
        Insert: {
          created_at?: string | null
          email: string
          name: string
          password: string
          phone?: string | null
          role_id?: number | null
          updated_at?: string | null
          user_id?: number
        }
        Update: {
          created_at?: string | null
          email?: string
          name?: string
          password?: string
          phone?: string | null
          role_id?: number | null
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_id"]
          },
        ]
      }
      weddings: {
        Row: {
          attendance_deadline: string | null
          background_color: string | null
          background_image: string | null
          background_music: string | null
          bride_name: string | null
          date_added: string | null
          description1: string | null
          description2: string | null
          email: string | null
          groom_name: string | null
          id: number
          language: string | null
          location_text: string | null
          location_url: string | null
          max_attendance: number | null
          mobile_background_image: string | null
          phone_number: string | null
          slug: string | null
          user_id: number | null
          wedding_date: string | null
          wedding_name: string
          whish_account: string | null
        }
        Insert: {
          attendance_deadline?: string | null
          background_color?: string | null
          background_image?: string | null
          background_music?: string | null
          bride_name?: string | null
          date_added?: string | null
          description1?: string | null
          description2?: string | null
          email?: string | null
          groom_name?: string | null
          id?: number
          language?: string | null
          location_text?: string | null
          location_url?: string | null
          max_attendance?: number | null
          mobile_background_image?: string | null
          phone_number?: string | null
          slug?: string | null
          user_id?: number | null
          wedding_date?: string | null
          wedding_name: string
          whish_account?: string | null
        }
        Update: {
          attendance_deadline?: string | null
          background_color?: string | null
          background_image?: string | null
          background_music?: string | null
          bride_name?: string | null
          date_added?: string | null
          description1?: string | null
          description2?: string | null
          email?: string | null
          groom_name?: string | null
          id?: number
          language?: string | null
          location_text?: string | null
          location_url?: string | null
          max_attendance?: number | null
          mobile_background_image?: string | null
          phone_number?: string | null
          slug?: string | null
          user_id?: number | null
          wedding_date?: string | null
          wedding_name?: string
          whish_account?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weddings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_customized_invitation_slug: {
        Args:
          | { design_name: string }
          | { design_name: string; language?: string }
        Returns: string
      }
      generate_event_slug: {
        Args: { event_name: string } | { event_name: string; language?: string }
        Returns: string
      }
      generate_wedding_slug: {
        Args:
          | { groom_name: string; bride_name: string }
          | { groom_name: string; bride_name: string; language?: string }
        Returns: string
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
