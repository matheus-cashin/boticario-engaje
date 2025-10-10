-- Create companies table
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  cnpj character varying,
  contact_person character varying,
  email character varying,
  phone character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);

-- Create schedules table
CREATE TABLE public.schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid,
  tenant_id character varying NOT NULL,
  campaign_id character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  journey_type integer NOT NULL,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying::text, 'processing'::character varying::text, 'finished'::character varying::text, 'cancelled'::character varying::text])),
  start_date date NOT NULL,
  end_date date NOT NULL,
  rule_text text NOT NULL,
  rule_parsed jsonb,
  notification_types text[] DEFAULT ARRAY['whatsapp'::text],
  processing_mode character varying DEFAULT 'manual'::character varying CHECK (processing_mode::text = ANY (ARRAY['manual'::character varying::text, 'semi_auto'::character varying::text, 'full_auto'::character varying::text])),
  ai_processing_enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  sales_target numeric DEFAULT 0,
  CONSTRAINT schedules_pkey PRIMARY KEY (id),
  CONSTRAINT schedules_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);

-- Create participants table
CREATE TABLE public.participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid,
  name character varying NOT NULL,
  email character varying,
  phone character varying NOT NULL,
  employee_id character varying,
  mongo_id character varying,
  target_amount numeric,
  current_progress numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT participants_pkey PRIMARY KEY (id),
  CONSTRAINT participants_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id)
);

-- Create rule_templates table
CREATE TABLE public.rule_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  template_name character varying NOT NULL,
  template_structure jsonb NOT NULL,
  example_text text,
  category character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rule_templates_pkey PRIMARY KEY (id)
);

-- Create rule_raw table
CREATE TABLE public.rule_raw (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id text NOT NULL,
  campaign_name text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  file_content text NOT NULL,
  upload_date timestamp with time zone NOT NULL DEFAULT now(),
  processing_status text NOT NULL DEFAULT 'pending'::text CHECK (processing_status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  processed_summary text,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  last_retry_at timestamp with time zone,
  is_correction boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rule_raw_pkey PRIMARY KEY (id)
);

-- Create upload_logs table
CREATE TABLE public.upload_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid,
  filename character varying NOT NULL,
  original_filename character varying NOT NULL,
  file_size integer,
  file_path character varying,
  mime_type character varying,
  status character varying DEFAULT 'uploaded'::character varying CHECK (status::text = ANY (ARRAY['uploaded'::character varying::text, 'processing'::character varying::text, 'processed'::character varying::text, 'failed'::character varying::text])),
  upload_type character varying DEFAULT 'parcial'::character varying CHECK (upload_type::text = ANY (ARRAY['parcial'::character varying::text, 'final'::character varying::text, 'meta'::character varying::text, 'resultado'::character varying::text])),
  rows_total integer,
  rows_processed integer DEFAULT 0,
  rows_failed integer DEFAULT 0,
  total_amount numeric DEFAULT 0,
  ai_processing_enabled boolean DEFAULT false,
  processing_errors jsonb,
  processing_summary jsonb,
  uploaded_by character varying,
  uploaded_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT upload_logs_pkey PRIMARY KEY (id),
  CONSTRAINT upload_logs_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id)
);

-- Create campaign_rules table
CREATE TABLE public.campaign_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL,
  raw_text text NOT NULL,
  processed_rule jsonb NOT NULL,
  rule_version integer DEFAULT 1,
  processing_status character varying DEFAULT 'pending'::character varying,
  ai_confidence_score numeric,
  validation_status character varying DEFAULT 'pending'::character varying,
  validated_by character varying,
  validated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaign_rules_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_rules_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id)
);

-- Create company_rules table
CREATE TABLE public.company_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid,
  campaign_id text NOT NULL,
  campaign_name text NOT NULL,
  rule_json jsonb,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  rule_text text NOT NULL DEFAULT ''::text,
  file_name text,
  file_size bigint,
  file_type text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  error_message text,
  CONSTRAINT company_rules_pkey PRIMARY KEY (id),
  CONSTRAINT company_rules_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);

-- Create campaign_files table
CREATE TABLE public.campaign_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  upload_type text NOT NULL CHECK (upload_type = ANY (ARRAY['rules'::text, 'sales'::text])),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  processing_result jsonb,
  error_message text,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  schedule_id uuid,
  processed_by_ranking_id uuid,
  validation_status text DEFAULT 'pending'::text CHECK (validation_status = ANY (ARRAY['pending'::text, 'validated'::text, 'rejected'::text])),
  CONSTRAINT campaign_files_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_files_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id)
);

-- Create rankings table (with forward reference to campaign_files)
CREATE TABLE public.rankings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid,
  calculation_date date NOT NULL,
  period_type character varying DEFAULT 'weekly'::character varying CHECK (period_type::text = ANY (ARRAY['daily'::character varying::text, 'weekly'::character varying::text, 'monthly'::character varying::text, 'campaign'::character varying::text])),
  reference_period character varying,
  ranking_data jsonb NOT NULL,
  total_participants integer NOT NULL,
  calculation_method character varying DEFAULT 'ai_engine'::character varying,
  processing_time_ms integer,
  is_final boolean DEFAULT false,
  ranking_sent boolean DEFAULT false,
  sent_at timestamp with time zone,
  sent_to_participants integer DEFAULT 0,
  total_sales_amount numeric DEFAULT 0,
  avg_sales_per_participant numeric DEFAULT 0,
  top_performer_amount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  source_file_id uuid,
  rule_id uuid,
  campaign_id text,
  CONSTRAINT rankings_pkey PRIMARY KEY (id),
  CONSTRAINT rankings_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id),
  CONSTRAINT rankings_source_file_id_fkey FOREIGN KEY (source_file_id) REFERENCES public.campaign_files(id),
  CONSTRAINT rankings_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.company_rules(id)
);

-- Add foreign key from campaign_files to rankings (circular reference)
ALTER TABLE public.campaign_files
ADD CONSTRAINT campaign_files_processed_by_ranking_id_fkey 
FOREIGN KEY (processed_by_ranking_id) REFERENCES public.rankings(id);

-- Create credits table
CREATE TABLE public.credits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid,
  participant_id uuid,
  upload_batch_id uuid,
  credit_type character varying NOT NULL CHECK (credit_type::text = ANY (ARRAY['meta_atingida'::character varying::text, 'bonus'::character varying::text, 'premiacao'::character varying::text, 'ajuste'::character varying::text])),
  amount numeric NOT NULL,
  description text,
  status character varying DEFAULT 'pendente'::character varying CHECK (status::text = ANY (ARRAY['pendente'::character varying::text, 'distribuido'::character varying::text, 'divergente'::character varying::text, 'cancelado'::character varying::text])),
  criteria_met character varying,
  achievement_date date,
  reference_period character varying,
  cashin_transaction_id character varying,
  cashin_status character varying,
  calculated_at timestamp with time zone DEFAULT now(),
  distributed_at timestamp with time zone,
  distributed_by character varying,
  notes text,
  divergence_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ranking_id uuid,
  source_file_id uuid,
  calculation_date date,
  CONSTRAINT credits_pkey PRIMARY KEY (id),
  CONSTRAINT credits_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id),
  CONSTRAINT credits_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id),
  CONSTRAINT credits_upload_batch_id_fkey FOREIGN KEY (upload_batch_id) REFERENCES public.upload_logs(id),
  CONSTRAINT credits_ranking_id_fkey FOREIGN KEY (ranking_id) REFERENCES public.rankings(id),
  CONSTRAINT credits_source_file_id_fkey FOREIGN KEY (source_file_id) REFERENCES public.campaign_files(id)
);

-- Create dispatch_history table
CREATE TABLE public.dispatch_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid,
  participant_id uuid,
  type character varying DEFAULT 'whatsapp'::character varying CHECK (type::text = ANY (ARRAY['whatsapp'::character varying::text, 'email'::character varying::text, 'sms'::character varying::text])),
  communication_name character varying NOT NULL,
  content text NOT NULL,
  file_url text,
  parameters text[],
  status character varying DEFAULT 'scheduled'::character varying CHECK (status::text = ANY (ARRAY['scheduled'::character varying::text, 'sent'::character varying::text, 'delivered'::character varying::text, 'failed'::character varying::text])),
  send_at timestamp with time zone NOT NULL,
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  twilio_response jsonb,
  external_id character varying,
  error_message text,
  is_ranking_message boolean DEFAULT false,
  ranking_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dispatch_history_pkey PRIMARY KEY (id),
  CONSTRAINT dispatch_history_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id),
  CONSTRAINT dispatch_history_ranking_id_fkey FOREIGN KEY (ranking_id) REFERENCES public.rankings(id),
  CONSTRAINT dispatch_history_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id)
);

-- Create partial_calculations table
CREATE TABLE public.partial_calculations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL,
  rule_id uuid NOT NULL,
  upload_batch_id uuid NOT NULL,
  calculation_date date NOT NULL,
  calculation_results jsonb NOT NULL,
  participants_evaluated integer,
  participants_qualified integer,
  total_achievement numeric,
  status character varying DEFAULT 'pending'::character varying,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT partial_calculations_pkey PRIMARY KEY (id),
  CONSTRAINT partial_calculations_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.campaign_rules(id),
  CONSTRAINT partial_calculations_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id),
  CONSTRAINT partial_calculations_upload_batch_id_fkey FOREIGN KEY (upload_batch_id) REFERENCES public.upload_logs(id)
);

-- Create sales_data table
CREATE TABLE public.sales_data (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid,
  participant_id uuid,
  sale_date date NOT NULL,
  amount numeric NOT NULL,
  quantity numeric,
  product_name character varying,
  product_category character varying,
  upload_batch_id uuid,
  raw_data jsonb,
  processed_by_ai boolean DEFAULT false,
  ai_confidence_score numeric,
  is_valid boolean DEFAULT true,
  validation_errors text[],
  created_at timestamp with time zone DEFAULT now(),
  source_file_id uuid,
  CONSTRAINT sales_data_pkey PRIMARY KEY (id),
  CONSTRAINT sales_data_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participants(id),
  CONSTRAINT sales_data_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id),
  CONSTRAINT sales_data_source_file_id_fkey FOREIGN KEY (source_file_id) REFERENCES public.campaign_files(id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partial_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_data ENABLE ROW LEVEL SECURITY;