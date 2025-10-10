
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Brain } from "lucide-react";

interface RuleProcessingStepProps {
  ruleText: string;
  onClose: () => void;
}

export function RuleProcessingStep({ ruleText, onClose }: RuleProcessingStepProps) {
  return (
    <div className="space-y-4">
      <div className="relative p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 rounded-lg border border-blue-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-blue-400/10 animate-pulse" />
        <div className="relative flex items-center justify-center space-x-4">
          <div className="relative">
            <Brain className="h-8 w-8 text-purple-600 animate-pulse" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-blue-500 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-purple-800 mb-1">
              Processando com Inteligência Artificial
            </p>
            <p className="text-sm text-blue-700">
              Nossa IA está interpretando as regras da campanha...
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Isso pode levar alguns instantes
            </p>
          </div>
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
