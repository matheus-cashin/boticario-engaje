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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          company_id: string | null
          created_at: string | null
          entity: string
          entity_id: string | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          previous_data: Json | null
          user_agent: string | null
          user_id: string | null
          user_type: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string | null
          entity: string
          entity_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          previous_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          previous_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_auditoria_empresa_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_files: {
        Row: {
          campaign_id: string
          company_id: string
          created_at: string | null
          error_message: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          processed_at: string | null
          processing_result: Json | null
          status: string | null
          updated_at: string | null
          upload_type: string
        }
        Insert: {
          campaign_id: string
          company_id: string
          created_at?: string | null
          error_message?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          processed_at?: string | null
          processing_result?: Json | null
          status?: string | null
          updated_at?: string | null
          upload_type: string
        }
        Update: {
          campaign_id?: string
          company_id?: string
          created_at?: string | null
          error_message?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          processed_at?: string | null
          processing_result?: Json | null
          status?: string | null
          updated_at?: string | null
          upload_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_campanha_campanha_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arquivos_campanha_empresa_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_managers: {
        Row: {
          company_id: string
          created_at: string | null
          email: string
          id: string
          name: string
          password_hash: string
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          password_hash: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          password_hash?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gerentes_campanha_empresa_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_rules: {
        Row: {
          ai_interpretation: string | null
          ai_model: string | null
          ai_prompt_used: string | null
          campaign_id: string
          created_at: string | null
          execution_logic: Json
          id: string
          raw_description: string
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
          version: number | null
        }
        Insert: {
          ai_interpretation?: string | null
          ai_model?: string | null
          ai_prompt_used?: string | null
          campaign_id: string
          created_at?: string | null
          execution_logic: Json
          id?: string
          raw_description: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          version?: number | null
        }
        Update: {
          ai_interpretation?: string | null
          ai_model?: string | null
          ai_prompt_used?: string | null
          campaign_id?: string
          created_at?: string | null
          execution_logic?: Json
          id?: string
          raw_description?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "regras_campanha_campanha_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_campanha_validado_por_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "campaign_managers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          name: string
          slots: number | null
          start_date: string
          status: string | null
          total_budget: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          name: string
          slots?: number | null
          start_date: string
          status?: string | null
          total_budget?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          slots?: number | null
          start_date?: string
          status?: string | null
          total_budget?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campanhas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "campaign_managers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campanhas_empresa_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      column_mappings: {
        Row: {
          ai_confidence: number | null
          created_at: string | null
          data_type: string | null
          file_id: string
          id: string
          mapped_column: string
          original_column: string
          validated: boolean | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          ai_confidence?: number | null
          created_at?: string | null
          data_type?: string | null
          file_id: string
          id?: string
          mapped_column: string
          original_column: string
          validated?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          ai_confidence?: number | null
          created_at?: string | null
          data_type?: string | null
          file_id?: string
          id?: string
          mapped_column?: string
          original_column?: string
          validated?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mapeamento_colunas_arquivo_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "campaign_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mapeamento_colunas_validado_por_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "campaign_managers"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cashin_platform_id: string
          created_at: string | null
          id: string
          name: string
          status: string | null
          tax_id: string
          updated_at: string | null
        }
        Insert: {
          cashin_platform_id: string
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
          tax_id: string
          updated_at?: string | null
        }
        Update: {
          cashin_platform_id?: string
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
          tax_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_snapshots: {
        Row: {
          achieved: number
          achievement: number
          created_at: string | null
          daily_sales: number | null
          id: string
          participation_id: string
          position: number | null
          position_change: number | null
          snapshot_date: string
        }
        Insert: {
          achieved: number
          achievement: number
          created_at?: string | null
          daily_sales?: number | null
          id?: string
          participation_id: string
          position?: number | null
          position_change?: number | null
          snapshot_date: string
        }
        Update: {
          achieved?: number
          achievement?: number
          created_at?: string | null
          daily_sales?: number | null
          id?: string
          participation_id?: string
          position?: number | null
          position_change?: number | null
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "snapshots_diarios_participacao_id_fkey"
            columns: ["participation_id"]
            isOneToOne: false
            referencedRelation: "participations"
            referencedColumns: ["id"]
          },
        ]
      }
      partial_calculations: {
        Row: {
          calculation_date: string
          calculation_results: Json
          campaign_id: string
          created_at: string | null
          file_id: string
          id: string
          participants_evaluated: number | null
          participants_qualified: number | null
          processed_at: string | null
          status: string | null
          total_achievement: number | null
          upload_batch: string | null
        }
        Insert: {
          calculation_date: string
          calculation_results: Json
          campaign_id: string
          created_at?: string | null
          file_id: string
          id?: string
          participants_evaluated?: number | null
          participants_qualified?: number | null
          processed_at?: string | null
          status?: string | null
          total_achievement?: number | null
          upload_batch?: string | null
        }
        Update: {
          calculation_date?: string
          calculation_results?: Json
          campaign_id?: string
          created_at?: string | null
          file_id?: string
          id?: string
          participants_evaluated?: number | null
          participants_qualified?: number | null
          processed_at?: string | null
          status?: string | null
          total_achievement?: number | null
          upload_batch?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculos_parciais_arquivo_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "campaign_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculos_parciais_campanha_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      participations: {
        Row: {
          achieved: number | null
          achievement: number | null
          active_days: number | null
          campaign_id: string
          company_id: string
          confirmed_reward: number | null
          created_at: string | null
          expected_reward: number | null
          first_sale_at: string | null
          goal: number
          id: string
          last_sale_at: string | null
          payment_date: string | null
          position: number | null
          reward_paid: boolean | null
          seller_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          achieved?: number | null
          achievement?: number | null
          active_days?: number | null
          campaign_id: string
          company_id: string
          confirmed_reward?: number | null
          created_at?: string | null
          expected_reward?: number | null
          first_sale_at?: string | null
          goal: number
          id?: string
          last_sale_at?: string | null
          payment_date?: string | null
          position?: number | null
          reward_paid?: boolean | null
          seller_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          achieved?: number | null
          achievement?: number | null
          active_days?: number | null
          campaign_id?: string
          company_id?: string
          confirmed_reward?: number | null
          created_at?: string | null
          expected_reward?: number | null
          first_sale_at?: string | null
          goal?: number
          id?: string
          last_sale_at?: string | null
          payment_date?: string | null
          position?: number | null
          reward_paid?: boolean | null
          seller_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participacoes_campanha_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participacoes_empresa_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participacoes_vendedor_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          company_id: string
          created_at: string | null
          external_code: string
          id: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string | null
          external_code: string
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string | null
          external_code?: string
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          sale_id: string
          total_amount: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          sale_id: string
          total_amount: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_venda_produto_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_venda_venda_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          company_id: string
          created_at: string | null
          external_order_id: string
          id: string
          sale_date: string
          seller_id: string
          source: string | null
          sync_date: string | null
          total_amount: number
        }
        Insert: {
          company_id: string
          created_at?: string | null
          external_order_id: string
          id?: string
          sale_date: string
          seller_id: string
          source?: string | null
          sync_date?: string | null
          total_amount: number
        }
        Update: {
          company_id?: string
          created_at?: string | null
          external_order_id?: string
          id?: string
          sale_date?: string
          seller_id?: string
          source?: string | null
          sync_date?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_empresa_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_vendedor_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          cluster: string | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          role: string | null
          status: string | null
          tax_id: string
          updated_at: string | null
          wallet_id: string | null
        }
        Insert: {
          cluster?: string | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          role?: string | null
          status?: string | null
          tax_id: string
          updated_at?: string | null
          wallet_id?: string | null
        }
        Update: {
          cluster?: string | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string | null
          status?: string | null
          tax_id?: string
          updated_at?: string | null
          wallet_id?: string | null
        }
        Relationships: []
      }
      upload_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          error_rows: number | null
          file_id: string
          id: string
          processed_rows: number | null
          processing_end: string | null
          processing_start: string | null
          processing_type: string
          status: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          error_rows?: number | null
          file_id: string
          id?: string
          processed_rows?: number | null
          processing_end?: string | null
          processing_start?: string | null
          processing_type: string
          status: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          error_rows?: number | null
          file_id?: string
          id?: string
          processed_rows?: number | null
          processing_end?: string | null
          processing_start?: string | null
          processing_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_processamento_arquivo_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "campaign_files"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_dispatches: {
        Row: {
          campaign_id: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          id: string
          message: string
          scheduled_date: string | null
          sent_date: string | null
          status: string | null
          target_audience: Json | null
          total_errors: number | null
          total_recipients: number | null
          total_sent: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          message: string
          scheduled_date?: string | null
          sent_date?: string | null
          status?: string | null
          target_audience?: Json | null
          total_errors?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          message?: string
          scheduled_date?: string | null
          sent_date?: string | null
          status?: string | null
          target_audience?: Json | null
          total_errors?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disparos_whatsapp_campanha_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disparos_whatsapp_criado_por_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "campaign_managers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disparos_whatsapp_empresa_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
