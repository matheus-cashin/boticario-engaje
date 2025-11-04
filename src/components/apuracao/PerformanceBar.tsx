import { Progress } from "@/components/ui/progress";

interface PerformanceBarProps {
  label: string;
  target: number;
  current: number;
  percentage: number;
}

export function PerformanceBar({ label, target, current, percentage }: PerformanceBarProps) {
  const getColor = () => {
    if (percentage >= 100) return "bg-cashin-green";
    if (percentage >= 80) return "bg-cashin-yellow";
    return "bg-destructive";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium text-foreground">{label}</span>
        <span className={`font-bold ${percentage >= 100 ? 'text-cashin-green' : 'text-muted-foreground'}`}>
          {percentage}%
        </span>
      </div>
      <div className="relative">
        <Progress value={Math.min(percentage, 100)} className="h-3" />
        <div
          className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Meta: R$ {target.toLocaleString('pt-BR')}</span>
        <span>Atual: R$ {current.toLocaleString('pt-BR')}</span>
      </div>
    </div>
  );
}
