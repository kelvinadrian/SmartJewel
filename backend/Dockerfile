# Estágio 1: Build da aplicação em ambiente Linux Maven com Java 21 JDK
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Copiar descritores do Maven e código-fonte
COPY pom.xml .
COPY src ./src

# Executar o build gerando o arquivo JAR de produção
RUN mvn clean package -DskipTests

# Estágio 2: Imagem final de execução Linux JRE (Ubuntu Jammy)
FROM eclipse-temurin:21-jre-jammy AS runner
WORKDIR /app

# Criar usuário não-root por segurança no Linux
RUN groupadd -r spring && useradd -r -g spring spring

# AJUSTE AQUI: Copia o JAR já dando a permissão para o usuário spring
COPY --from=builder --chown=spring:spring /build/target/*.jar app.jar

# Define o usuário após a cópia do arquivo
USER spring:spring

# Expor a porta 8080
EXPOSE 8080

# Comando de inicialização
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

