
import { useToast } from "@/hooks/use-toast";
import { ruleStorageService } from "@/services/ruleStorage";
import { aiAgentsService } from "@/services/aiAgentsService";
import { fileConverter } from "@/utils/fileConverter";
import { ruleErrorHandler } from "@/utils/ruleErrorHandler";
import { RuleRawRecord } from "@/types/rules";
import { supabase } from "@/integrations/supabase/client";

export function createRulesProcessingService(toast: ReturnType<typeof useToast>['toast']) {
  const processWithAI = async (file: File, campaignId: string, campaignName: string, isCorrection: boolean, ruleId?: string) => {
    try {
      // Atualizar status para processing se tiver ruleId
      if (ruleId) {
        await ruleStorageService.updateRuleStatus(ruleId, 'processing');
      }

      // Ler conteúdo do arquivo
      const fileText = await file.text();
      
      // Processar com AI Agent
      const result = await aiAgentsService.processRuleText(
        fileText,
        campaignId,
        campaignName,
        ruleId || ''
      );

      const summary = result.processedSummary || result.analysis || 
                     `Regras da campanha "${campaignName}" processadas com sucesso por AI.\n\n• Arquivo: ${file.name}\n• Data: ${new Date().toLocaleDateString()}\n• Status: Processado por IA`;

      // Atualizar banco se tiver ruleId
      if (ruleId) {
        await ruleStorageService.updateRuleStatus(ruleId, 'completed', { summary });
      }

      // Salvar o resumo na coluna rule_text da tabela schedules
      // Nota: campaignId aqui é na verdade o schedules.id (UUID), não o campaign_id (string)
      try {
        const { error: updateError } = await supabase
          .from('schedules')
          .update({ rule_text: summary })
          .eq('id', campaignId);
        
        if (updateError) {
          console.error('⚠️ Erro ao atualizar rule_text em schedules:', updateError);
        } else {
          console.log('✅ rule_text atualizado em schedules com sucesso');
        }
      } catch (updateError) {
        console.error('⚠️ Erro ao atualizar schedules:', updateError);
      }

      toast({
        title: isCorrection ? "Regra corrigida" : "Regra processada",
        description: `As regras foram ${isCorrection ? 'atualizadas' : 'processadas'} com sucesso pela IA.`,
      });

      return { summary, result };

    } catch (error) {
      console.error('❌ Erro no processamento com AI:', error);
      
      const errorMessage = ruleErrorHandler.getErrorMessage(error);

      // Atualizar status de erro se tiver ruleId
      if (ruleId) {
        const retryCount = 1;
        await ruleStorageService.updateRuleStatus(ruleId, 'failed', { 
          errorMessage, 
          retryCount 
        });
      }

      throw error;
    }
  };

  const processFileUpload = async (
    file: File, 
    campaignId: string, 
    campaignName: string, 
    isCorrection: boolean,
    currentRuleRecord: RuleRawRecord | null,
    setters: {
      setCurrentRuleRecord: (record: RuleRawRecord) => void;
      setHasRules: (hasRules: boolean) => void;
      setRulesSummary: (summary: string) => void;
      setIsUploading: (uploading: boolean) => void;
    }
  ) => {
    setters.setIsUploading(true);
    
    try {
      console.log('📤 Iniciando processamento de upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        campaignId,
        campaignName,
        isCorrection
      });

      // Converter arquivo para base64 de forma segura
      const base64String = await fileConverter.toBase64(file);
      console.log('✅ Arquivo convertido para base64 com sucesso');

      // Validar se o base64 está correto
      if (!fileConverter.validateBase64(base64String)) {
        throw new Error('Erro na conversão do arquivo para base64');
      }

      // Salvar no Supabase
      const ruleData = await ruleStorageService.saveRuleRecord(
        campaignId,
        campaignName,
        file,
        base64String,
        isCorrection
      );

      setters.setCurrentRuleRecord(ruleData);
      setters.setHasRules(true);

      // Processar com AI
      const { summary } = await processWithAI(file, campaignId, campaignName, isCorrection, ruleData.id);
      setters.setRulesSummary(summary);

    } catch (error) {
      console.error('❌ Erro no processamento do upload:', error);
      
      const errorMessage = ruleErrorHandler.getErrorMessage(error);

      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setters.setIsUploading(false);
      ruleErrorHandler.clearFileInputs();
    }
  };

  return {
    processWithAI,
    processFileUpload
  };
}
