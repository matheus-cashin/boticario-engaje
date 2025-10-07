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
      campanhas: {
        Row: {
          budget_total: number | null
          created_at: string | null
          created_by: string | null
          descricao: string | null
          empresa_id: string
          id: string
          nome: string
          periodo_fim: string
          periodo_inicio: string
          status: string | null
          tipo: string
          updated_at: string | null
          vagas: number | null
        }
        Insert: {
          budget_total?: number | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          nome: string
          periodo_fim: string
          periodo_inicio: string
          status?: string | null
          tipo: string
          updated_at?: string | null
          vagas?: number | null
        }
        Update: {
          budget_total?: number | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          periodo_fim?: string
          periodo_inicio?: string
          status?: string | null
          tipo?: string
          updated_at?: string | null
          vagas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campanhas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "gerentes_campanha"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campanhas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      disparos_whatsapp: {
        Row: {
          campanha_id: string | null
          created_at: string | null
          criado_por: string | null
          data_agendamento: string | null
          data_envio: string | null
          empresa_id: string
          id: string
          mensagem: string
          publico_alvo: Json | null
          status: string | null
          tipo: string | null
          total_destinatarios: number | null
          total_enviado: number | null
          total_erro: number | null
          updated_at: string | null
        }
        Insert: {
          campanha_id?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_agendamento?: string | null
          data_envio?: string | null
          empresa_id: string
          id?: string
          mensagem: string
          publico_alvo?: Json | null
          status?: string | null
          tipo?: string | null
          total_destinatarios?: number | null
          total_enviado?: number | null
          total_erro?: number | null
          updated_at?: string | null
        }
        Update: {
          campanha_id?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_agendamento?: string | null
          data_envio?: string | null
          empresa_id?: string
          id?: string
          mensagem?: string
          publico_alvo?: Json | null
          status?: string | null
          tipo?: string | null
          total_destinatarios?: number | null
          total_enviado?: number | null
          total_erro?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disparos_whatsapp_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disparos_whatsapp_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "gerentes_campanha"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disparos_whatsapp_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string
          created_at: string | null
          id: string
          nome: string
          plataforma_cashin_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string | null
          id?: string
          nome: string
          plataforma_cashin_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string | null
          id?: string
          nome?: string
          plataforma_cashin_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gerentes_campanha: {
        Row: {
          created_at: string | null
          email: string
          empresa_id: string
          id: string
          nome: string
          papel: string | null
          senha_hash: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          empresa_id: string
          id?: string
          nome: string
          papel?: string | null
          senha_hash: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          empresa_id?: string
          id?: string
          nome?: string
          papel?: string | null
          senha_hash?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gerentes_campanha_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_venda: {
        Row: {
          created_at: string | null
          id: string
          produto_id: string
          quantidade: number
          valor_total: number
          valor_unitario: number
          venda_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          produto_id: string
          quantidade: number
          valor_total: number
          valor_unitario: number
          venda_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          produto_id?: string
          quantidade?: number
          valor_total?: number
          valor_unitario?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_venda_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_venda_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_auditoria: {
        Row: {
          acao: string
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          empresa_id: string | null
          entidade: string
          entidade_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          usuario_id: string | null
          usuario_tipo: string | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          empresa_id?: string | null
          entidade: string
          entidade_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          usuario_id?: string | null
          usuario_tipo?: string | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          empresa_id?: string | null
          entidade?: string
          entidade_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          usuario_id?: string | null
          usuario_tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_auditoria_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      participacoes: {
        Row: {
          atingimento: number | null
          campanha_id: string
          created_at: string | null
          data_pagamento: string | null
          dias_ativo: number | null
          empresa_id: string
          id: string
          meta: number
          posicao: number | null
          premiacao_confirmada: number | null
          premiacao_paga: boolean | null
          premiacao_prevista: number | null
          primeira_venda_em: string | null
          realizado: number | null
          status: string | null
          ultima_venda_em: string | null
          updated_at: string | null
          vendedor_id: string
        }
        Insert: {
          atingimento?: number | null
          campanha_id: string
          created_at?: string | null
          data_pagamento?: string | null
          dias_ativo?: number | null
          empresa_id: string
          id?: string
          meta: number
          posicao?: number | null
          premiacao_confirmada?: number | null
          premiacao_paga?: boolean | null
          premiacao_prevista?: number | null
          primeira_venda_em?: string | null
          realizado?: number | null
          status?: string | null
          ultima_venda_em?: string | null
          updated_at?: string | null
          vendedor_id: string
        }
        Update: {
          atingimento?: number | null
          campanha_id?: string
          created_at?: string | null
          data_pagamento?: string | null
          dias_ativo?: number | null
          empresa_id?: string
          id?: string
          meta?: number
          posicao?: number | null
          premiacao_confirmada?: number | null
          premiacao_paga?: boolean | null
          premiacao_prevista?: number | null
          primeira_venda_em?: string | null
          realizado?: number | null
          status?: string | null
          ultima_venda_em?: string | null
          updated_at?: string | null
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participacoes_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participacoes_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria: string | null
          codigo_externo: string
          created_at: string | null
          empresa_id: string
          id: string
          nome: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          codigo_externo: string
          created_at?: string | null
          empresa_id: string
          id?: string
          nome: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          codigo_externo?: string
          created_at?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      regras_campanha: {
        Row: {
          campanha_id: string
          created_at: string | null
          descricao_raw: string
          id: string
          interpretacao_ia: string | null
          logica_execucao: Json
          modelo_ia: string | null
          motivo_rejeicao: string | null
          prompt_ia_usado: string | null
          status: string | null
          updated_at: string | null
          validado_em: string | null
          validado_por: string | null
          versao: number | null
        }
        Insert: {
          campanha_id: string
          created_at?: string | null
          descricao_raw: string
          id?: string
          interpretacao_ia?: string | null
          logica_execucao: Json
          modelo_ia?: string | null
          motivo_rejeicao?: string | null
          prompt_ia_usado?: string | null
          status?: string | null
          updated_at?: string | null
          validado_em?: string | null
          validado_por?: string | null
          versao?: number | null
        }
        Update: {
          campanha_id?: string
          created_at?: string | null
          descricao_raw?: string
          id?: string
          interpretacao_ia?: string | null
          logica_execucao?: Json
          modelo_ia?: string | null
          motivo_rejeicao?: string | null
          prompt_ia_usado?: string | null
          status?: string | null
          updated_at?: string | null
          validado_em?: string | null
          validado_por?: string | null
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "regras_campanha_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_campanha_validado_por_fkey"
            columns: ["validado_por"]
            isOneToOne: false
            referencedRelation: "gerentes_campanha"
            referencedColumns: ["id"]
          },
        ]
      }
      snapshots_diarios: {
        Row: {
          atingimento: number
          created_at: string | null
          data_snapshot: string
          id: string
          participacao_id: string
          posicao: number | null
          realizado: number
          variacao_posicao: number | null
          vendas_do_dia: number | null
        }
        Insert: {
          atingimento: number
          created_at?: string | null
          data_snapshot: string
          id?: string
          participacao_id: string
          posicao?: number | null
          realizado: number
          variacao_posicao?: number | null
          vendas_do_dia?: number | null
        }
        Update: {
          atingimento?: number
          created_at?: string | null
          data_snapshot?: string
          id?: string
          participacao_id?: string
          posicao?: number | null
          realizado?: number
          variacao_posicao?: number | null
          vendas_do_dia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "snapshots_diarios_participacao_id_fkey"
            columns: ["participacao_id"]
            isOneToOne: false
            referencedRelation: "participacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          created_at: string | null
          data_sincronizacao: string | null
          data_venda: string
          empresa_id: string
          id: string
          origem: string | null
          pedido_externo_id: string
          valor_total: number
          vendedor_id: string
        }
        Insert: {
          created_at?: string | null
          data_sincronizacao?: string | null
          data_venda: string
          empresa_id: string
          id?: string
          origem?: string | null
          pedido_externo_id: string
          valor_total: number
          vendedor_id: string
        }
        Update: {
          created_at?: string | null
          data_sincronizacao?: string | null
          data_venda?: string
          empresa_id?: string
          id?: string
          origem?: string | null
          pedido_externo_id?: string
          valor_total?: number
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vendedores"
            referencedColumns: ["id"]
          },
        ]
      }
      vendedores: {
        Row: {
          cargo: string | null
          cluster: string | null
          cpf: string
          created_at: string | null
          id: string
          nome: string
          status: string | null
          telefone: string | null
          updated_at: string | null
          wallet_id: string | null
        }
        Insert: {
          cargo?: string | null
          cluster?: string | null
          cpf: string
          created_at?: string | null
          id?: string
          nome: string
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
          wallet_id?: string | null
        }
        Update: {
          cargo?: string | null
          cluster?: string | null
          cpf?: string
          created_at?: string | null
          id?: string
          nome?: string
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
          wallet_id?: string | null
        }
        Relationships: []
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
