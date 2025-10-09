
export interface RuleRawRecord {
  id: string;
  campaign_id: string;
  campaign_name: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_content: string;
  upload_date: string;
  processing_status: string;
  processed_summary: string | null;
  error_message: string | null;
  retry_count: number;
  last_retry_at: string | null;
  is_correction: boolean;
  created_at: string;
  updated_at: string;
}
