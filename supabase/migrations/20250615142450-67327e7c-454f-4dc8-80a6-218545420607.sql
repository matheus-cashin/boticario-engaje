
-- Criar tabela para gerenciar arquivos de campanha
CREATE TABLE public.campaign_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  upload_type TEXT NOT NULL CHECK (upload_type IN ('rules', 'sales')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processing_result JSONB,
  error_message TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_campaign_files_campaign_id ON public.campaign_files(campaign_id);
CREATE INDEX idx_campaign_files_status ON public.campaign_files(status);
CREATE INDEX idx_campaign_files_upload_type ON public.campaign_files(upload_type);

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_campaign_files_updated_at
  BEFORE UPDATE ON public.campaign_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.campaign_files ENABLE ROW LEVEL SECURITY;

-- Política permissiva para permitir todas as operações
CREATE POLICY "Allow all operations on campaign_files" ON public.campaign_files
  FOR ALL USING (true)
  WITH CHECK (true);
