import { ArrowUpRight, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down";
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const MetricCard = ({ title, value, subtitle, trend, icon, className = "", onClick }: MetricCardProps) => {
  return (
    <Card 
      className={`p-6 rounded-3xl shadow-card hover:shadow-lg transition-all duration-300 cursor-pointer group ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="opacity-60 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-medium">
            {trend === 'up' ? '+5.2%' : '-2.1%'} from last month
          </span>
        </div>
      )}
    </Card>
  );
};

export default MetricCard;
