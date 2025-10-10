
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Campaign {
  id: string;
  name: string;
  platform: "whatsapp" | "email";
  fileCount: number;
  participantCount: number;
  startDate: string;
  endDate: string;
  totalValue: string;
  processingMode?: string;
  files: FileItem[];
}

export interface FileItem {
  name: string;
  uploadDate: string;
  totalValue: string;
  audit: string;
  status: "em-processamento" | "aprovado" | "rejeitado";
  credit: string;
}

export function useCampaigns() {
  const queryClient = useQueryClient();

  // Setup real-time subscription for campaign_files changes
  useEffect(() => {
    const channel = supabase
      .channel('campaign-files-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_files'
        },
        () => {
          // Invalidate and refetch campaigns when files change
          queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      console.log('=== INICIANDO BUSCA DE CAMPANHAS ===');
      
      try {
        // Buscar schedules
        console.log('Buscando schedules...');
        const { data: schedules, error: schedulesError } = await supabase
          .from('schedules')
          .select('*');

        if (schedulesError) {
          console.error('❌ Erro ao buscar schedules:', schedulesError);
          throw new Error(`Erro ao buscar schedules: ${schedulesError.message}`);
        }

        console.log('✅ Schedules encontrados:', schedules?.length || 0);

        if (!schedules || schedules.length === 0) {
          console.log('⚠️ Nenhum schedule encontrado');
          return [];
        }

        // Buscar campaign_files (dados reais das apurações)
        console.log('Buscando campaign_files...');
        const { data: campaignFiles, error: filesError } = await supabase
          .from('campaign_files')
          .select('*')
          .eq('upload_type', 'sales');

        if (filesError) {
          console.error('❌ Erro ao buscar campaign_files:', filesError);
          console.log('⚠️ Continuando sem campaign_files...');
        }

        console.log('✅ Campaign files encontrados:', campaignFiles?.length || 0);

        // Buscar todos os participants
        console.log('Buscando participants...');
        const { data: participants, error: participantsError } = await supabase
          .from('participants')
          .select('*');

        if (participantsError) {
          console.error('❌ Erro ao buscar participants:', participantsError);
          console.log('⚠️ Continuando sem participants...');
        }

        console.log('✅ Participants encontrados:', participants?.length || 0);

        // Buscar créditos para verificar status de divergência
        console.log('Buscando credits...');
        const { data: credits, error: creditsError } = await supabase
          .from('credits')
          .select('*');

        if (creditsError) {
          console.error('❌ Erro ao buscar credits:', creditsError);
          console.log('⚠️ Continuando sem credits...');
        }

        console.log('✅ Credits encontrados:', credits?.length || 0);

        // Transformar os dados
        console.log('🔄 Transformando dados em campanhas...');
        const campaigns: Campaign[] = schedules.map((schedule, index) => {
          console.log(`\n--- Processando Schedule ${index + 1}: ${schedule.name} ---`);
          
          // Filtrar dados relacionados a este schedule
          const scheduleCampaignFiles = campaignFiles?.filter(file => file.campaign_id === schedule.id) || [];
          const scheduleParticipants = participants?.filter(participant => participant.schedule_id === schedule.id) || [];
          const scheduleCredits = credits?.filter(credit => credit.schedule_id === schedule.id) || [];

          console.log(`📁 Campaign files para este schedule: ${scheduleCampaignFiles.length}`);
          console.log(`👥 Participants para este schedule: ${scheduleParticipants.length}`);
          console.log(`💳 Credits para este schedule: ${scheduleCredits.length}`);

          // Determinar plataforma com validação robusta
          let platform: "whatsapp" | "email" = "email"; // Default
          
          if (schedule.notification_types) {
            if (Array.isArray(schedule.notification_types)) {
              platform = schedule.notification_types.includes('whatsapp') ? 'whatsapp' : 'email';
            } else if (typeof schedule.notification_types === 'string') {
              const notifString = schedule.notification_types as string;
              platform = notifString.toLowerCase().includes('whatsapp') ? 'whatsapp' : 'email';
            }
          }
          
          console.log(`📱 Platform determinada: ${platform} (notification_types: ${JSON.stringify(schedule.notification_types)})`);

          // Formatar datas
          const formatDate = (dateStr: string | null) => {
            if (!dateStr) return 'N/A';
            try {
              return new Date(dateStr).toLocaleDateString('pt-BR');
            } catch (error) {
              console.log('⚠️ Erro ao formatar data:', dateStr, error);
              return 'N/A';
            }
          };

          const startDate = formatDate(schedule.start_date);
          const endDate = formatDate(schedule.end_date);

          // Calcular valor total das apurações reais
          const totalValue = scheduleCampaignFiles.reduce((sum, file) => {
            // Verificar se o arquivo foi processado com sucesso
            if (file.status === 'completed' && file.processing_result) {
              try {
                const processingResult = typeof file.processing_result === 'string' 
                  ? JSON.parse(file.processing_result) 
                  : file.processing_result;
                
                // Extrair valor total do processing_result
                const amount = processingResult?.totalAmount || 
                              processingResult?.total_amount || 
                              processingResult?.valorTotal || 0;
                
                return sum + Number(amount);
              } catch (error) {
                console.log('⚠️ Erro ao processar processing_result:', error);
                return sum;
              }
            }
            return sum;
          }, 0);

          const formattedTotalValue = `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

          // Transformar campaign_files em files com status de crédito correto
          const files: FileItem[] = scheduleCampaignFiles.map(file => {
            const uploadDate = file.uploaded_at ? formatDate(file.uploaded_at) : 'N/A';
            
            // Calcular valor do arquivo
            let fileValue = 0;
            if (file.status === 'completed' && file.processing_result) {
              try {
                const processingResult = typeof file.processing_result === 'string' 
                  ? JSON.parse(file.processing_result) 
                  : file.processing_result;
                
                fileValue = processingResult?.totalAmount || 
                           processingResult?.total_amount || 
                           processingResult?.valorTotal || 0;
              } catch (error) {
                console.log('⚠️ Erro ao processar valor do arquivo:', error);
              }
            }
            
            const formattedFileValue = `R$ ${Number(fileValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            
            // Mapear status
            let status: "em-processamento" | "aprovado" | "rejeitado" = "em-processamento";
            if (file.status === 'completed') status = 'aprovado';
            else if (file.status === 'failed') status = 'rejeitado';

            // Verificar se há créditos divergentes para este arquivo
            const fileCredits = scheduleCredits.filter(credit => credit.upload_batch_id === file.id);
            const hasDivergentCredits = fileCredits.some(credit => credit.status === 'divergente');
            
            // Determinar status do crédito
            let creditStatus = 'Pendente';
            if (hasDivergentCredits) {
              creditStatus = 'Divergente';
            } else if (fileCredits.some(credit => credit.status === 'distribuido')) {
              creditStatus = 'Distribuído';
            }

            // Determinar tipo de auditoria
            let auditType = 'Parcial';
            if (file.processing_result) {
              try {
                const processingResult = typeof file.processing_result === 'string' 
                  ? JSON.parse(file.processing_result) 
                  : file.processing_result;
                
                if (processingResult?.auditType === 'Final') {
                  auditType = 'Final';
                }
              } catch (error) {
                console.log('⚠️ Erro ao determinar tipo de auditoria:', error);
              }
            }

            return {
              name: file.file_name || 'Arquivo sem nome',
              uploadDate,
              totalValue: formattedFileValue,
              audit: auditType,
              status,
              credit: creditStatus
            };
          });

          const campaign: Campaign = {
            id: schedule.id,
            name: schedule.name || 'Campanha sem nome',
            platform,
            fileCount: scheduleCampaignFiles.length,
            participantCount: scheduleParticipants.length,
            startDate,
            endDate,
            totalValue: formattedTotalValue,
            processingMode: schedule.processing_mode || undefined,
            files
          };

          console.log(`✅ Campanha criada:`, campaign);
          return campaign;
        });

        console.log('🎉 TRANSFORMAÇÃO CONCLUÍDA!');
        console.log(`📊 Total de campanhas processadas: ${campaigns.length}`);
        
        return campaigns;
        
      } catch (error) {
        console.error('💥 ERRO GERAL na busca de campanhas:', error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
