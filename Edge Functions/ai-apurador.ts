import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { salesData, ruleJson, campaignId, campaignName } = await req.json();
    console.log('🎯 AI Apurador iniciado:', {
      campaignId,
      campaignName,
      totalRows: salesData?.length
    });
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }
    const systemPrompt = `Você é um especialista em cálculo de premiações e rankings de campanhas de vendas.

Sua tarefa é processar dados de vendas e calcular:
1. Prêmios individuais para cada participante baseado nas regras fornecidas
2. Ranking dos participantes
3. Estatísticas da campanha

INSTRUÇÕES OBRIGATÓRIAS:
- Use EXATAMENTE a estrutura de regras fornecida em JSON
- Calcule prêmios conforme as condições definidas (mínimo, faixa, percentual)
- Para pontos por produto: multiplique quantidade vendida pelos pontos do produto
- Para metas de vendas: verifique se atingiu as condições e aplique a recompensa
- Para rankings: ordene por desempenho (vendas totais ou pontos totais)
- Retorne APENAS JSON estruturado, sem texto adicional

Estrutura de retorno obrigatória:
{
  "participants": [
    {
      "name": "Nome do Participante",
      "totalSales": 0,
      "totalPoints": 0,
      "totalPrize": 0,
      "metasAchieved": ["Meta 1", "Meta 2"],
      "performanceLevel": "ouro|prata|bronze|sem_premio",
      "details": {
        "salesBreakdown": {},
        "prizeBreakdown": {}
      }
    }
  ],
  "ranking": [
    {
      "position": 1,
      "name": "Nome",
      "value": 0,
      "prize": 0
    }
  ],
  "summary": {
    "totalParticipants": 0,
    "totalSales": 0,
    "totalPrizes": 0,
    "averageSalesPerParticipant": 0,
    "topPerformerName": "",
    "topPerformerValue": 0
  }
}`;
    const userPrompt = `REGRAS DA CAMPANHA (JSON):
${JSON.stringify(ruleJson, null, 2)}

DADOS DE VENDAS (JSON):
${JSON.stringify(salesData, null, 2)}

CALCULE os prêmios e rankings conforme as regras. Retorne APENAS o JSON estruturado.`;
    console.log('🤖 Enviando para AI Gateway...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da AI Gateway:', errorText);
      throw new Error(`Erro na AI Gateway: ${response.status}`);
    }
    const aiResult = await response.json();
    const calculationText = aiResult.choices[0].message.content;
    console.log('✅ Cálculo AI concluído:', calculationText.substring(0, 200));
    // Tentar parsear o JSON retornado
    let calculationResult;
    try {
      const cleanedText = calculationText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      calculationResult = JSON.parse(cleanedText);
      console.log('✅ JSON parseado com sucesso');
    } catch (parseError) {
      console.error('⚠️ Erro ao parsear JSON da IA:', parseError);
      calculationResult = {
        error: true,
        raw_calculation: calculationText,
        parse_error: parseError.message
      };
    }
    // Salvar resultados no banco
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Buscar o ranking existente ou criar novo
    const calculationDate = new Date().toISOString().split('T')[0];
    const { data: existingRanking } = await supabase.from('rankings').select('id').eq('schedule_id', campaignId).eq('calculation_date', calculationDate).maybeSingle();
    if (existingRanking) {
      // Atualizar ranking existente
      await supabase.from('rankings').update({
        ranking_data: calculationResult,
        total_participants: calculationResult.summary?.totalParticipants || 0,
        total_sales_amount: calculationResult.summary?.totalSales || 0,
        top_performer_amount: calculationResult.summary?.topPerformerValue || 0,
        calculation_method: 'ai_engine',
        is_final: true
      }).eq('id', existingRanking.id);
      console.log('💾 Ranking atualizado:', existingRanking.id);
    } else {
      // Criar novo ranking
      const { error: rankingError } = await supabase.from('rankings').insert({
        schedule_id: campaignId,
        calculation_date: calculationDate,
        ranking_data: calculationResult,
        total_participants: calculationResult.summary?.totalParticipants || 0,
        total_sales_amount: calculationResult.summary?.totalSales || 0,
        top_performer_amount: calculationResult.summary?.topPerformerValue || 0,
        calculation_method: 'ai_engine',
        is_final: true,
        period_type: 'campaign'
      });
      if (rankingError) {
        console.error('❌ Erro ao salvar ranking:', rankingError);
      } else {
        console.log('💾 Ranking criado com sucesso');
      }
    }
    // Salvar dados de participantes, vendas e créditos
    if (calculationResult.participants && Array.isArray(calculationResult.participants)) {
      console.log('💾 Salvando dados de participantes, vendas e créditos...');
      for (const participant of calculationResult.participants){
        // Buscar ou criar participante
        let { data: existingParticipant } = await supabase.from('participants').select('id').eq('schedule_id', campaignId).eq('name', participant.name).maybeSingle();
        let participantId = existingParticipant?.id;
        if (!participantId) {
          // Criar participante
          const { data: newParticipant, error: participantError } = await supabase.from('participants').insert({
            schedule_id: campaignId,
            name: participant.name,
            email: participant.email || null,
            target_amount: 0
          }).select('id').single();
          if (participantError) {
            console.error('❌ Erro ao criar participante:', participantError);
            continue;
          }
          participantId = newParticipant.id;
          console.log('✅ Participante criado:', participant.name);
        }
        // Salvar ou atualizar vendas
        if (participant.totalSales && participant.totalSales > 0) {
          const { data: existingSale } = await supabase.from('sales_data').select('id, amount').eq('schedule_id', campaignId).eq('participant_id', participantId).maybeSingle();
          if (existingSale) {
            // Atualizar venda existente (soma incremental)
            await supabase.from('sales_data').update({
              amount: Number(existingSale.amount) + Number(participant.totalSales),
              updated_at: new Date().toISOString()
            }).eq('id', existingSale.id);
          } else {
            // Criar nova venda
            await supabase.from('sales_data').insert({
              schedule_id: campaignId,
              participant_id: participantId,
              amount: participant.totalSales,
              sale_date: calculationDate
            });
          }
        }
        // Salvar ou atualizar créditos
        if (participant.totalPrize && participant.totalPrize > 0) {
          const { data: existingCredit } = await supabase.from('credits').select('id, amount').eq('schedule_id', campaignId).eq('participant_id', participantId).maybeSingle();
          if (existingCredit) {
            // Atualizar crédito existente
            await supabase.from('credits').update({
              amount: participant.totalPrize,
              level: participant.performanceLevel || 'sem_premio',
              updated_at: new Date().toISOString()
            }).eq('id', existingCredit.id);
          } else {
            // Criar novo crédito
            await supabase.from('credits').insert({
              schedule_id: campaignId,
              participant_id: participantId,
              amount: participant.totalPrize,
              level: participant.performanceLevel || 'sem_premio',
              credit_date: calculationDate
            });
          }
        }
      }
      console.log('✅ Dados de participantes, vendas e créditos salvos com sucesso');
    }
    return new Response(JSON.stringify({
      success: true,
      calculation: calculationResult,
      campaignId
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❌ Erro no AI Apurador:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      success: false
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
