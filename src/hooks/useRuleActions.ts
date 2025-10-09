
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { companyRulesService } from "@/services/companyRulesService";
import { supabase } from "@/integrations/supabase/client";
import { CompanyRule } from "@/types/companyRules";

interface UseRuleActionsProps {
  currentRuleId: string | null;
  setCurrentRuleId: (id: string | null) => void;
  setCurrentRule: (rule: CompanyRule | null) => void;
  setRuleText: (text: string) => void;
  setProcessedSummary: (summary: string) => void;
  setIsApplied: (applied: boolean) => void;
  setHasExistingRule: (hasRule: boolean) => void;
  setStep: (step: 'input' | 'processing' | 'confirmation') => void;
  setIsDeleting: (deleting: boolean) => void;
}

export function useRuleActions({
  currentRuleId,
  setCurrentRuleId,
  setCurrentRule,
  setRuleText,
  setProcessedSummary,
  setIsApplied,
  setHasExistingRule,
  setStep,
  setIsDeleting
}: UseRuleActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeleteRule = async () => {
    if (!currentRuleId) return;

    setIsDeleting(true);
    
    try {
      console.log('🗑️ Excluindo regra:', currentRuleId);
      
      // Excluir da tabela company_rules
      await companyRulesService.deleteRule(currentRuleId);

      // Também marcar como deletada na rule_raw (se existir)
      try {
        const { error: ruleRawError } = await supabase
          .from('rule_raw')
          .update({
            processing_status: 'failed',
            error_message: 'Regra excluída pelo usuário'
          })
          .eq('id', currentRuleId);

        if (ruleRawError) {
          console.log('⚠️ Aviso ao atualizar rule_raw:', ruleRawError);
        }
      } catch (ruleRawUpdateError) {
        console.log('⚠️ rule_raw não atualizada (pode não existir):', ruleRawUpdateError);
      }

      // Resetar estado
      setCurrentRuleId(null);
      setCurrentRule(null);
      setRuleText('');
      setProcessedSummary('');
      setIsApplied(false);
      setHasExistingRule(false);
      setStep('input');

      toast({
        title: "Regra excluída",
        description: "A regra da campanha foi excluída com sucesso.",
      });
      
      // Invalidar queries para atualizar UI
      queryClient.invalidateQueries({ queryKey: ["schedules"] });

    } catch (error) {
      console.error('❌ Erro ao excluir regra:', error);
      
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a regra.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCorrection = () => {
    console.log('🔄 Iniciando correção da regra');
    setStep('input');
    setIsApplied(false);
    setProcessedSummary('');
    // Manter o texto para edição e dados da regra existente
  };

  return {
    handleDeleteRule,
    handleCorrection
  };
}
