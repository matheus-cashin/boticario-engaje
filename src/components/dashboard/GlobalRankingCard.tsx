import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RankingItem {
  rank: number;
  name: string;
  totalSales: number;
  campaigns: number;
}

const mockRankingData: RankingItem[] = [
  { rank: 1, name: "João Silva", totalSales: 150000, campaigns: 3 },
  { rank: 2, name: "Maria Santos", totalSales: 135000, campaigns: 4 },
  { rank: 3, name: "Pedro Oliveira", totalSales: 128000, campaigns: 2 },
  { rank: 4, name: "Ana Costa", totalSales: 115000, campaigns: 3 },
  { rank: 5, name: "Carlos Ferreira", totalSales: 98000, campaigns: 2 },
  { rank: 6, name: "Juliana Lima", totalSales: 87000, campaigns: 3 },
  { rank: 7, name: "Roberto Souza", totalSales: 76000, campaigns: 2 },
  { rank: 8, name: "Fernanda Alves", totalSales: 65000, campaigns: 1 },
  { rank: 9, name: "Lucas Martins", totalSales: 58000, campaigns: 2 },
  { rank: 10, name: "Patricia Rocha", totalSales: 52000, campaigns: 1 },
];

export function GlobalRankingCard() {
  const getRankBadge = (rank: number) => {
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
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Ranking Global - Top Vendedores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {mockRankingData.map((item, index) => (
              <div
                key={item.rank}
                className={`p-4 border rounded-lg hover:shadow-md transition-all ${
                  item.rank <= 3
                    ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20"
                    : "bg-card"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
                      {getRankBadge(item.rank)}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center text-secondary-foreground font-semibold shadow-sm">
                      {getInitials(item.name)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <TrendingUp className="h-4 w-4 text-cashin-green flex-shrink-0" />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {item.campaigns} {item.campaigns === 1 ? "campanha" : "campanhas"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <Badge variant="secondary" className="font-semibold whitespace-nowrap">
                      R$ {item.totalSales.toLocaleString("pt-BR")}
                    </Badge>
                    {item.rank <= 3 && (
                      <Trophy className="h-5 w-5 text-cashin-yellow mx-auto mt-1" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
