
-- Verificar se há políticas RLS bloqueando o acesso aos dados
-- Primeiro, vamos desabilitar temporariamente o RLS para testar
ALTER TABLE public.schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits DISABLE ROW LEVEL SECURITY;

-- Verificar se os dados existem mesmo
-- (isso vai nos ajudar a confirmar se o problema é de permissão ou código)
