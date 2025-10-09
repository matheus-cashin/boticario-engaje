
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, ArrowLeft, Trash2 } from "lucide-react";
import { CompanyRule } from "@/types/companyRules";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { RuleSummaryDisplay } from "./RuleSummaryDisplay";

interface RuleConfirmationStepProps {
  processedSummary: string;
  currentRule: CompanyRule | null;
  isDeleting: boolean;
  onCorrection: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function RuleConfirmationStep({
  processedSummary,
  currentRule,
  isDeleting,
  onCorrection,
  onDelete,
  onClose
}: RuleConfirmationStepProps) {
  return (
    <>
      <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
        <Check className="h-5 w-5 text-green-600" />
        <span className="text-sm font-medium text-green-800">
          Esta é a regra vigente da campanha
        </span>
      </div>

      {currentRule?.rule_json && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800 mb-2">
            ✨ Regra interpretada em JSON - Pronta para uso!
          </p>
          <p className="text-xs text-blue-600">
            O JSON pode ser usado diretamente pelo sistema de processamento.
          </p>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Resumo das Regras Vigentes
        </label>
        <div className="bg-muted/50 p-4 rounded-lg border min-h-[200px] max-h-[400px] overflow-y-auto">
          {currentRule?.rule_json ? (
            <RuleSummaryDisplay ruleJson={currentRule.rule_json} />
          ) : processedSummary ? (
            <MarkdownRenderer 
              content={processedSummary}
              className="text-sm text-gray-700"
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              Resumo das regras processadas aparecerá aqui...
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCorrection}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Alterar Regra</span>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              disabled={isDeleting}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir regra da campanha?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A regra vigente da campanha será removida permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sim, excluir regra
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          onClick={onClose}
          className="flex-1"
        >
          Confirmar e Fechar
        </Button>
      </div>
    </>
  );
}
