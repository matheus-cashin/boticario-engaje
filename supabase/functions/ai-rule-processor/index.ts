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
    const { ruleText, campaignId, campaignName, ruleId } = await req.json();
    
    console.log('🤖 AI Rule Processor iniciado:', { campaignId, campaignName, ruleId });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um especialista em interpretação de regras de campanhas de vendas e incentivos.

Sua tarefa é analisar exclusivamente o conteúdo do documento fornecido com as regras da campanha, extraindo as informações em formato JSON totalmente estruturado e fiel ao documento.

INSTRUÇÕES OBRIGATÓRIAS:
- NUNCA inclua explicações, comentários ou qualquer conteúdo fora do JSON.
- NÃO invente, infira ou crie campos ou valores não presentes no documento.
- Se algum campo não existir no documento, omita do JSON, não preencha com valores fictícios ou nulos, nem coloque campos com null.
- Preserve nomes de produtos, condições e regras exatamente como aparecem no documento (respeite acentuação, maiúsculas/minúsculas, unidades e abreviações).
- Sempre extraia todas as metas, condições, prêmios, datas, grupos elegíveis, produtos participantes, produtos excluídos e regras especiais (permanência, limites, etc) exatamente como descrito.
- Padronize datas para o formato: "YYYY-MM-DD".
- Em listas de produtos, crie arrays separados para cada faixa de pontuação, se houver.
- Só inclua campos que efetivamente estejam definidos ou explícitos no documento.

Se o documento for de PONTOS POR PRODUTO:
- Use "rule_type": "pontos_por_produto".
- Liste todos os produtos e suas pontuações exatamente como no documento.
- Indique o valor do ponto (ex: R$ 0,40 por ponto).
- Descreva grupos elegíveis, produtos excluídos e regras especiais.
- No campo de recompensa, use "type": "per_point" e "calculation_base": "achievement".

Se o documento for de META DE VENDAS (valores de venda, metas em R$ ou quantidade):
- Use "rule_type": "meta_fixa" ou "rule_type": "meta_progressiva" conforme o caso.
- Extraia metas, faixas, condições, premiações, datas, grupos, prêmios e regras.
- Se houver ranking/premiação por posição, preencha o campo "ranking_config" conforme disponível.

Sempre siga fielmente a estrutura JSON abaixo e preencha apenas com dados reais extraídos do documento:

{
  "rule_type": "meta_progressiva|meta_fixa|bonus_condicional|pontos_por_produto",
  "campaign_period": {
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD"
  },
  "evaluation_period": {
    "type": "daily|weekly|monthly|campaign",
    "report_day": "monday|tuesday|..." // Preencher só se explícito no documento
  },
  "targets": [
    {
      "name": "Nome da Meta",
      "metric": "sales_amount|quantity|points",
      "conditions": [
        {
          "type": "minimum|range|percentage",
          "operator": ">=|>|between",
          "value": 0,
          "value_max": 0, // Preencher apenas se range
          "reward": {
            "type": "fixed|percentage|per_point",
            "amount": 0,
            "calculation_base": "achievement|excess"
          }
        }
      ]
    }
  ],
  "ranking_config": {
    "enabled": false,
    "frequency": null,
    "top_positions": null,
    "rewards": []
  },
  "eligible_groups": [],
  "excluded_products": [],
  "special_rules": {},
  "products": {}
}

Retorne APENAS o JSON estruturado, sem nenhum texto adicional antes ou depois.`;

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
          { 
            role: 'user', 
            content: `Regras da campanha "${campaignName}":\n\n${ruleText}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da AI Gateway:', errorText);
      throw new Error(`Erro na AI Gateway: ${response.status}`);
    }

    const aiResult = await response.json();
    const analysisText = aiResult.choices[0].message.content;

    console.log('✅ Análise AI concluída:', analysisText.substring(0, 200));

    // Tentar parsear o JSON retornado pela IA
    let ruleJson;
    try {
      // Remover possíveis markdown code blocks
      const cleanedText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      ruleJson = JSON.parse(cleanedText);
      console.log('✅ JSON parseado com sucesso');
    } catch (parseError) {
      console.error('⚠️ Erro ao parsear JSON da IA, salvando como texto:', parseError);
      ruleJson = { 
        raw_analysis: analysisText, 
        parse_error: true,
        processed_by: 'ai-agent' 
      };
    }

    // Gerar resumo em linguagem natural
    console.log('📝 Gerando resumo em linguagem natural...');
    const summaryPrompt = `Com base nas regras da campanha processadas, crie um resumo estruturado e claro em linguagem natural para que o cliente possa verificar se a interpretação está correta.

O resumo deve incluir:
- Tipo da campanha
- Período de vigência
- Metas e condições
- Premiações e recompensas
- Grupos elegíveis
- Produtos excluídos (se houver)
- Regras especiais (se houver)

Use formatação markdown para melhor legibilidade (títulos, listas, negrito).
Seja objetivo, claro e organize as informações de forma hierárquica.`;

    const summaryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: summaryPrompt },
          { 
            role: 'user', 
            content: `Regras extraídas:\n\n${JSON.stringify(ruleJson, null, 2)}`
          }
        ],
      }),
    });

    let processedSummary = '';
    if (summaryResponse.ok) {
      const summaryResult = await summaryResponse.json();
      processedSummary = summaryResult.choices[0].message.content;
      console.log('✅ Resumo gerado com sucesso');
    } else {
      console.warn('⚠️ Falha ao gerar resumo, usando fallback');
      processedSummary = '## Regra Processada\n\nA regra foi processada com sucesso. Visualize os detalhes acima.';
    }

    // Atualizar o banco de dados
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabase
      .from('company_rules')
      .update({
        status: 'completed',
        rule_json: ruleJson,
        rule_text: processedSummary, // Salvando o resumo no campo rule_text
        processed_at: new Date().toISOString(),
      })
      .eq('id', ruleId);

    if (updateError) {
      console.error('❌ Erro ao atualizar company_rules:', updateError);
      throw updateError;
    }

    console.log('💾 Regra atualizada no banco com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        ruleJson,
        processedSummary,
        ruleId,
        processedBy: 'ai-agent',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no AI Rule Processor:', error);
    
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
