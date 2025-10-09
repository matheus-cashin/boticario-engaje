import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignName: string;
}

export function ParticipantsModal({ isOpen, onClose, campaignId, campaignName }: ParticipantsModalProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && campaignId) {
      fetchParticipants();
    }
  }, [isOpen, campaignId]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('schedule_id', campaignId)
        .eq('is_active', true)
        .order('current_progress', { ascending: false });

      if (error) {
        console.error('Erro ao buscar participantes:', error);
        return;
      }

      setParticipants(data || []);
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProgressPercentage = (current: number, target: number | null) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Participantes - {campaignName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum participante encontrado para esta campanha.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.map((participant) => (
                <div 
                  key={participant.id} 
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(participant.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate mb-1">
                      {participant.name}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {participant.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{participant.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{participant.phone}</span>
                      </div>
                      {participant.employee_id && (
                        <Badge variant="outline" className="text-xs">
                          ID: {participant.employee_id}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {formatCurrency(participant.current_progress)}
                    </div>
                    {participant.target_amount && (
                      <div className="text-xs text-muted-foreground">
                        {getProgressPercentage(participant.current_progress, participant.target_amount).toFixed(1)}% da meta
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {participants.length > 0 && (
            <div className="pt-3 border-t">
              <div className="text-sm text-muted-foreground text-center">
                Total: {participants.length} participantes ativos
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}