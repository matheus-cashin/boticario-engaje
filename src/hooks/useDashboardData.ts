import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardMetrics {
  averageAchievement: number;
  activeParticipation: number;
  popGrowth: number;
  totalRevenue: number;
  totalTarget: number;
  achievementDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  eligibilityRate: number;
  penetrationRate: number;
  campaignROI: number;
  performanceByCluster: {
    name: string;
    achievement: number;
    revenue: number;
  }[];
  performanceByRole: {
    name: string;
    achievement: number;
    revenue: number;
  }[];
  velocityScore: number;
  topPerformers: {
    id: string;
    name: string;
    achievement: number;
    revenue: number;
  }[];
}

export function useDashboardData(empresaId?: string) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setError(null);

        if (!empresaId) {
          // Se não tiver empresa_id, usar dados mockados ou retornar vazio
          setMetrics(null);
          return;
        }

        // Buscar participações ativas
        const { data: participacoes, error: participacoesError } = await supabase
          .from('participacoes')
          .select(`
            *,
            vendedor:vendedores(nome, cpf, cargo, cluster),
            campanha:campanhas(nome, status)
          `)
          .eq('empresa_id', empresaId);

        if (participacoesError) throw participacoesError;

        // Calcular métricas
        const totalParticipants = participacoes?.length || 0;
        const activeParticipants = participacoes?.filter(p => (p.realizado || 0) > 0).length || 0;
        const totalRevenue = participacoes?.reduce((sum, p) => sum + Number(p.realizado || 0), 0) || 0;
        const totalTarget = participacoes?.reduce((sum, p) => sum + Number(p.meta || 0), 0) || 0;
        const totalAchievement = participacoes?.reduce((sum, p) => sum + Number(p.atingimento || 0), 0) || 0;
        const averageAchievement = totalParticipants > 0 ? totalAchievement / totalParticipants : 0;
        const activeParticipation = totalParticipants > 0 ? (activeParticipants / totalParticipants) * 100 : 0;

        // Distribuição de atingimento
        const distribution = [
          { range: '0-50%', count: 0, percentage: 0 },
          { range: '51-100%', count: 0, percentage: 0 },
          { range: '101-150%', count: 0, percentage: 0 },
          { range: '>150%', count: 0, percentage: 0 },
        ];

        participacoes?.forEach(p => {
          const achievement = Number(p.atingimento || 0);
          if (achievement <= 50) distribution[0].count++;
          else if (achievement <= 100) distribution[1].count++;
          else if (achievement <= 150) distribution[2].count++;
          else distribution[3].count++;
        });

        distribution.forEach(d => {
          d.percentage = totalParticipants > 0 ? (d.count / totalParticipants) * 100 : 0;
        });

        // Elegibilidade (atingiu pelo menos 80% da meta)
        const eligible = participacoes?.filter(p => Number(p.atingimento || 0) >= 80).length || 0;
        const eligibilityRate = totalParticipants > 0 ? (eligible / totalParticipants) * 100 : 0;

        // Penetração (teve impacto positivo - vendeu algo)
        const penetrationRate = activeParticipation;

        // ROI (simplificado)
        const totalCashins = participacoes?.reduce((sum, p) => sum + Number(p.premiacao_confirmada || 0), 0) || 0;
        const campaignROI = totalCashins > 0 ? (totalRevenue / totalCashins) : 0;

        // Performance por cluster
        const clusterMap = new Map<string, { revenue: number; achievement: number; count: number }>();
        participacoes?.forEach(p => {
          const cluster = (p.vendedor as any)?.cluster || 'Sem cluster';
          if (!clusterMap.has(cluster)) {
            clusterMap.set(cluster, { revenue: 0, achievement: 0, count: 0 });
          }
          const current = clusterMap.get(cluster)!;
          current.revenue += Number(p.realizado || 0);
          current.achievement += Number(p.atingimento || 0);
          current.count++;
        });

        const performanceByCluster = Array.from(clusterMap.entries()).map(([name, data]) => ({
          name,
          achievement: data.count > 0 ? data.achievement / data.count : 0,
          revenue: data.revenue,
        }));

        // Performance por cargo
        const roleMap = new Map<string, { revenue: number; achievement: number; count: number }>();
        participacoes?.forEach(p => {
          const role = (p.vendedor as any)?.cargo || 'Sem cargo';
          if (!roleMap.has(role)) {
            roleMap.set(role, { revenue: 0, achievement: 0, count: 0 });
          }
          const current = roleMap.get(role)!;
          current.revenue += Number(p.realizado || 0);
          current.achievement += Number(p.atingimento || 0);
          current.count++;
        });

        const performanceByRole = Array.from(roleMap.entries()).map(([name, data]) => ({
          name,
          achievement: data.count > 0 ? data.achievement / data.count : 0,
          revenue: data.revenue,
        }));

        // Velocity Score (dias médios para atingir 100%)
        const completedParticipations = participacoes?.filter(p => Number(p.atingimento || 0) >= 100) || [];
        const avgDays = completedParticipations.length > 0
          ? completedParticipations.reduce((sum, p) => sum + (p.dias_ativo || 0), 0) / completedParticipations.length
          : 0;
        const velocityScore = avgDays;

        // Top performers
        const topPerformers = participacoes
          ?.sort((a, b) => Number(b.atingimento || 0) - Number(a.atingimento || 0))
          .slice(0, 5)
          .map(p => ({
            id: p.id,
            name: (p.vendedor as any)?.nome || 'N/A',
            achievement: Number(p.atingimento || 0),
            revenue: Number(p.realizado || 0),
          })) || [];

        setMetrics({
          averageAchievement,
          activeParticipation,
          popGrowth: 0, // Precisa de dados históricos para calcular
          totalRevenue,
          totalTarget,
          achievementDistribution: distribution,
          eligibilityRate,
          penetrationRate,
          campaignROI,
          performanceByCluster,
          performanceByRole,
          velocityScore,
          topPerformers,
        });
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [empresaId]);

  return { metrics, isLoading, error };
}
