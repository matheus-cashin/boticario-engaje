
export const ruleErrorHandler = {
  getErrorMessage(error: any): string {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return "Timeout: O processamento demorou mais que o esperado.";
      } else if (error.message.includes('Failed to fetch')) {
        return "Erro de conexão. Verifique se o serviço n8n está disponível.";
      } else if (error.message.includes('NetworkError')) {
        return "Erro de rede. Verifique sua conexão.";
      } else if (error.message.includes('corrompido') || error.message.includes('Faça um novo upload')) {
        return "Arquivo corrompido detectado. Faça um novo upload do arquivo.";
      } else if (error.message.includes('base64')) {
        return "Erro na validação do arquivo. Tente fazer um novo upload.";
      } else {
        return `Erro: ${error.message}`;
      }
    }
    return "Não foi possível processar o arquivo.";
  },

  clearFileInputs(): void {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => (input as HTMLInputElement).value = '');
  }
};
