
import { FileRow } from "./FileRow";
import { useCampaignFilesList } from "@/hooks/useCampaignFilesList";

interface FilesTableProps {
  campaignId: string;
  onDistributeBatch: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export function FilesTable({ campaignId, onDistributeBatch, onDeleteFile }: FilesTableProps) {
  const { files, isLoading, error, refetch } = useCampaignFilesList(campaignId);

  console.log('=== FILES TABLE DEBUG ===');
  console.log('📋 Campaign ID recebido:', campaignId);
  console.log('📁 Files carregados:', files);
  console.log('🔄 IsLoading:', isLoading);
  console.log('❌ Error:', error);
  console.log('📊 Quantidade de arquivos:', files?.length || 0);

  if (isLoading) {
    console.log('🔄 Mostrando loading...');
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Carregando arquivos...</p>
      </div>
    );
  }

  if (error) {
    console.log('💥 Mostrando erro:', error);
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Erro ao carregar arquivos: {error}</p>
        <button 
          onClick={refetch}
          className="mt-2 text-blue-600 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!files || files.length === 0) {
    console.log('📭 Nenhum arquivo encontrado, mostrando mensagem vazia');
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Nenhum arquivo de vendas encontrado.</p>
        <p className="text-xs text-gray-400 mt-1">Campaign ID: {campaignId}</p>
      </div>
    );
  }

  // Ordenar arquivos por data de envio, com finais no topo
  const sortedFiles = [...files].sort((a, b) => {
    // Verificar se é apuração final pelo processing_result
    const aIsFinal = a.processing_result?.auditType === "Final";
    const bIsFinal = b.processing_result?.auditType === "Final";
    
    if (aIsFinal && !bIsFinal) return -1;
    if (!aIsFinal && bIsFinal) return 1;
    
    // Ordenar por data mais recente
    return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
  });

  console.log(`✅ Renderizando tabela com ${sortedFiles.length} arquivos`);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 font-medium text-muted-foreground">ARQUIVO</th>
            <th className="text-left p-2 font-medium text-muted-foreground">DATA DE ENVIO</th>
            <th className="text-left p-2 font-medium text-muted-foreground">VALOR PARCIAL APURADO</th>
            <th className="text-left p-2 font-medium text-muted-foreground">APURAÇÃO</th>
            <th className="text-left p-2 font-medium text-muted-foreground">STATUS</th>
            <th className="text-left p-2 font-medium text-muted-foreground">CRÉDITO</th>
            <th className="text-left p-2 font-medium text-muted-foreground">AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {sortedFiles.map((file, index) => {
            console.log(`🎯 Renderizando arquivo ${index + 1}:`, file.file_name);
            return (
              <FileRow
                key={file.id}
                file={file}
                onDistributeBatch={onDistributeBatch}
                onDeleteFile={onDeleteFile}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
