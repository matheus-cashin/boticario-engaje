import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CategoryData {
  percentage: number;
  qualified: number;
  total: number;
}

interface LevelDistributionCardProps {
  level: string;
  coffee: CategoryData;
  filter: CategoryData;
}

export function LevelDistributionCard({ level, coffee, filter }: LevelDistributionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{level}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Café</span>
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              {coffee.qualified}/{coffee.total}
            </Badge>
          </div>
          <div className="relative">
            <Progress value={coffee.percentage} className="h-3" />
            <div
              className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
              style={{ width: `${coffee.percentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-right">{coffee.percentage}%</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Filtro</span>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {filter.qualified}/{filter.total}
            </Badge>
          </div>
          <div className="relative">
            <Progress value={filter.percentage} className="h-3" />
            <div
              className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
              style={{ width: `${filter.percentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-right">{filter.percentage}%</p>
        </div>
      </CardContent>
    </Card>
  );
}
