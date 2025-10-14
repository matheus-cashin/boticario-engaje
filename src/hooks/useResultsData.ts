import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Participant {
  id: string;
  name: string;
  email: string;
  division: string;
  manager: string;
  achievementBrazil: number;
  achievementDivision: number;
  achievementIndividual: number;
  salesCoffee: number;
  salesFilter: number;
  totalSales: number;
  cashins: number;
}

interface MetricsSummary {
  totalParticipants: number;
  metasAtingidas: number;
  participantesAcima100: number;
  totalCashins: number;
  taxaEngajamento: number;
  naoQualificados: number;
}

interface LevelDistribution {
  level: string;
  coffee: {
    percentage: number;
    qualified: number;
    total: number;
  };
  filter: {
    percentage: number;
    qualified: number;
    total: number;
  };
}

interface ResultsData {
  campaignName: string;
  campaignId: string;
  processDate: string;
  status: "processed" | "processing";
  metrics: MetricsSummary;
  participants: Participant[];
  levelDistribution: LevelDistribution[];
  distributionHistogram: Array<{ range: string; count: number }>;
  evolutionData: Array<{ week: string; average: number }>;
  managerData: Array<{ manager: string; avgPerformance: number; participants: number }>;
  salesTarget: number;
  totalSalesAchieved: number;
  estimatedPrize: number;
}

const fetchResultsData = async (scheduleId: string): Promise<ResultsData | null> => {
  console.log('🔍 Fetching results for schedule:', scheduleId);

  // Buscar informações da campanha
  const { data: schedule, error: scheduleError } = await supabase
    .from('schedules')
    .select('*')
    .eq('id', scheduleId)
    .maybeSingle();

  if (scheduleError || !schedule) {
    console.error('❌ Schedule not found:', scheduleError);
    return null;
  }

  // Buscar ranking mais recente processado
  const { data: latestRanking } = await supabase
    .from('rankings')
    .select('*')
    .eq('schedule_id', schedule.id)
    .is('deleted_at', null)
    .order('calculation_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Buscar TODOS os participantes da campanha com current_progress já calculado
  const { data: allParticipants } = await supabase
    .from('participants')
    .select('*')
    .eq('schedule_id', schedule.id);

  console.log(`📊 Total participants in campaign: ${allParticipants?.length || 0}`);

  // Criar lista completa de participantes usando current_progress (já calculado na apuração)
  const participants: Participant[] = (allParticipants || []).map(p => {
    const totalSales = Number(p.current_progress) || 0;
    const salesTarget = Number(schedule.sales_target) || 0;
    const achievement = salesTarget > 0 ? Math.min((totalSales / salesTarget) * 100, 200) : 0;

    return {
      id: p.id,
      name: p.name,
      email: p.email || '',
      division: 'N/A',
      manager: 'N/A',
      achievementBrazil: achievement,
      achievementDivision: achievement,
      achievementIndividual: achievement,
      salesCoffee: totalSales * 0.6,
      salesFilter: totalSales * 0.4,
      totalSales: totalSales,
      cashins: 0,
    };
  });

  // Ordenar por total de vendas
  participants.sort((a, b) => b.totalSales - a.totalSales);

  console.log(`✅ Processed ${participants.length} participants for ranking`);

  if (latestRanking) {
    console.log('✅ Found latest ranking:', latestRanking.calculation_date);

    // Já temos os participants processados acima, apenas usar dados do ranking para estatísticas
    console.log(`📊 Using ${participants.length} participants from consolidated data`);

    // Calcular métricas usando os participantes consolidados
    const totalSales = participants.reduce((sum, p) => sum + p.totalSales, 0);
    
    const participantesAcima100 = participants.filter(p => {
      const avgPerformance = (p.achievementBrazil + p.achievementDivision + p.achievementIndividual) / 3;
      return avgPerformance >= 100;
    }).length;
    
    const metrics: MetricsSummary = {
      totalParticipants: participants.length,
      metasAtingidas: participantesAcima100,
      participantesAcima100: participantesAcima100,
      totalCashins: 0,
      taxaEngajamento: participants.length > 0 ? (participantesAcima100 / participants.length) * 100 : 0,
      naoQualificados: participants.length - participantesAcima100,
    };

    // Criar histograma de distribuição baseado em achievement
    const distributionHistogram = [
      { range: "0-50%", count: participants.filter(p => {
        const avg = (p.achievementBrazil + p.achievementDivision + p.achievementIndividual) / 3;
        return avg < 50;
      }).length },
      { range: "50-100%", count: participants.filter(p => {
        const avg = (p.achievementBrazil + p.achievementDivision + p.achievementIndividual) / 3;
        return avg >= 50 && avg < 100;
      }).length },
      { range: "100-150%", count: participants.filter(p => {
        const avg = (p.achievementBrazil + p.achievementDivision + p.achievementIndividual) / 3;
        return avg >= 100 && avg < 150;
      }).length },
      { range: "150%+", count: participants.filter(p => {
        const avg = (p.achievementBrazil + p.achievementDivision + p.achievementIndividual) / 3;
        return avg >= 150;
      }).length },
    ];

    // Criar dados de evolução (mock por enquanto)
    const evolutionData = [
      { week: "Semana 1", average: 45 },
      { week: "Semana 2", average: 68 },
      { week: "Semana 3", average: 82 },
      { week: "Semana 4", average: 95 },
    ];

    const resultsData: ResultsData = {
      campaignName: schedule.name,
      campaignId: schedule.id,
      processDate: latestRanking.calculation_date,
      status: 'processed',
      metrics,
      participants,
      levelDistribution: [],
      distributionHistogram,
      evolutionData,
      managerData: [],
      salesTarget: Number(schedule.sales_target) || 0,
      totalSalesAchieved: totalSales,
      estimatedPrize: 0,
    };

    return resultsData;
  }

  // Caso não haja ranking processado, os participantes já foram processados acima
  // Apenas retornar os dados consolidados
  console.log('⚠️ No ranking found, using consolidated participant data');

  // Ordenar por performance
  participants.sort((a, b) => {
    const avgA = (a.achievementBrazil + a.achievementDivision + a.achievementIndividual) / 3;
    const avgB = (b.achievementBrazil + b.achievementDivision + b.achievementIndividual) / 3;
    return avgB - avgA;
  });

  // Calcular métricas
  const participantesAcima100 = participants.filter(p => 
    (p.achievementBrazil + p.achievementDivision + p.achievementIndividual) / 3 >= 100
  ).length;

  const qualificados = participants.filter(p => p.cashins > 0).length;
  const naoQualificados = participants.length - qualificados;

  const metrics: MetricsSummary = {
    totalParticipants: participants.length,
    metasAtingidas: qualificados,
    participantesAcima100,
    totalCashins: participants.reduce((sum, p) => sum + p.cashins, 0),
    taxaEngajamento: participants.length > 0 ? (qualificados / participants.length) * 100 : 0,
    naoQualificados,
  };

  // Distribuição por nível (mock - deve vir das regras)
  const totalParticipants = participants.length;
  const brazilQualified = participants.filter(p => p.achievementBrazil >= 100).length;
  const divisionQualified = participants.filter(p => p.achievementDivision >= 100).length;
  const individualQualified = participants.filter(p => p.achievementIndividual >= 100).length;

  const levelDistribution: LevelDistribution[] = [
    {
      level: "Brasil",
      coffee: {
        percentage: totalParticipants > 0 ? Math.round((brazilQualified / totalParticipants) * 100) : 0,
        qualified: brazilQualified,
        total: totalParticipants,
      },
      filter: {
        percentage: totalParticipants > 0 ? Math.round((brazilQualified / totalParticipants) * 100) : 0,
        qualified: brazilQualified,
        total: totalParticipants,
      },
    },
    {
      level: "Divisional",
      coffee: {
        percentage: totalParticipants > 0 ? Math.round((divisionQualified / totalParticipants) * 100) : 0,
        qualified: divisionQualified,
        total: totalParticipants,
      },
      filter: {
        percentage: totalParticipants > 0 ? Math.round((divisionQualified / totalParticipants) * 100) : 0,
        qualified: divisionQualified,
        total: totalParticipants,
      },
    },
    {
      level: "Individual",
      coffee: {
        percentage: totalParticipants > 0 ? Math.round((individualQualified / totalParticipants) * 100) : 0,
        qualified: individualQualified,
        total: totalParticipants,
      },
      filter: {
        percentage: totalParticipants > 0 ? Math.round((individualQualified / totalParticipants) * 100) : 0,
        qualified: individualQualified,
        total: totalParticipants,
      },
    },
  ];

  // Histograma de distribuição
  const ranges = [
    { range: "0-20%", min: 0, max: 20 },
    { range: "20-40%", min: 20, max: 40 },
    { range: "40-60%", min: 40, max: 60 },
    { range: "60-80%", min: 60, max: 80 },
    { range: "80-100%", min: 80, max: 100 },
    { range: "100-120%", min: 100, max: 120 },
    { range: "120-140%", min: 120, max: 140 },
    { range: "140%+", min: 140, max: Infinity },
  ];

  const distributionHistogram = ranges.map(r => ({
    range: r.range,
    count: participants.filter(p => {
      const avg = (p.achievementBrazil + p.achievementDivision + p.achievementIndividual) / 3;
      return avg >= r.min && avg < r.max;
    }).length,
  }));

  // Buscar arquivos processados para evolução temporal com vendas acumuladas
  const { data: filesData } = await supabase
    .from('campaign_files')
    .select('processed_at, id')
    .eq('schedule_id', scheduleId)
    .is('deleted_at', null)
    .eq('status', 'completed')
    .eq('upload_type', 'sales')
    .order('processed_at', { ascending: true });

  const evolutionData: Array<{ week: string; average: number }> = [];
  
  if (filesData && filesData.length > 0) {
    let cumulativeSales = 0;
    
    for (let i = 0; i < filesData.length; i++) {
      const file = filesData[i];
      
      // Buscar vendas até este arquivo (acumulado)
      const { data: fileSales } = await supabase
        .from('sales_data')
        .select('amount')
        .eq('schedule_id', schedule.id)
        .is('deleted_at', null)
        .lte('created_at', file.processed_at || new Date().toISOString());
      
      if (fileSales) {
        cumulativeSales = fileSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
      }
      
      // Calcular porcentagem de atingimento da meta
      const targetAmount = Number((schedule as any).sales_target) || 120000;
      const achievementPercentage = (cumulativeSales / targetAmount) * 100;
      
      evolutionData.push({
        week: `Parcial ${i + 1}`,
        average: achievementPercentage,
      });
    }
  }

  // Se não houver dados de evolução, criar um mock básico
  if (evolutionData.length === 0) {
    const totalSales = participants.reduce((sum, p) => sum + p.totalSales, 0);
    const targetAmount = Number((schedule as any).sales_target) || 120000;
    const achievementPercentage = (totalSales / targetAmount) * 100;
    
    evolutionData.push({
      week: "Atual",
      average: achievementPercentage,
    });
  }

  // Manager data (mock - não temos essa estrutura ainda)
  const managerData: Array<{ manager: string; avgPerformance: number; participants: number }> = [];

  const salesTarget = Number((schedule as any).sales_target) || 0;
  const totalSalesAchieved = participants.reduce((sum, p) => sum + p.totalSales, 0);
  const estimatedPrize = participants.reduce((sum, p) => sum + p.cashins, 0);

  return {
    campaignName: schedule.name,
    campaignId: schedule.campaign_id,
    processDate: schedule.updated_at || schedule.created_at,
    status: participants.length > 0 ? "processed" : "processing",
    metrics,
    participants,
    levelDistribution,
    distributionHistogram,
    evolutionData,
    managerData,
    salesTarget,
    totalSalesAchieved,
    estimatedPrize,
  };
};

export function useResultsData(scheduleId: string) {
  return useQuery({
    queryKey: ["results", scheduleId],
    queryFn: async () => {
      const data = await fetchResultsData(scheduleId);
      console.log('🎯 useResultsData returning:', {
        scheduleId,
        participantsCount: data?.participants?.length || 0,
        firstParticipant: data?.participants?.[0]?.name,
        totalSales: data?.totalSalesAchieved
      });
      return data;
    },
    enabled: !!scheduleId,
    staleTime: 5 * 60 * 1000,
  });
}
