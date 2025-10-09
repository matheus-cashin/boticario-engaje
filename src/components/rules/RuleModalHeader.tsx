
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { CompanyRule } from "@/types/companyRules";

interface RuleModalHeaderProps {
  step: 'input' | 'processing' | 'confirmation';
  campaignName: string;
  hasExistingRule: boolean;
  currentRule: CompanyRule | null;
}

export function RuleModalHeader({ step, campaignName, hasExistingRule, currentRule }: RuleModalHeaderProps) {
  const getStepTitle = () => {
    switch (step) {
      case 'input':
        return hasExistingRule ? 'Atualizar Regras da Campanha' : 'Definir Regras da Campanha';
      case 'processing':
        return 'Processando Regras';
      case 'confirmation':
        return 'Regras da Campanha';
      default:
        return 'Definir Regras da Campanha';
    }
  };

  const getStatusBadge = () => {
    if (!currentRule) return null;

    const statusConfig: Record<string, { variant: "secondary" | "default" | "destructive"; label: string; className?: string }> = {
      pending: { variant: "secondary", label: "Pendente" },
      processing: { variant: "default", label: "Processando" },
      completed: { variant: "default", label: "Ativa", className: "bg-green-100 text-green-800" },
      failed: { variant: "destructive", label: "Erro" }
    };

    const config = statusConfig[currentRule.status];
    
    return (
      <Badge variant={config.variant} className={config.className || ""}>
        {config.label}
      </Badge>
    );
  };

  return (
    <DialogHeader>
      <div className="flex items-center justify-between">
        <DialogTitle>
          {getStepTitle()} - {campaignName}
        </DialogTitle>
        {getStatusBadge()}
      </div>
      {currentRule && (
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mt-2">
            <FileText className="h-4 w-4" />
            <span>
              Criada em: {new Date(currentRule.created_at).toLocaleString()}
            </span>
          </div>
          {currentRule.file_name && (
            <div className="text-xs mt-1">
              Arquivo: {currentRule.file_name} ({currentRule.file_size ? Math.round(currentRule.file_size / 1024) : 0} KB)
            </div>
          )}
        </div>
      )}
    </DialogHeader>
  );
}
