import { Trophy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ParticipantCardProps {
  name: string;
  division: string;
  achievement: number;
  credit: number;
  rank: number;
  onClick?: () => void;
}

export function ParticipantCard({ name, division, achievement, credit, rank, onClick }: ParticipantCardProps) {
  const getRankColor = () => {
    if (rank === 1) return "bg-yellow-400 text-yellow-900";
    if (rank === 2) return "bg-gray-300 text-gray-900";
    if (rank === 3) return "bg-orange-400 text-orange-900";
    return "bg-blue-100 text-blue-900";
  };

  return (
    <div
      onClick={onClick}
      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-12 h-12 rounded-full ${getRankColor()} flex items-center justify-center font-bold text-lg`}>
            {rank}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{name}</p>
            <p className="text-sm text-gray-600">{division}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-600 font-semibold mb-1">
            <TrendingUp className="h-4 w-4" />
            <span>{achievement}%</span>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            R$ {credit.toLocaleString('pt-BR')}
          </Badge>
        </div>
      </div>
    </div>
  );
}
