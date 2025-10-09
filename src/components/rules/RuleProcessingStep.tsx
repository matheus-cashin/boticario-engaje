
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";

interface RuleProcessingStepProps {
  ruleText: string;
  onClose: () => void;
}

export function RuleProcessingStep({ ruleText, onClose }: RuleProcessingStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-3 p-8 bg-blue-50 rounded-lg border border-blue-200">
        <Clock className="h-6 w-6 text-blue-600 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-medium text-blue-800">
            Processando regras da campanha...
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Aguarde enquanto o n8n processa as regras. Isso pode levar alguns minutos.
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Texto da regra enviado para processamento
        </label>
        <Textarea
          value={ruleText}
          disabled
          className="min-h-[150px] bg-muted/50"
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose}>
          Fechar e Aguardar em Background
        </Button>
      </div>
    </div>
  );
}
