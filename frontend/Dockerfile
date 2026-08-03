# Estágio 1: Build das aplicações do Angular Workspace (shared-core, admin-app, catalog-app)
FROM node:20-alpine AS builder
WORKDIR /build

# Copiar arquivos de dependências
COPY package.json package-lock.json ./
RUN npm ci || npm install

# Copiar código-fonte do Angular Workspace
COPY . .

# Compilar biblioteca e todas as aplicações
RUN npm run build:all

# Estágio 2: Servidor Nginx Alpine
FROM nginx:1.25-alpine AS runner

# Copiar arquivo de configuração Nginx customizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar artefatos compilados do catalog-app e admin-app
COPY --from=builder /build/dist/catalog-app /usr/share/nginx/html/catalog-app
COPY --from=builder /build/dist/admin-app /usr/share/nginx/html/admin-app

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
