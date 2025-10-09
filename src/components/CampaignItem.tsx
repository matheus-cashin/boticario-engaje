
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import { RankingModal } from "./RankingModal";
import { UploadModal } from "./UploadModal";
import { RulesModal } from "./RulesModal";
import { ParticipantsModal } from "./ParticipantsModal";
import { EditCampaignModal } from "./campaigns/EditCampaignModal";
import { CampaignHeader } from "./CampaignHeader";
import { FilesTable } from "./FilesTable";
import { useToast } from "@/hooks/use-toast";
import { deleteCampaignFile } from "@/services/campaignFileService";

interface CampaignItemProps {
  id: string;
  name: string;
  platform: "whatsapp" | "email";
  fileCount: number;
  participantCount: number;
  startDate: string;
  endDate: string;
  totalValue: string;
  files: any[];
  onSelect?: () => void;
}

export function CampaignItem({
  id,
  name,
  platform,
  fileCount,
  participantCount,
  startDate,
  endDate,
  totalValue,
  onSelect,
}: CampaignItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [optimisticSetter, setOptimisticSetter] = useState<(() => void) | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDistributeBatch = (fileId: string) => {
    // TODO: Implementar distribuição de lote
    toast({
      title: "Lote distribuído",
      description: `O crédito do arquivo foi marcado como distribuído.`,
    });
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const result = await deleteCampaignFile(fileId);
      
      if (result.success) {
        toast({
          title: "Arquivo excluído",
          description: "O arquivo foi excluído com sucesso.",
        });
        
        // Invalidar queries para atualizar listas
        queryClient.invalidateQueries({ queryKey: ["campaign-files", id] });
        queryClient.invalidateQueries({ queryKey: ["schedules"] });
      } else {
        toast({
          title: "Erro ao excluir",
          description: result.error || "Não foi possível excluir o arquivo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleUploadSuccess = () => {
    toast({
      title: "Upload concluído",
      description: "O arquivo foi adicionado à campanha com sucesso.",
    });
    
    // Invalidar queries para atualizar listas
    queryClient.invalidateQueries({ queryKey: ["campaign-files", id] });
    queryClient.invalidateQueries({ queryKey: ["schedules"] });
  };

  return (
    <>
      <div className="border rounded-lg bg-card">
        <div
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          <div className="flex items-center space-x-3">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
            <div className="flex-1">
              <CampaignHeader
                id={id}
                name={name}
                platform={platform}
                fileCount={fileCount}
                participantCount={participantCount}
                startDate={startDate}
                endDate={endDate}
                totalValue={totalValue}
                onRulesClick={(setter) => {
                  setOptimisticSetter(() => setter);
                  setIsRulesModalOpen(true);
                }}
                onRankingClick={() => setIsRankingModalOpen(true)}
                onUploadClick={() => setIsUploadModalOpen(true)}
                onParticipantsClick={() => setIsParticipantsModalOpen(true)}
                onEditClick={() => setIsEditModalOpen(true)}
              />
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t bg-muted/20">
            <div className="p-4">
              <FilesTable
                campaignId={id}
                onDistributeBatch={handleDistributeBatch}
                onDeleteFile={handleDeleteFile}
              />
            </div>
          </div>
        )}
      </div>

      <RankingModal
        isOpen={isRankingModalOpen}
        onClose={() => setIsRankingModalOpen(false)}
        campaignId={id}
        campaignName={name}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        campaignId={id}
        campaignName={name}
        onUploadSuccess={handleUploadSuccess}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
      />

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        campaignId={id}
        campaignName={name}
        onRuleApproved={optimisticSetter || undefined}
      />

      <ParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        campaignId={id}
        campaignName={name}
      />

      <EditCampaignModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          toast({
            title: "Campanha atualizada",
            description: "As alterações foram salvas com sucesso.",
          });
          
          // Invalidar queries para atualizar listas sem reload
          queryClient.invalidateQueries({ queryKey: ["schedules"] });
          queryClient.invalidateQueries({ queryKey: ["campaign-files", id] });
          setIsEditModalOpen(false);
        }}
        campaignId={id}
        campaignData={{
          name,
          startDate,
          endDate,
          platform,
        }}
      />
    </>
  );
}
