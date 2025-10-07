import { Card } from "@/components/ui/card";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

interface ComparisonItem {
  name: string;
  value: number;
  percentage: number;
  trend: "up" | "down";
  subtitle?: string;
}

interface ComparisonChartProps {
  title: string;
  data: ComparisonItem[];
  valuePrefix?: string;
}

const ComparisonChart = ({ title, data, valuePrefix = "" }: ComparisonChartProps) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <Card className="p-6 rounded-3xl shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Ver todos
        </button>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium mb-1">{item.name}</p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold">{valuePrefix}{item.value.toFixed(1)}%</p>
                  <div className={`flex items-center gap-1 text-xs ${item.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                    {item.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{item.percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  index === 0 ? 'bg-success' : index === 1 ? 'bg-info' : 'bg-warning'
                }`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ComparisonChart;