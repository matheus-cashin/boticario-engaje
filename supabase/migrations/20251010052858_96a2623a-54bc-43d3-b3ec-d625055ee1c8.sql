-- Create storage bucket for campaign files
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-files', 'campaign-files', false);

-- Create RLS policies for campaign files bucket
CREATE POLICY "Allow authenticated users to upload campaign files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaign-files');

CREATE POLICY "Allow authenticated users to read campaign files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'campaign-files');

CREATE POLICY "Allow authenticated users to update campaign files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'campaign-files');

CREATE POLICY "Allow authenticated users to delete campaign files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'campaign-files');