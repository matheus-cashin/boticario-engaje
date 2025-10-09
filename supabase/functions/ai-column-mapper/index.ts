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
    const { fileId } = await req.json();
    
    console.log('🗺️ AI Column Mapper iniciado:', { fileId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados do arquivo
    const { data: fileData, error: fileError } = await supabase
      .from('campaign_files')
      .select('processing_result')
      .eq('id', fileId)
      .single();

    if (fileError || !fileData?.processing_result) {
      throw new Error('Arquivo não encontrado ou não processado');
    }

    const processingResult = fileData.processing_result as any;
    const columns = processingResult.columns || [];
    const dataSample = (processingResult.data || []).slice(0, 10);

    console.log('📊 Colunas detectadas:', columns);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um especialista em análise e mapeamento de dados de campanhas de vendas.

Sua tarefa é analisar as colunas de um arquivo Excel e mapear cada coluna para um campo padronizado.

CAMPOS PADRONIZADOS DISPONÍVEIS:
- participant_name: Nome do participante/vendedor
- participant_id: CPF, ID ou código único do participante
- email: Email do participante
- phone: Telefone/celular
- division: Regional, divisional ou área
- manager: Nome do gerente
- achievement_brazil: Atingimento da meta Brasil (%)
- achievement_division: Atingimento da meta divisional (%)
- achievement_individual: Atingimento da meta individual (%)
- total_sales: Valor total de vendas (R$)
- sales_coffee: Vendas de café (R$)
- sales_filter: Vendas de filtro (R$)
- reference_date: Data de referência
- custom_field: Qualquer outro campo não identificado

TIPOS DE DADOS:
- string: Texto geral
- number: Números
- currency: Valores monetários
- percentage: Percentuais
- date: Datas
- email: Email
- phone: Telefone

Retorne APENAS um JSON com este formato:
{
  "mappings": [
    {
      "columnNumber": 1,
      "originalName": "Nome da Coluna",
      "suggestedField": "participant_name",
      "confidence": 95,
      "dataType": "string",
      "reasoning": "Breve explicação do mapeamento"
    }
  ]
}`;

    const userPrompt = `Analise e mapeie as seguintes colunas:

COLUNAS:
${columns.map((col: string, idx: number) => `${idx + 1}. ${col}`).join('\n')}

AMOSTRA DOS DADOS (primeiras 10 linhas):
${JSON.stringify(dataSample, null, 2)}

Retorne o mapeamento em JSON.`;

    console.log('🤖 Enviando para AI Gateway...');

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
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da AI Gateway:', errorText);
      throw new Error(`Erro na AI Gateway: ${response.status}`);
    }

    const aiResult = await response.json();
    const mappingText = aiResult.choices[0].message.content;

    console.log('✅ Mapeamento AI recebido:', mappingText.substring(0, 200));

    // Parsear o JSON do mapeamento
    let mappingResult;
    try {
      const cleanedText = mappingText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      mappingResult = JSON.parse(cleanedText);
      console.log('✅ JSON parseado com sucesso');
    } catch (parseError) {
      console.error('⚠️ Erro ao parsear JSON:', parseError);
      // Fallback para mapeamento básico
      mappingResult = {
        mappings: columns.map((col: string, idx: number) => ({
          columnNumber: idx + 1,
          originalName: col,
          suggestedField: 'custom_field',
          confidence: 50,
          dataType: 'string',
          reasoning: 'Mapeamento automático falhou'
        }))
      };
    }

    // Atualizar o arquivo com o mapeamento
    const { error: updateError } = await supabase
      .from('campaign_files')
      .update({
        processing_result: {
          ...processingResult,
          columnMappings: mappingResult.mappings,
          aiMappingDone: true
        }
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('❌ Erro ao salvar mapeamento:', updateError);
      throw updateError;
    }

    console.log('💾 Mapeamento salvo com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        mappings: mappingResult.mappings,
        fileId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no AI Column Mapper:', error);
    
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
