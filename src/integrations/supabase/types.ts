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
      code_snippets: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          language: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          language?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          language?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_clients: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          profile_picture_url: string | null
          sentiment_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          sentiment_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          sentiment_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_deals: {
        Row: {
          ai_next_steps: string | null
          client_id: string | null
          contract_url: string | null
          created_at: string
          expected_close_date: string | null
          id: string
          notes: string | null
          stage: string
          title: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          ai_next_steps?: string | null
          client_id?: string | null
          contract_url?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          stage?: string
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          ai_next_steps?: string | null
          client_id?: string | null
          contract_url?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          stage?: string
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          deal_id: string | null
          due_date: string | null
          id: string
          pdf_url: string | null
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          deal_id?: string | null
          due_date?: string | null
          id?: string
          pdf_url?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          deal_id?: string | null
          due_date?: string | null
          id?: string
          pdf_url?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_invoices_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_messages: {
        Row: {
          category: string | null
          client_id: string | null
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          category?: string | null
          client_id?: string | null
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          category?: string | null
          client_id?: string | null
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
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
      diagnostic_logic: {
        Row: {
          category: string | null
          created_at: string
          equipment_types: string[] | null
          fault_code: string
          fault_description: string
          id: string
          part_name: string
          part_number: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          equipment_types?: string[] | null
          fault_code: string
          fault_description: string
          id?: string
          part_name: string
          part_number: string
          price?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          equipment_types?: string[] | null
          fault_code?: string
          fault_description?: string
          id?: string
          part_name?: string
          part_number?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_leads: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
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
      fleet_units: {
        Row: {
          acquisition_date: string | null
          created_at: string
          id: string
          monthly_revenue: number | null
          notes: string | null
          status: string
          unit_name: string
          unit_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acquisition_date?: string | null
          created_at?: string
          id?: string
          monthly_revenue?: number | null
          notes?: string | null
          status?: string
          unit_name: string
          unit_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acquisition_date?: string | null
          created_at?: string
          id?: string
          monthly_revenue?: number | null
          notes?: string | null
          status?: string
          unit_name?: string
          unit_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hq_transactions: {
        Row: {
          amount: number
          business_revenue: number
          created_at: string
          description: string | null
          id: string
          scholarship_fund: number
          status: string
          stripe_payment_intent_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          business_revenue: number
          created_at?: string
          description?: string | null
          id?: string
          scholarship_fund: number
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          business_revenue?: number
          created_at?: string
          description?: string | null
          id?: string
          scholarship_fund?: number
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          user_id?: string | null
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
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_id: string
          reward_type: string
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id: string
          reward_type?: string
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id?: string
          reward_type?: string
          status?: string
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
      treasury_activity: {
        Row: {
          activity_type: string
          amount: number | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          status: string
          user_id: string
        }
        Insert: {
          activity_type: string
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      treasury_metrics: {
        Row: {
          active_leases: number
          created_at: string
          id: string
          milestone_target: number
          notes: string | null
          rewards_earned: number
          staked_sol: number
          total_wealth: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active_leases?: number
          created_at?: string
          id?: string
          milestone_target?: number
          notes?: string | null
          rewards_earned?: number
          staked_sol?: number
          total_wealth?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active_leases?: number
          created_at?: string
          id?: string
          milestone_target?: number
          notes?: string | null
          rewards_earned?: number
          staked_sol?: number
          total_wealth?: number
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
      workflow_runs: {
        Row: {
          created_at: string
          current_step: string | null
          id: string
          metadata: Json | null
          status: string
          title: string
          updated_at: string
          user_id: string
          webhook_url: string | null
          workflow_type: string
        }
        Insert: {
          created_at?: string
          current_step?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          webhook_url?: string | null
          workflow_type: string
        }
        Update: {
          created_at?: string
          current_step?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          notes: string | null
          status: string
          step_name: string
          step_order: number
          workflow_run_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          status?: string
          step_name: string
          step_order?: number
          workflow_run_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          status?: string
          step_name?: string
          step_order?: number
          workflow_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
