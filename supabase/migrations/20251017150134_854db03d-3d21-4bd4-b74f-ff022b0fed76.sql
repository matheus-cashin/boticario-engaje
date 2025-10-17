-- Criar view que mostra a relação entre participantes e campanhas
CREATE OR REPLACE VIEW public.participants_campaigns_view AS
SELECT 
  p.id as participant_id,
  p.employee_id,
  p.name as participant_name,
  p.email,
  p.phone,
  p.is_active as participant_active,
  p.current_progress,
  p.target_amount,
  p.created_at as participant_created_at,
  p.updated_at as participant_updated_at,
  
  s.id as schedule_id,
  s.campaign_id,
  s.name as campaign_name,
  s.start_date as campaign_start,
  s.end_date as campaign_end,
  s.status as campaign_status,
  s.sales_target as campaign_target,
  s.journey_type,
  
  -- Métricas calculadas
  CASE 
    WHEN p.target_amount > 0 THEN 
      ROUND((p.current_progress / p.target_amount * 100)::numeric, 2)
    ELSE 0 
  END as progress_percentage,
  
  CASE 
    WHEN s.end_date < CURRENT_DATE THEN 'finished'
    WHEN s.start_date > CURRENT_DATE THEN 'upcoming'
    ELSE 'active'
  END as campaign_period_status

FROM public.participants p
INNER JOIN public.schedules s ON p.schedule_id = s.id
WHERE p.is_active = true
ORDER BY s.start_date DESC, p.name;

-- Criar view adicional agrupada por employee_id (mostra histórico do funcionário)
CREATE OR REPLACE VIEW public.employee_campaigns_history AS
SELECT 
  p.employee_id,
  p.name as employee_name,
  p.email,
  p.phone,
  COUNT(DISTINCT p.schedule_id) as total_campaigns,
  COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_campaigns,
  AVG(p.current_progress) as avg_progress,
  SUM(p.current_progress) as total_sales,
  MAX(s.end_date) as last_campaign_date,
  json_agg(
    json_build_object(
      'campaign_id', s.campaign_id,
      'campaign_name', s.name,
      'start_date', s.start_date,
      'end_date', s.end_date,
      'progress', p.current_progress,
      'target', p.target_amount,
      'status', s.status
    ) ORDER BY s.start_date DESC
  ) as campaigns_details
FROM public.participants p
INNER JOIN public.schedules s ON p.schedule_id = s.id
WHERE p.employee_id IS NOT NULL
GROUP BY p.employee_id, p.name, p.email, p.phone
ORDER BY total_campaigns DESC, p.name;

COMMENT ON VIEW public.participants_campaigns_view IS 
'View que mostra todos os participantes e suas campanhas associadas com métricas calculadas';

COMMENT ON VIEW public.employee_campaigns_history IS 
'View que agrupa por employee_id mostrando o histórico completo de campanhas de cada funcionário';