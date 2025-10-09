
-- Criar políticas RLS para a tabela campaign_files
-- Permitir todas as operações para facilitar o funcionamento do sistema

-- Política para SELECT
CREATE POLICY "Allow all select on campaign_files" ON public.campaign_files
  FOR SELECT USING (true);

-- Política para INSERT
CREATE POLICY "Allow all insert on campaign_files" ON public.campaign_files
  FOR INSERT WITH CHECK (true);

-- Política para UPDATE
CREATE POLICY "Allow all update on campaign_files" ON public.campaign_files
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Política para DELETE
CREATE POLICY "Allow all delete on campaign_files" ON public.campaign_files
  FOR DELETE USING (true);
