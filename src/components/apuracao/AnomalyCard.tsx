import { AlertTriangle, TrendingUp, TrendingDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnomalyCardProps {
  participantName: string;
  field: string;
  value: string;
  type: "outlier_positive" | "outlier_negative" | "suspicious";
  description: string;
  onAction: (action: "keep" | "review" | "exclude") => void;
}

export function AnomalyCard({
  participantName,
  field,
  value,
  type,
  description,
  onAction,
}: AnomalyCardProps) {
  const getTypeConfig = () => {
    switch (type) {
      case "outlier_positive":
        return {
          icon: TrendingUp,
          label: "Outlier Positivo",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "outlier_negative":
        return {
          icon: TrendingDown,
          label: "Outlier Negativo",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      case "suspicious":
        return {
          icon: HelpCircle,
          label: "Suspeito",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div
      className={`p-4 border rounded-lg ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">{participantName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {field}
                </Badge>
                <span className="text-sm font-mono font-semibold text-gray-700">
                  {value}
                </span>
              </div>
            </div>
            <Badge variant="outline" className={`${config.color}`}>
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-700">{description}</p>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction("keep")}
              className="text-green-600 hover:bg-green-50"
            >
              Manter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction("review")}
              className="text-blue-600 hover:bg-blue-50"
            >
              Revisar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction("exclude")}
              className="text-red-600 hover:bg-red-50"
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
