import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CampaignPerformance } from "@/hooks/useReportsData";

interface CampaignTableProps {
  data: CampaignPerformance[];
}

export function CampaignTable({ data }: CampaignTableProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { label: 'Ativa', variant: 'default' as const },
      'completed': { label: 'Concluída', variant: 'secondary' as const },
      'pending': { label: 'Pendente', variant: 'outline' as const },
      'paused': { label: 'Pausada', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || 
                      { label: status, variant: 'outline' as const };

    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const calculateTimeProgress = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    return progress;
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedData = [...data].sort((a, b) => b.totalAmount - a.totalAmount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhamento das Campanhas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Participantes</TableHead>
                <TableHead className="text-right">Arquivos</TableHead>
                <TableHead className="text-right">Volume Total</TableHead>
                <TableHead className="text-right">Conclusão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((campaign) => (
                <TableRow 
                  key={campaign.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/reports/${campaign.id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="max-w-[200px] truncate" title={campaign.name}>
                      {campaign.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(campaign.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.participantCount}
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.fileCount}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(campaign.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${getCompletionColor(calculateTimeProgress(campaign.startDate, campaign.endDate))}`}>
                      {calculateTimeProgress(campaign.startDate, campaign.endDate).toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {sortedData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma campanha encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}
