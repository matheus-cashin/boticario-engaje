
-- Criar tabela para armazenar regras das empresas
CREATE TABLE public.company_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  rule_text TEXT NOT NULL,
  rule_json JSONB,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_company_rules_company_id ON public.company_rules(company_id);
CREATE INDEX idx_company_rules_campaign_id ON public.company_rules(campaign_id);
CREATE INDEX idx_company_rules_status ON public.company_rules(status);

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_company_rules_updated_at
  BEFORE UPDATE ON public.company_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.company_rules ENABLE ROW LEVEL SECURITY;

-- Política permissiva para permitir todas as operações
CREATE POLICY "Allow all operations on company_rules" ON public.company_rules
  FOR ALL USING (true)
  WITH CHECK (true);
