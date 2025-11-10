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

  // Selecionar participantes que atingiram a meta (current_progress >= target_amount)
  const qualifiedParticipants = participants.filter(p => {
    const progress = Number(p.current_progress) || 0;
    const target = Number(p.target_amount) || 0;
    return target > 0 && progress >= target;
  });

  console.log(`👥 Total de participantes: ${participants.length}`);
  console.log(`✅ Participantes que atingiram meta: ${qualifiedParticipants.length}`);

  const TOTAL_PRIZE_POOL = 8500;

  // Estratégia de distribuição
  let recipients = qualifiedParticipants;
  if (recipients.length === 0) {
    console.warn('⚠️ Ninguém atingiu a meta. Distribuindo entre quem teve progresso (> 0).');
    recipients = participants.filter(p => (Number(p.current_progress) || 0) > 0);
  }
  if (recipients.length === 0) {
    console.warn('⚠️ Nenhum progresso encontrado. Distribuindo igualmente entre todos os participantes.');
    recipients = participants;
  }

  // Cálculo com ajuste de centavos para garantir total exato
  const baseAmount = Math.floor((TOTAL_PRIZE_POOL / recipients.length) * 100) / 100; // duas casas
  const subtotal = baseAmount * recipients.length;
  const remainder = Number((TOTAL_PRIZE_POOL - subtotal).toFixed(2));

  // Soft delete créditos antigos deste schedule
  await supabase
    .from('credits')
    .update({ deleted_at: new Date().toISOString() })
    .eq('schedule_id', scheduleId)
    .is('deleted_at', null);

  // Inserir novos créditos
  const nowIso = new Date().toISOString();
  const creditsToInsert = recipients.map((p, idx) => ({
    schedule_id: scheduleId,
    participant_id: p.id,
    amount: idx === recipients.length - 1 ? baseAmount + remainder : baseAmount,
    credit_type: 'premiacao',
    status: 'pendente',
    description: 'Prêmio mockado (recalcular prêmios)',
    calculated_at: nowIso
  }));

  const { error: insertError } = await supabase
    .from('credits')
    .insert(creditsToInsert);

  if (insertError) {
    console.error('❌ Erro ao inserir créditos:', insertError);
    throw insertError;
  }

  // Preparar resposta mockada
  const prizes = recipients.map((p, idx) => ({
    participant_id: p.id,
    participant_name: p.name,
    total_sales: Number(p.current_progress) || 0,
    achievement_percentage: Number(p.target_amount) > 0
      ? Number(((Number(p.current_progress) / Number(p.target_amount)) * 100).toFixed(1))
      : 0,
    prize_amount: idx === recipients.length - 1 ? baseAmount + remainder : baseAmount,
    qualified_conditions: qualifiedParticipants.length > 0 ? ["Atingiu meta individual"] : ["Distribuição alternativa"]
  }));

  const mockData = {
    success: true,
    summary: {
      schedule_id: scheduleId,
      total_participants: participants.length,
      participants_with_prizes: recipients.length,
      total_prizes: TOTAL_PRIZE_POOL,
      total_sales_records: 0
    },
    prizes
  };

  console.log('✅ Prêmios calculados e distribuídos:', mockData);
  console.log(`💰 Total distribuído: R$ ${TOTAL_PRIZE_POOL.toFixed(2)}`);
  console.log(`👥 Valor base por participante: R$ ${baseAmount.toFixed(2)} | Ajuste final: R$ ${remainder.toFixed(2)}`);
  
  return mockData;
};
