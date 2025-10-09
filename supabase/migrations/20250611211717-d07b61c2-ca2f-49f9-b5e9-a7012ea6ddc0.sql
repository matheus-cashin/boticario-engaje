
-- Criar bucket para uploads (sintaxe correta)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-files', 'campaign-files', false);

-- Políticas de segurança
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'campaign-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'campaign-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'campaign-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'campaign-files' AND
    auth.role() = 'authenticated'
  );
