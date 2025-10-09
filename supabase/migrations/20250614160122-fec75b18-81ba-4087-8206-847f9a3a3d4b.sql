
-- Inserir uma campanha mockada chamada "teste mat" com status correto
INSERT INTO schedules (
  id,
  name,
  campaign_id,
  tenant_id,
  rule_text,
  start_date,
  end_date,
  notification_types,
  status,
  journey_type
) VALUES (
  gen_random_uuid(),
  'teste mat',
  'CAMP_TESTE_MAT_001',
  'tenant_default',
  'Regra de teste: Participantes que atingirem R$ 1000 em vendas receberão R$ 100 de comissão',
  '2024-01-01',
  '2024-12-31',
  ARRAY['whatsapp'],
  'pending',
  1
);

-- Inserir alguns participantes para a campanha
INSERT INTO participants (
  id,
  schedule_id,
  name,
  phone,
  email,
  employee_id,
  target_amount,
  current_progress
) 
SELECT 
  gen_random_uuid(),
  s.id,
  'Participante ' || generate_series,
  '+5511999' || LPAD(generate_series::text, 6, '0'),
  'participante' || generate_series || '@teste.com',
  'EMP' || LPAD(generate_series::text, 3, '0'),
  5000.00,
  generate_series * 150.00
FROM schedules s, generate_series(1, 5)
WHERE s.name = 'teste mat';

-- Inserir alguns uploads mockados
INSERT INTO upload_logs (
  id,
  schedule_id,
  filename,
  original_filename,
  status,
  upload_type,
  total_amount,
  rows_total,
  rows_processed,
  rows_failed
)
SELECT 
  gen_random_uuid(),
  s.id,
  'vendas_' || TO_CHAR(NOW() - INTERVAL '10 days' + (generate_series || ' days')::INTERVAL, 'YYYY_MM_DD') || '.xlsx',
  'Vendas ' || TO_CHAR(NOW() - INTERVAL '10 days' + (generate_series || ' days')::INTERVAL, 'DD/MM/YYYY') || '.xlsx',
  CASE 
    WHEN generate_series = 3 THEN 'processed'
    WHEN generate_series = 2 THEN 'failed' 
    ELSE 'uploaded'
  END,
  CASE WHEN generate_series = 3 THEN 'final' ELSE 'parcial' END,
  1000.00 + (generate_series * 250.00),
  100,
  CASE 
    WHEN generate_series = 2 THEN 85
    ELSE 100
  END,
  CASE 
    WHEN generate_series = 2 THEN 15
    ELSE 0
  END
FROM schedules s, generate_series(1, 3)
WHERE s.name = 'teste mat';
