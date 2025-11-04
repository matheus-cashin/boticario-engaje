
import { Badge } from "@/components/ui/badge";
import { Check, Clock, AlertCircle } from "lucide-react";

interface RuleStatusBadgeProps {
  hasRule: boolean;
  status?: 'completed' | 'processing' | 'failed';
}

export function RuleStatusBadge({ hasRule, status }: RuleStatusBadgeProps) {
  if (!hasRule) {
    return null;
  }

  switch (status) {
    case 'completed':
      return (
        <Badge variant="secondary" className="bg-cashin-green/10 text-cashin-green border-cashin-green/20">
          <Check className="h-3 w-3 mr-1" />
          Ativa
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="secondary" className="bg-cashin-yellow/10 text-cashin-yellow border-cashin-yellow/20">
          <Clock className="h-3 w-3 mr-1" />
          Processando
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          Erro
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          Configurada
        </Badge>
      );
  }
}
