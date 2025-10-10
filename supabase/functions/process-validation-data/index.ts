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

    // 2. Mapear campos
    const nameField = columnMappings.find((m: any) => m.suggestedField === "participant_name")?.originalName;
    const emailField = columnMappings.find((m: any) => m.suggestedField === "email")?.originalName;
    const phoneField = columnMappings.find((m: any) => m.suggestedField === "phone")?.originalName;
    const cpfField = columnMappings.find((m: any) => m.suggestedField === "participant_id")?.originalName;
    const saleDateField = columnMappings.find((m: any) => m.suggestedField === "sale_date")?.originalName;
    const amountField = columnMappings.find((m: any) => m.suggestedField === "amount")?.originalName;

    // 3. Processar participantes
    const participantsToUpsert = [];
    const salesDataToInsert = [];
    
    for (const row of rawData) {
      const name = row[nameField];
      const email = row[emailField];
      const phone = row[phoneField];
      const cpf = row[cpfField];
      
      if (!name || !phone) continue; // Skip invalid rows

      // Preparar participante
      participantsToUpsert.push({
        name,
        email: email || null,
        phone,
        employee_id: cpf || null,
        schedule_id: file.schedule_id,
        is_active: true
      });

      // Preparar dados de venda
      if (saleDateField && amountField) {
        const saleDate = row[saleDateField];
        const amount = parseFloat(row[amountField]) || 0;

        if (saleDate && amount > 0) {
          salesDataToInsert.push({
            schedule_id: file.schedule_id,
            participant_name: name,
            participant_phone: phone,
            sale_date: saleDate,
            amount: amount,
            source_file_id: fileId,
            is_valid: true
          });
        }
      }
    }

    // 4. Inserir/atualizar participantes
    const { data: insertedParticipants, error: participantsError } = await supabase
      .from('participants')
      .upsert(participantsToUpsert, {
        onConflict: 'phone,schedule_id',
        ignoreDuplicates: false
      })
      .select();

    if (participantsError) {
      console.error('Error inserting participants:', participantsError);
      throw participantsError;
    }

    // 5. Criar mapa de participantes por telefone
    const participantMap = new Map();
    if (insertedParticipants) {
      for (const p of insertedParticipants) {
        participantMap.set(p.phone, p.id);
      }
    }

    // 6. Adicionar participant_id aos dados de venda
    const salesWithParticipantId = salesDataToInsert.map(sale => ({
      ...sale,
      participant_id: participantMap.get(sale.participant_phone) || null
    }));

    // 7. Inserir dados de vendas
    if (salesWithParticipantId.length > 0) {
      const { error: salesError } = await supabase
        .from('sales_data')
        .insert(salesWithParticipantId);

      if (salesError) {
        console.error('Error inserting sales:', salesError);
        throw salesError;
      }
    }

    // 8. Atualizar status do arquivo
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
          participants: insertedParticipants?.length || 0,
          sales: salesWithParticipantId.length,
          scheduleId: file.schedule_id
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