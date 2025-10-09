
export const fileConverter = {
  async toBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const result = reader.result as string;
          // Remove o prefixo data:type;base64,
          const base64 = result.split(',')[1];
          if (!base64) {
            throw new Error('Falha na conversão para base64');
          }
          resolve(base64);
        } catch (err) {
          reject(new Error('Erro ao processar arquivo'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  },

  fromBase64ToFile(base64Data: string, fileName: string, fileType: string): File {
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Dados do arquivo corrompidos');
    }

    // Limpar base64 (remover espaços e quebras de linha)
    let cleanBase64 = base64Data.replace(/\s/g, '');
    
    // Verificar se os dados parecem estar em formato hexadecimal
    // Se for muito longo e contém apenas caracteres hex, pode ser hexadecimal
    const isLikelyHex = /^[0-9a-fA-F]+$/.test(cleanBase64) && cleanBase64.length % 2 === 0 && cleanBase64.length > 1000;
    
    if (isLikelyHex) {
      console.log('⚠️ Detectados dados em formato hexadecimal, convertendo para base64...');
      try {
        // Converter hex para bytes e depois para base64
        const bytes = new Uint8Array(cleanBase64.length / 2);
        for (let i = 0; i < cleanBase64.length; i += 2) {
          bytes[i / 2] = parseInt(cleanBase64.substr(i, 2), 16);
        }
        cleanBase64 = btoa(String.fromCharCode(...bytes));
        console.log('✅ Conversão de hex para base64 bem-sucedida');
      } catch (hexError) {
        console.error('❌ Erro na conversão de hex para base64:', hexError);
        throw new Error('Arquivo corrompido. Dados em formato incompatível.');
      }
    }
    
    let binaryString;
    try {
      binaryString = atob(cleanBase64);
    } catch (atobError) {
      console.error('Erro no atob:', atobError);
      throw new Error('Arquivo corrompido. Faça um novo upload.');
    }
    
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: fileType });
    const file = new File([blob], fileName, { type: fileType });

    console.log('📁 Arquivo reconstruído:', {
      name: file.name,
      size: file.size,
      type: file.type,
      originalDataLength: base64Data.length
    });

    return file;
  },

  validateBase64(base64String: string): boolean {
    if (!base64String || typeof base64String !== 'string') {
      return false;
    }

    try {
      // Tentar decodificar para verificar se é base64 válido
      const cleaned = base64String.replace(/\s/g, '');
      atob(cleaned);
      return true;
    } catch {
      return false;
    }
  }
};
