export const calculatePrizes = async (scheduleId: string) => {
  // Simulando delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Dados mockados
  const mockData = {
    success: true,
    summary: {
      schedule_id: scheduleId,
      total_participants: 5,
      participants_with_prizes: 4,
      total_prizes: 18500.00,
      total_sales_records: 610
    },
    prizes: [
      {
        participant_id: "1",
        participant_name: "Julia",
        total_sales: 125000.50,
        achievement_percentage: 104.2,
        prize_amount: 6000.00,
        qualified_conditions: ["Faixa 3720-4029 pontos"]
      },
      {
        participant_id: "2",
        participant_name: "Marcos",
        total_sales: 98500.00,
        achievement_percentage: 95.5,
        prize_amount: 4000.00,
        qualified_conditions: ["Faixa 3410-3719 pontos"]
      },
      {
        participant_id: "3",
        participant_name: "Nani",
        total_sales: 142000.00,
        achievement_percentage: 112.3,
        prize_amount: 9000.00,
        qualified_conditions: ["Mínimo 4030 pontos"]
      },
      {
        participant_id: "4",
        participant_name: "Matheus",
        total_sales: 87000.00,
        achievement_percentage: 89.2,
        prize_amount: 2000.00,
        qualified_conditions: ["Faixa 3100-3409 pontos"]
      }
    ]
  };

  console.log('✅ Prêmios mockados calculados com sucesso:', mockData);
  return mockData;
};
