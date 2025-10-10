
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
import { MessageCircle, Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
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

export function RankingModal({ isOpen, onClose, campaignId, campaignName }: RankingModalProps) {
  const [participants, setParticipants] = useState<RankingParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    console.log('[RankingModal] useEffect disparado:', { isOpen, campaignId, campaignName });
    if (isOpen && campaignId) {
      console.log('[RankingModal] Iniciando busca de dados...');
      fetchRankingData();
    } else {
      console.log('[RankingModal] Não iniciando busca:', { isOpen, campaignId });
    }
  }, [isOpen, campaignId]);

  const fetchRankingData = async () => {
    setLoading(true);
    console.log('[RankingModal] Buscando participantes da campanha:', campaignId);
    
    try {
      // Buscar participantes da campanha (schedule_id = campaignId)
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('schedule_id', campaignId)
        .eq('is_active', true)
        .order('current_progress', { ascending: false });

      console.log('[RankingModal] Participantes encontrados:', participantsData);

      if (participantsError) {
        console.error('[RankingModal] Erro ao buscar participantes:', participantsError);
        setDebugInfo(`Erro: ${participantsError.message}`);
        setParticipants([]);
        setLoading(false);
        return;
      }

      if (!participantsData || participantsData.length === 0) {
        console.log('[RankingModal] Nenhum participante encontrado');
        setDebugInfo('Nenhum participante encontrado para esta campanha.');
        setParticipants([]);
        setLoading(false);
        return;
      }

      // Processar dados dos participantes para o ranking
      const rankingList: RankingParticipant[] = participantsData.map((participant: Participant, index: number) => {
        const targetAmount = participant.target_amount || 0;
        const currentProgress = participant.current_progress || 0;
        const progress = targetAmount > 0 ? (currentProgress / targetAmount) * 100 : 0;
        
        return {
          position: index + 1,
          id: participant.id,
          name: participant.name,
          progress: progress,
          current_progress: currentProgress,
          target_amount: targetAmount
        };
      });

      setParticipants(rankingList);
      setDebugInfo(`✅ ${rankingList.length} participantes encontrados`);
      
    } catch (error) {
      console.error('[RankingModal] Erro ao processar ranking:', error);
      setDebugInfo(`Erro ao processar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppDispatch = () => {
    console.log(`Disparando ranking da campanha ${campaignName} via WhatsApp`);
    // Aqui seria implementada a lógica de disparo via WhatsApp
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
            >
              <MessageCircle className="h-4 w-4" />
              Disparar ranking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
