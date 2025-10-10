
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { aiAgentsService } from "@/services/aiAgentsService";
import { companyRulesService } from "@/services/companyRulesService";
import { CompanyRule } from "@/types/companyRules";
import { supabase } from "@/integrations/supabase/client";

interface UseRuleSubmissionProps {
  ruleText: string;
  hasExistingRule: boolean;
  setIsProcessing: (processing: boolean) => void;
  setCurrentRuleId: (id: string | null) => void;
  setCurrentRule: (rule: CompanyRule | null) => void;
  setStep: (step: 'input' | 'processing' | 'confirmation') => void;
  setProcessedSummary: (summary: string) => void;
}

export function useRuleSubmission({
  ruleText,
  hasExistingRule,
  setIsProcessing,
  setCurrentRuleId,
  setCurrentRule,
  setStep,
  setProcessedSummary
}: UseRuleSubmissionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmitRuleText = async (campaignId: string, campaignName: string) => {
    if (!ruleText.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, digite a regra da campanha.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('📝 Iniciando processamento da regra:', {
        campaignId,
        campaignName,
        ruleTextLength: ruleText.length,
        isUpdate: hasExistingRule
      });

      // Salvar na nova tabela company_rules
      const ruleRecord = await companyRulesService.createRule(
        campaignId,
        campaignName,
        ruleText,
        'rule_text.txt',
        ruleText.length,
        'text/plain'
      );

      console.log('💾 Regra salva na tabela company_rules:', {
        ruleId: ruleRecord.id,
        status: ruleRecord.status
      });

      setCurrentRuleId(ruleRecord.id);
      setCurrentRule(ruleRecord);
      setStep('processing');

      // Atualizar status para processing
      await companyRulesService.updateRuleStatus(ruleRecord.id, 'processing');

      // Processar com AI Agent
      const result = await aiAgentsService.processRuleText(
        ruleText,
        campaignId,
        campaignName,
        ruleRecord.id
      );

      console.log('📤 Regra processada com AI Agent com sucesso');
      
      // Atualizar o resumo processado com o retorno da edge function
      if (result?.processedSummary) {
        setProcessedSummary(result.processedSummary);
        
        // Salvar o resumo na coluna rule_text da tabela schedules
        try {
          const { error: updateError } = await supabase
            .from('schedules')
            .update({ rule_text: result.processedSummary })
            .eq('campaign_id', campaignId);
          
          if (updateError) {
            console.error('⚠️ Erro ao atualizar rule_text em schedules:', updateError);
          } else {
            console.log('✅ rule_text atualizado em schedules com sucesso');
          }
        } catch (updateError) {
          console.error('⚠️ Erro ao atualizar schedules:', updateError);
        }
      }
      
      setIsProcessing(false);
      setStep('confirmation');
      
      // Invalidar queries para atualizar UI
      queryClient.invalidateQueries({ queryKey: ["schedules"] });

    } catch (error) {
      console.error('❌ Erro ao processar regra:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Não foi possível processar a regra.";
      
      if (setCurrentRuleId) {
        const currentRuleId = error instanceof Error && 'ruleId' in error ? (error as any).ruleId : null;
        if (currentRuleId) {
          await companyRulesService.updateRuleStatus(currentRuleId, 'failed', { 
            error_message: errorMessage 
          });
        }
      }

      setIsProcessing(false);
      setStep('input');

      toast({
        title: "Erro no processamento",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return {
    handleSubmitRuleText
  };
}
