import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

const PerformanceOverview = () => {
  const metrics = [
    {
      label: "Taxa de Atingimento Média",
      value: 87.5,
      target: 100,
      trend: "up" as const,
      change: "+12.3%",
      icon: Target,
    },
    {
      label: "Participação Ativa",
      value: 78.2,
      target: 100,
      trend: "up" as const,
      change: "+5.4%",
      icon: Activity,
    },
    {
      label: "Crescimento PoP",
      value: 15.8,
      target: 20,
      trend: "up" as const,
      change: "+15.8%",
      icon: TrendingUp,
    },
  ];

  return (
    <Card className="p-6 rounded-3xl shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Desempenho Geral</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Período:</span>
          <select className="text-sm font-medium bg-transparent border-none focus:outline-none cursor-pointer">
            <option>Este mês</option>
            <option>Último trimestre</option>
            <option>Este ano</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Icon className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">{metric.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Meta: {metric.target}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{metric.value}%</p>
                  <div className={`flex items-center gap-1 text-xs ${
                    metric.trend === 'up' ? 'text-success' : 'text-danger'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{metric.change}</span>
                  </div>
                </div>
              </div>
              <Progress value={(metric.value / metric.target) * 100} className="h-2" />
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-2xl bg-success/5">
            <p className="text-xs text-muted-foreground mb-1">Receita Realizada</p>
            <p className="text-xl font-bold text-success">R$ 2.87M</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Meta Total</p>
            <p className="text-xl font-bold">R$ 3.28M</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PerformanceOverview;