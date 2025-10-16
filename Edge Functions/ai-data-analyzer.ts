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
    const { fileId, campaignId, campaignName } = await req.json();
    console.log('🤖 AI Data Analyzer iniciado:', {
      fileId,
      campaignId,
      campaignName
    });
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Buscar dados do arquivo
    const { data: fileData, error: fileError } = await supabase.from('campaign_files').select('processing_result').eq('id', fileId).single();
    if (fileError || !fileData?.processing_result) {
      throw new Error('Arquivo não encontrado ou não processado');
    }
    const { columns, data: rawData } = fileData.processing_result;
    console.log('📊 Dados do arquivo carregados:', {
      columns: columns.length,
      rows: rawData.length
    });
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }
    const systemPrompt = `Você é um analista especializado em dados de campanhas de vendas.
Analise os dados fornecidos e identifique:
1. Anomalias e outliers nos dados
2. Padrões de desempenho
3. Participantes com performance excepcional ou abaixo do esperado
4. Sugestões de otimização da campanha
5. Insights sobre distribuição de vendas

Forneça análise clara e acionável em formato estruturado.`;
    const dataSample = rawData.slice(0, 50); // Primeiras 50 linhas
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
            content: `Analise os dados da campanha "${campaignName}":\n\nColunas: ${columns.join(', ')}\n\nTotal de registros: ${rawData.length}\n\nAmostra dos dados (primeiras 50 linhas):\n${JSON.stringify(dataSample, null, 2)}\n\nForneça uma análise detalhada com insights e recomendações.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da AI Gateway:', errorText);
      throw new Error(`Erro na AI Gateway: ${response.status}`);
    }
    const aiResult = await response.json();
    const analysis = aiResult.choices[0].message.content;
    console.log('✅ Análise AI concluída');
    // Salvar análise no arquivo
    const { error: updateError } = await supabase.from('campaign_files').update({
      ai_analysis: {
        analysis,
        analyzed_at: new Date().toISOString(),
        analyzed_by: 'ai-data-analyzer'
      }
    }).eq('id', fileId);
    if (updateError) {
      console.error('❌ Erro ao salvar análise:', updateError);
      throw updateError;
    }
    return new Response(JSON.stringify({
      success: true,
      analysis,
      fileId,
      analyzedBy: 'ai-agent'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❌ Erro no AI Data Analyzer:', error);
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
