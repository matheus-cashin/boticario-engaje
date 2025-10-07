-- ============================================
-- FUNÇÃO PARA ATUALIZAR TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- EMPRESAS E USUÁRIOS
-- ============================================

CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(14) NOT NULL UNIQUE,
  plataforma_cashin_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'ATIVA',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar empresas"
  ON empresas FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE gerentes_campanha (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  papel VARCHAR(50) DEFAULT 'ADMIN_CAMPANHA',
  status VARCHAR(20) DEFAULT 'ATIVO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(empresa_id, email)
);

ALTER TABLE gerentes_campanha ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gerentes podem ver dados da própria empresa"
  ON gerentes_campanha FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_gerentes_campanha_updated_at
  BEFORE UPDATE ON gerentes_campanha
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PRODUTOS
-- ============================================

CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo_externo VARCHAR(100) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ATIVO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(empresa_id, codigo_externo)
);

CREATE INDEX idx_produtos_empresa ON produtos(empresa_id);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar produtos"
  ON produtos FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON produtos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VENDEDORES
-- ============================================

CREATE TABLE vendedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf VARCHAR(11) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  cluster VARCHAR(100),
  wallet_id UUID,
  status VARCHAR(20) DEFAULT 'ATIVO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendedores_cpf ON vendedores(cpf);
CREATE INDEX idx_vendedores_cargo ON vendedores(cargo);
CREATE INDEX idx_vendedores_cluster ON vendedores(cluster);

ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar vendedores"
  ON vendedores FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_vendedores_updated_at
  BEFORE UPDATE ON vendedores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CAMPANHAS
-- ============================================

CREATE TABLE campanhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  vagas INTEGER,
  budget_total DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'RASCUNHO',
  created_by UUID REFERENCES gerentes_campanha(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_periodo CHECK (periodo_fim >= periodo_inicio),
  CONSTRAINT check_vagas_ranking CHECK (
    (tipo = 'META_ESCALONADA' AND vagas IS NULL) OR
    (tipo = 'RANKING' AND vagas IS NOT NULL)
  )
);

CREATE INDEX idx_campanhas_empresa ON campanhas(empresa_id);
CREATE INDEX idx_campanhas_status ON campanhas(status);
CREATE INDEX idx_campanhas_periodo ON campanhas(periodo_inicio, periodo_fim);

ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar campanhas"
  ON campanhas FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_campanhas_updated_at
  BEFORE UPDATE ON campanhas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- REGRAS DE CAMPANHA
-- ============================================

CREATE TABLE regras_campanha (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
  descricao_raw TEXT NOT NULL,
  interpretacao_ia TEXT,
  logica_execucao JSONB NOT NULL,
  status VARCHAR(30) DEFAULT 'AGUARDANDO_VALIDACAO',
  validado_por UUID REFERENCES gerentes_campanha(id),
  validado_em TIMESTAMP,
  motivo_rejeicao TEXT,
  versao INTEGER DEFAULT 1,
  prompt_ia_usado TEXT,
  modelo_ia VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campanha_id, versao)
);

CREATE INDEX idx_regras_campanha ON regras_campanha(campanha_id);
CREATE INDEX idx_regras_status ON regras_campanha(status);

ALTER TABLE regras_campanha ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar regras"
  ON regras_campanha FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_regras_campanha_updated_at
  BEFORE UPDATE ON regras_campanha
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PARTICIPAÇÕES
-- ============================================

CREATE TABLE participacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id UUID NOT NULL REFERENCES vendedores(id) ON DELETE CASCADE,
  campanha_id UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  meta DECIMAL(15,2) NOT NULL,
  realizado DECIMAL(15,2) DEFAULT 0,
  atingimento DECIMAL(5,2) DEFAULT 0,
  posicao INTEGER,
  premiacao_prevista DECIMAL(10,2),
  premiacao_confirmada DECIMAL(10,2),
  premiacao_paga BOOLEAN DEFAULT FALSE,
  data_pagamento TIMESTAMP,
  primeira_venda_em TIMESTAMP,
  ultima_venda_em TIMESTAMP,
  dias_ativo INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'EM_ANDAMENTO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendedor_id, campanha_id)
);

CREATE INDEX idx_participacoes_vendedor ON participacoes(vendedor_id);
CREATE INDEX idx_participacoes_campanha ON participacoes(campanha_id);
CREATE INDEX idx_participacoes_empresa ON participacoes(empresa_id);
CREATE INDEX idx_participacoes_posicao ON participacoes(campanha_id, posicao) WHERE posicao IS NOT NULL;
CREATE INDEX idx_participacoes_atingimento ON participacoes(campanha_id, atingimento DESC);

ALTER TABLE participacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar participações"
  ON participacoes FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_participacoes_updated_at
  BEFORE UPDATE ON participacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VENDAS
-- ============================================

CREATE TABLE vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id UUID NOT NULL REFERENCES vendedores(id),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  pedido_externo_id VARCHAR(100) NOT NULL,
  data_venda TIMESTAMP NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  data_sincronizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  origem VARCHAR(50) DEFAULT 'API',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(empresa_id, pedido_externo_id)
);

CREATE INDEX idx_vendas_vendedor ON vendas(vendedor_id);
CREATE INDEX idx_vendas_empresa ON vendas(empresa_id);
CREATE INDEX idx_vendas_data ON vendas(data_venda);
CREATE INDEX idx_vendas_pedido ON vendas(pedido_externo_id);

ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar vendas"
  ON vendas FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- ITENS DE VENDA
-- ============================================

CREATE TABLE itens_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_valor_total CHECK (valor_total = quantidade * valor_unitario)
);

CREATE INDEX idx_itens_venda ON itens_venda(venda_id);
CREATE INDEX idx_itens_produto ON itens_venda(produto_id);

ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar itens de venda"
  ON itens_venda FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- SNAPSHOTS DIÁRIOS
-- ============================================

CREATE TABLE snapshots_diarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participacao_id UUID NOT NULL REFERENCES participacoes(id) ON DELETE CASCADE,
  data_snapshot DATE NOT NULL,
  realizado DECIMAL(15,2) NOT NULL,
  atingimento DECIMAL(5,2) NOT NULL,
  posicao INTEGER,
  vendas_do_dia DECIMAL(15,2) DEFAULT 0,
  variacao_posicao INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(participacao_id, data_snapshot)
);

CREATE INDEX idx_snapshots_participacao ON snapshots_diarios(participacao_id);
CREATE INDEX idx_snapshots_data ON snapshots_diarios(data_snapshot);

ALTER TABLE snapshots_diarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar snapshots"
  ON snapshots_diarios FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- COMUNICAÇÃO
-- ============================================

CREATE TABLE disparos_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  campanha_id UUID REFERENCES campanhas(id),
  mensagem TEXT NOT NULL,
  tipo VARCHAR(30),
  publico_alvo JSONB,
  total_destinatarios INTEGER,
  data_agendamento TIMESTAMP,
  data_envio TIMESTAMP,
  status VARCHAR(30) DEFAULT 'AGENDADO',
  total_enviado INTEGER DEFAULT 0,
  total_erro INTEGER DEFAULT 0,
  criado_por UUID REFERENCES gerentes_campanha(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disparos_empresa ON disparos_whatsapp(empresa_id);
CREATE INDEX idx_disparos_campanha ON disparos_whatsapp(campanha_id);
CREATE INDEX idx_disparos_status ON disparos_whatsapp(status);

ALTER TABLE disparos_whatsapp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar disparos"
  ON disparos_whatsapp FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_disparos_whatsapp_updated_at
  BEFORE UPDATE ON disparos_whatsapp
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUDITORIA
-- ============================================

CREATE TABLE logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  usuario_id UUID,
  usuario_tipo VARCHAR(30),
  acao VARCHAR(100) NOT NULL,
  entidade VARCHAR(50) NOT NULL,
  entidade_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_empresa ON logs_auditoria(empresa_id);
CREATE INDEX idx_logs_usuario ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_entidade ON logs_auditoria(entidade, entidade_id);
CREATE INDEX idx_logs_data ON logs_auditoria(created_at DESC);

ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar logs de auditoria"
  ON logs_auditoria FOR SELECT
  TO authenticated
  USING (true);