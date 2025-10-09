import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "pending" | "processing" | "completed" | "error";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return { label: "Concluído", className: "bg-green-100 text-green-800" };
      case "processing":
        return { label: "Processando", className: "bg-blue-100 text-blue-800" };
      case "error":
        return { label: "Erro", className: "bg-red-100 text-red-800" };
      default:
        return { label: "Pendente", className: "bg-yellow-100 text-yellow-800" };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
