
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { companyRulesService } from "@/services/companyRulesService";
import { useRulePolling } from "./useRulePolling";
import { useRuleState } from "./useRuleState";
import { useRuleLoader } from "./useRuleLoader";
import { useRuleSubmission } from "./useRuleSubmission";
import { useRuleActions } from "./useRuleActions";

export function useRuleTextModal(campaignId: string, campaignName: string) {
  const { toast } = useToast();
  
  const {
    step,
    ruleText,
    processedSummary,
    isProcessing,
    isApplied,
    currentRuleId,
    currentRule,
    hasExistingRule,
    isDeleting,
    setStep,
    setRuleText,
    setProcessedSummary,
    setIsProcessing,
    setIsApplied,
    setCurrentRuleId,
    setCurrentRule,
    setHasExistingRule,
    setIsDeleting,
    resetState
  } = useRuleState();

  const { loadExistingRule } = useRuleLoader({
    setCurrentRuleId,
    setCurrentRule,
    setRuleText,
    setProcessedSummary,
    setIsApplied,
    setHasExistingRule,
    setStep
  });

  const { handleSubmitRuleText } = useRuleSubmission({
    ruleText,
    hasExistingRule,
    setIsProcessing,
    setCurrentRuleId,
    setCurrentRule,
    setStep,
    setProcessedSummary
  });

  const { handleDeleteRule, handleCorrection } = useRuleActions({
    currentRuleId,
    setCurrentRuleId,
    setCurrentRule,
    setRuleText,
    setProcessedSummary,
    setIsApplied,
    setHasExistingRule,
    setStep,
    setIsDeleting
  });

  const { isPolling } = useRulePolling({
    ruleId: currentRuleId,
    isActive: step === 'processing',
    onCompleted: (summary) => {
      console.log('✅ Processamento concluído com sucesso:', {
        ruleId: currentRuleId,
        summaryLength: summary.length,
        summaryPreview: summary.substring(0, 100) + '...'
      });
      
      setProcessedSummary(summary);
      setIsApplied(true);
      setHasExistingRule(true);
      setStep('confirmation');
      setIsProcessing(false);
      
      // Atualizar regra com o resumo processado
      if (currentRuleId) {
        companyRulesService.updateRuleStatus(currentRuleId, 'completed', {
          processed_at: new Date().toISOString()
        });
      }
      
      toast({
        title: "Regra processada",
        description: "A regra foi processada com sucesso pelo n8n.",
      });
    },
    onFailed: (error) => {
      console.error('❌ Processamento falhou:', {
        ruleId: currentRuleId,
        error
      });
      
      setIsProcessing(false);
      setStep('input');
      
      // Atualizar regra com erro
      if (currentRuleId) {
        companyRulesService.updateRuleStatus(currentRuleId, 'failed', {
          error_message: error
        });
      }
      
      toast({
        title: "Erro no processamento",
        description: error,
        variant: "destructive",
      });
    }
  });

  const wrappedHandleSubmitRuleText = () => handleSubmitRuleText(campaignId, campaignName);
  const wrappedLoadExistingRule = () => loadExistingRule(campaignId);

  return {
    step,
    ruleText,
    setRuleText,
    processedSummary,
    isProcessing: isProcessing || isPolling,
    isApplied,
    hasExistingRule,
    isDeleting,
    currentRule,
    handleSubmitRuleText: wrappedHandleSubmitRuleText,
    handleCorrection,
    handleDeleteRule,
    resetModal: resetState,
    loadExistingRule: wrappedLoadExistingRule
  };
}
