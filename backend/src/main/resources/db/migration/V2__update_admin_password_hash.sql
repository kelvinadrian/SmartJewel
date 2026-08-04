-- Migration V2: Atualizar a senha do usuário admin@smartjewel.com para o hash válido da senha admin123
UPDATE users
SET senha = '$2a$10$45TY4W4ztn5g8BkpCLSspuOhxdyGzMrcs5WdC27F5dI2Ibp5oQwkS'
WHERE email = 'admin@smartjewel.com';
