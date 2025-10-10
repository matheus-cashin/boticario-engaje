
import { useState, useEffect, useRef } from "react";
import { getCampaignFiles } from "@/services/campaignFileService";
import { supabase } from "@/integrations/supabase/client";

export interface CampaignFile {
  id: string;
  file_name: string;
  uploaded_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_result?: any;
  error_message?: string;
  file_size: number;
  upload_type: string;
}

export function useCampaignFilesList(scheduleId: string) {
  const [files, setFiles] = useState<CampaignFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Carregando arquivos do schedule:', scheduleId);
      
      if (!scheduleId) {
        console.log('⚠️ Schedule ID não fornecido');
        setFiles([]);
        return;
      }
      
      const campaignFiles = await getCampaignFiles(scheduleId);
      
      console.log('📥 Arquivos retornados do serviço:', campaignFiles);
      
      // Mapear dados do Supabase para o tipo CampaignFile
      const mappedFiles: CampaignFile[] = campaignFiles.map(file => ({
        id: file.id,
        file_name: file.file_name,
        uploaded_at: file.uploaded_at,
        status: file.status as 'pending' | 'processing' | 'completed' | 'failed',
        processing_result: file.processing_result,
        error_message: file.error_message || undefined,
        file_size: file.file_size,
        upload_type: file.upload_type
      }));
      
      console.log('✅ Arquivos mapeados:', mappedFiles);
      setFiles(mappedFiles);
      
      console.log('✅ Arquivos carregados:', mappedFiles.length);
    } catch (err) {
      console.error('❌ Erro ao carregar arquivos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect disparado para scheduleId:', scheduleId);
    if (scheduleId) {
      loadFiles();

      // Limpar canal anterior se existir
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Configurar real-time subscription com nome único
      console.log('📡 Configurando real-time para campaign_files');
      
      const channelName = `campaign_files_${scheduleId}_${Date.now()}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'campaign_files',
            filter: `schedule_id=eq.${scheduleId}`
          },
          (payload) => {
            console.log('📨 Real-time update recebido:', payload);
            
            // Recarregar a lista quando houver mudanças
            loadFiles();
          }
        )
        .subscribe();

      channelRef.current = channel;

      // Cleanup function
      return () => {
        console.log('🧹 Limpando subscription real-time');
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    } else {
      setFiles([]);
      setIsLoading(false);
    }
  }, [scheduleId]);

  return {
    files,
    isLoading,
    error,
    refetch: loadFiles
  };
}
