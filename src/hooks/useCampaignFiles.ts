
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { uploadCampaignFile } from "@/services/campaignFileService";

export function useCampaignFiles() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async(
    file: File, 
    scheduleId: string, 
    fileType: 'rules' | 'sales' = 'rules'
  ) => {
    // Validar arquivo
    const allowedTypes = fileType === 'rules' 
      ? ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      : ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    
    if (!allowedTypes.includes(file.type)) {
      const typeDescription = fileType === 'rules' 
        ? "PDF, DOC, DOCX ou TXT" 
        : "Excel (.xlsx, .xls) ou CSV";
      
      toast({
        title: "Arquivo não suportado",
        description: `Por favor, envie um arquivo ${typeDescription}.`,
        variant: "destructive",
      });
      return { success: false };
    }

    const maxSize = fileType === 'rules' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB para regras, 50MB para vendas
    if (file.size > maxSize) {
      const sizeLimit = fileType === 'rules' ? "10MB" : "50MB";
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${sizeLimit}.`,
        variant: "destructive",
      });
      return { success: false };
    }

    setIsUploading(true);
    
    try {
      const result = await uploadCampaignFile(file, scheduleId, fileType);
      
      if (result.success) {
        toast({
          title: "Upload realizado com sucesso!",
          description: `Arquivo ${file.name} foi enviado e está sendo processado.`,
        });
        
        // Invalidar queries para atualizar listas
        queryClient.invalidateQueries({ queryKey: ["recent-uploads"] });
        queryClient.invalidateQueries({ queryKey: ["campaign-files", scheduleId] });
        queryClient.invalidateQueries({ queryKey: ["schedules"] });
      } else {
        toast({
          title: "Erro no upload",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    handleFileUpload
  };
}
