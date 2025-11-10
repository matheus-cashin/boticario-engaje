import { supabase } from "@/integrations/supabase/client";

export const calculatePrizes = async (scheduleId: string) => {
  console.log('🎯 Iniciando cálculo mockado de prêmios para schedule:', scheduleId);
  
  // Simulando delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Buscar participantes do schedule
  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .eq('schedule_id', scheduleId);

  if (!participants || participants.length === 0) {
    console.log('⚠️ Nenhum participante encontrado');
    return {
      success: true,
      summary: {
        schedule_id: scheduleId,
        total_participants: 0,
        participants_with_prizes: 0,
        total_prizes: 0,
        total_sales_records: 0
      },
      prizes: []
    };
  }

  // Filtrar participantes que atingiram a meta (current_progress >= target_amount)
  const qualifiedParticipants = participants.filter(p => {
    const progress = Number(p.current_progress) || 0;
    const target = Number(p.target_amount) || 0;
    return target > 0 && progress >= target;
  });

  console.log(`👥 Total de participantes: ${participants.length}`);
  console.log(`✅ Participantes que atingiram meta: ${qualifiedParticipants.length}`);

  const TOTAL_PRIZE_POOL = 8500;
  const prizePerQualified = qualifiedParticipants.length > 0 
    ? TOTAL_PRIZE_POOL / qualifiedParticipants.length 
    : 0;

  // Soft delete créditos antigos deste schedule
  await supabase
    .from('credits')
    .update({ deleted_at: new Date().toISOString() })
    .eq('schedule_id', scheduleId)
    .is('deleted_at', null);

  // Inserir novos créditos para participantes qualificados
  if (qualifiedParticipants.length > 0) {
    const creditsToInsert = qualifiedParticipants.map(p => ({
      schedule_id: scheduleId,
      participant_id: p.id,
      amount: prizePerQualified,
      credit_type: 'premio',
      status: 'pendente',
      description: 'Prêmio por atingimento de meta',
      calculated_at: new Date().toISOString()
    }));

    const { error: insertError } = await supabase
      .from('credits')
      .insert(creditsToInsert);

    if (insertError) {
      console.error('❌ Erro ao inserir créditos:', insertError);
      throw insertError;
    }
  }

  // Preparar resposta mockada
  const prizes = qualifiedParticipants.map(p => ({
    participant_id: p.id,
    participant_name: p.name,
    total_sales: Number(p.current_progress) || 0,
    achievement_percentage: Number(p.target_amount) > 0 
      ? ((Number(p.current_progress) / Number(p.target_amount)) * 100).toFixed(1)
      : 0,
    prize_amount: prizePerQualified,
    qualified_conditions: ["Atingiu meta individual"]
  }));

  const mockData = {
    success: true,
    summary: {
      schedule_id: scheduleId,
      total_participants: participants.length,
      participants_with_prizes: qualifiedParticipants.length,
      total_prizes: TOTAL_PRIZE_POOL,
      total_sales_records: 0
    },
    prizes
  };

  console.log('✅ Prêmios calculados e distribuídos:', mockData);
  console.log(`💰 Total distribuído: R$ ${TOTAL_PRIZE_POOL.toFixed(2)}`);
  console.log(`👥 Valor por participante qualificado: R$ ${prizePerQualified.toFixed(2)}`);
  
  return mockData;
};
