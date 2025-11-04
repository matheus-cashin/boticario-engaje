import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const campaigns = [
  { name: 'Programa de Vendas Q1', status: 'Ativa', period: '01/01/2024 - 31/03/2024', engagement: '85%', participants: 1250, revenue: 'R$ 450.000' },
  { name: 'Campanha de Metas Trimestrais', status: 'Ativa', period: '15/01/2024 - 15/04/2024', engagement: '72%', participants: 890, revenue: 'R$ 320.500' },
  { name: 'Incentivo Lançamento de Produto', status: 'Encerrada', period: '01/12/2023 - 31/12/2023', engagement: '95%', participants: 2100, revenue: 'R$ 680.000' },
  { name: 'Desafio de Produtividade', status: 'Ativa', period: '01/02/2024 - 28/02/2024', engagement: '68%', participants: 540, revenue: 'R$ 180.200' },
  { name: 'Programa de Fidelidade Clientes', status: 'Encerrada', period: '01/10/2023 - 31/12/2023', engagement: '88%', participants: 3450, revenue: 'R$ 890.000' },
  { name: 'Bonificação Anual 2024', status: 'Planejada', period: '01/07/2024 - 31/12/2024', engagement: '0%', participants: 0, revenue: 'R$ 0' },
  { name: 'Meta de Expansão Regional', status: 'Ativa', period: '10/01/2024 - 10/06/2024', engagement: '78%', participants: 670, revenue: 'R$ 295.800' },
  { name: 'Incentivo Inovação', status: 'Planejada', period: '01/03/2024 - 30/06/2024', engagement: '0%', participants: 0, revenue: 'R$ 0' },
];

export function CampaignsTable() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Ativa':
        return 'default';
      case 'Encerrada':
        return 'secondary';
      case 'Planejada':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getEngagementColor = (engagement: string) => {
    const value = parseInt(engagement);
    if (value === 0) return 'text-muted-foreground';
    if (value >= 80) return 'text-cashin-green';
    if (value >= 60) return 'text-cashin-yellow';
    return 'text-cashin-orange';
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Campanhas de Incentivo</CardTitle>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Campanha</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[140px]">Período</TableHead>
                <TableHead className="text-right min-w-[120px]">Engajamento</TableHead>
                <TableHead className="text-right min-w-[120px]">Participantes</TableHead>
                <TableHead className="text-right min-w-[120px]">Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="max-w-[250px] truncate" title={campaign.name}>
                      {campaign.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{campaign.period}</TableCell>
                  <TableCell className={`text-right font-semibold ${getEngagementColor(campaign.engagement)}`}>
                    {campaign.engagement}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">{campaign.participants.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right font-medium whitespace-nowrap">{campaign.revenue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
