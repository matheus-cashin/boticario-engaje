
import { supabase } from "@/integrations/supabase/client";

export interface UploadResult {
  success: boolean;
  fileId?: string;
  error?: string;
}

export async function uploadCampaignFile(
  file: File,
  campaignId: string,
  fileType: 'rules' | 'sales' = 'rules'
): Promise<UploadResult> {
  try {
    console.log('🚀 Iniciando upload para Storage:', {
      fileName: file.name,
      fileSize: file.size,
      campaignId,
      fileType
    });

    // 1. Gerar nome único e path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${campaignId}/${fileType}/${fileName}`;

    // 2. Upload para Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('campaign-files')
      .upload(filePath, file);

    if (storageError) {
      console.error('❌ Erro no upload para Storage:', storageError);
      throw new Error(`Erro no upload: ${storageError.message}`);
    }

    console.log('✅ Upload para Storage realizado:', storageData);

    // 3. Salvar referência no banco
    const { data: dbData, error: dbError } = await supabase
      .from('campaign_files')
      .insert({
        campaign_id: campaignId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        upload_type: fileType,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Erro ao salvar no banco:', dbError);
      // Tentar limpar o arquivo do storage se falhou salvar no banco
      await supabase.storage.from('campaign-files').remove([filePath]);
      throw new Error(`Erro ao salvar referência: ${dbError.message}`);
    }

    console.log('💾 Arquivo salvo no banco:', dbData);

    // 4. Processar arquivo baseado no tipo
    if (fileType === 'sales') {
      // Processar arquivo de vendas com edge function
      console.log('📊 Processando arquivo de vendas...');
      
      try {
        const { error: processingError } = await supabase.functions.invoke('process-campaign-file', {
          body: { fileId: dbData.id }
        });

        if (processingError) {
          console.error('❌ Erro ao processar arquivo:', processingError);
          await supabase
            .from('campaign_files')
            .update({ 
              status: 'failed',
              error_message: `Erro no processamento: ${processingError.message}`
            })
            .eq('id', dbData.id);
        } else {
          console.log('✅ Arquivo processado com sucesso');
        }
      } catch (error) {
        console.error('❌ Falha ao invocar função de processamento:', error);
      }
    } else if (fileType === 'rules') {
      // Notificar n8n para processar regras
      console.log('📡 Enviando notificação para n8n (regras)...');
      
      const response = await fetch('https://cashin-mvp-n8n.vfzy2c.easypanel.host/webhook-test/49077a37-9ef4-4894-b5e8-31db7646d3e0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: dbData.id,
          campaignId: campaignId,
          filePath: filePath,
          action: 'process-rules',
          fileName: file.name
        })
      });

      if (!response.ok) {
        console.warn('⚠️ Erro ao notificar n8n, mas arquivo foi salvo:', response.statusText);
      } else {
        console.log('✅ n8n notificado com sucesso (regras)');
      }
    }

    return { success: true, fileId: dbData.id };
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido no upload'
    };
  }
}

export async function getCampaignFile(fileId: string) {
  const { data, error } = await supabase
    .from('campaign_files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (error) {
    console.error('Erro ao buscar arquivo:', error);
    return null;
  }

  return data;
}

export async function updateFileStatus(
  fileId: string, 
  status: 'processing' | 'completed' | 'failed',
  result?: any,
  errorMessage?: string
) {
  const updateData: any = { 
    status,
    updated_at: new Date().toISOString()
  };

  if (status === 'completed' && result) {
    updateData.processing_result = result;
    updateData.processed_at = new Date().toISOString();
  }

  if (status === 'failed' && errorMessage) {
    updateData.error_message = errorMessage;
  }

  const { error } = await supabase
    .from('campaign_files')
    .update(updateData)
    .eq('id', fileId);

  if (error) {
    console.error('Erro ao atualizar status do arquivo:', error);
  }
}

export async function deleteCampaignFile(fileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Iniciando exclusão do arquivo:', fileId);

    // 1. Buscar dados do arquivo
    const { data: fileData, error: fetchError } = await supabase
      .from('campaign_files')
      .select('file_path')
      .eq('id', fileId)
      .single();

    if (fetchError || !fileData) {
      throw new Error('Arquivo não encontrado');
    }

    // 2. Remover do Storage
    const { error: storageError } = await supabase.storage
      .from('campaign-files')
      .remove([fileData.file_path]);

    if (storageError) {
      console.warn('⚠️ Erro ao remover do storage:', storageError);
      // Não falhar por causa disso, continuar com a exclusão lógica
    }

    // 3. Marcar como deletado no banco
    const { error: updateError } = await supabase
      .from('campaign_files')
      .update({
        status: 'failed',
        error_message: 'Arquivo excluído pelo usuário',
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);

    if (updateError) {
      throw new Error(`Erro ao marcar arquivo como deletado: ${updateError.message}`);
    }

    console.log('✅ Arquivo excluído com sucesso');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao excluir arquivo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido na exclusão'
    };
  }
}

export async function getCampaignFiles(campaignId: string) {
  console.log('🔍 Buscando arquivos no banco para campanha:', campaignId);
  
  const { data, error } = await supabase
    .from('campaign_files')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('upload_type', 'sales')
    .neq('status', 'failed')
    .order('uploaded_at', { ascending: false });

  console.log('📋 Query executada:', {
    campaignId,
    uploadType: 'sales',
    status: 'não failed'
  });

  if (error) {
    console.error('❌ Erro ao buscar arquivos da campanha:', error);
    return [];
  }

  console.log('📄 Dados retornados do banco:', data);
  console.log('📊 Total de arquivos encontrados:', data?.length || 0);

  // Log detalhado de cada arquivo encontrado
  if (data && data.length > 0) {
    data.forEach((file, index) => {
      console.log(`📁 Arquivo ${index + 1}:`, {
        id: file.id,
        name: file.file_name,
        status: file.status,
        campaignId: file.campaign_id,
        uploadType: file.upload_type
      });
    });
  } else {
    console.log('⚠️ Nenhum arquivo encontrado com os critérios:', {
      campaign_id: campaignId,
      upload_type: 'sales',
      status: 'não failed'
    });
  }

  return data || [];
}

export async function downloadCampaignFile(filePath: string, fileName: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('⬇️ Iniciando download do arquivo:', { filePath, fileName });

    const { data, error } = await supabase.storage
      .from('campaign-files')
      .download(filePath);

    if (error) {
      console.error('❌ Erro ao baixar arquivo:', error);
      return { success: false, error: error.message };
    }

    // Criar URL para download
    const url = URL.createObjectURL(data);
    
    // Criar elemento temporário para trigger do download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Limpar
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Download realizado com sucesso');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro no download:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido no download'
    };
  }
}
