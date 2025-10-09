
import { useToast } from "@/hooks/use-toast";
import { fileValidator } from "@/utils/fileValidator";
import { useRulesState } from "@/hooks/useRulesState";
import { createRulesProcessingService } from "@/services/rulesProcessingService";
import { createRulesRetryService } from "@/services/rulesRetryService";
import { createRulesLoaderService } from "@/services/rulesLoaderService";

export function useRuleOperations(campaignId: string, campaignName: string) {
  const { toast } = useToast();
  
  const {
    rulesSummary,
    setRulesSummary,
    isUploading,
    setIsUploading,
    hasRules,
    setHasRules,
    currentRuleRecord,
    setCurrentRuleRecord,
    isRetrying,
    setIsRetrying
  } = useRulesState();

  const setters = {
    setCurrentRuleRecord,
    setHasRules,
    setRulesSummary,
    setIsUploading,
    setIsRetrying
  };

  const processingService = createRulesProcessingService(toast);
  const loaderService = createRulesLoaderService();
  const retryService = createRulesRetryService(toast, processingService.processWithAI);

  const loadExistingRules = async () => {
    await loaderService.loadExistingRules(campaignId, setters);
  };

  const processFileUpload = async (file: File, isCorrection: boolean) => {
    await processingService.processFileUpload(
      file, 
      campaignId, 
      campaignName, 
      isCorrection, 
      currentRuleRecord, 
      setters
    );
    
    // Recarregar regras após processamento
    await loadExistingRules();
  };

  const handleRetryProcessing = async () => {
    await retryService.handleRetryProcessing(currentRuleRecord, setters);
    // Recarregar regras após retry
    await loadExistingRules();
  };

  const validateFile = fileValidator.validate;

  return {
    rulesSummary,
    isUploading,
    hasRules,
    currentRuleRecord,
    isRetrying,
    loadExistingRules,
    processFileUpload,
    handleRetryProcessing,
    validateFile
  };
}
