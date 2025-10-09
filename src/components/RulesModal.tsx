
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useRuleTextModal } from "@/hooks/useRuleTextModal";
import { useCampaignFiles } from "@/hooks/useCampaignFiles";
import { RuleModalHeader } from "./rules/RuleModalHeader";
import { RuleInputStep } from "./rules/RuleInputStep";
import { RuleProcessingStep } from "./rules/RuleProcessingStep";
import { RuleConfirmationStep } from "./rules/RuleConfirmationStep";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignName: string;
  onRuleApproved?: () => void;
}

export function RulesModal({ isOpen, onClose, campaignId, campaignName, onRuleApproved }: RulesModalProps) {
  const {
    step,
    ruleText,
    setRuleText,
    processedSummary,
    isProcessing,
    hasExistingRule,
    isDeleting,
    currentRule,
    handleSubmitRuleText,
    handleCorrection,
    handleDeleteRule,
    resetModal,
    loadExistingRule
  } = useRuleTextModal(campaignId, campaignName);

  const { isUploading, handleFileUpload } = useCampaignFiles();

  useEffect(() => {
    if (isOpen) {
      // Força recarregamento sempre que abrir o modal
      console.log('🔄 Modal aberto, carregando regra existente...');
      loadExistingRule();
    } else {
      resetModal();
    }
  }, [isOpen]);

  const handleFileUploadWrapper = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await handleFileUpload(file, campaignId, 'rules');
    
    // Limpar input
    event.target.value = '';
    
    // Recarregar regra após upload
    setTimeout(() => {
      loadExistingRule();
    }, 1000);
  };

  const handleClose = () => {
    // Se há regra completada, notificar
    if (currentRule?.status === 'completed' && onRuleApproved) {
      onRuleApproved();
    }
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <RuleModalHeader
          step={step}
          campaignName={campaignName}
          hasExistingRule={hasExistingRule}
          currentRule={currentRule}
        />

        <div className="space-y-4">
          {step === 'input' && (
            <RuleInputStep
              ruleText={ruleText}
              setRuleText={setRuleText}
              isProcessing={isProcessing}
              hasExistingRule={hasExistingRule}
              isUploading={isUploading}
              onSubmit={handleSubmitRuleText}
              onFileUpload={handleFileUploadWrapper}
              onClose={handleClose}
            />
          )}

          {step === 'processing' && (
            <RuleProcessingStep
              ruleText={ruleText}
              onClose={handleClose}
            />
          )}

          {step === 'confirmation' && (
            <RuleConfirmationStep
              processedSummary={processedSummary}
              currentRule={currentRule}
              isDeleting={isDeleting}
              onCorrection={handleCorrection}
              onDelete={handleDeleteRule}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
