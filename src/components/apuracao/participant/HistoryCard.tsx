import { TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HistoryItem {
  campaign: string;
  period: string;
  averagePerformance: number;
  prize: number;
}

interface HistoryCardProps {
  history: HistoryItem[];
  trend: "up" | "stable" | "down";
}

export function HistoryCard({ history, trend }: HistoryCardProps) {
  const getTrendConfig = () => {
    switch (trend) {
      case "up":
        return {
          icon: TrendingUp,
          label: "Crescente",
          color: "bg-green-100 text-green-800",
        };
      case "down":
        return {
          icon: TrendingDown,
          label: "Decrescente",
          color: "bg-red-100 text-red-800",
        };
      default:
        return {
          icon: Minus,
          label: "Estável",
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  const trendConfig = getTrendConfig();
  const TrendIcon = trendConfig.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Histórico</CardTitle>
          <Badge variant="outline" className={trendConfig.color}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {trendConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.campaign}</h4>
                <p className="text-sm text-gray-600">{item.period}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <span className="text-xs text-gray-600">Performance:</span>
                    <span className="ml-1 font-semibold text-gray-900">
                      {item.averagePerformance}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Prêmio:</span>
                    <span className="ml-1 font-semibold text-green-600">
                      R$ {item.prize.toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mini Sparkline Placeholder */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Tendência de Performance</p>
          <div className="flex items-end justify-between h-16 gap-1">
            {history.reverse().map((item, index) => (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                style={{ height: `${(item.averagePerformance / 200) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
