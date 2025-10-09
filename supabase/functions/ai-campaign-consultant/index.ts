import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, campaignId } = await req.json();
    
    console.log('🤖 AI Campaign Consultant:', { campaignId, message: message.substring(0, 100) });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar contexto da campanha
    const { data: schedule } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', campaignId)
      .single();

    const { data: files } = await supabase
      .from('campaign_files')
      .select('*')
      .eq('schedule_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: rule } = await supabase
      .from('company_rules')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const contextInfo = {
      campaign: schedule,
      recentFiles: files?.length || 0,
      hasRule: !!rule,
      ruleAnalysis: rule?.rule_json?.analysis || 'Não disponível',
    };

    console.log('📊 Contexto da campanha carregado:', contextInfo);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um consultor especializado em campanhas de vendas e incentivo.
Você tem acesso ao contexto completo da campanha e pode responder perguntas sobre:
- Performance e resultados
- Regras e critérios
- Análise de dados
- Recomendações estratégicas
- Otimização de campanhas

Forneça respostas claras, objetivas e acionáveis baseadas nos dados disponíveis.`;

    const contextMessage = `Contexto da campanha:
- Nome: ${schedule?.name || 'N/A'}
- Status: ${schedule?.status || 'N/A'}
- Arquivos recentes: ${contextInfo.recentFiles}
- Regras cadastradas: ${contextInfo.hasRule ? 'Sim' : 'Não'}
${contextInfo.hasRule ? `\nResumo das regras:\n${contextInfo.ruleAnalysis.substring(0, 500)}` : ''}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'system', content: contextMessage },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da AI Gateway:', errorText);
      throw new Error(`Erro na AI Gateway: ${response.status}`);
    }

    const aiResult = await response.json();
    const reply = aiResult.choices[0].message.content;

    console.log('✅ Resposta gerada');

    return new Response(
      JSON.stringify({
        success: true,
        reply,
        context: contextInfo,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no AI Campaign Consultant:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
