
import { Badge } from "@/components/ui/badge";

interface FileStatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

export function FileStatusBadge({ status, errorMessage }: FileStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "PENDENTE",
      className: "bg-cashin-yellow/10 text-cashin-yellow border-cashin-yellow/20",
    },
    processing: {
      label: "PROCESSANDO",
      className: "bg-primary/10 text-primary border-primary/20",
    },
    completed: {
      label: "APURADO",
      className: "bg-cashin-green/10 text-cashin-green border-cashin-green/20",
    },
    failed: {
      label: "ERRO",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
  };

  return (
    <div>
      <Badge
        variant="outline"
        className={statusConfig[status].className}
      >
        {statusConfig[status].label}
      </Badge>
      {errorMessage && (
        <div className="text-xs text-red-500 mt-1" title={errorMessage}>
          {errorMessage.substring(0, 50)}...
        </div>
      )}
    </div>
  );
}
