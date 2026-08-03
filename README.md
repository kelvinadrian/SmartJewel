# SmartJewel Monorepo

Este é o repositório do projeto **SmartJewel**, estruturado como um monorepo.

---

## 📁 Estrutura do Repositório

```text
SmartJewel/
├── README.md
├── .gitignore
└── backend/               # Aplicação Java 25 + Spring Boot
    ├── pom.xml
    └── src/
        ├── main/
        │   ├── java/com/smartjewel/
        │   └── resources/
        │       └── application.yml
        └── test/
```

---

## 🛠️ Tecnologias do Backend

- **Java**: 25
- **Framework**: Spring Boot 3.4.2
- **Banco de Dados**: PostgreSQL (Supabase)
- **Dependências**:
  - Spring Web
  - Spring Data JPA
  - Spring Boot Validation
  - PostgreSQL Driver
  - Lombok

---

## 🚀 Como Executar o Backend

### 1. Pré-requisitos

- **Java 25** instalado e configurado no ambiente.
- **Maven 3.9+** (ou utilizar o wrapper Maven `./mvnw`).
- Instância do **PostgreSQL no Supabase**.

### 2. Configurar Variáveis de Ambiente

O arquivo `backend/src/main/resources/application.yml` utiliza variáveis de ambiente para a conexão com o banco de dados Supabase:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DB_URL` | URL de Conexão JDBC | `jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:6543/postgres` |
| `DB_USER` | Usuário do banco Supabase | `postgres.your-project-id` |
| `DB_PASSWORD` | Senha do banco Supabase | `SuaSenhaSegura123` |

#### Definindo no PowerShell (Windows):
```powershell
$env:DB_URL="jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
$env:DB_USER="postgres.your-project-id"
$env:DB_PASSWORD="SuaSenhaSegura123"
```

#### Definindo no Linux/macOS (Bash/Zsh):
```bash
export DB_URL="jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
export DB_USER="postgres.your-project-id"
export DB_PASSWORD="SuaSenhaSegura123"
```

#### Ou utilizando um arquivo `.env` (com suporte IDE / extensão):
```env
DB_URL=jdbc:postgresql://<SUPABASE_HOST>:5432/<DB_NAME>
DB_USER=<POSTGRES_USER>
DB_PASSWORD=<POSTGRES_PASSWORD>
```

---

### 3. Executando a Aplicação

Navegue até a pasta do backend e rode o projeto com Maven:

```bash
cd backend
mvn spring-boot:run
```

A aplicação estará acessível em: `http://localhost:8080`

---

## 📝 Commits

Seguimos a convenção de [Conventional Commits](https://www.conventionalcommits.org/).
