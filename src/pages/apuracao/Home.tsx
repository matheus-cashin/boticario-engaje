import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { FileDropzone } from "@/components/apuracao/FileDropzone";
import { CampaignCard } from "@/components/apuracao/CampaignCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadCampaignFile, deleteCampaignFile } from "@/services/campaignFileService";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Campaign {
  id: string;
  name: string;
  campaignName: string;
  uploadDate: string;
  status: "Processada" | "Em análise" | "Rascunho";
  participants: number;
}

export default function ApuracaoHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Buscar campanhas (schedules) do Supabase
  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Buscar uploads recentes (campaign_files)
  const { data: recentUploads, isLoading: isLoadingUploads } = useQuery({
    queryKey: ["recent-uploads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_files")
        .select("*")
        .eq("upload_type", "sales")
        .neq("status", "failed")
        .order("uploaded_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const handleFileAccepted = async (file: File) => {
    if (!selectedCampaignId) {
      toast({
        title: "Selecione uma campanha",
        description: "Por favor, selecione a campanha para este arquivo",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadCampaignFile(file, selectedCampaignId, "sales");

      if (result.success && result.fileId) {
        toast({
          title: "Upload realizado",
          description: "Arquivo enviado para processamento",
        });
        navigate(`/apuracao/analyze/${result.fileId}`);
      } else {
        throw new Error(result.error || "Erro no upload");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = (campaignFileId: string) => {
    navigate(`/apuracao/analyze/${campaignFileId}`);
  };

  const handleDeleteUpload = async (fileId: string) => {
    try {
      // Optimistic update - remove da UI imediatamente
      queryClient.setQueryData(["recent-uploads"], (old: any) => {
        if (!old) return old;
        return old.filter((upload: any) => upload.id !== fileId);
      });

      const result = await deleteCampaignFile(fileId);
      
      if (result.success) {
        toast({
          title: "Upload excluído",
          description: "O arquivo foi excluído com sucesso.",
        });
        
        // Invalidar queries para garantir sincronização
        queryClient.invalidateQueries({ queryKey: ["recent-uploads"] });
      } else {
        // Reverter o optimistic update em caso de erro
        queryClient.invalidateQueries({ queryKey: ["recent-uploads"] });
        
        toast({
          title: "Erro ao excluir",
          description: result.error || "Não foi possível excluir o arquivo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Reverter o optimistic update em caso de erro
      queryClient.invalidateQueries({ queryKey: ["recent-uploads"] });
      
      console.error('Erro ao excluir upload:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const campaigns: Campaign[] =
    recentUploads?.map((upload) => {
      const schedule = schedules?.find((s) => s.id === upload.campaign_id);
      return {
        id: upload.id,
        name: upload.file_name || "Arquivo sem nome",
        campaignName: schedule?.name || "Campanha sem nome",
        uploadDate: upload.uploaded_at,
        status:
          upload.status === "completed"
            ? "Processada"
            : upload.status === "processing"
            ? "Em análise"
            : "Rascunho",
        participants: 0, // Será calculado no processamento
      };
    }) || [];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/campaigns")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Campanhas
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Apuração Inteligente</h1>
                <p className="text-gray-600 mt-2">Processamento automático de campanhas de vendas</p>
              </div>

              {/* Seleção de Campanha e Upload */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Selecione a Campanha
                    </label>
                    {isLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma campanha" />
                        </SelectTrigger>
                        <SelectContent>
                          {schedules?.map((schedule) => (
                            <SelectItem key={schedule.id} value={schedule.id}>
                              {schedule.name} - {schedule.status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {selectedCampaignId && (
                    <FileDropzone onFileAccepted={handleFileAccepted} disabled={isUploading} />
                  )}

                  {!selectedCampaignId && (
                    <div className="text-center p-8 text-gray-500">
                      Selecione uma campanha para fazer upload do arquivo de vendas
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Uploads Recentes */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">Uploads Recentes</h2>
                {isLoadingUploads ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : campaigns.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign, index) => (
                      <CampaignCard
                        key={campaign.id}
                        {...campaign}
                        index={index}
                        onClick={() => handleUploadClick(campaign.id)}
                        onDelete={handleDeleteUpload}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                      Nenhum upload encontrado. Faça o upload do primeiro arquivo acima.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
