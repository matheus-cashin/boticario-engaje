import { Trophy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface TopPerformerItemProps {
  rank: number;
  name: string;
  averagePerformance: number;
  cashins: number;
  onClick: () => void;
  index: number;
}

export function TopPerformerItem({
  rank,
  name,
  averagePerformance,
  cashins,
  onClick,
  index,
}: TopPerformerItemProps) {
  const getRankBadge = () => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      className="p-4 border rounded-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer bg-white"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {getRankBadge()}
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
            {getInitials(name)}
          </div>
        </div>

        <div className="flex-1">
          <p className="font-semibold text-gray-900">{name}</p>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-600">
              Performance: {averagePerformance.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="text-right">
          <Badge className="bg-green-100 text-green-800">
            R$ {cashins.toLocaleString("pt-BR")}
          </Badge>
          {rank <= 3 && (
            <Trophy className="h-5 w-5 text-yellow-500 mx-auto mt-1" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
