
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Trophy, Medal, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  campaignName: string;
}

interface Participant {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  employee_id: string | null;
  current_progress: number;
  target_amount: number | null;
  is_active: boolean;
}

interface RankingParticipant {
  position: number;
  id: string;
  name: string;
  phone: string;
  progress: number;
  current_progress: number;
  target_amount: number | null;
}


const getPositionIcon = (position: number, progress: number) => {
  // Ícone especial para quem ultrapassou a meta
  if (progress > 100) {
    return <div className="relative">
      <Trophy className="h-4 w-4 text-yellow-600" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
    </div>;
  }
  
  switch (position) {
    case 1:
      return <Trophy className="h-4 w-4 text-yellow-600" />;
    case 2:
      return <Medal className="h-4 w-4 text-gray-500" />;
    case 3:
      return <Award className="h-4 w-4 text-amber-600" />;
    default:
      return <span className="text-sm font-semibold text-muted-foreground">{position}</span>;
  }
};

export function RankingModal({ isOpen, onClose, scheduleId, campaignName }: RankingModalProps) {
  const [participants, setParticipants] = useState<RankingParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    console.log('[RankingModal] useEffect disparado:', { isOpen, scheduleId, campaignName });
    if (isOpen && scheduleId) {
      console.log('[RankingModal] Iniciando busca de dados...');
      fetchRankingData();
    } else {
      console.log('[RankingModal] Não iniciando busca:', { isOpen, scheduleId });
    }
  }, [isOpen, scheduleId]);

  const fetchRankingData = async () => {
    setLoading(true);
    console.log('[RankingModal] Buscando ranking do schedule:', scheduleId);
    
    try {
      // Buscar TODOS os participantes da campanha com current_progress já calculado
      const { data: allParticipants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('schedule_id', scheduleId);

      if (participantsError) {
        console.error('[RankingModal] Erro ao buscar participantes:', participantsError);
        setDebugInfo(`Erro: ${participantsError.message}`);
        setParticipants([]);
        setLoading(false);
        return;
      }

      console.log(`[RankingModal] Total de participantes: ${allParticipants?.length || 0}`);

      // Buscar meta da campanha
      const { data: schedule } = await supabase
        .from('schedules')
        .select('sales_target')
        .eq('id', scheduleId)
        .single();

      const salesTarget = Number(schedule?.sales_target) || 0;

      // Criar ranking completo usando current_progress (já calculado na apuração)
      const rankingList: RankingParticipant[] = (allParticipants || []).map(participant => {
        const totalSales = Number(participant.current_progress) || 0;
        const target = Number(participant.target_amount) || salesTarget || null;
        const progress = target ? (totalSales / target) * 100 : 0;

        return {
          position: 0, // Será definido após ordenação
          id: participant.id,
          name: participant.name || 'Nome não informado',
          phone: participant.phone || '',
          progress: progress,
          current_progress: totalSales,
          target_amount: target
        };
      })
      .sort((a, b) => b.current_progress - a.current_progress)
      .map((p, index) => ({ ...p, position: index + 1 }));

      console.log(`[RankingModal] Ranking criado com ${rankingList.length} participantes usando current_progress`);
      setParticipants(rankingList);
      setDebugInfo(`✅ ${rankingList.length} participantes no ranking`);
      
    } catch (error) {
      console.error('[RankingModal] Erro ao processar ranking:', error);
      setDebugInfo(`Erro ao processar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppDispatch = async () => {
    console.log(`Disparando ranking da campanha ${campaignName} via WhatsApp`);
    setSending(true);
    
    try {
      const webhookUrl = 'https://n8n-prod.cashin.com.br/webhook/ranking';
      
      // Preparar dados para envio
      const rankingData = participants.map(participant => ({
        nome: participant.name,
        telefone: participant.phone,
        posicao: participant.position,
        atingimento_meta: parseFloat(participant.progress.toFixed(2)),
        valor_vendido: Number(participant.current_progress.toFixed(2)),
        meta_individual: participant.target_amount,
        campanha: participant.target_amount ? campaignName : `${campaignName} (sem meta individual)`
      }));

      console.log('Enviando dados para o webhook:', {
        url: webhookUrl,
        totalParticipantes: rankingData.length,
        campanha: campaignName
      });

      const payload = {
        campanha: campaignName,
        campanha_id: scheduleId,
        data_envio: new Date().toISOString(),
        total_participantes: rankingData.length,
        ranking: rankingData
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Resposta do webhook:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        throw new Error(`Webhook respondeu com status ${response.status}: ${response.statusText}`);
      }

      // Tentar ler resposta
      let responseData;
      try {
        responseData = await response.json();
        console.log('Resposta JSON do webhook:', responseData);
      } catch (e) {
        console.log('Webhook não retornou JSON (esperado para alguns webhooks)');
      }

      toast({
        title: "Ranking enviado!",
        description: `${rankingData.length} participante(s) notificado(s) com sucesso.`,
      });
      
    } catch (error) {
      console.error('Erro ao disparar ranking:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro ao enviar",
        description: errorMessage.includes('Failed to fetch') 
          ? 'Não foi possível conectar ao servidor. Verifique a URL do webhook.' 
          : `Verifique sua conexão e tente novamente. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Ranking - {campaignName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum participante encontrado para esta campanha.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {participants.map((participant) => {
                const isAboveTarget = participant.progress > 100;
                const displayProgress = Math.min(participant.progress, 100); // Limitar visualmente a 100%
                
                return (
                  <div 
                    key={participant.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isAboveTarget 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100' 
                        : 'bg-card hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8">
                      {getPositionIcon(participant.position, participant.progress)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate flex items-center gap-2">
                        {participant.name}
                        {isAboveTarget && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                            META+
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 relative">
                          <Progress 
                            value={displayProgress} 
                            className="h-2"
                          />
                          {isAboveTarget && (
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full h-2"></div>
                          )}
                        </div>
                        <span className={`text-xs font-medium min-w-[3.5rem] ${
                          isAboveTarget ? 'text-green-700' : 'text-muted-foreground'
                        }`}>
                          {participant.progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        R$ {participant.current_progress.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        {participant.target_amount && (
                          <span> / R$ {participant.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        )}
                        {isAboveTarget && (
                          <span className="text-green-600 font-medium ml-1">
                            (+R$ {(participant.current_progress - participant.target_amount!).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="pt-2 border-t">
            <Button 
              onClick={handleWhatsAppDispatch} 
              className="w-full flex items-center justify-center gap-2"
              size="sm"
              disabled={sending || participants.length === 0}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" />
                  Disparar ranking
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
