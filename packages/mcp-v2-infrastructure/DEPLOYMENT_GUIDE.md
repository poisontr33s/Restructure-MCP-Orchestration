# MCP v2 Shared Infrastructure Deployment Guide

> **🚀 Complete deployment guide for MCP v2 universal infrastructure stack**

## Overview

This guide covers deploying the MCP v2 shared infrastructure that provides the backbone for all language implementations (TypeScript, Java, Python, etc.).

## Prerequisites

### Required Software

- **Docker**: Version 24.0+ with Docker Compose v2
- **Git**: For cloning and version control
- **Node.js**: 18+ (for management scripts)
- **pnpm**: Package manager (`npm install -g pnpm`)

### System Requirements

- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Storage**: 20GB free disk space
- **CPU**: 4 cores recommended
- **Network**: Ports 3000-3010, 5432, 6379, 5672, 9090, 3001, 16686, 9411

## Quick Start

### 1. Clone and Navigate

```bash
cd mcp-v2-shared-infrastructure
```

### 2. Environment Setup

```bash
# Copy and customize environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 3. Deploy Infrastructure

```bash
# Start all services
docker-compose up -d

# Verify deployment
docker-compose ps
```

### 4. Verify Services

```bash
# Check all services are healthy
docker-compose logs --tail=50

# Test connectivity
curl http://localhost:3000/health
```

## Environment Configuration

### Environment Variables (.env)

```bash
# === Core Configuration ===
MCP_ENVIRONMENT=development
MCP_VERSION=2.0.0
MCP_CLUSTER_NAME=mcp-v2-cluster

# === Security ===
REDIS_PASSWORD=your-secure-redis-password
POSTGRES_PASSWORD=your-secure-postgres-password
RABBITMQ_DEFAULT_USER=mcp-admin
RABBITMQ_DEFAULT_PASS=your-secure-rabbitmq-password
JWT_SECRET=your-jwt-secret-key

# === Database ===
POSTGRES_DB=mcp_v2
POSTGRES_USER=mcp_user
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# === Redis ===
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# === Message Queue ===
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672

# === Monitoring ===
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
GRAFANA_ADMIN_PASSWORD=admin
JAEGER_PORT=16686
ZIPKIN_PORT=9411

# === Load Balancer ===
NGINX_HTTP_PORT=3000
NGINX_HTTPS_PORT=3443

# === Application Scaling ===
MCP_BRIDGE_REPLICAS=2
MCP_CONTEXT_REPLICAS=2
MCP_DOCS_REPLICAS=1
```

## Service Architecture

### Core Services

#### 1. **Redis** (In-Memory Cache & Pub/Sub)

- **Purpose**: Context caching, session storage, real-time messaging
- **Port**: 6379
- **Health Check**: `redis-cli ping`
- **Management**: Redis Commander on port 8081

#### 2. **PostgreSQL** (Persistent Storage)

- **Purpose**: Context history, metadata, configuration
- **Port**: 5432
- **Health Check**: `pg_isready -h localhost -p 5432`
- **Management**: pgAdmin on port 5050

#### 3. **RabbitMQ** (Message Queue)

- **Purpose**: Async messaging, distributed tasks, event streaming
- **Port**: 5672 (AMQP), 15672 (Management)
- **Health Check**: `rabbitmqctl status`
- **Management**: Web UI at http://localhost:15672

#### 4. **Nginx** (Load Balancer & Gateway)

- **Purpose**: API gateway, load balancing, SSL termination
- **Port**: 3000 (HTTP), 3443 (HTTPS)
- **Config**: `/etc/nginx/conf.d/mcp.conf`

### Monitoring Stack

#### 5. **Prometheus** (Metrics Collection)

- **Purpose**: Time-series metrics, alerting rules
- **Port**: 9090
- **Config**: `/etc/prometheus/prometheus.yml`
- **Targets**: All MCP services + infrastructure

#### 6. **Grafana** (Visualization)

- **Purpose**: Dashboards, alerting, monitoring UI
- **Port**: 3001
- **Login**: admin / (from GRAFANA_ADMIN_PASSWORD)
- **Datasources**: Prometheus, PostgreSQL

#### 7. **Jaeger** (Distributed Tracing)

- **Purpose**: Request tracing across services
- **Port**: 16686 (UI), 14268 (Collector)
- **Integration**: OpenTelemetry compatible

## Deployment Modes

### Development Mode

```bash
# Start with development overrides
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Features:
# - Hot reloading
# - Debug ports exposed
# - Reduced resource limits
# - Local volume mounts
```

### Production Mode

```bash
# Start with production overrides
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Features:
# - Health checks enabled
# - Resource limits enforced
# - Security hardening
# - Log aggregation
```

### High Availability Mode

```bash
# Start with HA configuration
docker-compose -f docker-compose.yml -f docker-compose.ha.yml up -d

# Features:
# - Service replication
# - Load balancing
# - Failover mechanisms
# - Backup strategies
```

## Service Management

### Starting Services

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d redis postgres rabbitmq

# Start with build
docker-compose up -d --build
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific services
docker-compose stop redis
```

### Monitoring Services

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f redis

# Check service status
docker-compose ps

# Execute commands in containers
docker-compose exec redis redis-cli
docker-compose exec postgres psql -U mcp_user -d mcp_v2
```

## Health Checks & Verification

### Automated Health Checks

```bash
# Use the health check script
./scripts/health-check.sh

# Or check individual services
curl http://localhost:3000/health
curl http://localhost:9090/-/healthy
curl http://localhost:3001/api/health
```

### Manual Verification

#### Redis

```bash
docker-compose exec redis redis-cli ping
# Expected: PONG

docker-compose exec redis redis-cli info replication
# Check replication status
```

#### PostgreSQL

```bash
docker-compose exec postgres pg_isready -h localhost -p 5432
# Expected: accepting connections

docker-compose exec postgres psql -U mcp_user -d mcp_v2 -c "SELECT version();"
# Check PostgreSQL version
```

#### RabbitMQ

```bash
docker-compose exec rabbitmq rabbitmqctl status
# Check cluster status

curl -u admin:password http://localhost:15672/api/overview
# Check management API
```

## Security Configuration

### SSL/TLS Setup

```bash
# Generate self-signed certificates for development
./scripts/generate-certs.sh

# For production, use Let's Encrypt or corporate certs
# Copy certificates to ./certs/ directory
```

### Network Security

```bash
# Create custom network for isolation
docker network create mcp-v2-network

# Update docker-compose.yml to use custom network
# This isolates MCP services from other containers
```

### Access Control

```bash
# Configure firewall rules (example for Ubuntu)
sudo ufw allow 3000/tcp  # API Gateway
sudo ufw allow 3001/tcp  # Grafana
sudo ufw deny 5432/tcp   # Block direct DB access
sudo ufw deny 6379/tcp   # Block direct Redis access
```

## Data Management

### Backup Strategies

#### PostgreSQL Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U mcp_user mcp_v2 > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T postgres psql -U mcp_user -d mcp_v2 < backup_20241201_143000.sql
```

#### Redis Backup

```bash
# Create Redis snapshot
docker-compose exec redis redis-cli BGSAVE

# Copy snapshot
docker cp mcp-v2_redis_1:/data/dump.rdb ./backups/redis_$(date +%Y%m%d_%H%M%S).rdb
```

### Data Migration

```bash
# Run database migrations
docker-compose exec -T postgres psql -U mcp_user -d mcp_v2 -f /migrations/001_initial_schema.sql

# Run Redis setup scripts
docker-compose exec redis redis-cli --eval /scripts/setup.lua
```

## Performance Tuning

### Resource Optimization

#### Memory Allocation

```yaml
# In docker-compose.yml
services:
  redis:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  postgres:
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

#### Connection Pooling

```bash
# PostgreSQL connection tuning
docker-compose exec postgres psql -U mcp_user -d mcp_v2 -c "
  ALTER SYSTEM SET max_connections = 200;
  ALTER SYSTEM SET shared_buffers = '1GB';
  ALTER SYSTEM SET effective_cache_size = '3GB';
"
```

### Monitoring & Alerting

#### Custom Grafana Dashboards

1. Import MCP v2 dashboard: `./monitoring/dashboards/mcp-v2-overview.json`
2. Configure alerts for:
   - High memory usage (>80%)
   - Database connection limits
   - Queue depth thresholds
   - Response time degradation

#### Prometheus Alerting Rules

```yaml
# ./monitoring/prometheus/alerts.yml
groups:
  - name: mcp-v2-infrastructure
    rules:
      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High memory usage in {{ $labels.container_label_com_docker_compose_service }}'
```

## Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check port conflicts
netstat -tulpn | grep :3000

# Check Docker daemon
systemctl status docker

# Check available resources
docker system df
docker system prune  # Clean up if needed
```

#### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres | tail -50

# Test connection
docker-compose exec postgres psql -U mcp_user -d mcp_v2 -c "\l"

# Reset connection pool
docker-compose restart postgres
```

#### Redis Memory Issues

```bash
# Check Redis memory usage
docker-compose exec redis redis-cli info memory

# Configure maxmemory policy
docker-compose exec redis redis-cli config set maxmemory-policy allkeys-lru
```

### Performance Issues

#### Slow Database Queries

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

#### High Redis Latency

```bash
# Check Redis latency
docker-compose exec redis redis-cli --latency-history -i 1

# Monitor operations
docker-compose exec redis redis-cli monitor
```

## Integration with Language Implementations

### TypeScript Integration

```typescript
// packages/core/src/config/infrastructure.ts
export const infrastructureConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'mcp_v2',
    username: process.env.POSTGRES_USER || 'mcp_user',
    password: process.env.POSTGRES_PASSWORD,
  },
  rabbitmq: {
    url: `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
  },
};
```

### Java Integration

```yaml
# application.yml for Spring Boot services
spring:
  datasource:
    url: jdbc:postgresql://${POSTGRES_HOST:localhost}:${POSTGRES_PORT:5432}/${POSTGRES_DB:mcp_v2}
    username: ${POSTGRES_USER:mcp_user}
    password: ${POSTGRES_PASSWORD}

  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD}

  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_DEFAULT_USER:mcp-admin}
    password: ${RABBITMQ_DEFAULT_PASS}
```

### Python Integration

```python
# config/infrastructure.py
import os
from dataclasses import dataclass

@dataclass
class InfrastructureConfig:
    redis_host: str = os.getenv('REDIS_HOST', 'localhost')
    redis_port: int = int(os.getenv('REDIS_PORT', '6379'))
    redis_password: str = os.getenv('REDIS_PASSWORD', '')

    postgres_host: str = os.getenv('POSTGRES_HOST', 'localhost')
    postgres_port: int = int(os.getenv('POSTGRES_PORT', '5432'))
    postgres_db: str = os.getenv('POSTGRES_DB', 'mcp_v2')
    postgres_user: str = os.getenv('POSTGRES_USER', 'mcp_user')
    postgres_password: str = os.getenv('POSTGRES_PASSWORD', '')

    rabbitmq_url: str = f"amqp://{os.getenv('RABBITMQ_DEFAULT_USER', 'mcp-admin')}:{os.getenv('RABBITMQ_DEFAULT_PASS', '')}@{os.getenv('RABBITMQ_HOST', 'localhost')}:{os.getenv('RABBITMQ_PORT', '5672')}"
```

## Next Steps

1. **Deploy Infrastructure**: Follow this guide to deploy the shared infrastructure
2. **Implement Language Bindings**: Create MCP v2 client/server libraries for each language
3. **Migrate Existing Services**: Gradually upgrade MCP v1 servers to use MCP v2 protocol
4. **Monitor & Optimize**: Use the monitoring stack to optimize performance
5. **Scale & Secure**: Apply production hardening and scaling strategies

## Support & Maintenance

### Regular Maintenance Tasks

- Weekly backup verification
- Monthly security updates
- Quarterly performance reviews
- Log rotation and cleanup

### Monitoring Checklist

- [ ] All services healthy and responsive
- [ ] Resource usage within acceptable limits
- [ ] No critical alerts in Grafana
- [ ] Database and Redis backups successful
- [ ] SSL certificates not expiring soon

---

**🚀 Ready to power your polyglot MCP v2 ecosystem!**

For issues or questions, check the troubleshooting section or create an issue in the repository.
