
import { useToast } from "@/hooks/use-toast";
import { ruleStorageService } from "@/services/ruleStorage";
import { fileConverter } from "@/utils/fileConverter";
import { ruleErrorHandler } from "@/utils/ruleErrorHandler";
import { RuleRawRecord } from "@/types/rules";

export function createRulesRetryService(
  toast: ReturnType<typeof useToast>['toast'],
  sendToN8n: (file: File, campaignId: string, campaignName: string, isCorrection: boolean, ruleId?: string) => Promise<any>
) {
  const handleRetryProcessing = async (
    currentRuleRecord: RuleRawRecord | null,
    setters: {
      setIsRetrying: (retrying: boolean) => void;
      setRulesSummary: (summary: string) => void;
    }
  ) => {
    if (!currentRuleRecord) return;

    setters.setIsRetrying(true);
    
    try {
      console.log('🔄 Iniciando nova tentativa para regra:', currentRuleRecord.id);

      // Buscar dados do arquivo
      const fileData = await ruleStorageService.getRuleFileData(currentRuleRecord.id);

      // Validar dados antes de tentar reconstruir o arquivo
      if (!fileData.file_content) {
        throw new Error('Dados do arquivo não encontrados');
      }

      console.log('📊 Dados do arquivo recuperados:', {
        contentLength: fileData.file_content.length,
        fileName: fileData.file_name,
        fileType: fileData.file_type
      });

      // Reconstruir arquivo a partir do base64
      const file = fileConverter.fromBase64ToFile(
        fileData.file_content,
        fileData.file_name,
        fileData.file_type
      );

      console.log('📁 Arquivo reconstruído para nova tentativa:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Tentar enviar novamente usando as propriedades corretas do record
      const { summary } = await sendToN8n(
        file, 
        currentRuleRecord.campaign_id, 
        currentRuleRecord.campaign_name, 
        currentRuleRecord.is_correction, 
        currentRuleRecord.id
      );
      
      setters.setRulesSummary(summary);

    } catch (error) {
      console.error('❌ Erro na nova tentativa:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Não foi possível reprocessar as regras.";
      
      toast({
        title: "Erro na nova tentativa",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setters.setIsRetrying(false);
    }
  };

  return {
    handleRetryProcessing
  };
}
