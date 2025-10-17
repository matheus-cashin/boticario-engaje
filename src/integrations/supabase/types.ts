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
      campaign_files: {
        Row: {
          campaign_id: string
          created_at: string
          deleted_at: string | null
          error_message: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          processed_at: string | null
          processed_by_ranking_id: string | null
          processing_result: Json | null
          schedule_id: string | null
          status: string
          updated_at: string
          upload_type: string
          uploaded_at: string
          validation_status: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          deleted_at?: string | null
          error_message?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          processed_at?: string | null
          processed_by_ranking_id?: string | null
          processing_result?: Json | null
          schedule_id?: string | null
          status?: string
          updated_at?: string
          upload_type: string
          uploaded_at?: string
          validation_status?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          deleted_at?: string | null
          error_message?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          processed_at?: string | null
          processed_by_ranking_id?: string | null
          processing_result?: Json | null
          schedule_id?: string | null
          status?: string
          updated_at?: string
          upload_type?: string
          uploaded_at?: string
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_files_processed_by_ranking_id_fkey"
            columns: ["processed_by_ranking_id"]
            isOneToOne: false
            referencedRelation: "rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_files_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["schedule_id"]
          },
          {
            foreignKeyName: "campaign_files_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_rules: {
        Row: {
          ai_confidence_score: number | null
          created_at: string | null
          id: string
          processed_rule: Json
          processing_status: string | null
          raw_text: string
          rule_version: number | null
          schedule_id: string
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
          validation_status: string | null
        }
        Insert: {
          ai_confidence_score?: number | null
          created_at?: string | null
          id?: string
          processed_rule: Json
          processing_status?: string | null
          raw_text: string
          rule_version?: number | null
          schedule_id: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_status?: string | null
        }
        Update: {
          ai_confidence_score?: number | null
          created_at?: string | null
          id?: string
          processed_rule?: Json
          processing_status?: string | null
          raw_text?: string
          rule_version?: number | null
          schedule_id?: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_rules_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["schedule_id"]
          },
          {
            foreignKeyName: "campaign_rules_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cnpj: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_rules: {
        Row: {
          campaign_id: string
          campaign_name: string
          company_id: string | null
          created_at: string
          error_message: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          id: string
          processed_at: string | null
          rule_json: Json | null
          rule_text: string
          schedule_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          campaign_name: string
          company_id?: string | null
          created_at?: string
          error_message?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          processed_at?: string | null
          rule_json?: Json | null
          rule_text?: string
          schedule_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          campaign_name?: string
          company_id?: string | null
          created_at?: string
          error_message?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          processed_at?: string | null
          rule_json?: Json | null
          rule_text?: string
          schedule_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_rules_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["schedule_id"]
          },
          {
            foreignKeyName: "company_rules_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      credits: {
        Row: {
          achievement_date: string | null
          amount: number
          calculated_at: string | null
          calculation_date: string | null
          cashin_status: string | null
          cashin_transaction_id: string | null
          created_at: string | null
          credit_type: string
          criteria_met: string | null
          deleted_at: string | null
          description: string | null
          distributed_at: string | null
          distributed_by: string | null
          divergence_reason: string | null
          id: string
          notes: string | null
          participant_id: string | null
          ranking_id: string | null
          reference_period: string | null
          schedule_id: string | null
          source_file_id: string | null
          status: string | null
          updated_at: string | null
          upload_batch_id: string | null
        }
        Insert: {
          achievement_date?: string | null
          amount: number
          calculated_at?: string | null
          calculation_date?: string | null
          cashin_status?: string | null
          cashin_transaction_id?: string | null
          created_at?: string | null
          credit_type: string
          criteria_met?: string | null
          deleted_at?: string | null
          description?: string | null
          distributed_at?: string | null
          distributed_by?: string | null
          divergence_reason?: string | null
          id?: string
          notes?: string | null
          participant_id?: string | null
          ranking_id?: string | null
          reference_period?: string | null
          schedule_id?: string | null
          source_file_id?: string | null
          status?: string | null
          updated_at?: string | null
          upload_batch_id?: string | null
        }
        Update: {
          achievement_date?: string | null
          amount?: number
          calculated_at?: string | null
          calculation_date?: string | null
          cashin_status?: string | null
          cashin_transaction_id?: string | null
          created_at?: string | null
          credit_type?: string
          criteria_met?: string | null
          deleted_at?: string | null
          description?: string | null
          distributed_at?: string | null
          distributed_by?: string | null
          divergence_reason?: string | null
          id?: string
          notes?: string | null
          participant_id?: string | null
          ranking_id?: string | null
          reference_period?: string | null
          schedule_id?: string | null
          source_file_id?: string | null
          status?: string | null
          updated_at?: string | null
          upload_batch_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credits_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["participant_id"]
          },
          {
            foreignKeyName: "credits_ranking_id_fkey"
            columns: ["ranking_id"]
            isOneToOne: false
            referencedRelation: "rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["schedule_id"]
          },
          {
            foreignKeyName: "credits_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "campaign_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_upload_batch_id_fkey"
            columns: ["upload_batch_id"]
            isOneToOne: false
            referencedRelation: "upload_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_history: {
        Row: {
          communication_name: string
          content: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          external_id: string | null
          file_url: string | null
          id: string
          is_ranking_message: boolean | null
          parameters: string[] | null
          participant_id: string | null
          ranking_id: string | null
          schedule_id: string | null
          send_at: string
          sent_at: string | null
          status: string | null
          twilio_response: Json | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          communication_name: string
          content: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          file_url?: string | null
          id?: string
          is_ranking_message?: boolean | null
          parameters?: string[] | null
          participant_id?: string | null
          ranking_id?: string | null
          schedule_id?: string | null
          send_at: string
          sent_at?: string | null
          status?: string | null
          twilio_response?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          communication_name?: string
          content?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          file_url?: string | null
          id?: string
          is_ranking_message?: boolean | null
          parameters?: string[] | null
          participant_id?: string | null
          ranking_id?: string | null
          schedule_id?: string | null
          send_at?: string
          sent_at?: string | null
          status?: string | null
          twilio_response?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_history_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_history_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["participant_id"]
          },
          {
            foreignKeyName: "dispatch_history_ranking_id_fkey"
            columns: ["ranking_id"]
            isOneToOne: false
            referencedRelation: "rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_history_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["schedule_id"]
          },
          {
            foreignKeyName: "dispatch_history_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      partial_calculations: {
        Row: {
          calculation_date: string
          calculation_results: Json
          created_at: string | null
          id: string
          participants_evaluated: number | null
          participants_qualified: number | null
          processed_at: string | null
          rule_id: string
          schedule_id: string
          status: string | null
          total_achievement: number | null
          upload_batch_id: string
        }
        Insert: {
          calculation_date: string
          calculation_results: Json
          created_at?: string | null
          id?: string
          participants_evaluated?: number | null
          participants_qualified?: number | null
          processed_at?: string | null
          rule_id: string
          schedule_id: string
          status?: string | null
          total_achievement?: number | null
          upload_batch_id: string
        }
        Update: {
          calculation_date?: string
          calculation_results?: Json
          created_at?: string | null
          id?: string
          participants_evaluated?: number | null
          participants_qualified?: number | null
          processed_at?: string | null
          rule_id?: string
          schedule_id?: string
          status?: string | null
          total_achievement?: number | null
          upload_batch_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partial_calculations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "campaign_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partial_calculations_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["schedule_id"]
          },
          {
            foreignKeyName: "partial_calculations_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partial_calculations_upload_batch_id_fkey"
            columns: ["upload_batch_id"]
            isOneToOne: false
            referencedRelation: "upload_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          created_at: string | null
          current_progress: number | null
          email: string | null
          employee_id: string | null
          id: string
          is_active: boolean | null
          mongo_id: string | null
          name: string
          phone: string
          schedule_id: string | null
          target_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_progress?: number | null
          email?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          mongo_id?: string | null
          name: string
          phone: string
          schedule_id?: string | null
          target_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_progress?: number | null
          email?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          mongo_id?: string | null
          name?: string
          phone?: string
          schedule_id?: string | null
          target_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["schedule_id"]
          },
          {
            foreignKeyName: "participants_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      rankings: {
        Row: {
          avg_sales_per_participant: number | null
          calculation_date: string
          calculation_method: string | null
          campaign_id: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          is_final: boolean | null
          period_type: string | null
          processing_time_ms: number | null
          ranking_data: Json
          ranking_sent: boolean | null
          reference_period: string | null
          rule_id: string | null
          schedule_id: string | null
          sent_at: string | null
          sent_to_participants: number | null
          source_file_id: string | null
          top_performer_amount: number | null
          total_participants: number
          total_sales_amount: number | null
        }
        Insert: {
          avg_sales_per_participant?: number | null
          calculation_date: string
          calculation_method?: string | null
          campaign_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_final?: boolean | null
          period_type?: string | null
          processing_time_ms?: number | null
          ranking_data: Json
          ranking_sent?: boolean | null
          reference_period?: string | null
          rule_id?: string | null
          schedule_id?: string | null
          sent_at?: string | null
          sent_to_participants?: number | null
          source_file_id?: string | null
          top_performer_amount?: number | null
          total_participants: number
          total_sales_amount?: number | null
        }
        Update: {
          avg_sales_per_participant?: number | null
          calculation_date?: string
          calculation_method?: string | null
          campaign_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_final?: boolean | null
          period_type?: string | null
          processing_time_ms?: number | null
          ranking_data?: Json
          ranking_sent?: boolean | null
          reference_period?: string | null
          rule_id?: string | null
          schedule_id?: string | null
          sent_at?: string | null
          sent_to_participants?: number | null
          source_file_id?: string | null
          top_performer_amount?: number | null
          total_participants?: number
          total_sales_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rankings_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "company_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["schedule_id"]
          },
          {
            foreignKeyName: "rankings_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "campaign_files"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_raw: {
        Row: {
          campaign_id: string
          campaign_name: string
          created_at: string
          error_message: string | null
          file_content: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          is_correction: boolean
          last_retry_at: string | null
          processed_summary: string | null
          processing_status: string
          retry_count: number
          updated_at: string
          upload_date: string
        }
        Insert: {
          campaign_id: string
          campaign_name: string
          created_at?: string
          error_message?: string | null
          file_content: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          is_correction?: boolean
          last_retry_at?: string | null
          processed_summary?: string | null
          processing_status?: string
          retry_count?: number
          updated_at?: string
          upload_date?: string
        }
        Update: {
          campaign_id?: string
          campaign_name?: string
          created_at?: string
          error_message?: string | null
          file_content?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          is_correction?: boolean
          last_retry_at?: string | null
          processed_summary?: string | null
          processing_status?: string
          retry_count?: number
          updated_at?: string
          upload_date?: string
        }
        Relationships: []
      }
      rule_templates: {
        Row: {
          category: string | null
          created_at: string | null
          example_text: string | null
          id: string
          is_active: boolean | null
          template_name: string
          template_structure: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          example_text?: string | null
          id?: string
          is_active?: boolean | null
          template_name: string
          template_structure: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          example_text?: string | null
          id?: string
          is_active?: boolean | null
          template_name?: string
          template_structure?: Json
        }
        Relationships: []
      }
      sales_data: {
        Row: {
          ai_confidence_score: number | null
          amount: number
          created_at: string | null
          deleted_at: string | null
          id: string
          is_valid: boolean | null
          participant_id: string | null
          processed_by_ai: boolean | null
          product_category: string | null
          product_name: string | null
          quantity: number | null
          raw_data: Json | null
          sale_date: string
          schedule_id: string | null
          source_file_id: string | null
          upload_batch_id: string | null
          validation_errors: string[] | null
        }
        Insert: {
          ai_confidence_score?: number | null
          amount: number
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_valid?: boolean | null
          participant_id?: string | null
          processed_by_ai?: boolean | null
          product_category?: string | null
          product_name?: string | null
          quantity?: number | null
          raw_data?: Json | null
          sale_date: string
          schedule_id?: string | null
          source_file_id?: string | null
          upload_batch_id?: string | null
          validation_errors?: string[] | null
        }
        Update: {
          ai_confidence_score?: number | null
          amount?: number
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_valid?: boolean | null
          participant_id?: string | null
          processed_by_ai?: boolean | null
          product_category?: string | null
          product_name?: string | null
          quantity?: number | null
          raw_data?: Json | null
          sale_date?: string
          schedule_id?: string | null
          source_file_id?: string | null
          upload_batch_id?: string | null
          validation_errors?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_data_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_data_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["participant_id"]
          },
          {
            foreignKeyName: "sales_data_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["schedule_id"]
          },
          {
            foreignKeyName: "sales_data_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_data_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "campaign_files"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          ai_processing_enabled: boolean | null
          campaign_id: string
          company_id: string | null
          created_at: string | null
          end_date: string
          id: string
          journey_type: number
          name: string
          notification_types: string[] | null
          processing_mode: string | null
          rule_parsed: Json | null
          rule_text: string
          sales_target: number | null
          start_date: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          ai_processing_enabled?: boolean | null
          campaign_id: string
          company_id?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          journey_type: number
          name: string
          notification_types?: string[] | null
          processing_mode?: string | null
          rule_parsed?: Json | null
          rule_text: string
          sales_target?: number | null
          start_date: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          ai_processing_enabled?: boolean | null
          campaign_id?: string
          company_id?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          journey_type?: number
          name?: string
          notification_types?: string[] | null
          processing_mode?: string | null
          rule_parsed?: Json | null
          rule_text?: string
          sales_target?: number | null
          start_date?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_logs: {
        Row: {
          ai_processing_enabled: boolean | null
          created_at: string | null
          file_path: string | null
          file_size: number | null
          filename: string
          id: string
          mime_type: string | null
          original_filename: string
          processed_at: string | null
          processing_errors: Json | null
          processing_summary: Json | null
          rows_failed: number | null
          rows_processed: number | null
          rows_total: number | null
          schedule_id: string | null
          status: string | null
          total_amount: number | null
          upload_type: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          ai_processing_enabled?: boolean | null
          created_at?: string | null
          file_path?: string | null
          file_size?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          original_filename: string
          processed_at?: string | null
          processing_errors?: Json | null
          processing_summary?: Json | null
          rows_failed?: number | null
          rows_processed?: number | null
          rows_total?: number | null
          schedule_id?: string | null
          status?: string | null
          total_amount?: number | null
          upload_type?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          ai_processing_enabled?: boolean | null
          created_at?: string | null
          file_path?: string | null
          file_size?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          original_filename?: string
          processed_at?: string | null
          processing_errors?: Json | null
          processing_summary?: Json | null
          rows_failed?: number | null
          rows_processed?: number | null
          rows_total?: number | null
          schedule_id?: string | null
          status?: string | null
          total_amount?: number | null
          upload_type?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upload_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "participants_campaigns_view"
            referencedColumns: ["schedule_id"]
          },
          {
            foreignKeyName: "upload_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      employee_campaigns_history: {
        Row: {
          active_campaigns: number | null
          avg_progress: number | null
          campaigns_details: Json | null
          email: string | null
          employee_id: string | null
          employee_name: string | null
          last_campaign_date: string | null
          phone: string | null
          total_campaigns: number | null
          total_sales: number | null
        }
        Relationships: []
      }
      participants_campaigns_view: {
        Row: {
          campaign_end: string | null
          campaign_id: string | null
          campaign_name: string | null
          campaign_period_status: string | null
          campaign_start: string | null
          campaign_status: string | null
          campaign_target: number | null
          current_progress: number | null
          email: string | null
          employee_id: string | null
          journey_type: number | null
          participant_active: boolean | null
          participant_created_at: string | null
          participant_id: string | null
          participant_name: string | null
          participant_updated_at: string | null
          phone: string | null
          progress_percentage: number | null
          schedule_id: string | null
          target_amount: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      recalculate_schedule_rankings: {
        Args: { p_schedule_id: string }
        Returns: undefined
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
