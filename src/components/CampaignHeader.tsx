
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, TrendingUp, Upload, Edit, BarChart3 } from "lucide-react";
import { PlatformTag } from "./PlatformTag";
import { RuleStatusBadge } from "./RuleStatusBadge";
import { useRuleStatus } from "@/hooks/useRuleStatus";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CampaignHeaderProps {
  id: string;
  name: string;
  platform: "whatsapp" | "email";
  fileCount: number;
  participantCount: number;
  startDate: string;
  endDate: string;
  totalValue: string;
  processingMode?: string;
  onRulesClick: (setOptimistic: () => void) => void;
  onRankingClick: () => void;
  onUploadClick: () => void;
  onParticipantsClick: () => void;
  onEditClick: () => void;
}

export function CampaignHeader({
  id,
  name,
  platform,
  fileCount,
  participantCount,
  startDate,
  endDate,
  totalValue,
  processingMode,
  onRulesClick,
  onRankingClick,
  onUploadClick,
  onParticipantsClick,
  onEditClick,
}: CampaignHeaderProps) {
  const navigate = useNavigate();
  const { hasRule, ruleStatus, setOptimisticCompleted } = useRuleStatus(id);
  const [liveFileCount, setLiveFileCount] = useState(fileCount);
  const [liveParticipantCount, setLiveParticipantCount] = useState(participantCount);

  // Live verification of file count
  useEffect(() => {
    const fetchFileCount = async () => {
      const { count } = await supabase
        .from('campaign_files')
        .select('*', { count: 'exact', head: true })
        .eq('schedule_id', id)
        .is('deleted_at', null);
      
      if (count !== null) {
        setLiveFileCount(count);
      }
    };

    fetchFileCount();

    // Real-time subscription
    const channel = supabase
      .channel(`campaign-files-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_files',
          filter: `schedule_id=eq.${id}`
        },
        () => {
          fetchFileCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Live verification of participant count
  useEffect(() => {
    const fetchParticipantCount = async () => {
      const { count } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('schedule_id', id)
        .eq('is_active', true);
      
      if (count !== null) {
        setLiveParticipantCount(count);
      }
    };

    fetchParticipantCount();

    // Real-time subscription
    const channel = supabase
      .channel(`campaign-participants-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `schedule_id=eq.${id}`
        },
        () => {
          fetchParticipantCount();
        }
      )
      .on('broadcast', { event: 'participants_updated' }, () => {
        fetchParticipantCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  return (
    <div className="flex items-center justify-between relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-0 right-0 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onEditClick();
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <div className="flex-1">
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg">Campanha: {name}</h3>
          </div>
          <div className="flex items-center space-x-3 mt-2">
            <PlatformTag platform={platform} />
            {processingMode === 'full_auto' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Integração
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 mb-3">
            <Button
              variant={hasRule ? "default" : "outline"}
              size="sm"
              className={`h-7 px-2 text-xs transition-all duration-300 ${
                hasRule && ruleStatus === 'completed' 
                  ? "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/50" 
                  : hasRule && ruleStatus === 'processing'
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : hasRule && ruleStatus === 'failed'
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onRulesClick(setOptimisticCompleted);
              }}
            >
              <Settings className="h-3 w-3 mr-1" />
              Regras
            </Button>
            <RuleStatusBadge 
              hasRule={hasRule} 
              status={ruleStatus || undefined} 
            />
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onRankingClick();
              }}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Ranking
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-7 px-2 text-xs ${
                      !hasRule ? 'border-amber-500 text-amber-600 hover:bg-amber-50' : ''
                    } ${(processingMode === 'full_auto' || !hasRule) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasRule || processingMode === 'full_auto') {
                        return;
                      }
                      onUploadClick();
                    }}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload {!hasRule && '⚠️'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="pointer-events-auto">
                  <p>Para realizar o upload de um arquivo primeiro inclua uma regra para a campanha</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/reports/${id}`);
              }}
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Relatório
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{liveFileCount} Arquivos</span>
            <button 
              className="hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onParticipantsClick();
              }}
            >
              {liveParticipantCount} Participantes
            </button>
          </div>
          </div>
      
      <div className="text-right pr-8">
        <div className="font-medium">Período da campanha</div>
        <div className="text-sm text-muted-foreground">{startDate}</div>
        <div className="text-sm text-muted-foreground">{endDate}</div>
        <div className="font-medium mt-1">Valor Total Apurado</div>
        <div className="text-sm text-muted-foreground">{totalValue}</div>
      </div>
    </div>
  );
}
