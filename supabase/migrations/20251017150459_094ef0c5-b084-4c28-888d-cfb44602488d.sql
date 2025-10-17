-- Dropar a view existente e recriá-la com a nova coluna
DROP VIEW IF EXISTS public.participants_campaigns_view;

CREATE VIEW public.participants_campaigns_view AS
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
  s.rule_text as campaign_rule_text,
  
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

COMMENT ON VIEW public.participants_campaigns_view IS 
'View que mostra todos os participantes e suas campanhas associadas com métricas calculadas e regras da campanha';