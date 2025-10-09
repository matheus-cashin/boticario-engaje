import { CheckCircle, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CategoryPerformance {
  percentage: number;
  achieved: boolean;
}

interface LevelPerformance {
  level: string;
  coffee: CategoryPerformance;
  filter: CategoryPerformance;
}

interface PerformanceCardProps {
  campaignName: string;
  period: string;
  performance: LevelPerformance[];
  averageAchievement: number;
  ranking: {
    position: number;
    total: number;
  };
}

export function PerformanceCard({
  campaignName,
  period,
  performance,
  averageAchievement,
  ranking,
}: PerformanceCardProps) {
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 150) return "from-yellow-400 to-orange-500";
    if (percentage >= 100) return "from-green-400 to-green-600";
    if (percentage >= 80) return "from-blue-400 to-blue-600";
    return "from-gray-400 to-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance na Campanha</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm text-gray-600">{campaignName}</p>
              <span>•</span>
              <p className="text-sm text-gray-600">{period}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              {averageAchievement.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Atingimento Médio</p>
            <Badge variant="outline" className="mt-1">
              #{ranking.position} de {ranking.total}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {performance.map((level, index) => {
          const isIndividual = level.level === "Individual";
          const isExceptional =
            isIndividual && (level.coffee.percentage > 150 || level.filter.percentage > 150);

          return (
            <div
              key={level.level}
              className={`p-4 rounded-lg border-2 ${
                isExceptional
                  ? "border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  META {level.level.toUpperCase()}
                </h3>
                {isExceptional && <Flame className="h-5 w-5 text-orange-500" />}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Café</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {level.coffee.percentage}%
                      </span>
                      {level.coffee.achieved && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={Math.min(level.coffee.percentage, 100)} className="h-3" />
                    <div
                      className={`absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r ${getPerformanceColor(
                        level.coffee.percentage
                      )} transition-all`}
                      style={{ width: `${Math.min(level.coffee.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Filtro</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {level.filter.percentage}%
                      </span>
                      {level.filter.achieved && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={Math.min(level.filter.percentage, 100)} className="h-3" />
                    <div
                      className={`absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r ${getPerformanceColor(
                        level.filter.percentage
                      )} transition-all`}
                      style={{ width: `${Math.min(level.filter.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
