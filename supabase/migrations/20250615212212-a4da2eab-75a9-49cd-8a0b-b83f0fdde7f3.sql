
-- Criar bucket para arquivos de campanha se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-files', 'campaign-files', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir SELECT em todos os objetos do bucket campaign-files
CREATE POLICY "Allow public read access on campaign-files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'campaign-files');

-- Política para permitir INSERT em todos os objetos do bucket campaign-files
CREATE POLICY "Allow authenticated insert on campaign-files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'campaign-files');

-- Política para permitir UPDATE em todos os objetos do bucket campaign-files
CREATE POLICY "Allow authenticated update on campaign-files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'campaign-files');

-- Política para permitir DELETE em todos os objetos do bucket campaign-files
CREATE POLICY "Allow authenticated delete on campaign-files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'campaign-files');
