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
      belt_diagnostics: {
        Row: {
          attachments: string[] | null
          belt_saver_benefits: string[]
          cause: string
          created_at: string
          id: string
          location: string
          notes: string | null
          recommendations: string[]
          severity: string
          status: string
          tracking_direction: string
          user_id: string | null
        }
        Insert: {
          attachments?: string[] | null
          belt_saver_benefits: string[]
          cause: string
          created_at?: string
          id?: string
          location: string
          notes?: string | null
          recommendations: string[]
          severity: string
          status?: string
          tracking_direction: string
          user_id?: string | null
        }
        Update: {
          attachments?: string[] | null
          belt_saver_benefits?: string[]
          cause?: string
          created_at?: string
          id?: string
          location?: string
          notes?: string | null
          recommendations?: string[]
          severity?: string
          status?: string
          tracking_direction?: string
          user_id?: string | null
        }
        Relationships: []
      }
      dealer_inventory: {
        Row: {
          created_at: string
          dealer_id: string
          id: string
          last_updated: string
          part_id: string
          quantity: number
          status: string
        }
        Insert: {
          created_at?: string
          dealer_id: string
          id?: string
          last_updated?: string
          part_id: string
          quantity?: number
          status?: string
        }
        Update: {
          created_at?: string
          dealer_id?: string
          id?: string
          last_updated?: string
          part_id?: string
          quantity?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealer_inventory_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "equipment_dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_inventory_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "equipment_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_dealers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          hours: Json | null
          id: string
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          makes_served: string[] | null
          name: string
          phone: string | null
          state: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          hours?: Json | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          makes_served?: string[] | null
          name: string
          phone?: string | null
          state?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          hours?: Json | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          makes_served?: string[] | null
          name?: string
          phone?: string | null
          state?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      equipment_diagnostics: {
        Row: {
          created_at: string
          diagnosis: string | null
          equipment_type: string | null
          id: string
          images: string[] | null
          make: string | null
          model: string | null
          notes: string | null
          parts_needed: Json | null
          repair_steps: string | null
          status: string
          symptoms: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          equipment_type?: string | null
          id?: string
          images?: string[] | null
          make?: string | null
          model?: string | null
          notes?: string | null
          parts_needed?: Json | null
          repair_steps?: string | null
          status?: string
          symptoms: string
          user_id: string
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          equipment_type?: string | null
          id?: string
          images?: string[] | null
          make?: string | null
          model?: string | null
          notes?: string | null
          parts_needed?: Json | null
          repair_steps?: string | null
          status?: string
          symptoms?: string
          user_id?: string
        }
        Relationships: []
      }
      equipment_parts: {
        Row: {
          avg_price: number | null
          category: string | null
          created_at: string
          description: string | null
          equipment_types: string[] | null
          id: string
          image_url: string | null
          makes: string[] | null
          name: string
          part_number: string
        }
        Insert: {
          avg_price?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          equipment_types?: string[] | null
          id?: string
          image_url?: string | null
          makes?: string[] | null
          name: string
          part_number: string
        }
        Update: {
          avg_price?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          equipment_types?: string[] | null
          id?: string
          image_url?: string | null
          makes?: string[] | null
          name?: string
          part_number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          free_uses_remaining: number
          full_name: string | null
          id: string
          total_uses: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          free_uses_remaining?: number
          full_name?: string | null
          id: string
          total_uses?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          free_uses_remaining?: number
          full_name?: string | null
          id?: string
          total_uses?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_name: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_name?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_name?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_modules: {
        Row: {
          activated_at: string | null
          active: boolean
          created_at: string
          expires_at: string | null
          id: string
          module_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          active?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          module_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          active?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          module_name?: string
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
      activate_user_module: {
        Args: {
          p_expires_at?: string
          p_module_name: string
          p_user_id: string
        }
        Returns: boolean
      }
      deactivate_user_module: {
        Args: { p_module_name: string; p_user_id: string }
        Returns: boolean
      }
      decrement_usage: { Args: never; Returns: boolean }
      get_usage_status: {
        Args: never
        Returns: {
          free_uses_remaining: number
          has_active_subscription: boolean
          total_uses: number
        }[]
      }
      has_module_access: { Args: { p_module_name: string }; Returns: boolean }
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
