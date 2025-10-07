import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DistributionItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface DistributionChartProps {
  title: string;
  data: DistributionItem[];
}

const DistributionChart = ({ title, data }: DistributionChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6 rounded-3xl shadow-card">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{item.value} vendedores</span>
                <span className="font-semibold min-w-[50px] text-right">{item.percentage}%</span>
              </div>
            </div>
            <Progress 
              value={item.percentage} 
              className="h-2"
              style={{
                // @ts-ignore
                '--progress-background': `hsl(var(--${item.color}))`
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total de vendedores</span>
          <span className="font-bold">{total}</span>
        </div>
      </div>
    </Card>
  );
};

export default DistributionChart;