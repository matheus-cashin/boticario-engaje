
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
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <Check className="h-3 w-3 mr-1" />
          Ativa
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Processando
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
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
