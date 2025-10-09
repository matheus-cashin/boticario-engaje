import { supabase } from "@/integrations/supabase/client";
import { RuleRawRecord } from "@/types/rules";
import { companyRulesService } from "@/services/companyRulesService";

export const ruleStorageService = {
  async loadExistingRules(campaignId: string): Promise<RuleRawRecord | null> {
    console.log('🔍 Carregando regras existentes para campanha:', campaignId);
    
    const { data, error } = await supabase
      .from('rule_raw')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erro ao carregar regras:', error);
      return null;
    }

    if (data && data.length > 0) {
      const ruleRecord = data[0] as RuleRawRecord;
      console.log('✅ Regras carregadas:', ruleRecord);
      return ruleRecord;
    }

    return null;
  },

  async saveRuleRecord(
    campaignId: string,
    campaignName: string,
    file: File,
    base64Content: string,
    isCorrection: boolean
  ): Promise<RuleRawRecord> {
    console.log('💾 Salvando regra em ambas as tabelas...');

    // Salvar na tabela rule_raw (compatibilidade)
    const { data: ruleData, error: ruleError } = await supabase
      .from('rule_raw')
      .insert({
        campaign_id: campaignId,
        campaign_name: campaignName,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_content: base64Content,
        processing_status: 'pending',
        is_correction: isCorrection,
        retry_count: 0
      })
      .select()
      .single();

    if (ruleError) {
      console.error('❌ Erro ao salvar no rule_raw:', ruleError);
      throw new Error(`Erro ao salvar regra: ${ruleError.message}`);
    }

    console.log('💾 Regra salva no rule_raw:', ruleData.id);

    // Também salvar na nova tabela company_rules
    try {
      await companyRulesService.createRule(
        campaignId,
        campaignName,
        base64Content, // Salvar o conteúdo do arquivo como texto da regra
        file.name,
        file.size,
        file.type
      );
      console.log('💾 Regra também salva em company_rules');
    } catch (error) {
      console.error('⚠️ Erro ao salvar em company_rules (continuando):', error);
    }

    return ruleData as RuleRawRecord;
  },

  async saveRuleTextRecord(
    campaignId: string,
    campaignName: string,
    ruleText: string
  ): Promise<RuleRawRecord> {
    console.log('💾 Salvando regra de texto em ambas as tabelas...');

    // Salvar na tabela rule_raw (compatibilidade)
    const { data: ruleData, error: ruleError } = await supabase
      .from('rule_raw')
      .insert({
        campaign_id: campaignId,
        campaign_name: campaignName,
        file_name: 'rule_text.txt',
        file_size: ruleText.length,
        file_type: 'text/plain',
        file_content: ruleText,
        processing_status: 'pending',
        is_correction: false,
        retry_count: 0
      })
      .select()
      .single();

    if (ruleError) {
      console.error('❌ Erro ao salvar regra de texto no rule_raw:', ruleError);
      throw new Error(`Erro ao salvar regra: ${ruleError.message}`);
    }

    console.log('💾 Regra de texto salva no rule_raw:', ruleData.id);

    // Também salvar na nova tabela company_rules
    try {
      await companyRulesService.createRule(
        campaignId,
        campaignName,
        ruleText,
        'rule_text.txt',
        ruleText.length,
        'text/plain'
      );
      console.log('💾 Regra de texto também salva em company_rules');
    } catch (error) {
      console.error('⚠️ Erro ao salvar em company_rules (continuando):', error);
    }

    return ruleData as RuleRawRecord;
  },

  async updateRuleStatus(
    ruleId: string, 
    status: 'processing' | 'completed' | 'failed',
    data?: { summary?: string; errorMessage?: string; retryCount?: number }
  ): Promise<void> {
    const updateData: any = { 
      processing_status: status,
      last_retry_at: new Date().toISOString()
    };

    if (data?.summary) updateData.processed_summary = data.summary;
    if (data?.errorMessage) updateData.error_message = data.errorMessage;
    if (data?.retryCount !== undefined) updateData.retry_count = data.retryCount;

    await supabase
      .from('rule_raw')
      .update(updateData)
      .eq('id', ruleId);
  },

  async getRuleFileData(ruleId: string) {
    const { data, error } = await supabase
      .from('rule_raw')
      .select('file_content, file_name, file_type, file_size')
      .eq('id', ruleId)
      .single();

    if (error || !data) {
      throw new Error('Arquivo não encontrado no banco de dados');
    }

    return data;
  }
};
