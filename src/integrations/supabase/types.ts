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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          changed_by: string | null
          complaint_id: string
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["complaint_status"]
          note: string | null
          previous_status:
            | Database["public"]["Enums"]["complaint_status"]
            | null
        }
        Insert: {
          changed_by?: string | null
          complaint_id: string
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["complaint_status"]
          note?: string | null
          previous_status?:
            | Database["public"]["Enums"]["complaint_status"]
            | null
        }
        Update: {
          changed_by?: string | null
          complaint_id?: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["complaint_status"]
          note?: string | null
          previous_status?:
            | Database["public"]["Enums"]["complaint_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_assignments: {
        Row: {
          assigned_at: string
          assigned_to: string
          complaint_id: string
          id: string
        }
        Insert: {
          assigned_at?: string
          assigned_to: string
          complaint_id: string
          id?: string
        }
        Update: {
          assigned_at?: string
          assigned_to?: string
          complaint_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_assignments_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          anonymous: boolean
          category: Database["public"]["Enums"]["complaint_category"]
          created_at: string
          declaration_confirmed: boolean | null
          description: string
          id: string
          reference_id: string | null
          response_text: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          submission_type: string
          submitter_contact: string | null
          submitter_id: string | null
          submitter_name: string | null
          tracking_id: string
          updated_at: string
        }
        Insert: {
          anonymous?: boolean
          category: Database["public"]["Enums"]["complaint_category"]
          created_at?: string
          declaration_confirmed?: boolean | null
          description: string
          id?: string
          reference_id?: string | null
          response_text?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          submission_type?: string
          submitter_contact?: string | null
          submitter_id?: string | null
          submitter_name?: string | null
          tracking_id: string
          updated_at?: string
        }
        Update: {
          anonymous?: boolean
          category?: Database["public"]["Enums"]["complaint_category"]
          created_at?: string
          declaration_confirmed?: boolean | null
          description?: string
          id?: string
          reference_id?: string | null
          response_text?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          submission_type?: string
          submitter_contact?: string | null
          submitter_id?: string | null
          submitter_name?: string | null
          tracking_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
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
      is_admin: { Args: never; Returns: boolean }
      is_officer: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "officer"
      complaint_category:
        | "corruption"
        | "abuse_of_office"
        | "misconduct"
        | "policy_suggestion"
        | "public_service_concern"
        | "anti_corruption_idea"
        | "observation"
        | "self_report_officer"
        | "self_report_individual"
        | "self_report_organization"
      complaint_status:
        | "submitted"
        | "under_review"
        | "assigned"
        | "responded"
        | "closed"
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
      app_role: ["admin", "officer"],
      complaint_category: [
        "corruption",
        "abuse_of_office",
        "misconduct",
        "policy_suggestion",
        "public_service_concern",
        "anti_corruption_idea",
        "observation",
        "self_report_officer",
        "self_report_individual",
        "self_report_organization",
      ],
      complaint_status: [
        "submitted",
        "under_review",
        "assigned",
        "responded",
        "closed",
      ],
    },
  },
} as const
