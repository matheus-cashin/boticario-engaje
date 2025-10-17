
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Target } from "lucide-react";

interface GoalAchievementData {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

interface GoalAchievementChartProps {
  data: {
    id: string;
    name: string;
    participantCount: number;
    completionRate: number;
  }[];
}

export function GoalAchievementChart({ data }: GoalAchievementChartProps) {
  // Calcular distribuição de atingimento de meta
  const calculateGoalDistribution = (): GoalAchievementData[] => {
    const ranges = [
      { label: "0-25%", min: 0, max: 25, color: "#ef4444" },
      { label: "25-50%", min: 25, max: 50, color: "#f97316" },
      { label: "50-75%", min: 50, max: 75, color: "#eab308" },
      { label: "75-100%", min: 75, max: 100, color: "#3b82f6" },
      { label: "100%+", min: 100, max: Infinity, color: "#22c55e" }
    ];

    const totalCampaigns = data.length;

    return ranges.map(range => {
      const count = data.filter(campaign =>
        campaign.completionRate >= range.min && campaign.completionRate < range.max
      ).length;

      const percentage = totalCampaigns > 0 ? (count / totalCampaigns) * 100 : 0;

      return {
        range: range.label,
        count,
        percentage: Math.round(percentage * 10) / 10,
        color: range.color
      };
    });
  };

  const chartData = calculateGoalDistribution();
  const totalCampaigns = data.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Taxa de Atingimento de Meta
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição de campanhas por nível de conclusão ({totalCampaigns} campanhas)
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12 }}
              label={{
                value: 'Faixa de Atingimento',
                position: 'insideBottom',
                offset: -10,
                style: { fontSize: 14, fontWeight: 500 }
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: 'Número de Campanhas',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fontSize: 14, fontWeight: 500, textAnchor: 'middle' }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "12px"
              }}
              formatter={(value: number, name: string, props: any) => {
                const percentage = props.payload.percentage;
                return [
                  `${value} campanhas (${percentage}%)`,
                  'Quantidade'
                ];
              }}
            />
            <Bar
              dataKey="count"
              radius={[8, 8, 0, 0]}
              name="Campanhas"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legenda com insights */}
        <div className="mt-4 grid grid-cols-5 gap-2 text-xs">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex flex-col">
                <span className="font-medium">{item.range}</span>
                <span className="text-muted-foreground">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
