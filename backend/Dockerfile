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
USER spring:spring

# Copiar a aplicação compilada a partir do estágio de build
COPY --from=builder /build/target/*.jar app.jar

# Expor a porta 8080 ( Render injeta a variável PORT )
EXPOSE 8080

# Comando de inicialização otimizado para Linux
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
