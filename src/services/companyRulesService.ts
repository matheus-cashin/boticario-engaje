
import { supabase } from "@/integrations/supabase/client";
import { CompanyRule } from "@/types/companyRules";

export const companyRulesService = {
  async createRule(
    scheduleId: string,
    campaignName: string,
    ruleText: string,
    fileName?: string,
    fileSize?: number,
    fileType?: string,
    companyId?: string
  ): Promise<CompanyRule> {
    // Buscar o campaign_id (string) a partir do scheduleId (UUID)
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .select('campaign_id')
      .eq('id', scheduleId)
      .single();

    if (scheduleError || !schedule) {
      console.error('❌ Erro ao buscar schedule:', scheduleError);
      throw new Error(`Schedule não encontrado: ${scheduleError?.message}`);
    }

    console.log('🏢 Criando regra na tabela company_rules:', {
      scheduleId,
      campaignId: schedule.campaign_id,
      campaignName,
      ruleTextLength: ruleText.length,
      fileName,
      fileSize,
      fileType,
      companyId
    });

    const { data, error } = await supabase
      .from('company_rules')
      .insert({
        schedule_id: scheduleId,
        campaign_id: schedule.campaign_id,
        campaign_name: campaignName,
        rule_text: ruleText,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        company_id: companyId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar regra:', error);
      throw new Error(`Erro ao salvar regra: ${error.message}`);
    }

    console.log('✅ Regra criada com sucesso:', data.id);
    return data as CompanyRule;
  },

  async updateRuleStatus(
    ruleId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    updates?: {
      rule_json?: any;
      error_message?: string;
      processed_at?: string;
    }
  ): Promise<void> {
    console.log('🔄 Atualizando status da regra:', {
      ruleId,
      status,
      updates
    });

    const updateData: any = { status };
    
    if (updates?.rule_json) updateData.rule_json = updates.rule_json;
    if (updates?.error_message) updateData.error_message = updates.error_message;
    if (updates?.processed_at) updateData.processed_at = updates.processed_at;
    if (status === 'completed') updateData.processed_at = new Date().toISOString();

    const { error } = await supabase
      .from('company_rules')
      .update(updateData)
      .eq('id', ruleId);

    if (error) {
      console.error('❌ Erro ao atualizar status da regra:', error);
      throw new Error(`Erro ao atualizar regra: ${error.message}`);
    }

    console.log('✅ Status da regra atualizado com sucesso');
  },

  async getRulesBySchedule(scheduleId: string): Promise<CompanyRule[]> {
    console.log('🔍 Buscando regras para schedule:', scheduleId);

    const { data, error } = await supabase
      .from('company_rules')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar regras:', error);
      return [];
    }

    console.log('✅ Regras encontradas:', data?.length || 0);
    return data as CompanyRule[];
  },

  async getLatestRuleForSchedule(scheduleId: string): Promise<CompanyRule | null> {
    console.log('🔍 Buscando regra mais recente para schedule:', scheduleId);

    const { data, error } = await supabase
      .from('company_rules')
      .select('*')
      .eq('schedule_id', scheduleId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Erro ao buscar regra mais recente:', error);
      return null;
    }

    const rule = data?.[0] as CompanyRule || null;
    console.log('✅ Regra mais recente:', rule?.id || 'Nenhuma encontrada');
    return rule;
  },

  async deleteRule(ruleId: string): Promise<void> {
    console.log('🗑️ Excluindo regra:', ruleId);

    const { error } = await supabase
      .from('company_rules')
      .delete()
      .eq('id', ruleId);

    if (error) {
      console.error('❌ Erro ao excluir regra:', error);
      throw new Error(`Erro ao excluir regra: ${error.message}`);
    }

    console.log('✅ Regra excluída com sucesso');
  }
};
