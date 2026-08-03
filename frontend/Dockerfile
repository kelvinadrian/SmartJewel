# Estágio 1: Build da aplicação Angular com Node.js
FROM node:20-alpine AS builder
WORKDIR /build

# Copiar arquivos de dependências
COPY package.json package-lock.json ./
RUN npm ci || npm install

# Copiar código-fonte da aplicação
COPY . .

# Compilar aplicação para produção
RUN npm run build

# Estágio 2: Servidor Nginx de Alta Performance para arquivos estáticos
FROM nginx:1.25-alpine AS runner

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar artefatos estáticos compilados do estágio de build
COPY --from=builder /build/dist/frontend/browser /usr/share/nginx/html

# Expor a porta 80 do Nginx
EXPOSE 80

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]
