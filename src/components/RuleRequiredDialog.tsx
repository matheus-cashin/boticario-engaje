import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { companyRulesService } from "@/services/companyRulesService";
import { useToast } from "@/hooks/use-toast";

interface RuleRequiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  campaignName: string;
  onRuleCreated: () => void;
  onOpenRulesModal?: () => void;
}

export function RuleRequiredDialog({
  isOpen,
  onClose,
  scheduleId,
  campaignName,
  onRuleCreated,
  onOpenRulesModal,
}: RuleRequiredDialogProps) {
  const [ruleText, setRuleText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!ruleText.trim()) {
      toast({
        title: "Regra obrigatória",
        description: "Por favor, insira o texto da regra da campanha.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await companyRulesService.createRule(
        scheduleId,
        campaignName,
        ruleText,
        'rule_text.txt',
        ruleText.length,
        'text/plain'
      );

      toast({
        title: "Regra criada com sucesso",
        description: "A regra foi salva e você pode continuar com o upload.",
      });

      setRuleText("");
      onRuleCreated();
      onClose();
    } catch (error) {
      console.error("Erro ao criar regra:", error);
      toast({
        title: "Erro ao criar regra",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRulesModal = () => {
    onClose();
    // Chamar o callback para abrir o RulesModal principal
    onOpenRulesModal?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Regra da Campanha Necessária
          </DialogTitle>
          <DialogDescription>
            Esta campanha ainda não possui regras cadastradas. É necessário definir
            as regras antes de fazer upload de arquivos de vendas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Digite ou cole o texto da regra:
            </label>
            <Textarea
              placeholder="Ex: A campanha contempla vendas de produtos X, Y e Z no período de DD/MM/AAAA a DD/MM/AAAA. Prêmios para vendedores que atingirem..."
              value={ruleText}
              onChange={(e) => setRuleText(e.target.value)}
              className="min-h-[200px]"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Descreva as regras da campanha, incluindo período, produtos elegíveis,
              metas e premiações.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleOpenRulesModal}
              disabled={isSubmitting}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Abrir Gerenciador de Regras
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !ruleText.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Regra"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
