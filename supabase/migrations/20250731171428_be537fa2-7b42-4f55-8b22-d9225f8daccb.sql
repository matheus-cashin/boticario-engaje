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
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
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
  'b2c3d4e5-f6g7-8901-bcde-f23456789012',
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
  'c3d4e5f6-g7h8-9012-cdef-345678901234',
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

-- Inserir participantes para cada campanha
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
) VALUES 
-- Participantes da Campanha Q1 2024
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ana Silva', 'ana.silva@empresa.com', '+5511987654321', 'EMP001', 50000, 42500, true),
('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Carlos Santos', 'carlos.santos@empresa.com', '+5511987654322', 'EMP002', 50000, 39000, true),
('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Maria Oliveira', 'maria.oliveira@empresa.com', '+5511987654323', 'EMP003', 50000, 36000, true),
('44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'João Costa', 'joao.costa@empresa.com', '+5511987654324', 'EMP004', 50000, 34000, true),
('55555555-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Fernanda Lima', 'fernanda.lima@empresa.com', '+5511987654325', 'EMP005', 50000, 32500, true),

-- Participantes da Campanha Incentivo Verão
('66666666-6666-6666-6666-666666666666', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'Pedro Alves', 'pedro.alves@empresa.com', '+5511987654326', 'EMP006', 30000, 18600, true),
('77777777-7777-7777-7777-777777777777', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'Juliana Rocha', 'juliana.rocha@empresa.com', '+5511987654327', 'EMP007', 30000, 17400, true),
('88888888-8888-8888-8888-888888888888', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'Roberto Ferreira', 'roberto.ferreira@empresa.com', '+5511987654328', 'EMP008', 30000, 16500, true),
('99999999-9999-9999-9999-999999999999', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'Camila Souza', 'camila.souza@empresa.com', '+5511987654329', 'EMP009', 30000, 15600, true),

-- Participantes da Campanha Meta Trimestral
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'André Pereira', 'andre.pereira@empresa.com', '+5511987654330', 'EMP010', 60000, 14400, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'Luciana Mendes', 'luciana.mendes@empresa.com', '+5511987654331', 'EMP011', 60000, 13200, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'Ricardo Gomes', 'ricardo.gomes@empresa.com', '+5511987654332', 'EMP012', 60000, 12000, true);

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
) VALUES 
-- Vendas para Ana Silva (Campanha Q1 2024)
('s1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', '2024-01-15', 15000, 'Produto A', 'Eletrônicos', true),
('s1111111-1111-1111-1111-111111111112', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', '2024-02-20', 12500, 'Produto B', 'Eletrônicos', true),
('s1111111-1111-1111-1111-111111111113', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', '2024-03-10', 15000, 'Produto C', 'Casa', true),

-- Vendas para Carlos Santos (Campanha Q1 2024)
('s2222222-2222-2222-2222-222222222221', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '22222222-2222-2222-2222-222222222222', '2024-01-20', 20000, 'Produto A', 'Eletrônicos', true),
('s2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '22222222-2222-2222-2222-222222222222', '2024-02-15', 19000, 'Produto D', 'Casa', true),

-- Vendas para Maria Oliveira (Campanha Q1 2024)
('s3333333-3333-3333-3333-333333333331', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '33333333-3333-3333-3333-333333333333', '2024-01-25', 18000, 'Produto B', 'Eletrônicos', true),
('s3333333-3333-3333-3333-333333333332', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '33333333-3333-3333-3333-333333333333', '2024-03-05', 18000, 'Produto E', 'Roupas', true),

-- Vendas para João Costa (Campanha Q1 2024)
('s4444444-4444-4444-4444-444444444441', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '44444444-4444-4444-4444-444444444444', '2024-02-10', 17000, 'Produto A', 'Eletrônicos', true),
('s4444444-4444-4444-4444-444444444442', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '44444444-4444-4444-4444-444444444444', '2024-03-15', 17000, 'Produto F', 'Casa', true),

-- Vendas para Fernanda Lima (Campanha Q1 2024)
('s5555555-5555-5555-5555-555555555551', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '55555555-5555-5555-5555-555555555555', '2024-01-30', 16000, 'Produto C', 'Casa', true),
('s5555555-5555-5555-5555-555555555552', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '55555555-5555-5555-5555-555555555555', '2024-02-25', 16500, 'Produto G', 'Roupas', true),

-- Vendas para Pedro Alves (Campanha Incentivo Verão)
('s6666666-6666-6666-6666-666666666661', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '66666666-6666-6666-6666-666666666666', '2024-02-15', 9300, 'Produto Verão A', 'Roupas', true),
('s6666666-6666-6666-6666-666666666662', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '66666666-6666-6666-6666-666666666666', '2024-03-20', 9300, 'Produto Verão B', 'Esportes', true),

-- Vendas para Juliana Rocha (Campanha Incentivo Verão)
('s7777777-7777-7777-7777-777777777771', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '77777777-7777-7777-7777-777777777777', '2024-02-20', 8700, 'Produto Verão C', 'Roupas', true),
('s7777777-7777-7777-7777-777777777772', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '77777777-7777-7777-7777-777777777777', '2024-04-10', 8700, 'Produto Verão D', 'Esportes', true),

-- Vendas para Roberto Ferreira (Campanha Incentivo Verão)
('s8888888-8888-8888-8888-888888888881', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '88888888-8888-8888-8888-888888888888', '2024-02-25', 8250, 'Produto Verão E', 'Casa', true),
('s8888888-8888-8888-8888-888888888882', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '88888888-8888-8888-8888-888888888888', '2024-03-30', 8250, 'Produto Verão F', 'Roupas', true),

-- Vendas para Camila Souza (Campanha Incentivo Verão)
('s9999999-9999-9999-9999-999999999991', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '99999999-9999-9999-9999-999999999999', '2024-03-05', 7800, 'Produto Verão G', 'Esportes', true),
('s9999999-9999-9999-9999-999999999992', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '99999999-9999-9999-9999-999999999999', '2024-04-15', 7800, 'Produto Verão H', 'Casa', true),

-- Vendas para André Pereira (Campanha Meta Trimestral)
('saaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa1', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-03-10', 7200, 'Produto Meta A', 'Eletrônicos', true),
('saaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa2', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-04-20', 7200, 'Produto Meta B', 'Casa', true),

-- Vendas para Luciana Mendes (Campanha Meta Trimestral)
('sbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb1', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-03-15', 6600, 'Produto Meta C', 'Roupas', true),
('sbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb2', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-05-10', 6600, 'Produto Meta D', 'Eletrônicos', true),

-- Vendas para Ricardo Gomes (Campanha Meta Trimestral)
('scccccc-cccc-cccc-cccc-cccccccccc1', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-03-20', 6000, 'Produto Meta E', 'Casa', true),
('scccccc-cccc-cccc-cccc-cccccccccc2', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-04-25', 6000, 'Produto Meta F', 'Esportes', true);