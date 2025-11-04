import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "pending" | "processing" | "completed" | "error";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return { label: "Concluído", className: "bg-cashin-green/10 text-cashin-green border-cashin-green/20" };
      case "processing":
        return { label: "Processando", className: "bg-primary/10 text-primary border-primary/20" };
      case "error":
        return { label: "Erro", className: "bg-destructive/10 text-destructive border-destructive/20" };
      default:
        return { label: "Pendente", className: "bg-cashin-yellow/10 text-cashin-yellow border-cashin-yellow/20" };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
