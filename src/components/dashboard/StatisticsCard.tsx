import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, MoreVertical, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StatisticsCard() {
  const stats = [
    { label: 'ROI das campanhas', value: '130k', change: '↑ 5% vs ano passado', positive: true },
    { label: 'Média de engajamento', value: '68%', change: '↓ 3% vs ano passado', positive: false },
    { label: 'Total de vendedores ativos', value: '954', change: '↑ 2% vs ano passado', positive: true },
    { label: 'Média de vendedores por campanha', value: '145', change: null, positive: null },
    { label: 'Taxa de atingimento de meta', value: '87%', change: '↑ 4% vs ano passado', positive: true },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Estatísticas</CardTitle>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold">{stat.value}</span>
              {stat.change && (
                <span className={`text-xs whitespace-nowrap ${stat.positive ? 'text-cashin-green' : 'text-destructive'}`}>
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
        
        <div className="mt-6 rounded-lg bg-primary/5 p-4 border border-primary/10">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">
              O maior impacto no faturamento é com campanhas no segundo trimestre e existe 
              uma sazonalidade de crescimento de vendas orgânica no quarto trimestre.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
