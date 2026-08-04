-- Migration V5: Refatoração do domínio de produtos para usar ProductType, MaterialColor e Category simplificada

-- 1. Criação da tabela product_types
CREATE TABLE IF NOT EXISTS product_types (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);

-- 2. Criação da tabela material_colors
CREATE TABLE IF NOT EXISTS material_colors (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);

-- 3. Carga inicial de product_types (Tipos de semijoias)
INSERT INTO product_types (id, nome, descricao, created_at, created_by)
SELECT 'a1000000-0000-0000-0000-000000000001', 'Anel', 'Anéis solitários, alianças e aparadores', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM product_types WHERE nome = 'Anel');

INSERT INTO product_types (id, nome, descricao, created_at, created_by)
SELECT 'a1000000-0000-0000-0000-000000000002', 'Brinco', 'Argolas, ear cuffs e brincos finos', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM product_types WHERE nome = 'Brinco');

INSERT INTO product_types (id, nome, descricao, created_at, created_by)
SELECT 'a1000000-0000-0000-0000-000000000003', 'Bracelete', 'Braceletes rígidos e articulados', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM product_types WHERE nome = 'Bracelete');

INSERT INTO product_types (id, nome, descricao, created_at, created_by)
SELECT 'a1000000-0000-0000-0000-000000000004', 'Berloques', 'Berloques e pingentes para pulseiras', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM product_types WHERE nome = 'Berloques');

INSERT INTO product_types (id, nome, descricao, created_at, created_by)
SELECT 'a1000000-0000-0000-0000-000000000005', 'Acessórios de cabelo', 'Tiaras, presilhas e grampos de luxo', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM product_types WHERE nome = 'Acessórios de cabelo');

INSERT INTO product_types (id, nome, descricao, created_at, created_by)
SELECT 'a1000000-0000-0000-0000-000000000006', 'Colar', 'Chokers, gargantilhas e colares finos', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM product_types WHERE nome = 'Colar');

INSERT INTO product_types (id, nome, descricao, created_at, created_by)
SELECT 'a1000000-0000-0000-0000-000000000007', 'Pulseira', 'Pulseiras de elo, rivieras e correntes', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM product_types WHERE nome = 'Pulseira');

INSERT INTO product_types (id, nome, descricao, created_at, created_by)
SELECT 'a1000000-0000-0000-0000-000000000008', 'Conjuntos', 'Conjuntos coordenados de colar e brinco', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM product_types WHERE nome = 'Conjuntos');

INSERT INTO product_types (id, nome, descricao, created_at, created_by)
SELECT 'a1000000-0000-0000-0000-000000000009', 'Escapulario', 'Escapulários de proteção em ouro e prata', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM product_types WHERE nome = 'Escapulario');

-- 4. Carga inicial de material_colors (Materiais e Cores)
INSERT INTO material_colors (id, nome, descricao, created_at, created_by)
SELECT 'm1000000-0000-0000-0000-000000000001', 'Banhado a Ouro', 'Ouro 18k banhado com alta durabilidade', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM material_colors WHERE nome = 'Banhado a Ouro');

INSERT INTO material_colors (id, nome, descricao, created_at, created_by)
SELECT 'm1000000-0000-0000-0000-000000000002', 'Prata 925', 'Prata 925 maciça de alta joalheria', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM material_colors WHERE nome = 'Prata 925');

INSERT INTO material_colors (id, nome, descricao, created_at, created_by)
SELECT 'm1000000-0000-0000-0000-000000000003', 'Prata', 'Acabamento prateado brilhante', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM material_colors WHERE nome = 'Prata');

INSERT INTO material_colors (id, nome, descricao, created_at, created_by)
SELECT 'm1000000-0000-0000-0000-000000000004', 'Dourado', 'Acabamento dourado radiante', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM material_colors WHERE nome = 'Dourado');

INSERT INTO material_colors (id, nome, descricao, created_at, created_by)
SELECT 'm1000000-0000-0000-0000-000000000005', 'Banhado a Prata', 'Banho de prata esterlina', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM material_colors WHERE nome = 'Banhado a Prata');

INSERT INTO material_colors (id, nome, descricao, created_at, created_by)
SELECT 'm1000000-0000-0000-0000-000000000006', 'Ouro 18k', 'Ouro 18k de teor nobre', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM material_colors WHERE nome = 'Ouro 18k');

INSERT INTO material_colors (id, nome, descricao, created_at, created_by)
SELECT 'm1000000-0000-0000-0000-000000000007', 'Rhodium', 'Banho de ródio branco protetor', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM material_colors WHERE nome = 'Rhodium');

INSERT INTO material_colors (id, nome, descricao, created_at, created_by)
SELECT 'm1000000-0000-0000-0000-000000000008', 'Rhodium Negro', 'Ródio negro sofisticado', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM material_colors WHERE nome = 'Rhodium Negro');

-- 5. Atualização da tabela categories (adicionando product_type_id)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='categories' AND column_name='product_type_id'
    ) THEN
        ALTER TABLE categories ADD COLUMN product_type_id UUID REFERENCES product_types(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Drop constraints e tabelas antigas se existirem
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name='subcategories'
    ) THEN
        DROP TABLE subcategories CASCADE;
    END IF;
END $$;

-- 6. Adição de chaves estrangeiras na tabela products
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='subcategory_id'
    ) THEN
        ALTER TABLE products DROP COLUMN subcategory_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='product_type_id'
    ) THEN
        ALTER TABLE products ADD COLUMN product_type_id UUID REFERENCES product_types(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category_id'
    ) THEN
        ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='material_color_id'
    ) THEN
        ALTER TABLE products ADD COLUMN material_color_id UUID REFERENCES material_colors(id) ON DELETE SET NULL;
    END IF;
END $$;
