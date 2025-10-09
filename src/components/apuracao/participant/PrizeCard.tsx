import { Trophy, CheckCircle, Clock, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PrizeCardProps {
  level: "Bronze" | "Prata" | "Ouro" | "Platinum";
  base: number;
  bonus: number;
  total: number;
  status: "pending" | "processing" | "paid";
  paidDate?: string;
}

export function PrizeCard({ level, base, bonus, total, status, paidDate }: PrizeCardProps) {
  const getLevelConfig = () => {
    switch (level) {
      case "Platinum":
        return {
          color: "from-gray-300 to-gray-500",
          textColor: "text-gray-700",
          bgColor: "bg-gray-100",
        };
      case "Ouro":
        return {
          color: "from-yellow-300 to-yellow-600",
          textColor: "text-yellow-700",
          bgColor: "bg-yellow-100",
        };
      case "Prata":
        return {
          color: "from-gray-200 to-gray-400",
          textColor: "text-gray-700",
          bgColor: "bg-gray-100",
        };
      default:
        return {
          color: "from-orange-300 to-orange-600",
          textColor: "text-orange-700",
          bgColor: "bg-orange-100",
        };
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case "paid":
        return {
          icon: CheckCircle,
          label: "Pago",
          color: "bg-green-100 text-green-800",
        };
      case "processing":
        return {
          icon: Loader,
          label: "Processando",
          color: "bg-blue-100 text-blue-800",
        };
      default:
        return {
          icon: Clock,
          label: "Pendente",
          color: "bg-yellow-100 text-yellow-800",
        };
    }
  };

  const levelConfig = getLevelConfig();
  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className={`h-5 w-5 ${levelConfig.textColor}`} />
          Premiação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center pb-4 border-b">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${levelConfig.color} mb-3`}
          >
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h3 className={`text-2xl font-bold ${levelConfig.textColor}`}>{level}</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Cashins Base</span>
            <span className="font-semibold text-gray-900">
              R$ {base.toLocaleString("pt-BR")}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Bônus por Superação</span>
            <span className="font-semibold text-green-600">
              + R$ {bonus.toLocaleString("pt-BR")}
            </span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                R$ {total.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status do Pagamento</span>
            <Badge variant="outline" className={statusConfig.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
          {paidDate && (
            <p className="text-xs text-gray-500 mt-2">
              Pago em {new Date(paidDate).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
