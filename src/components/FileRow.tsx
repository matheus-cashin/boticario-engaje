
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CampaignFile } from "@/hooks/useCampaignFilesList";
import { downloadCampaignFile } from "@/services/campaignFileService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileStatusBadge } from "./FileStatusBadge";
import { CreditStatusBadge } from "./CreditStatusBadge";
import { FileActionsDropdown } from "./FileActionsDropdown";
import { FileDeleteDialog } from "./FileDeleteDialog";

interface FileRowProps {
  file: CampaignFile;
  onDistributeBatch: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export function FileRow({ file, onDistributeBatch, onDeleteFile }: FileRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [totalValue, setTotalValue] = useState<string>("R$ 0,00");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Extrair informações do processing_result
  const auditType = file.processing_result?.auditType || "Parcial";
  const participantsCount = file.processing_result?.participantsCount || 0;

  // Formatar data
  const uploadDate = new Date(file.uploaded_at).toLocaleDateString('pt-BR');

  // Buscar valor real das vendas deste arquivo
  useEffect(() => {
    const fetchFileSales = async () => {
      const { data: sales } = await supabase
        .from('sales_data')
        .select('amount')
        .eq('source_file_id', file.id)
        .is('deleted_at', null);

      if (sales && sales.length > 0) {
        const fileValue = sales.reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0);
        setTotalValue(`R$ ${fileValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      }
    };

    fetchFileSales();
  }, [file.id]);

  const handleDelete = () => {
    onDeleteFile(file.id);
    setShowDeleteDialog(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Buscar o file_path do arquivo
      const { data: fileData } = await supabase
        .from('campaign_files')
        .select('file_path')
        .eq('id', file.id)
        .single();

      if (!fileData?.file_path) {
        toast({
          title: "Erro no download",
          description: "Caminho do arquivo não encontrado.",
          variant: "destructive",
        });
        return;
      }

      const result = await downloadCampaignFile(fileData.file_path, file.file_name);
      
      if (result.success) {
        toast({
          title: "Download iniciado",
          description: "O arquivo será baixado em breve.",
        });
      } else {
        toast({
          title: "Erro no download",
          description: result.error || "Não foi possível baixar o arquivo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewAnalysis = () => {
    navigate(`/apuracao/analyze/${file.id}`);
  };

  const isFinal = auditType === "Final";

  return (
    <>
      <tr 
        className={`border-b last:border-b-0 ${
          isFinal ? "bg-green-50 hover:bg-green-100" : ""
        }`}
      >
        <td className="p-2">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="text-blue-600 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? "Baixando..." : file.file_name}
            </button>
          </div>
        </td>
        <td className="p-2">{uploadDate}</td>
        <td className="p-2">
          <div>
            <div>{totalValue}</div>
            {participantsCount > 0 && (
              <div className="text-xs text-gray-500">
                {participantsCount} participante(s)
              </div>
            )}
          </div>
        </td>
        <td className="p-2">
          <CreditStatusBadge status={file.status} fileId={file.id} />
        </td>
        <td className="p-2">
          <FileActionsDropdown
            fileStatus={file.status}
            creditStatus={
              file.status === 'completed' && file.id === '9987621b-9278-439a-81dc-1f32dc07e160' 
                ? 'Distribuído' 
                : file.status === 'completed' 
                  ? 'Pendente' 
                  : file.status === 'failed' 
                    ? 'Sem saldo'
                    : 'Pendente'
            }
            isDownloading={isDownloading}
            onDownload={handleDownload}
            onDistribute={() => onDistributeBatch(file.id)}
            onDelete={() => setShowDeleteDialog(true)}
            onViewAnalysis={handleViewAnalysis}
          />
        </td>
      </tr>

      <FileDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        fileName={file.file_name}
        onConfirm={handleDelete}
      />
    </>
  );
}
