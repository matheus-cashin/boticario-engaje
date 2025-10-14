
export const n8nService = {
  async sendToWebhook(file: File, campaignId: string, campaignName: string, isCorrection: boolean, ruleId?: string) {
    const WEBHOOK_URL = 'https://n8n-prod.cashin.com.br/webhook-test/49077a37-9ef4-4894-b5e8-31db7646d3e0';
    
    console.log('🚀 Enviando para n8n:', {
      webhookUrl: WEBHOOK_URL,
      fileName: file.name,
      campaignId,
      campaignName,
      isCorrection,
      ruleId
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('campaignId', campaignId);
    formData.append('campaignName', campaignName);
    formData.append('isCorrection', isCorrection.toString());
    
    if (ruleId) {
      formData.append('ruleId', ruleId);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutos

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Resposta de erro do n8n:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Erro do servidor n8n: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Resposta do n8n:', result);
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ Timeout na requisição para n8n');
        throw new Error('Timeout: O processamento demorou mais que o esperado.');
      }
      
      console.error('❌ Erro na requisição para n8n:', error);
      throw error;
    }
  },

  async sendRuleTextToWebhookAsync(ruleText: string, campaignId: string, campaignName: string, ruleId?: string) {
    const WEBHOOK_URL = 'https://n8n-prod.cashin.com.br/webhook/2979cd3b-e25b-4d24-8c6c-1c8aa6e3b8cb';
    
    console.log('🚀 Enviando texto da regra para n8n (assíncrono):', {
      webhookUrl: WEBHOOK_URL,
      ruleText: ruleText.substring(0, 100) + '...',
      campaignId,
      campaignName,
      ruleId
    });

    const payload = {
      ruleText,
      campaignId,
      campaignName,
      ruleId
    };

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Resposta de erro do n8n:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Erro do servidor n8n: ${response.status} - ${errorText}`);
      }

      console.log('📤 Regra enviada para n8n com sucesso');
      
      // Não retorna o resultado processado, apenas confirma o envio
      return { success: true };
    } catch (error) {
      console.error('❌ Erro na requisição para n8n:', error);
      throw error;
    }
  },

  async sendRuleTextToWebhook(ruleText: string, campaignId: string, campaignName: string, ruleId?: string) {
    const WEBHOOK_URL = 'https://n8n-prod.cashin.com.br/webhook/2979cd3b-e25b-4d24-8c6c-1c8aa6e3b8cb';
    
    console.log('🚀 Enviando texto da regra para n8n:', {
      webhookUrl: WEBHOOK_URL,
      ruleText: ruleText.substring(0, 100) + '...',
      campaignId,
      campaignName,
      ruleId
    });

    const payload = {
      ruleText,
      campaignId,
      campaignName,
      ruleId
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutos

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Resposta de erro do n8n:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Erro do servidor n8n: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Resposta do n8n:', result);
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ Timeout na requisição para n8n');
        throw new Error('Timeout: O processamento demorou mais que o esperado.');
      }
      
      console.error('❌ Erro na requisição para n8n:', error);
      throw error;
    }
  }
};
