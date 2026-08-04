-- Migration V6: Remoção das restrições NOT NULL e colunas legadas (tipo e material) da tabela products

DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='tipo'
    ) THEN
        ALTER TABLE products ALTER COLUMN tipo DROP NOT NULL;
        ALTER TABLE products DROP COLUMN tipo;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='material'
    ) THEN
        ALTER TABLE products ALTER COLUMN material DROP NOT NULL;
        ALTER TABLE products DROP COLUMN material;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='subcategory_id'
    ) THEN
        ALTER TABLE products DROP COLUMN subcategory_id;
    END IF;
END $$;
