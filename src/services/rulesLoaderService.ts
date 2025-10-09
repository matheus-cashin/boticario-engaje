
import { ruleStorageService } from "@/services/ruleStorage";
import { RuleRawRecord } from "@/types/rules";

export function createRulesLoaderService() {
  const loadExistingRules = async (
    campaignId: string,
    setters: {
      setCurrentRuleRecord: (record: RuleRawRecord | null) => void;
      setHasRules: (hasRules: boolean) => void;
      setRulesSummary: (summary: string) => void;
    }
  ) => {
    try {
      const ruleRecord = await ruleStorageService.loadExistingRules(campaignId);
      
      if (ruleRecord) {
        setters.setCurrentRuleRecord(ruleRecord);
        setters.setHasRules(true);

        if (ruleRecord.processed_summary) {
          setters.setRulesSummary(ruleRecord.processed_summary);
        } else if (ruleRecord.processing_status === 'failed' && ruleRecord.error_message) {
          setters.setRulesSummary(`Erro no processamento: ${ruleRecord.error_message}`);
        } else if (ruleRecord.processing_status === 'pending' || ruleRecord.processing_status === 'processing') {
          setters.setRulesSummary('Regras carregadas, aguardando processamento...');
        }
      } else {
        setters.setHasRules(false);
        setters.setCurrentRuleRecord(null);
        setters.setRulesSummary("");
      }
    } catch (error) {
      console.error('Erro ao carregar regras:', error);
    }
  };

  return {
    loadExistingRules
  };
}
