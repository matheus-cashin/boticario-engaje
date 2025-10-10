
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCampaignFiles } from "@/hooks/useCampaignFiles";
import { useToast } from "@/hooks/use-toast";
import { FileUploadArea } from "@/components/upload/FileUploadArea";
import { UploadProgressBar } from "@/components/upload/UploadProgressBar";
import { RuleRequiredDialog } from "@/components/RuleRequiredDialog";
import { ArrowRight, AlertCircle } from "lucide-react";
import { companyRulesService } from "@/services/companyRulesService";
import { ruleStorageService } from "@/services/ruleStorage";
import { getCampaignFile } from "@/services/campaignFileService";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  campaignName: string;
  onUploadSuccess: () => void;
  onOpenRulesModal?: () => void;
}

export function UploadModal({ 
  isOpen, 
  onClose, 
  scheduleId, 
  campaignName, 
  onUploadSuccess,
  onOpenRulesModal 
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRuleRequired, setShowRuleRequired] = useState(false);
  const [hasRule, setHasRule] = useState<boolean | null>(null);
  const [isCheckingRule, setIsCheckingRule] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('pending');
  const { isUploading, handleFileUpload } = useCampaignFiles();
  const { toast } = useToast();
  const navigate = useNavigate();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar regra quando o modal abre
  useEffect(() => {
    if (isOpen) {
      checkCampaignRule();
    }
  }, [isOpen, scheduleId]);

  // Polling do status do arquivo após upload
  useEffect(() => {
    if (uploadedFileId && isProcessing) {
      console.log('🔄 Iniciando polling do status do arquivo:', uploadedFileId);
      
      const pollFileStatus = async () => {
        try {
          const fileData = await getCampaignFile(uploadedFileId);
          
          if (fileData) {
            console.log('📊 Status do arquivo:', fileData.status);
            setProcessingStatus(fileData.status);
            
            // Atualizar progresso baseado no status
            if (fileData.status === 'processing') {
              setUploadProgress(prev => Math.min(prev + 2, 95));
            } else if (fileData.status === 'completed') {
              setUploadProgress(100);
              setIsProcessing(false);
              
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              
              toast({
                title: "Processamento concluído!",
                description: "Arquivo processado com sucesso. Você pode visualizar a análise.",
              });
            } else if (fileData.status === 'failed') {
              setIsProcessing(false);
              
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              
              toast({
                title: "Erro no processamento",
                description: fileData.error_message || "Ocorreu um erro ao processar o arquivo.",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      };
      
      // Poll imediatamente
      pollFileStatus();
      
      // Depois poll a cada 2 segundos
      pollingIntervalRef.current = setInterval(pollFileStatus, 2000);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [uploadedFileId, isProcessing]);

  const checkCampaignRule = async () => {
    setIsCheckingRule(true);
    try {
      // Verificar em ambas as tabelas
      const companyRule = await companyRulesService.getLatestRuleForSchedule(scheduleId);
      const ruleRaw = await ruleStorageService.loadExistingRules(scheduleId);

      const hasValidRule = (companyRule && companyRule.status === 'completed') || 
                          (ruleRaw && ruleRaw.processing_status === 'completed');

      console.log('🔍 Verificação de regra:', {
        scheduleId,
        hasCompanyRule: !!companyRule,
        hasRuleRaw: !!ruleRaw,
        hasValidRule
      });

      setHasRule(hasValidRule);
    } catch (error) {
      console.error('Erro ao verificar regra:', error);
      setHasRule(false);
    } finally {
      setIsCheckingRule(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadedFileId(null);
      console.log('Arquivo selecionado:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
  };

  const handleUpload = async () => {
    // Verificar regra antes de fazer upload
    if (hasRule === false) {
      setShowRuleRequired(true);
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para fazer upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setUploadProgress(10);
      setProcessingStatus('pending');

      const result = await handleFileUpload(selectedFile, scheduleId, 'sales');

      if (result.success && result.fileId) {
        console.log('✅ Upload realizado com sucesso, fileId:', result.fileId);
        setUploadProgress(30);
        setUploadedFileId(result.fileId);
        
        toast({
          title: "Upload realizado",
          description: "Arquivo enviado. Aguarde enquanto nossa IA processa os dados...",
        });

        onUploadSuccess();
        // O polling agora irá monitorar o progresso via useEffect
      } else {
        setIsProcessing(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Erro durante upload:', error);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleGoToAnalysis = () => {
    if (uploadedFileId && processingStatus === 'completed') {
      navigate(`/apuracao/analyze/${uploadedFileId}`);
      handleClose();
    }
  };

  const handleClose = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setSelectedFile(null);
    setUploadedFileId(null);
    setUploadProgress(0);
    setIsProcessing(false);
    setHasRule(null);
    setProcessingStatus('pending');
    onClose();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadedFileId(null);
    console.log('Arquivo removido da seleção');
  };

  const handleRuleCreated = () => {
    checkCampaignRule();
    setShowRuleRequired(false);
  };

  const handleOpenRulesModalFromDialog = () => {
    setShowRuleRequired(false);
    handleClose();
    onOpenRulesModal?.();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload de Arquivo de Vendas</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {isCheckingRule ? (
              <div className="text-center py-4 text-muted-foreground">
                Verificando regras da campanha...
              </div>
            ) : hasRule === false ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-900">Regra necessária</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Esta campanha precisa ter regras cadastradas antes de fazer upload de arquivos.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRuleRequired(true)}
                      className="mt-3"
                    >
                      Cadastrar Regra
                    </Button>
                  </div>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="py-8">
                <UploadProgressBar progress={uploadProgress} />
              </div>
            ) : !uploadedFileId ? (
              <>
                <div className="text-sm text-muted-foreground">
                  Envie o arquivo Excel com os dados de vendas. O sistema processará automaticamente 
                  e identificará as colunas.
                </div>

                <FileUploadArea
                  selectedFile={selectedFile}
                  onFileSelect={handleFileSelect}
                  onRemoveFile={removeFile}
                />

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleClose} disabled={isUploading || isProcessing}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleUpload} 
                    disabled={!selectedFile || isUploading || isProcessing || !hasRule}
                  >
                    {isUploading ? "Enviando..." : "Fazer Upload"}
                  </Button>
                </div>
              </>
            ) : processingStatus !== 'completed' && processingStatus !== 'failed' ? (
              <div className="py-8">
                <UploadProgressBar progress={uploadProgress} />
              </div>
            ) : (
              <>
                <div className="text-center space-y-4 py-4">
                  {processingStatus === 'completed' ? (
                    <>
                      <div className="text-green-600 text-lg font-medium">
                        ✓ Processamento concluído!
                      </div>
                      <div className="text-sm text-muted-foreground">
                        O arquivo foi processado com sucesso. Clique em "Ir para Análise" para visualizar os resultados.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-red-600 text-lg font-medium">
                        ✗ Erro no processamento
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ocorreu um erro ao processar o arquivo. Por favor, tente novamente.
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {processingStatus === 'completed' && (
                    <Button 
                      onClick={handleGoToAnalysis}
                      className="w-full gap-2"
                    >
                      Ir para Análise
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={handleClose}
                    className="w-full"
                  >
                    Fechar
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <RuleRequiredDialog
        isOpen={showRuleRequired}
        onClose={() => setShowRuleRequired(false)}
        scheduleId={scheduleId}
        campaignName={campaignName}
        onRuleCreated={handleRuleCreated}
        onOpenRulesModal={handleOpenRulesModalFromDialog}
      />
    </>
  );
}
