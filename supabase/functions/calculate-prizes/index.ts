import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scheduleId } = await req.json();
    
    if (!scheduleId) {
      return new Response(
        JSON.stringify({ error: "scheduleId é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("🎯 Iniciando cálculo de prêmios para schedule:", scheduleId);

    // 1. Buscar schedule com regra estruturada
    const { data: schedule, error: scheduleError } = await supabase
      .from("schedules")
      .select("*")
      .eq("id", scheduleId)
      .single();

    if (scheduleError || !schedule) {
      console.error("❌ Schedule não encontrado:", scheduleError);
      return new Response(
        JSON.stringify({ error: "Campanha não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ruleJson = schedule.rule_parsed;
    if (!ruleJson) {
      console.error("❌ Regra não encontrada para o schedule");
      return new Response(
        JSON.stringify({ error: "Regra da campanha não encontrada" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("📋 Regra estruturada:", JSON.stringify(ruleJson));

    // 2. Buscar participantes
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select("*")
      .eq("schedule_id", scheduleId)
      .eq("is_active", true);

    if (participantsError) {
      console.error("❌ Erro ao buscar participantes:", participantsError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar participantes" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`👥 Total de participantes: ${participants?.length || 0}`);

    // 3. Buscar dados de vendas por participante
    const { data: salesData, error: salesError } = await supabase
      .from("sales_data")
      .select("*")
      .eq("schedule_id", scheduleId)
      .is("deleted_at", null);

    if (salesError) {
      console.error("❌ Erro ao buscar vendas:", salesError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar dados de vendas" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📊 Total de registros de vendas: ${salesData?.length || 0}`);

    // 4. Agrupar vendas por participante
    const salesByParticipant = new Map<string, number>();
    salesData?.forEach(sale => {
      if (sale.participant_id) {
        const current = salesByParticipant.get(sale.participant_id) || 0;
        salesByParticipant.set(sale.participant_id, current + Number(sale.amount));
      }
    });

    // 5. Calcular prêmios baseado nas regras
    const calculatedPrizes: Array<{
      participant_id: string;
      participant_name: string;
      sales_amount: number;
      prize_amount: number;
      achievement_percentage: number;
    }> = [];

    let totalPrizes = 0;

    for (const participant of participants || []) {
      const salesAmount = salesByParticipant.get(participant.id) || 0;
      const targetAmount = Number(participant.target_amount) || 0;
      
      if (targetAmount === 0) {
        console.log(`⚠️ Participante ${participant.name} sem meta definida`);
        continue;
      }

      const achievementPercentage = (salesAmount / targetAmount) * 100;
      let prizeAmount = 0;

      // Aplicar lógica de recompensa baseado na regra
      if (ruleJson.rewards && Array.isArray(ruleJson.rewards)) {
        for (const reward of ruleJson.rewards) {
          const rewardType = reward.tipo || reward.type;
          
          // Verificar condições do prêmio
          let qualifies = false;
          
          if (reward.condicoes || reward.conditions) {
            const conditions = reward.condicoes || reward.conditions;
            
            for (const condition of conditions) {
              const operator = condition.operador || condition.operator;
              const value = Number(condition.valor || condition.value);
              const maxValue = Number(condition.valor_max || condition.max_value);
              
              // Avaliar a condição
              if (operator === "maior ou igual" || operator === ">=" || operator === "a partir de") {
                qualifies = achievementPercentage >= value;
              } else if (operator === "entre" || operator === "between" || operator === "de") {
                qualifies = achievementPercentage >= value && achievementPercentage <= maxValue;
              } else if (operator === "maior" || operator === ">" || operator === "acima de") {
                qualifies = achievementPercentage > value;
              }
              
              if (qualifies) break;
            }
          }

          if (qualifies) {
            // Calcular prêmio baseado no tipo
            if (rewardType === "fixo" || rewardType === "Fixo") {
              prizeAmount += Number(reward.valor || reward.value || 0);
            } else if (rewardType === "por_ponto" || rewardType === "Por Ponto") {
              // Prêmio por ponto percentual acima da meta
              const pointsAboveTarget = Math.max(0, achievementPercentage - 100);
              prizeAmount += pointsAboveTarget * Number(reward.valor || reward.value || 0);
            } else if (rewardType === "percentual" || rewardType === "Percentual") {
              // Prêmio percentual sobre as vendas
              const percentage = Number(reward.valor || reward.value || 0) / 100;
              prizeAmount += salesAmount * percentage;
            }
          }
        }
      }

      calculatedPrizes.push({
        participant_id: participant.id,
        participant_name: participant.name,
        sales_amount: salesAmount,
        prize_amount: prizeAmount,
        achievement_percentage: achievementPercentage,
      });

      totalPrizes += prizeAmount;
    }

    console.log(`💰 Total de prêmios calculados: R$ ${totalPrizes.toFixed(2)}`);
    console.log(`👥 Participantes com prêmio: ${calculatedPrizes.filter(p => p.prize_amount > 0).length}`);

    // 6. Limpar créditos antigos e inserir novos
    const calculationDate = new Date().toISOString().split('T')[0];
    
    // Marcar créditos antigos como deletados para este schedule e data
    await supabase
      .from("credits")
      .update({ deleted_at: new Date().toISOString() })
      .eq("schedule_id", scheduleId)
      .eq("calculation_date", calculationDate)
      .is("deleted_at", null);

    // Inserir novos créditos
    const creditsToInsert = calculatedPrizes
      .filter(p => p.prize_amount > 0)
      .map(p => ({
        schedule_id: scheduleId,
        participant_id: p.participant_id,
        amount: p.prize_amount,
        credit_type: "premio_campanha",
        calculation_date: calculationDate,
        status: "pendente",
        description: `Prêmio calculado: ${p.achievement_percentage.toFixed(1)}% da meta alcançada`,
      }));

    if (creditsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("credits")
        .insert(creditsToInsert);

      if (insertError) {
        console.error("❌ Erro ao inserir créditos:", insertError);
        return new Response(
          JSON.stringify({ error: "Erro ao salvar créditos calculados" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log("✅ Cálculo de prêmios concluído com sucesso");

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_participants: participants?.length || 0,
          participants_with_prizes: calculatedPrizes.filter(p => p.prize_amount > 0).length,
          total_prizes: totalPrizes,
          calculation_date: calculationDate,
        },
        prizes: calculatedPrizes,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Erro no cálculo de prêmios:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
