
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReportMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  totalParticipants: number;
  totalSalesAmount: number;
  averageParticipationRate: number;
  topPerformingCampaign: {
    name: string;
    amount: number;
  } | null;
}

export interface CampaignPerformance {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  totalAmount: number;
  fileCount: number;
  status: string;
  completionRate: number;
}

export function useReportsData() {
  return useQuery({
    queryKey: ['reports-data'],
    queryFn: async () => {
      console.log('🔍 Buscando dados para relatórios...');

      // Buscar schedules (campanhas)
      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select('*');

      if (schedulesError) {
        console.error('❌ Erro ao buscar schedules:', schedulesError);
        throw new Error(`Erro ao buscar campanhas: ${schedulesError.message}`);
      }

      // Buscar participants
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*');

      if (participantsError) {
        console.error('❌ Erro ao buscar participants:', participantsError);
        throw new Error(`Erro ao buscar participantes: ${participantsError.message}`);
      }

      // Buscar campaign_files
      const { data: campaignFiles, error: filesError } = await supabase
        .from('campaign_files')
        .select('*')
        .eq('upload_type', 'sales')
        .is('deleted_at', null);

      if (filesError) {
        console.error('❌ Erro ao buscar campaign_files:', filesError);
        throw new Error(`Erro ao buscar arquivos: ${filesError.message}`);
      }

      // Buscar sales_data para calcular valores reais
      const { data: salesData, error: salesError } = await supabase
        .from('sales_data')
        .select('*')
        .eq('is_valid', true)
        .is('deleted_at', null);

      if (salesError) {
        console.error('❌ Erro ao buscar sales_data:', salesError);
        throw new Error(`Erro ao buscar vendas: ${salesError.message}`);
      }

      // Calcular métricas gerais
      const totalCampaigns = schedules?.length || 0;
      const activeCampaigns = schedules?.filter(s => s.status === 'active').length || 0;
      const completedCampaigns = schedules?.filter(s => s.status === 'completed').length || 0;
      const totalParticipants = participants?.length || 0;

      // Calcular valor total das vendas
      const totalSalesAmount = salesData?.reduce((sum, sale) => sum + Number(sale.amount || 0), 0) || 0;

      // Calcular taxa média de participação
      const averageParticipationRate = totalCampaigns > 0 
        ? (totalParticipants / totalCampaigns) 
        : 0;

      // Encontrar campanha com melhor performance
      const campaignPerformances = schedules?.map(schedule => {
        const scheduleSales = salesData?.filter(s => s.schedule_id === schedule.id) || [];
        const scheduleAmount = scheduleSales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);

        return {
          name: schedule.name,
          amount: scheduleAmount
        };
      }) || [];

      const topPerformingCampaign = campaignPerformances.length > 0
        ? campaignPerformances.reduce((max, current) => 
            current.amount > max.amount ? current : max
          )
        : null;

      const metrics: ReportMetrics = {
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalParticipants,
        totalSalesAmount,
        averageParticipationRate,
        topPerformingCampaign
      };

      // Calcular performance por campanha
      const campaignPerformanceData: CampaignPerformance[] = schedules?.map(schedule => {
        const scheduleParticipants = participants?.filter(p => p.schedule_id === schedule.id) || [];
        const scheduleFiles = campaignFiles?.filter(f => f.schedule_id === schedule.id) || [];
        const scheduleSales = salesData?.filter(s => s.schedule_id === schedule.id) || [];
        
        const scheduleAmount = scheduleSales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);

        // Calcular taxa de conclusão baseada nos participantes que venderam
        const participantsWithSales = new Set(scheduleSales.map(s => s.participant_id)).size;
        const completionRate = scheduleParticipants.length > 0 
          ? (participantsWithSales / scheduleParticipants.length) * 100
          : 0;

        return {
          id: schedule.id,
          name: schedule.name || 'Campanha sem nome',
          startDate: schedule.start_date || '',
          endDate: schedule.end_date || '',
          participantCount: scheduleParticipants.length,
          totalAmount: scheduleAmount,
          fileCount: scheduleFiles.filter(f => f.status === 'processed').length,
          status: schedule.status || 'pending',
          completionRate
        };
      }) || [];

      console.log('✅ Dados de relatórios processados:', {
        metrics,
        campaignCount: campaignPerformanceData.length
      });

      return {
        metrics,
        campaignPerformance: campaignPerformanceData
      };
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
