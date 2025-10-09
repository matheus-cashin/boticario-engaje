
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportMetrics as ReportMetricsType } from "@/hooks/useReportsData";
import { TrendingUp, Users, Target, Award } from "lucide-react";

interface ReportMetricsProps {
  metrics: ReportMetricsType;
}

export function ReportMetrics({ metrics }: ReportMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const metricCards = [
    {
      title: "Total de Campanhas",
      value: formatNumber(metrics.totalCampaigns),
      subtitle: `${metrics.activeCampaigns} ativas`,
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Total de Participantes",
      value: formatNumber(metrics.totalParticipants),
      subtitle: `Média de ${metrics.averageParticipationRate.toFixed(1)} por campanha`,
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Volume Total de Vendas",
      value: formatCurrency(metrics.totalSalesAmount),
      subtitle: "Todas as campanhas",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Melhor Campanha",
      value: metrics.topPerformingCampaign?.name || "N/A",
      subtitle: metrics.topPerformingCampaign 
        ? formatCurrency(metrics.topPerformingCampaign.amount)
        : "Nenhuma campanha",
      icon: Award,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-5 w-5 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
