
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, TrendingUp, Upload, Edit, BarChart3 } from "lucide-react";
import { PlatformTag } from "./PlatformTag";
import { RuleStatusBadge } from "./RuleStatusBadge";
import { useRuleStatus } from "@/hooks/useRuleStatus";

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
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onUploadClick();
              }}
              disabled={processingMode === 'full_auto'}
              title={processingMode === 'full_auto' ? 'Upload desabilitado para campanhas com integração' : ''}
            >
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </Button>
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
            <span>{fileCount} Arquivos</span>
            <button 
              className="hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onParticipantsClick();
              }}
            >
              {participantCount} Participantes
            </button>
          </div>
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
