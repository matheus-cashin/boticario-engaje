import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

export function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <Icon className={`h-12 w-12 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}
