
import { Badge } from "@/components/ui/badge";

interface FileStatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

export function FileStatusBadge({ status, errorMessage }: FileStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "PENDENTE",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    processing: {
      label: "PROCESSANDO",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    completed: {
      label: "APURADO",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    failed: {
      label: "ERRO",
      className: "bg-red-100 text-red-800 border-red-200",
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
