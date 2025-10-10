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
    const { data: file, error: fileError } = await supabase
      .from('campaign_files')
      .select('*, schedules(*)')
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      throw new Error('File not found');
    }

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
            raw_data: sale
          });

        if (saleError) {
          console.error('Error inserting sale:', saleError);
        }
      }

      // Atualizar total de vendas do participante
      processedParticipants[processedParticipants.length - 1].totalSales = totalAmount;
      
      console.log(`Processed ${sales.length} sales for ${participantData.name}: R$ ${totalAmount}`);
    }

    console.log(`Total processed: ${processedParticipants.length} participants`);

    // 6. Calcular estatísticas totais
    const totalSalesAmount = processedParticipants.reduce((sum, p) => sum + p.totalSales, 0);
    const totalSalesCount = Array.from(salesByParticipant.values()).reduce((sum, sales) => sum + sales.length, 0);

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
          details: processedParticipants.map(p => ({
            name: p.name,
            totalSales: p.totalSales
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