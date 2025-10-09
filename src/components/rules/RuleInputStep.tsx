
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface RuleInputStepProps {
  ruleText: string;
  setRuleText: (text: string) => void;
  isProcessing: boolean;
  hasExistingRule: boolean;
  isUploading: boolean;
  onSubmit: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

export function RuleInputStep({
  ruleText,
  setRuleText,
  isProcessing,
  hasExistingRule,
  isUploading,
  onSubmit,
  onFileUpload,
  onClose
}: RuleInputStepProps) {
  return (
    <>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          {hasExistingRule ? 'Atualizar as regras da sua campanha' : 'Digite as regras da sua campanha'}
        </label>
        <Textarea
          value={ruleText}
          onChange={(e) => setRuleText(e.target.value)}
          placeholder="Descreva as regras da campanha, critérios de apuração, metas, premiações, etc..."
          className="min-h-[200px]"
          disabled={isProcessing}
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onSubmit}
          disabled={isProcessing || !ruleText.trim()}
          className="flex-1"
        >
          {isProcessing ? "Processando..." : hasExistingRule ? "Atualizar Regras" : "Processar Regras"}
        </Button>

        <div className="flex gap-2">
          <label htmlFor="rules-upload" className="cursor-pointer">
            <Button 
              variant="outline" 
              size="sm"
              disabled={isUploading}
              asChild
            >
              <span>
                <Upload className="h-4 w-4" />
              </span>
            </Button>
          </label>
          <Input
            id="rules-upload"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={onFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </>
  );
}
