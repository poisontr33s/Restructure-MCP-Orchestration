# Multi-stage Docker build for Java 21 MCP Orchestration System
# Captain Guthilda's Renaissance Container Architecture

# Stage 1: Build stage with Maven and Java 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

LABEL maintainer="Captain Guthilda <guthilda@mcporchestration.ai>"
LABEL description="Java 21 MCP Orchestration System - Build Stage"
LABEL version="2.0.0-java21-renaissance"

# Set working directory
WORKDIR /app

# Copy Maven configuration files
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw ./

# Copy all module pom.xml files for dependency resolution
COPY mcp-shared/pom.xml ./mcp-shared/
COPY mcp-core/pom.xml ./mcp-core/
COPY mcp-cli/pom.xml ./mcp-cli/
COPY mcp-monitor/pom.xml ./mcp-monitor/
COPY mcp-guthilda/pom.xml ./mcp-guthilda/
COPY mcp-servers/pom.xml ./mcp-servers/
COPY mcp-ai-integration/pom.xml ./mcp-ai-integration/

# Download dependencies for better Docker layer caching
RUN mvn dependency:go-offline -B

# Copy source code
COPY mcp-shared/src/ ./mcp-shared/src/
COPY mcp-core/src/ ./mcp-core/src/
COPY mcp-cli/src/ ./mcp-cli/src/
COPY mcp-monitor/src/ ./mcp-monitor/src/
COPY mcp-guthilda/src/ ./mcp-guthilda/src/
COPY mcp-servers/src/ ./mcp-servers/src/
COPY mcp-ai-integration/src/ ./mcp-ai-integration/src/

# Build the application with Java 21 optimizations
RUN mvn clean package -DskipTests -B \
    --no-transfer-progress \
    -Dmaven.javadoc.skip=true \
    -Dmaven.source.skip=true

# Stage 2: Runtime stage with optimized Java 21 JRE
FROM eclipse-temurin:21-jre-alpine AS runtime

LABEL maintainer="Captain Guthilda <guthilda@mcporchestration.ai>"
LABEL description="Java 21 MCP Orchestration System - Runtime"
LABEL version="2.0.0-java21-renaissance"

# Install additional runtime dependencies
RUN apk add --no-cache \
    curl \
    jq \
    bash \
    procps \
    && rm -rf /var/cache/apk/*

# Create application user for security
RUN addgroup -g 1000 mcpapp && \
    adduser -D -s /bin/bash -u 1000 -G mcpapp mcpapp

# Set working directory
WORKDIR /app

# Copy built artifacts from builder stage
COPY --from=builder --chown=mcpapp:mcpapp /app/mcp-core/target/mcp-core-*.jar ./mcp-core.jar
COPY --from=builder --chown=mcpapp:mcpapp /app/mcp-cli/target/mcp-cli-*.jar ./mcp-cli.jar
COPY --from=builder --chown=mcpapp:mcpapp /app/mcp-monitor/target/mcp-monitor-*.jar ./mcp-monitor.jar
COPY --from=builder --chown=mcpapp:mcpapp /app/mcp-guthilda/target/mcp-guthilda-*.jar ./mcp-guthilda.jar
COPY --from=builder --chown=mcpapp:mcpapp /app/mcp-ai-integration/target/mcp-ai-integration-*.jar ./mcp-ai-integration.jar

# Create directories for application data
RUN mkdir -p /app/config /app/logs /app/data && \
    chown -R mcpapp:mcpapp /app

# Copy configuration files
COPY --chown=mcpapp:mcpapp docker/application.yml ./config/
COPY --chown=mcpapp:mcpapp docker/logback-spring.xml ./config/

# Copy startup scripts
COPY --chown=mcpapp:mcpapp docker/docker-entrypoint.sh ./
COPY --chown=mcpapp:mcpapp docker/health-check.sh ./
RUN chmod +x docker-entrypoint.sh health-check.sh

# Switch to application user
USER mcpapp

# Configure Java 21 JVM with virtual threads and modern GC
ENV JAVA_OPTS="-XX:+UseZGC \
               -XX:+UnlockExperimentalVMOptions \
               -XX:+UseTransparentHugePages \
               -XX:+EnableDynamicAgentLoading \
               -Djdk.virtualThreadScheduler.parallelism=16 \
               -Djdk.virtualThreadScheduler.maxPoolSize=256 \
               -Xms1g \
               -Xmx4g \
               -XX:+HeapDumpOnOutOfMemoryError \
               -XX:HeapDumpPath=/app/logs/"

# Configure application properties
ENV SPRING_PROFILES_ACTIVE=docker
ENV LOGGING_CONFIG=/app/config/logback-spring.xml
ENV MCP_CONFIG_PATH=/app/config
ENV MCP_DATA_PATH=/app/data
ENV MCP_LOGS_PATH=/app/logs

# Expose ports for different services
EXPOSE 8080 8081 8082 8083 8084

# Health check using Java 21 optimized endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ./health-check.sh || exit 1

# Set entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]

# Default command runs the core orchestration service
CMD ["core"]
