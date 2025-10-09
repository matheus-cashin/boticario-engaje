import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessedData {
  columns: string[];
  data: Record<string, any>[];
  metadata: {
    totalRows: number;
    totalColumns: number;
    fileType: string;
    sheetName?: string;
    hasValidRules?: boolean;
    ruleValidationMessage?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fileId } = await req.json();
    
    if (!fileId) {
      throw new Error('fileId is required');
    }

    console.log('🔄 Processing file:', fileId);

    // Get file metadata from database
    const { data: fileRecord, error: fetchError } = await supabase
      .from('campaign_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fetchError || !fileRecord) {
      throw new Error(`File not found: ${fetchError?.message}`);
    }

    console.log('📁 File record:', fileRecord.file_name);

    // Update status to processing
    await supabase
      .from('campaign_files')
      .update({ status: 'processing' })
      .eq('id', fileId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('campaign-files')
      .download(fileRecord.file_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    console.log('📥 File downloaded, size:', fileData.size);

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Read Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: null 
    });

    console.log('📊 Extracted rows:', jsonData.length);

    if (jsonData.length === 0) {
      throw new Error('No data found in file');
    }

    // Extract columns from first row
    const columns = Object.keys(jsonData[0] as Record<string, any>);
    
    console.log('📋 Columns found:', columns);

    // Buscar regras da campanha
    console.log('🔍 Buscando regras da campanha:', fileRecord.campaign_id);
    
    const { data: campaignRules, error: rulesError } = await supabase
      .from('company_rules')
      .select('*')
      .eq('campaign_id', fileRecord.campaign_id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (rulesError) {
      console.error('❌ Erro ao buscar regras:', rulesError);
    }

    let hasValidRules = false;
    let ruleValidationMessage = '';

    if (!campaignRules || campaignRules.length === 0) {
      // Tentar buscar na tabela antiga rule_raw
      const { data: rawRules } = await supabase
        .from('rule_raw')
        .select('*')
        .eq('campaign_id', fileRecord.campaign_id)
        .eq('processing_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!rawRules || rawRules.length === 0) {
        console.warn('⚠️ Nenhuma regra encontrada para esta campanha');
        ruleValidationMessage = 'ATENÇÃO: Esta campanha não possui regras definidas. Defina as regras antes de processar o arquivo de vendas.';
      } else {
        hasValidRules = true;
        console.log('✅ Regras encontradas na rule_raw');
        ruleValidationMessage = 'Regras da campanha encontradas e prontas para aplicação.';
      }
    } else {
      hasValidRules = true;
      console.log('✅ Regras encontradas na company_rules');
      ruleValidationMessage = 'Regras da campanha encontradas e prontas para aplicação.';
    }

    // Prepare processed result
    const processedResult: ProcessedData = {
      columns,
      data: jsonData as Record<string, any>[],
      metadata: {
        totalRows: jsonData.length,
        totalColumns: columns.length,
        fileType: fileRecord.file_type,
        sheetName,
        hasValidRules,
        ruleValidationMessage
      }
    };

    // Save processed result to database
    const { error: updateError } = await supabase
      .from('campaign_files')
      .update({
        status: 'completed',
        processing_result: processedResult,
        processed_at: new Date().toISOString(),
        error_message: hasValidRules ? null : ruleValidationMessage
      })
      .eq('id', fileId);

    if (updateError) {
      throw new Error(`Failed to update file: ${updateError.message}`);
    }

    console.log('✅ File processed successfully');
    
    // Chamar o mapeamento de colunas em background
    console.log('🗺️ Iniciando mapeamento de colunas com IA...');
    try {
      const mapperResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-column-mapper`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileId })
        }
      );

      if (mapperResponse.ok) {
        console.log('✅ Mapeamento de colunas executado com sucesso');
      } else {
        const errorText = await mapperResponse.text();
        console.error('⚠️ Erro ao executar mapeamento:', errorText);
      }
    } catch (mapperError) {
      console.error('⚠️ Falha ao chamar mapeador:', mapperError);
      // Não falhar o processamento principal por causa do mapper
    }
    
    if (!hasValidRules) {
      console.warn('⚠️ Arquivo processado mas aguardando definição de regras');
    } else {
      // Se houver regras válidas, enviar para o apurador
      console.log('🎯 Iniciando cálculo de prêmios e ranking...');
      
      const ruleData = campaignRules && campaignRules.length > 0 
        ? campaignRules[0].rule_json 
        : null;

      if (ruleData) {
        try {
          // Chamar o apurador em background
          const apuradorResponse = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-apurador`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                salesData: jsonData,
                ruleJson: ruleData,
                campaignId: fileRecord.campaign_id,
                campaignName: fileRecord.campaign_id
              })
            }
          );

          if (apuradorResponse.ok) {
            console.log('✅ Apurador executado com sucesso');
          } else {
            console.error('⚠️ Erro ao executar apurador:', await apuradorResponse.text());
          }
        } catch (apuradorError) {
          console.error('⚠️ Falha ao chamar apurador:', apuradorError);
          // Não falhar o processamento principal por causa do apurador
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        fileId,
        rowsProcessed: jsonData.length,
        columnsFound: columns.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error processing file:', error);

    // Try to update file status to failed
    if (error instanceof Error) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { fileId } = await req.json();
        if (fileId) {
          await supabase
            .from('campaign_files')
            .update({
              status: 'failed',
              error_message: error.message
            })
            .eq('id', fileId);
        }
      } catch (updateError) {
        console.error('Failed to update error status:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
