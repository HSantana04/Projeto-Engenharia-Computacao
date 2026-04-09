CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
    category TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultores podem gerenciar transacoes"
    ON transactions
    FOR ALL
    USING (
        client_id IN (
            SELECT id FROM clients WHERE cpf_consultor = (
                SELECT cpf FROM consultores WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Clientes podem gerenciar suas proprias transacoes"
    ON transactions
    FOR ALL
    USING (client_id = auth.uid());

CREATE TABLE extracted_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
    category TEXT,
    date DATE DEFAULT CURRENT_DATE,
    confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE extracted_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ALL on extracted_transactions"
    ON extracted_transactions FOR ALL USING (true) WITH CHECK (true);