-- Drop all storage policies for campaign-files bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload campaign files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read campaign files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update campaign files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete campaign files" ON storage.objects;

-- Create public storage policies
CREATE POLICY "Public access to campaign files"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'campaign-files')
WITH CHECK (bucket_id = 'campaign-files');

-- Disable RLS on all tables
ALTER TABLE public.campaign_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.partial_calculations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_raw DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_logs DISABLE ROW LEVEL SECURITY;