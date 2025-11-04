import { Progress } from "@/components/ui/progress";

interface ConfidenceBarProps {
  confidence: number;
}

export function ConfidenceBar({ confidence }: ConfidenceBarProps) {
  const getColor = () => {
    if (confidence >= 90) return "bg-cashin-green";
    if (confidence >= 70) return "bg-cashin-yellow";
    return "bg-destructive";
  };

  const getLabel = () => {
    if (confidence >= 90) return "Alta";
    if (confidence >= 70) return "Média";
    return "Baixa";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Confiança: {getLabel()}</span>
        <span className="font-semibold">{confidence}%</span>
      </div>
      <div className="relative">
        <Progress value={confidence} className="h-2" />
        <div
          className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getColor()}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}
