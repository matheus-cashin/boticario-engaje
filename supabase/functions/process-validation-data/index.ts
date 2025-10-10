import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileId, anomalyActions } = await req.json();

    if (!fileId) {
      throw new Error('fileId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Buscar arquivo e dados processados
    console.log('📋 Buscando arquivo:', fileId);
    const { data: file, error: fileError } = await supabase
      .from('campaign_files')
      .select('*, schedules(*)')
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      console.error('❌ Erro ao buscar arquivo:', fileError);
      throw new Error('File not found');
    }

    // Validar que o arquivo tem schedule_id
    if (!file.schedule_id) {
      console.error('❌ Arquivo sem schedule_id:', file);
      throw new Error('Arquivo não está vinculado a uma campanha (schedule_id ausente)');
    }

    console.log('✅ Arquivo encontrado:', {
      id: file.id,
      schedule_id: file.schedule_id,
      campaign_id: file.campaign_id
    });
    console.log('🎯 Campanha vinculada:', file.schedules);

    const processingResult = (file.processing_result as any) || {};
    const rawData = Array.isArray(processingResult.data) ? processingResult.data : [];
    const columnMappings = Array.isArray(processingResult.columnMappings)
      ? processingResult.columnMappings
      : [];

    if (rawData.length === 0) {
      throw new Error('No data to process');
    }

    // 2. Mapear campos - buscar por diferentes padrões de colunas
    console.log('Column mappings:', JSON.stringify(columnMappings, null, 2));
    console.log('Sample data:', JSON.stringify(rawData[0], null, 2));

    // Identificar campos automaticamente
    const nameField = columnMappings.find((m: any) => 
      m.suggestedField === "participant_name" || 
      m.originalName?.toLowerCase().includes('nome') ||
      m.originalName?.toLowerCase().includes('vendedor')
    )?.originalName;
    
    const productField = columnMappings.find((m: any) => 
      m.originalName?.toLowerCase().includes('produto') ||
      m.originalName?.toLowerCase().includes('descri')
    )?.originalName;
    
    const quantityField = columnMappings.find((m: any) => 
      m.originalName?.toLowerCase().includes('qtd') ||
      m.originalName?.toLowerCase().includes('quantidade') ||
      m.dataType === 'number'
    )?.originalName;
    
    const unitPriceField = columnMappings.find((m: any) => 
      m.originalName?.toLowerCase().includes('preço') ||
      m.originalName?.toLowerCase().includes('preco') ||
      m.originalName?.toLowerCase().includes('unit')
    )?.originalName;
    
    const totalField = columnMappings.find((m: any) => 
      m.originalName?.toLowerCase().includes('total') ||
      m.originalName?.toLowerCase().includes('valor')
    )?.originalName;

    const categoryField = columnMappings.find((m: any) => 
      m.originalName?.toLowerCase().includes('categoria') ||
      m.originalName?.toLowerCase().includes('category')
    )?.originalName;

    console.log('Detected fields:', {
      nameField,
      productField,
      quantityField,
      unitPriceField,
      totalField,
      categoryField
    });

    // 3. Agrupar vendas por participante
    const participantsMap = new Map();
    const salesByParticipant = new Map();
    
    for (const row of rawData) {
      const name = row[nameField];
      if (!name) continue;

      // Criar chave única para o participante
      const participantKey = name.toLowerCase().trim();
      
      // Inicializar participante se não existir
      if (!participantsMap.has(participantKey)) {
        participantsMap.set(participantKey, {
          name: name,
          phone: `temp_${participantKey}`, // Telefone temporário - será atualizado depois
          email: null,
          employee_id: null,
          schedule_id: file.schedule_id,
          is_active: true
        });
        salesByParticipant.set(participantKey, []);
      }

      // Calcular valor da venda
      let saleAmount = 0;
      if (totalField && row[totalField]) {
        saleAmount = parseFloat(row[totalField]) || 0;
      } else if (quantityField && unitPriceField) {
        const qty = parseFloat(row[quantityField]) || 0;
        const price = parseFloat(row[unitPriceField]) || 0;
        saleAmount = qty * price;
      }

      if (saleAmount > 0) {
        // Adicionar venda
        salesByParticipant.get(participantKey).push({
          product: productField ? row[productField] : null,
          category: categoryField ? row[categoryField] : null,
          quantity: quantityField ? parseFloat(row[quantityField]) : 1,
          unit_price: unitPriceField ? parseFloat(row[unitPriceField]) : saleAmount,
          amount: saleAmount,
          sale_date: new Date().toISOString().split('T')[0], // Data atual como padrão
          rawRow: row
        });
      }
    }

    console.log(`Found ${participantsMap.size} unique participants`);

    // 4. Processar e salvar participantes
    const processedParticipants = [];
    
    for (const [key, participantData] of participantsMap) {
      // Verificar se participante já existe pelo nome
      const { data: existing } = await supabase
        .from('participants')
        .select('id, phone')
        .eq('schedule_id', participantData.schedule_id)
        .ilike('name', participantData.name)
        .single();

      let participantId;
      let participantPhone;

      if (existing) {
        // Participante existe - usar dados existentes
        participantId = existing.id;
        participantPhone = existing.phone;
        console.log(`Found existing participant: ${participantData.name} (${participantId})`);
      } else {
        // Criar novo participante
        const { data: inserted, error: insertError } = await supabase
          .from('participants')
          .insert({
            ...participantData,
            phone: `pending_${Date.now()}_${key}` // Telefone temporário único
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error inserting participant:', insertError);
          continue;
        }
        
        participantId = inserted.id;
        participantPhone = inserted.phone;
        console.log(`Created new participant: ${participantData.name} (${participantId})`);
      }

      processedParticipants.push({
        id: participantId,
        name: participantData.name,
        phone: participantPhone,
        totalSales: 0
      });

      // 5. Processar vendas deste participante
      const sales = salesByParticipant.get(key) || [];
      let totalAmount = 0;

      for (const sale of sales) {
        totalAmount += sale.amount;
        
        console.log(`💾 Salvando venda para participante ${participantData.name}:`, {
          participant_id: participantId,
          schedule_id: file.schedule_id,
          amount: sale.amount
        });
        
        // Inserir venda individual
        const { error: saleError } = await supabase
          .from('sales_data')
          .insert({
            schedule_id: file.schedule_id,
            participant_id: participantId,
            sale_date: sale.sale_date,
            amount: sale.amount,
            quantity: sale.quantity,
            product_name: sale.product,
            product_category: sale.category,
            source_file_id: fileId,
            is_valid: true,
            raw_data: sale.rawRow
          });

        if (saleError) {
          console.error('Error inserting sale:', saleError);
        }
      }

      // Calcular total acumulado de todas as vendas do participante nesta campanha
      const { data: allParticipantSales } = await supabase
        .from('sales_data')
        .select('amount')
        .eq('schedule_id', file.schedule_id)
        .eq('participant_id', participantId);

      const cumulativeTotalSales = (allParticipantSales || []).reduce(
        (sum, sale) => sum + Number(sale.amount || 0), 
        0
      );

      // Atualizar total de vendas do participante com valor acumulado
      processedParticipants[processedParticipants.length - 1].totalSales = cumulativeTotalSales;
      
      // Atualizar current_progress do participante com o total acumulado
      await supabase
        .from('participants')
        .update({ current_progress: cumulativeTotalSales })
        .eq('id', participantId);
      
      console.log(`Processed ${sales.length} sales for ${participantData.name}: R$ ${totalAmount}`);
    }

    console.log(`Total processed: ${processedParticipants.length} participants`);

    // 6. Calcular estatísticas e criar ranking
    const totalSalesAmount = processedParticipants.reduce((sum, p) => sum + p.totalSales, 0);
    const totalSalesCount = Array.from(salesByParticipant.values()).reduce((sum, sales) => sum + sales.length, 0);

    // Buscar TODOS os participantes da campanha com current_progress atualizado
    const { data: allCampaignParticipants } = await supabase
      .from('participants')
      .select('id, name, current_progress')
      .eq('schedule_id', file.schedule_id);

    console.log(`Found ${allCampaignParticipants?.length || 0} participants in campaign`);

    // Criar mapa com os totais já calculados
    const participantTotals = new Map();
    for (const participant of allCampaignParticipants || []) {
      // Buscar contagem de vendas
      const { data: salesCount } = await supabase
        .from('sales_data')
        .select('id', { count: 'exact', head: true })
        .eq('schedule_id', file.schedule_id)
        .eq('participant_id', participant.id);

      participantTotals.set(participant.id, {
        name: participant.name,
        total: Number(participant.current_progress) || 0,
        sales_count: salesCount || 0
      });
    }

    // Ordenar participantes por total de vendas
    const rankedParticipants = Array.from(participantTotals.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total);

    // Preparar dados do ranking
    const rankingData = {
      participants: rankedParticipants.map((p, index) => ({
        position: index + 1,
        participant_id: p.id,
        participant_name: p.name,
        total_sales: p.total,
        sales_count: p.sales_count
      })),
      summary: {
        total_participants: rankedParticipants.length,
        total_sales: rankedParticipants.reduce((sum, p) => sum + p.total, 0),
        average_per_participant: rankedParticipants.length > 0 
          ? rankedParticipants.reduce((sum, p) => sum + p.total, 0) / rankedParticipants.length 
          : 0,
        top_seller: rankedParticipants[0] || null,
        last_update: new Date().toISOString()
      }
    };

    // Criar ou atualizar ranking
    const { data: existingRanking } = await supabase
      .from('rankings')
      .select('id')
      .eq('schedule_id', file.schedule_id)
      .eq('calculation_date', new Date().toISOString().split('T')[0])
      .single();

    if (existingRanking) {
      // Atualizar ranking existente
      await supabase
        .from('rankings')
        .update({
          ranking_data: rankingData,
          total_participants: rankedParticipants.length,
          total_sales_amount: rankingData.summary.total_sales,
          avg_sales_per_participant: rankingData.summary.average_per_participant,
          top_performer_amount: rankedParticipants[0]?.total || 0,
          source_file_id: fileId
        })
        .eq('id', existingRanking.id);
      
      console.log(`Updated existing ranking ${existingRanking.id}`);
    } else {
      // Criar novo ranking
      const { data: newRanking } = await supabase
        .from('rankings')
        .insert({
          schedule_id: file.schedule_id,
          calculation_date: new Date().toISOString().split('T')[0],
          ranking_data: rankingData,
          total_participants: rankedParticipants.length,
          total_sales_amount: rankingData.summary.total_sales,
          avg_sales_per_participant: rankingData.summary.average_per_participant,
          top_performer_amount: rankedParticipants[0]?.total || 0,
          is_final: false,
          source_file_id: fileId,
          calculation_method: 'automated'
        })
        .select()
        .single();
      
      console.log(`Created new ranking ${newRanking?.id}`);
    }

    console.log(`Ranking updated with ${rankedParticipants.length} participants`);

    // 7. Atualizar status do arquivo
    const { error: updateError } = await supabase
      .from('campaign_files')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
        validation_status: 'approved'
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Error updating file status:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: {
          participants: processedParticipants.length,
          sales: totalSalesCount,
          totalAmount: totalSalesAmount,
          scheduleId: file.schedule_id,
          ranking: {
            topSeller: rankedParticipants[0]?.name || null,
            topAmount: rankedParticipants[0]?.total || 0,
            averagePerParticipant: rankingData.summary.average_per_participant
          },
          details: rankedParticipants.slice(0, 5).map(p => ({
            name: p.name,
            totalSales: p.total
          }))
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing validation data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});