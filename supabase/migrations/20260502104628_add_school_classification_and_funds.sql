-- 1. Adicionar classificação na tabela de clientes existente
ALTER TABLE clients ADD COLUMN IF NOT EXISTS classification text DEFAULT 'gestao_financeira';

-- 2. Criar a tabela de Verbas (funds)
CREATE TABLE IF NOT EXISTS funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('capital', 'custeio')),
  amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar a tabela de Subverbas (sub_funds)
CREATE TABLE IF NOT EXISTS sub_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES funds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar RLS e adicionar Políticas
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_funds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for users" ON funds FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for users" ON sub_funds FOR ALL USING (auth.role() = 'authenticated');