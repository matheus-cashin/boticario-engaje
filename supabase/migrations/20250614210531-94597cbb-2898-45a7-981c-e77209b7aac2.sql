
-- Criar tabela para armazenar regras brutas (não processadas)
CREATE TABLE public.rule_raw (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  file_content BYTEA NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processed_summary TEXT,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_retry_at TIMESTAMP WITH TIME ZONE,
  is_correction BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_rule_raw_campaign_id ON public.rule_raw(campaign_id);
CREATE INDEX idx_rule_raw_processing_status ON public.rule_raw(processing_status);
CREATE INDEX idx_rule_raw_upload_date ON public.rule_raw(upload_date DESC);

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_rule_raw_updated_at
  BEFORE UPDATE ON public.rule_raw
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS (Row Level Security) - por enquanto permissivo para todos
ALTER TABLE public.rule_raw ENABLE ROW LEVEL SECURITY;

-- Política permissiva para permitir todas as operações (ajustar conforme necessário)
CREATE POLICY "Allow all operations on rule_raw" ON public.rule_raw
  FOR ALL USING (true)
  WITH CHECK (true);
