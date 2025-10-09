import { supabase } from "@/integrations/supabase/client";

export const aiAgentsService = {
  async processRuleText(
    ruleText: string,
    campaignId: string,
    campaignName: string,
    ruleId: string
  ) {
    console.log('🤖 Enviando regra para AI Agent:', {
      campaignId,
      campaignName,
      ruleId,
      ruleLength: ruleText.length,
    });

    const { data, error } = await supabase.functions.invoke('ai-rule-processor', {
      body: {
        ruleText,
        campaignId,
        campaignName,
        ruleId,
      },
    });

    if (error) {
      console.error('❌ Erro ao processar regra com AI:', error);
      throw error;
    }

    console.log('✅ Regra processada com sucesso:', data);
    return data;
  },

  async analyzeFileData(
    fileId: string,
    campaignId: string,
    campaignName: string
  ) {
    console.log('🤖 Enviando arquivo para análise AI:', {
      fileId,
      campaignId,
      campaignName,
    });

    const { data, error } = await supabase.functions.invoke('ai-data-analyzer', {
      body: {
        fileId,
        campaignId,
        campaignName,
      },
    });

    if (error) {
      console.error('❌ Erro ao analisar arquivo com AI:', error);
      throw error;
    }

    console.log('✅ Arquivo analisado com sucesso:', data);
    return data;
  },

  async consultCampaign(message: string, campaignId: string) {
    console.log('🤖 Consultando AI sobre campanha:', {
      campaignId,
      message: message.substring(0, 100),
    });

    const { data, error } = await supabase.functions.invoke('ai-campaign-consultant', {
      body: {
        message,
        campaignId,
      },
    });

    if (error) {
      console.error('❌ Erro ao consultar AI:', error);
      throw error;
    }

    console.log('✅ Resposta recebida da AI');
    return data;
  },

  async calculatePrizesAndRanking(
    salesData: any[],
    ruleJson: any,
    campaignId: string,
    campaignName: string
  ) {
    console.log('🎯 Enviando para apurador:', {
      campaignId,
      campaignName,
      totalRows: salesData.length,
    });

    const { data, error } = await supabase.functions.invoke('ai-apurador', {
      body: {
        salesData,
        ruleJson,
        campaignId,
        campaignName,
      },
    });

    if (error) {
      console.error('❌ Erro no apurador:', error);
      throw error;
    }

    console.log('✅ Apuração concluída com sucesso');
    return data;
  },
};
