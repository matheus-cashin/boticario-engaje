import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Search } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  totalSales: number;
  targetAmount: number;
  cashins: number;
}

interface FullRankingModalProps {
  open: boolean;
  onClose: () => void;
  participants: Participant[];
  campaignTarget: number;
  campaignName: string;
}

export function FullRankingModal({ 
  open, 
  onClose, 
  participants, 
  campaignTarget,
  campaignName 
}: FullRankingModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Ordenar participantes por vendas totais
  const rankedParticipants = [...participants].sort((a, b) => 
    Number(b.totalSales) - Number(a.totalSales)
  );

  // Filtrar participantes baseado na busca
  const filteredParticipants = rankedParticipants.filter(participant => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const name = participant.name?.toLowerCase() || "";
    const email = participant.email?.toLowerCase() || "";
    const phone = participant.phone?.toLowerCase() || "";
    
    return name.includes(search) || email.includes(search) || phone.includes(search);
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Ranking Completo - {campaignName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {filteredParticipants.length} de {participants.length} participantes
          </p>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-3">
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum participante encontrado com "{searchTerm}"</p>
              </div>
            ) : (
              filteredParticipants.map((participant, index) => {
              const totalSales = Number(participant.totalSales) || 0;
              const targetAmount = Number(participant.targetAmount) || 0;
              const target = targetAmount > 0 ? targetAmount : campaignTarget;
              const progress = target > 0 ? (totalSales / target) * 100 : 0;
              const isAboveTarget = progress > 100;
              const displayProgress = Math.min(progress, 100);
              
              return (
                <div 
                  key={participant.id} 
                  className={`p-4 rounded-lg border transition-colors ${
                    isAboveTarget 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                      : 'bg-card'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Posição */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-bold text-primary shrink-0">
                      {index + 1}
                    </div>

                    {/* Informações principais */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Nome e Badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-base">{participant.name}</h4>
                        {isAboveTarget && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            META+
                          </Badge>
                        )}
                      </div>

                      {/* Contatos */}
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {participant.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{participant.email}</span>
                          </div>
                        )}
                        {participant.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{participant.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Barra de progresso */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <Progress 
                            value={displayProgress} 
                            className="h-2.5"
                          />
                          {isAboveTarget && (
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full h-2.5"></div>
                          )}
                        </div>
                        <span className={`text-sm font-semibold min-w-[4rem] text-right ${
                          isAboveTarget ? 'text-green-700' : 'text-muted-foreground'
                        }`}>
                          {progress.toFixed(1)}%
                        </span>
                      </div>

                      {/* Valores */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="space-y-0.5">
                          <p className="text-muted-foreground">
                            Vendas: <span className="font-medium text-foreground">
                              R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            Meta: <span className="font-medium text-foreground">
                              R$ {target.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </p>
                        </div>
                        {isAboveTarget && (
                          <div className="text-right">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                              +R$ {(totalSales - target).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Cashins */}
                      {participant.cashins > 0 && (
                        <div className="pt-1 border-t">
                          <p className="text-sm text-muted-foreground">
                            Prêmio: <span className="font-semibold text-primary">
                              R$ {participant.cashins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
