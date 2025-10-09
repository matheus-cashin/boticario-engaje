
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { CampaignPerformance } from "@/hooks/useReportsData";

interface CampaignPerformanceChartProps {
  data: CampaignPerformance[];
}

export function CampaignPerformanceChart({ data }: CampaignPerformanceChartProps) {
  const chartData = data.slice(0, 10).map(campaign => ({
    name: campaign.name.length > 15 
      ? campaign.name.substring(0, 15) + '...'
      : campaign.name,
    fullName: campaign.name,
    amount: campaign.totalAmount,
    participants: campaign.participantCount,
    completion: campaign.completionRate
  }));

  const chartConfig = {
    amount: {
      label: "Volume de Vendas",
      color: "hsl(var(--primary))",
    },
    participants: {
      label: "Participantes",
      color: "hsl(var(--secondary))",
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Campanha (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => 
                  new Intl.NumberFormat('pt-BR', { 
                    notation: 'compact',
                    style: 'currency',
                    currency: 'BRL'
                  }).format(value)
                }
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => {
                      if (name === 'amount') {
                        return [
                          new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(value as number),
                          'Volume de Vendas'
                        ];
                      }
                      return [value, 'Participantes'];
                    }}
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.name === label);
                      return item?.fullName || label;
                    }}
                  />
                }
              />
              <Bar 
                dataKey="amount" 
                fill="var(--color-amount)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
