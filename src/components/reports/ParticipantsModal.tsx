import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Participant {
  id: string;
  name: string;
  email: string;
  division: string;
  manager: string;
  achievementBrazil: number;
  achievementDivision: number;
  achievementIndividual: number;
  totalSales: number;
  cashins: number;
}

interface ParticipantsModalProps {
  open: boolean;
  onClose: () => void;
  participants: Participant[];
}

export function ParticipantsModal({ open, onClose, participants }: ParticipantsModalProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Todos os Participantes</DialogTitle>
        </DialogHeader>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Divisão</TableHead>
                <TableHead>Gerente</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
                <TableHead className="text-right">Brasil</TableHead>
                <TableHead className="text-right">Divisão</TableHead>
                <TableHead className="text-right">Individual</TableHead>
                <TableHead className="text-right">Cashins</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => {
                const avgPerformance = 
                  (participant.achievementBrazil + participant.achievementDivision + participant.achievementIndividual) / 3;
                
                const hasValidPerformance = !isNaN(avgPerformance) && isFinite(avgPerformance);
                const hasValidSales = !isNaN(participant.totalSales) && isFinite(participant.totalSales);
                const hasValidCashins = !isNaN(participant.cashins) && isFinite(participant.cashins);
                const hasValidAchievementBrazil = !isNaN(participant.achievementBrazil) && isFinite(participant.achievementBrazil);
                const hasValidAchievementDivision = !isNaN(participant.achievementDivision) && isFinite(participant.achievementDivision);
                const hasValidAchievementIndividual = !isNaN(participant.achievementIndividual) && isFinite(participant.achievementIndividual);
                
                return (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">{participant.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{participant.email}</TableCell>
                    <TableCell>{participant.division}</TableCell>
                    <TableCell>{participant.manager}</TableCell>
                    <TableCell className="text-right font-medium">
                      {hasValidSales ? formatCurrency(participant.totalSales) : 'R$ 0,00'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={hasValidAchievementBrazil && participant.achievementBrazil >= 100 ? "default" : "secondary"}>
                        {hasValidAchievementBrazil ? formatPercentage(participant.achievementBrazil) : '0.0%'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={hasValidAchievementDivision && participant.achievementDivision >= 100 ? "default" : "secondary"}>
                        {hasValidAchievementDivision ? formatPercentage(participant.achievementDivision) : '0.0%'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={hasValidAchievementIndividual && participant.achievementIndividual >= 100 ? "default" : "secondary"}>
                        {hasValidAchievementIndividual ? formatPercentage(participant.achievementIndividual) : '0.0%'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-fuchsia-600">
                      {hasValidCashins ? formatCurrency(participant.cashins) : 'R$ 0,00'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}