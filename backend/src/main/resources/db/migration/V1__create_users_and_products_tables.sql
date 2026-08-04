-- Migration V1: Criação das tabelas de Usuários e Produtos (Semijoias)

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    sku VARCHAR(255) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL,
    material VARCHAR(50) NOT NULL,
    preco NUMERIC(38,2) NOT NULL,
    quantidade_estoque INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    last_modified_by VARCHAR(255)
);

-- Inserção do usuário administrador inicial (senha: admin123 codificada BCrypt) em ANSI SQL
INSERT INTO users (id, nome, email, senha, role, created_at, created_by)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Administrador', 'admin@smartjewel.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@smartjewel.com');
