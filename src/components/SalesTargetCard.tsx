import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

const SalesTargetCard = () => {
  const target = 29234.06;
  const current = 5412.44;
  const percentage = (current / target) * 100;

  return (
    <Card className="p-6 rounded-3xl shadow-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Your sales targets</p>
          <p className="text-2xl font-bold">$ {target.toLocaleString()}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="relative h-3 bg-secondary rounded-full overflow-hidden mb-3">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-success rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          $ {current.toLocaleString()} <span className="text-xs">left</span>
        </span>
        <span className="font-medium">{percentage.toFixed(1)}%</span>
      </div>
    </Card>
  );
};

export default SalesTargetCard;
