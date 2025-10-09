
import { companyRulesService } from "@/services/companyRulesService";
import { ruleStorageService } from "@/services/ruleStorage";
import { CompanyRule } from "@/types/companyRules";

interface UseRuleLoaderProps {
  setCurrentRuleId: (id: string | null) => void;
  setCurrentRule: (rule: CompanyRule | null) => void;
  setRuleText: (text: string) => void;
  setProcessedSummary: (summary: string) => void;
  setIsApplied: (applied: boolean) => void;
  setHasExistingRule: (hasRule: boolean) => void;
  setStep: (step: 'input' | 'processing' | 'confirmation') => void;
}

export function useRuleLoader({
  setCurrentRuleId,
  setCurrentRule,
  setRuleText,
  setProcessedSummary,
  setIsApplied,
  setHasExistingRule,
  setStep
}: UseRuleLoaderProps) {

  const loadExistingRule = async (campaignId: string) => {
    try {
      // Primeiro tentar buscar na nova tabela company_rules
      let existingRule = await companyRulesService.getLatestRuleForCampaign(campaignId);
      
      // Se não encontrar na company_rules, buscar na rule_raw para compatibilidade
      if (!existingRule) {
        const ruleRawRecord = await ruleStorageService.loadExistingRules(campaignId);
        
        if (ruleRawRecord && ruleRawRecord.processing_status === 'completed') {
          // Converter rule_raw para formato CompanyRule para compatibilidade
          const convertedRule: CompanyRule = {
            id: ruleRawRecord.id,
            company_id: null,
            campaign_id: ruleRawRecord.campaign_id,
            campaign_name: ruleRawRecord.campaign_name,
            rule_text: ruleRawRecord.file_content,
            rule_json: null,
            file_name: ruleRawRecord.file_name,
            file_size: ruleRawRecord.file_size,
            file_type: ruleRawRecord.file_type,
            status: 'completed',
            processed_at: ruleRawRecord.last_retry_at,
            error_message: ruleRawRecord.error_message,
            created_at: ruleRawRecord.created_at,
            updated_at: ruleRawRecord.updated_at
          };
          
          setCurrentRuleId(ruleRawRecord.id);
          setCurrentRule(convertedRule);
          setRuleText(ruleRawRecord.file_content);
          setProcessedSummary(ruleRawRecord.processed_summary || ruleRawRecord.file_content);
          setIsApplied(true);
          setHasExistingRule(true);
          setStep('confirmation');
          return;
        }
      } else {
        setCurrentRuleId(existingRule.id);
        setCurrentRule(existingRule);
        setRuleText(existingRule.rule_text);
        
        // Se tem rule_json, mostrar o JSON formatado, senão mostrar o texto da regra
        if (existingRule.rule_json) {
          setProcessedSummary(JSON.stringify(existingRule.rule_json, null, 2));
        } else {
          setProcessedSummary(existingRule.rule_text);
        }
        
        setIsApplied(true);
        setHasExistingRule(true);
        setStep('confirmation');
        return;
      }
      
      setHasExistingRule(false);
      setStep('input');
    } catch (error) {
      console.error('❌ Erro ao carregar regra existente:', error);
      setStep('input');
    }
  };

  return {
    loadExistingRule
  };
}
