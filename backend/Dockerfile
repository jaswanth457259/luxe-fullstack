# ── Stage 1: Build ─────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy pom and download dependencies (layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# ── Stage 2: Runtime ───────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

# Security: non-root user
RUN addgroup -S luxe && adduser -S luxe -G luxe
WORKDIR /app
USER luxe

# Copy built jar
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

# Railway dynamic port support
ENV PORT=8080

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]