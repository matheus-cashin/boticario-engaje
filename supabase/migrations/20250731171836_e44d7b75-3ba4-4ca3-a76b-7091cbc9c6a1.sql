-- Inserir 3 campanhas exemplo
INSERT INTO schedules (
  id, 
  tenant_id, 
  campaign_id, 
  name, 
  journey_type, 
  start_date, 
  end_date, 
  status, 
  rule_text,
  notification_types,
  processing_mode
) VALUES 
(
  gen_random_uuid(),
  'tenant_001',
  'CAMP_001',
  'Campanha Q1 2024',
  1,
  '2024-01-01',
  '2024-03-31',
  'active',
  'Participantes devem alcançar meta de vendas de R$ 50.000 no período',
  ARRAY['whatsapp'],
  'automatic'
),
(
  gen_random_uuid(),
  'tenant_001',
  'CAMP_002',
  'Incentivo Verão',
  1,
  '2024-02-01',
  '2024-04-30',
  'active',
  'Campanha de incentivo para vendas de produtos de verão com meta de R$ 30.000',
  ARRAY['whatsapp', 'email'],
  'manual'
),
(
  gen_random_uuid(),
  'tenant_001',
  'CAMP_003',
  'Meta Trimestral',
  1,
  '2024-03-01',
  '2024-05-31',
  'pending',
  'Alcançar 120% da meta estabelecida para o trimestre',
  ARRAY['whatsapp'],
  'automatic'
);

-- Armazenar os IDs das campanhas em variáveis temporárias (usando WITH)
WITH campaign_ids AS (
  SELECT id, campaign_id FROM schedules WHERE campaign_id IN ('CAMP_001', 'CAMP_002', 'CAMP_003')
),
inserted_participants AS (
  INSERT INTO participants (
    id,
    schedule_id,
    name,
    email,
    phone,
    employee_id,
    target_amount,
    current_progress,
    is_active
  ) 
  SELECT 
    gen_random_uuid(),
    c.id,
    p.name,
    p.email,
    p.phone,
    p.employee_id,
    p.target_amount,
    p.current_progress,
    p.is_active
  FROM campaign_ids c
  CROSS JOIN (VALUES
    -- Participantes da Campanha Q1 2024
    ('Ana Silva', 'ana.silva@empresa.com', '+5511987654321', 'EMP001', 50000, 42500, true, 'CAMP_001'),
    ('Carlos Santos', 'carlos.santos@empresa.com', '+5511987654322', 'EMP002', 50000, 39000, true, 'CAMP_001'),
    ('Maria Oliveira', 'maria.oliveira@empresa.com', '+5511987654323', 'EMP003', 50000, 36000, true, 'CAMP_001'),
    ('João Costa', 'joao.costa@empresa.com', '+5511987654324', 'EMP004', 50000, 34000, true, 'CAMP_001'),
    ('Fernanda Lima', 'fernanda.lima@empresa.com', '+5511987654325', 'EMP005', 50000, 32500, true, 'CAMP_001'),
    
    -- Participantes da Campanha Incentivo Verão
    ('Pedro Alves', 'pedro.alves@empresa.com', '+5511987654326', 'EMP006', 30000, 18600, true, 'CAMP_002'),
    ('Juliana Rocha', 'juliana.rocha@empresa.com', '+5511987654327', 'EMP007', 30000, 17400, true, 'CAMP_002'),
    ('Roberto Ferreira', 'roberto.ferreira@empresa.com', '+5511987654328', 'EMP008', 30000, 16500, true, 'CAMP_002'),
    ('Camila Souza', 'camila.souza@empresa.com', '+5511987654329', 'EMP009', 30000, 15600, true, 'CAMP_002'),
    
    -- Participantes da Campanha Meta Trimestral
    ('André Pereira', 'andre.pereira@empresa.com', '+5511987654330', 'EMP010', 60000, 14400, true, 'CAMP_003'),
    ('Luciana Mendes', 'luciana.mendes@empresa.com', '+5511987654331', 'EMP011', 60000, 13200, true, 'CAMP_003'),
    ('Ricardo Gomes', 'ricardo.gomes@empresa.com', '+5511987654332', 'EMP012', 60000, 12000, true, 'CAMP_003')
  ) AS p(name, email, phone, employee_id, target_amount, current_progress, is_active, campaign_ref)
  WHERE c.campaign_id = p.campaign_ref
  RETURNING id, schedule_id, name, employee_id
)
-- Inserir dados de vendas para criar o progresso dos participantes
INSERT INTO sales_data (
  id,
  schedule_id,
  participant_id,
  sale_date,
  amount,
  product_name,
  product_category,
  is_valid
) 
SELECT 
  gen_random_uuid(),
  ip.schedule_id,
  ip.id,
  s.sale_date::date,
  s.amount,
  s.product_name,
  s.product_category,
  s.is_valid
FROM inserted_participants ip
CROSS JOIN (VALUES
  -- Vendas para Ana Silva (EMP001)
  ('2024-01-15', 15000, 'Produto A', 'Eletrônicos', true, 'EMP001'),
  ('2024-02-20', 12500, 'Produto B', 'Eletrônicos', true, 'EMP001'),
  ('2024-03-10', 15000, 'Produto C', 'Casa', true, 'EMP001'),
  
  -- Vendas para Carlos Santos (EMP002)
  ('2024-01-20', 20000, 'Produto A', 'Eletrônicos', true, 'EMP002'),
  ('2024-02-15', 19000, 'Produto D', 'Casa', true, 'EMP002'),
  
  -- Vendas para Maria Oliveira (EMP003)
  ('2024-01-25', 18000, 'Produto B', 'Eletrônicos', true, 'EMP003'),
  ('2024-03-05', 18000, 'Produto E', 'Roupas', true, 'EMP003'),
  
  -- Vendas para João Costa (EMP004)
  ('2024-02-10', 17000, 'Produto A', 'Eletrônicos', true, 'EMP004'),
  ('2024-03-15', 17000, 'Produto F', 'Casa', true, 'EMP004'),
  
  -- Vendas para Fernanda Lima (EMP005)
  ('2024-01-30', 16000, 'Produto C', 'Casa', true, 'EMP005'),
  ('2024-02-25', 16500, 'Produto G', 'Roupas', true, 'EMP005'),
  
  -- Vendas para Pedro Alves (EMP006)
  ('2024-02-15', 9300, 'Produto Verão A', 'Roupas', true, 'EMP006'),
  ('2024-03-20', 9300, 'Produto Verão B', 'Esportes', true, 'EMP006'),
  
  -- Vendas para Juliana Rocha (EMP007)
  ('2024-02-20', 8700, 'Produto Verão C', 'Roupas', true, 'EMP007'),
  ('2024-04-10', 8700, 'Produto Verão D', 'Esportes', true, 'EMP007'),
  
  -- Vendas para Roberto Ferreira (EMP008)
  ('2024-02-25', 8250, 'Produto Verão E', 'Casa', true, 'EMP008'),
  ('2024-03-30', 8250, 'Produto Verão F', 'Roupas', true, 'EMP008'),
  
  -- Vendas para Camila Souza (EMP009)
  ('2024-03-05', 7800, 'Produto Verão G', 'Esportes', true, 'EMP009'),
  ('2024-04-15', 7800, 'Produto Verão H', 'Casa', true, 'EMP009'),
  
  -- Vendas para André Pereira (EMP010)
  ('2024-03-10', 7200, 'Produto Meta A', 'Eletrônicos', true, 'EMP010'),
  ('2024-04-20', 7200, 'Produto Meta B', 'Casa', true, 'EMP010'),
  
  -- Vendas para Luciana Mendes (EMP011)
  ('2024-03-15', 6600, 'Produto Meta C', 'Roupas', true, 'EMP011'),
  ('2024-05-10', 6600, 'Produto Meta D', 'Eletrônicos', true, 'EMP011'),
  
  -- Vendas para Ricardo Gomes (EMP012)
  ('2024-03-20', 6000, 'Produto Meta E', 'Casa', true, 'EMP012'),
  ('2024-04-25', 6000, 'Produto Meta F', 'Esportes', true, 'EMP012')
) AS s(sale_date, amount, product_name, product_category, is_valid, employee_ref)
WHERE ip.employee_id = s.employee_ref;