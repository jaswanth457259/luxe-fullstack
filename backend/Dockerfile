# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile — Spring Boot Backend
# Multi-stage build: reduces final image size from ~600MB → ~200MB
# Optimized for HIGH TRAFFIC: JVM tuning for lakhs of concurrent users
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /build

# Copy Maven wrapper and pom first (Docker layer caching — faster rebuilds)
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .

# Download dependencies (cached as a separate layer)
RUN ./mvnw dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN ./mvnw package -DskipTests -q

# Extract layered JAR for optimal Docker caching
RUN java -Djarmode=layertools -jar target/*.jar extract --destination extracted

# ── Stage 2: Production Runtime ───────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

# Security: Don't run as root
RUN addgroup -S luxe && adduser -S luxe -G luxe
WORKDIR /app
USER luxe

# Copy layered JAR components in order of change frequency
# (least frequently changed layers first = better caching)
COPY --from=builder /build/extracted/dependencies/ ./
COPY --from=builder /build/extracted/spring-boot-loader/ ./
COPY --from=builder /build/extracted/snapshot-dependencies/ ./
COPY --from=builder /build/extracted/application/ ./

# Health check for Railway and load balancers
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:8080/api/actuator/health || exit 1

EXPOSE 8080

# ── JVM Tuning for HIGH TRAFFIC (lakhs of users) ─────────────────────────────
# G1GC: Best for latency-sensitive web applications
# Heap: Starts at 512MB, max 1.5GB (Railway Pro gives 2GB RAM)
# Container awareness: JVM respects Docker memory limits
ENV JAVA_OPTS="\
  -server \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UseContainerSupport \
  -XX:InitialRAMPercentage=25.0 \
  -XX:MaxRAMPercentage=75.0 \
  -XX:+OptimizeStringConcat \
  -XX:+UseStringDeduplication \
  -Djava.security.egd=file:/dev/./urandom \
  -Dspring.backgroundpreinitializer.ignore=true"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
