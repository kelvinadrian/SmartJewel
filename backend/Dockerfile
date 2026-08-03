# Estágio 1: Build da aplicação com Maven 3.9 e Java 21 JDK
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Copiar pom.xml e código-fonte
COPY pom.xml .
COPY src ./src

# Executar o build gerando o arquivo JAR otimizado
RUN mvn clean package -DskipTests

# Estágio 2: Imagem final leve de execução (JRE 21)
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Criar usuário não-root por segurança
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiar a aplicação compilada a partir do estágio de build
COPY --from=builder /build/target/*.jar app.jar

# Expor a porta padrão da aplicação Spring Boot
EXPOSE 8080

# Comando de inicialização
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
