
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
    "Pendente": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Distribuído": "bg-green-100 text-green-800 border-green-200",
    "Sem saldo": "bg-red-100 text-red-800 border-red-200",
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
