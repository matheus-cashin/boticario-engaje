
export interface CompanyRule {
  id: string;
  company_id: string | null;
  campaign_id: string;
  campaign_name: string;
  rule_text: string;
  rule_json: any | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}
