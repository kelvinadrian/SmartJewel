-- Migration V3: Criação das tabelas de Categorias e Subcategorias e relacionamento com Produtos

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);

-- Adiciona a coluna subcategory_id na tabela products se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='products' AND column_name='subcategory_id'
    ) THEN
        ALTER TABLE products ADD COLUMN subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Carga inicial de Categorias e Subcategorias para Semijoias de Alta Joalheria

-- 1. Categoria: Anéis
INSERT INTO categories (id, nome, descricao, created_at, created_by)
SELECT 'c1000000-0000-0000-0000-000000000001', 'Anéis', 'Anéis solitários, aparadores e alianças banhadas a ouro e prata 925', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'c1000000-0000-0000-0000-000000000001');

INSERT INTO subcategories (id, category_id, nome, descricao, created_at, created_by)
SELECT 's1000000-0000-0000-0000-000000000101', 'c1000000-0000-0000-0000-000000000001', 'Aliança de Compromisso', 'Alianças de casamento e noivado de luxo', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE id = 's1000000-0000-0000-0000-000000000101');

INSERT INTO subcategories (id, category_id, nome, descricao, created_at, created_by)
SELECT 's1000000-0000-0000-0000-000000000102', 'c1000000-0000-0000-0000-000000000001', 'Anel Aparador', 'Aparadores cravejados com zircônias', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE id = 's1000000-0000-0000-0000-000000000102');

INSERT INTO subcategories (id, category_id, nome, descricao, created_at, created_by)
SELECT 's1000000-0000-0000-0000-000000000103', 'c1000000-0000-0000-0000-000000000001', 'Anel Solitário', 'Anéis solitários clássicos', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE id = 's1000000-0000-0000-0000-000000000103');

-- 2. Categoria: Brincos
INSERT INTO categories (id, nome, descricao, created_at, created_by)
SELECT 'c2000000-0000-0000-0000-000000000002', 'Brincos', 'Argolas, ear cuffs e brincos finos', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'c2000000-0000-0000-0000-000000000002');

INSERT INTO subcategories (id, category_id, nome, descricao, created_at, created_by)
SELECT 's2000000-0000-0000-0000-000000000201', 'c2000000-0000-0000-0000-000000000002', 'Argolas', 'Brincos de argola banhados a ouro', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE id = 's2000000-0000-0000-0000-000000000201');

INSERT INTO subcategories (id, category_id, nome, descricao, created_at, created_by)
SELECT 's2000000-0000-0000-0000-000000000202', 'c2000000-0000-0000-0000-000000000002', 'Ear Cuff', 'Brincos ear cuff modernos', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE id = 's2000000-0000-0000-0000-000000000202');

-- 3. Categoria: Colares
INSERT INTO categories (id, nome, descricao, created_at, created_by)
SELECT 'c3000000-0000-0000-0000-000000000003', 'Colares', 'Gargantilhas, chokers e colares finos', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'c3000000-0000-0000-0000-000000000003');

INSERT INTO subcategories (id, category_id, nome, descricao, created_at, created_by)
SELECT 's3000000-0000-0000-0000-000000000301', 'c3000000-0000-0000-0000-000000000003', 'Choker', 'Colares choker delicados', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE id = 's3000000-0000-0000-0000-000000000301');

INSERT INTO subcategories (id, category_id, nome, descricao, created_at, created_by)
SELECT 's3000000-0000-0000-0000-000000000302', 'c3000000-0000-0000-0000-000000000003', 'Gargantilha', 'Gargantilhas sofisticadas', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE id = 's3000000-0000-0000-0000-000000000302');

-- 4. Categoria: Pulseiras
INSERT INTO categories (id, nome, descricao, created_at, created_by)
SELECT 'c4000000-0000-0000-0000-000000000004', 'Pulseiras', 'Braceletes e pulseiras delicadas', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'c4000000-0000-0000-0000-000000000004');

INSERT INTO subcategories (id, category_id, nome, descricao, created_at, created_by)
SELECT 's4000000-0000-0000-0000-000000000401', 'c4000000-0000-0000-0000-000000000004', 'Bracelete', 'Braceletes ajustáveis de luxo', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE id = 's4000000-0000-0000-0000-000000000401');

INSERT INTO subcategories (id, category_id, nome, descricao, created_at, created_by)
SELECT 's4000000-0000-0000-0000-000000000402', 'c4000000-0000-0000-0000-000000000004', 'Pulseira de Elo', 'Pulseiras de elo baiano e português', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE id = 's4000000-0000-0000-0000-000000000402');
