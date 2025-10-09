import { useQuery } from "@tanstack/react-query";

interface ParticipantPerformance {
  level: string;
  coffee: {
    percentage: number;
    achieved: boolean;
  };
  filter: {
    percentage: number;
    achieved: boolean;
  };
}

interface ParticipantHistory {
  campaign: string;
  period: string;
  averagePerformance: number;
  prize: number;
}

interface ParticipantData {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  role: string;
  division: string;
  unit: string;
  manager: string;
  campaign: {
    name: string;
    period: string;
  };
  performance: ParticipantPerformance[];
  averageAchievement: number;
  ranking: {
    position: number;
    total: number;
  };
  level: "Bronze" | "Prata" | "Ouro" | "Platinum";
  prize: {
    base: number;
    bonus: number;
    total: number;
    status: "pending" | "processing" | "paid";
    paidDate?: string;
  };
  history: ParticipantHistory[];
  trend: "up" | "stable" | "down";
}

const calculatePrize = (avgPerformance: number): { base: number; bonus: number } => {
  let base = 0;
  
  if (avgPerformance < 70) {
    base = 0;
  } else if (avgPerformance < 100) {
    base = 500;
  } else if (avgPerformance < 150) {
    base = 1200;
  } else if (avgPerformance < 200) {
    base = 2000;
  } else {
    base = 3000;
  }

  // Bônus de 10-20% para superação
  const bonus = avgPerformance >= 100 ? Math.floor(base * (0.1 + Math.random() * 0.1)) : 0;
  
  return { base, bonus };
};

const getLevel = (avgPerformance: number): "Bronze" | "Prata" | "Ouro" | "Platinum" => {
  if (avgPerformance >= 180) return "Platinum";
  if (avgPerformance >= 140) return "Ouro";
  if (avgPerformance >= 100) return "Prata";
  return "Bronze";
};

const mockParticipantData: ParticipantData = {
  id: "P001",
  name: "João Silva",
  email: "joao.silva@empresa.com",
  phone: "+55 11 98765-4321",
  employeeId: "EMP-12345",
  role: "Vendedor Sênior",
  division: "Sul",
  unit: "Porto Alegre - Centro",
  manager: "Ana Paula Gerente",
  campaign: {
    name: "GOL DE OURO",
    period: "Janeiro 2024",
  },
  performance: [
    {
      level: "Brasil",
      coffee: {
        percentage: 190,
        achieved: true,
      },
      filter: {
        percentage: 175,
        achieved: true,
      },
    },
    {
      level: "Divisional",
      coffee: {
        percentage: 156,
        achieved: true,
      },
      filter: {
        percentage: 142,
        achieved: true,
      },
    },
    {
      level: "Individual",
      coffee: {
        percentage: 168,
        achieved: true,
      },
      filter: {
        percentage: 185,
        achieved: true,
      },
    },
  ],
  averageAchievement: 169.3,
  ranking: {
    position: 3,
    total: 88,
  },
  level: "Ouro",
  prize: {
    base: 2000,
    bonus: 320,
    total: 2320,
    status: "pending",
  },
  history: [
    {
      campaign: "Campanha Q4 2023",
      period: "Out-Dez 2023",
      averagePerformance: 145,
      prize: 1400,
    },
    {
      campaign: "Campanha Q3 2023",
      period: "Jul-Set 2023",
      averagePerformance: 132,
      prize: 1200,
    },
    {
      campaign: "Campanha Q2 2023",
      period: "Abr-Jun 2023",
      averagePerformance: 118,
      prize: 800,
    },
    {
      campaign: "Campanha Q1 2023",
      period: "Jan-Mar 2023",
      averagePerformance: 98,
      prize: 500,
    },
  ],
  trend: "up",
};

const fetchParticipantData = async (participantId: string): Promise<ParticipantData> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Calcular prêmio baseado na performance
  const { base, bonus } = calculatePrize(mockParticipantData.averageAchievement);
  const level = getLevel(mockParticipantData.averageAchievement);
  
  return {
    ...mockParticipantData,
    id: participantId,
    prize: {
      ...mockParticipantData.prize,
      base,
      bonus,
      total: base + bonus,
    },
    level,
  };
};

export function useParticipantData(participantId: string) {
  return useQuery({
    queryKey: ["participant", participantId],
    queryFn: () => fetchParticipantData(participantId),
    staleTime: 5 * 60 * 1000,
  });
}
