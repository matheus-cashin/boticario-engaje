
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { MonthlyTrend } from "@/hooks/useReportsData";

interface MonthlyTrendsChartProps {
  data: MonthlyTrend[];
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  const chartConfig = {
    campaigns: {
      label: "Campanhas",
      color: "hsl(var(--primary))",
    },
    participants: {
      label: "Participantes",
      color: "hsl(var(--secondary))",
    },
    totalAmount: {
      label: "Volume de Vendas",
      color: "hsl(var(--accent))",
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendências Mensais</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="month"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => 
                  new Intl.NumberFormat('pt-BR', { 
                    notation: 'compact'
                  }).format(value)
                }
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => {
                      if (name === 'totalAmount') {
                        return [
                          new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(value as number),
                          'Volume de Vendas'
                        ];
                      }
                      return [value, name === 'campaigns' ? 'Campanhas' : 'Participantes'];
                    }}
                  />
                }
              />
              <Line 
                type="monotone" 
                dataKey="campaigns" 
                stroke="var(--color-campaigns)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="participants" 
                stroke="var(--color-participants)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
