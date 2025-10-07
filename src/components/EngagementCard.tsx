import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface EngagementCardProps {
  title: string;
  value: number;
  target?: number;
  subtitle: string;
  icon: LucideIcon;
  color: "success" | "warning" | "info" | "danger";
}

const EngagementCard = ({ title, value, target, subtitle, icon: Icon, color }: EngagementCardProps) => {
  const percentage = target ? (value / target) * 100 : value;
  
  const colorClasses = {
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    info: "text-info bg-info/10",
    danger: "text-danger bg-danger/10",
  };

  return (
    <Card className="p-6 rounded-3xl shadow-card hover:shadow-lg transition-all duration-300 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{value.toFixed(1)}%</p>
            {target && (
              <span className="text-sm text-muted-foreground">/ {target}%</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-2xl ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      {target && (
        <div className="space-y-2">
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {percentage > 100 ? 'Meta superada!' : `${(100 - percentage).toFixed(1)}% para meta`}
          </p>
        </div>
      )}
    </Card>
  );
};

export default EngagementCard;