
import { Badge } from "@/components/ui/badge";

interface CreditStatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileId?: string;
}

export function CreditStatusBadge({ status, fileId }: CreditStatusBadgeProps) {
  const getCreditStatus = () => {
    if (status === 'failed') return "Sem saldo";
    if (status === 'pending' || status === 'processing') return "Pendente";
    if (status === 'completed') {
      // Para demonstração: primeiro arquivo mostra "Distribuído", outros "Pendente"
      if (fileId === '9987621b-9278-439a-81dc-1f32dc07e160') {
        return "Distribuído";
      }
      return "Pendente";
    }
    return "Pendente";
  };

  const creditStatus = getCreditStatus();

  const creditConfig = {
    "Pendente": "bg-cashin-yellow/10 text-cashin-yellow border-cashin-yellow/20",
    "Distribuído": "bg-cashin-green/10 text-cashin-green border-cashin-green/20",
    "Sem saldo": "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Badge
      variant="outline"
      className={creditConfig[creditStatus as keyof typeof creditConfig]}
    >
      {creditStatus}
    </Badge>
  );
}
