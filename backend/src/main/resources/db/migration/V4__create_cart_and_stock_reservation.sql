-- Migration V4: Adição do controle de estoque livre/reservado e tabelas do Carrinho

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='products' AND column_name='available_quantity'
    ) THEN
        ALTER TABLE products ADD COLUMN available_quantity INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='products' AND column_name='reserved_quantity'
    ) THEN
        ALTER TABLE products ADD COLUMN reserved_quantity INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Inicializa available_quantity com o estoque inicial existente para produtos já cadastrados
UPDATE products 
SET available_quantity = quantidade_estoque, reserved_quantity = 0 
WHERE available_quantity = 0 AND quantidade_estoque > 0;

CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY,
    cart_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY,
    cart_table_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_carts_status_updated ON carts(status, updated_at);
