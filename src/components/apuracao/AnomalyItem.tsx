import { AlertTriangle, XCircle, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnomalyItemProps {
  line: number;
  field: string;
  value: string;
  type: string;
  description: string;
  severity: "warning" | "error";
}

export function AnomalyItem({ line, field, value, type, description, severity }: AnomalyItemProps) {
  const Icon = severity === "error" ? XCircle : AlertTriangle;
  const bgColor = severity === "error" ? "bg-red-50" : "bg-yellow-50";
  const borderColor = severity === "error" ? "border-red-200" : "border-yellow-200";
  const iconColor = severity === "error" ? "text-red-500" : "text-yellow-600";

  return (
    <div className={`p-4 border rounded-lg ${bgColor} ${borderColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={`h-5 w-5 mt-0.5 ${iconColor}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-900">Linha {line}</p>
              <Badge variant="outline" className="text-xs">
                {field}
              </Badge>
            </div>
            <p className="text-sm text-gray-700 mb-1">{description}</p>
            <p className="text-sm font-mono text-gray-600 bg-white px-2 py-1 rounded inline-block">
              {value}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
