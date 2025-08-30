# MCP v2 Shared Infrastructure

A comprehensive Docker-based infrastructure for the Model Context Protocol (MCP) v2 ecosystem, providing standardized services, monitoring, and deployment configurations.

## 🎯 Overview

This infrastructure package provides production-ready containerized services for MCP v2 applications, including:

- **Message Queues**: Redis for high-performance messaging
- **Databases**: PostgreSQL for persistent storage, MongoDB for document storage
- **Monitoring**: Prometheus metrics, Grafana dashboards, AlertManager
- **Load Balancing**: Nginx for request routing and SSL termination
- **Service Discovery**: Consul for dynamic service registration
- **Logging**: Centralized logging with structured output

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ available RAM
- 10GB+ available disk space

### Development Environment

```bash
# Clone and navigate to the infrastructure
cd mcp-v2-shared-infrastructure

# Copy environment configuration
cp .env.example .env

# Start development stack
docker-compose -f docker-compose.dev.yml up -d

# Check service health
./scripts/health-check.sh
```

### Production Environment

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Monitor logs
docker-compose logs -f
```

## 📋 Services

| Service | Port | Description |
|---------|------|-------------|
| Redis | 6379 | Message queue and caching |
| PostgreSQL | 5432 | Primary database |
| MongoDB | 27017 | Document database |
| Prometheus | 9090 | Metrics collection |
| Grafana | 3000 | Monitoring dashboards |
| Nginx | 80, 443 | Load balancer & SSL |
| Consul | 8500 | Service discovery |

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database Configuration
POSTGRES_USER=mcp_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=mcp_v2

MONGODB_ROOT_USERNAME=mcp_admin
MONGODB_ROOT_PASSWORD=secure_password

# Redis Configuration
REDIS_PASSWORD=secure_redis_password

# Monitoring
GRAFANA_ADMIN_PASSWORD=admin_password

# SSL Configuration (Production)
SSL_CERT_PATH=/etc/ssl/certs/mcp.crt
SSL_KEY_PATH=/etc/ssl/private/mcp.key
```

### Docker Compose Files

- `docker-compose.yml`: Base configuration with core services
- `docker-compose.dev.yml`: Development overrides with debug settings
- `docker-compose.prod.yml`: Production configuration with SSL and clustering

## 🛠️ Management Scripts

### Health Check

```bash
./scripts/health-check.sh
```

Validates all services are running and responding correctly.

### Backup

```bash
./scripts/backup.sh
```

Creates timestamped backups of all persistent data.

### Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f redis
docker-compose logs -f postgres
```

## 📊 Monitoring

### Prometheus Metrics

Access metrics at `http://localhost:9090`

Key metrics collected:

- Service health and uptime
- Database connection pools
- Message queue depth
- HTTP request rates and latency
- Resource utilization (CPU, memory, disk)

### Grafana Dashboards

Access dashboards at `http://localhost:3000`

Default credentials: `admin` / `admin` (change in production)

Pre-configured dashboards:

- MCP Service Overview
- Database Performance
- Message Queue Analytics
- Infrastructure Health

## 🔒 Security

### Development

- Default passwords (change for production)
- HTTP only (no SSL)
- Permissive network policies
- Debug logging enabled

### Production

- Strong passwords required
- SSL/TLS encryption
- Network isolation
- Security headers
- Rate limiting
- Audit logging

## 📁 Directory Structure

```text
mcp-v2-shared-infrastructure/
├── docker-compose.yml              # Base services
├── docker-compose.dev.yml          # Development overrides
├── docker-compose.prod.yml         # Production configuration
├── .env.example                    # Environment template
├── DEPLOYMENT_GUIDE.md             # Detailed deployment instructions
├── scripts/
│   ├── health-check.sh             # Service health validation
│   ├── backup.sh                   # Data backup utility
│   ├── restore.sh                  # Data restoration
│   └── cleanup.sh                  # Resource cleanup
├── config/
│   ├── nginx/                      # Nginx configuration
│   ├── prometheus/                 # Prometheus config
│   ├── grafana/                    # Grafana dashboards
│   └── consul/                     # Service discovery
└── volumes/                        # Persistent data mounts
    ├── postgres/
    ├── mongodb/
    ├── redis/
    └── logs/
```

## 🔄 Scaling

### Horizontal Scaling

```bash
# Scale specific services
docker-compose up -d --scale redis=3
docker-compose up -d --scale nginx=2

# Auto-scaling with Docker Swarm
docker stack deploy -c docker-compose.prod.yml mcp-stack
```

### Vertical Scaling

Adjust resource limits in compose files:

```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

## 🧪 Testing

### Integration Tests

```bash
# Run infrastructure tests
./scripts/test-infrastructure.sh

# Test specific services
./scripts/test-database.sh
./scripts/test-messaging.sh
```

### Load Testing

```bash
# HTTP load testing
./scripts/load-test.sh

# Database performance testing
./scripts/db-benchmark.sh
```

## 🚨 Troubleshooting

### Common Issues

**Services won't start:**

```bash
# Check Docker daemon
docker info

# Check resource availability
docker system df
docker system prune
```

**Database connection issues:**

```bash
# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U mcp_user -d mcp_v2
```

**High memory usage:**

```bash
# Monitor resource usage
docker stats

# Adjust memory limits
# Edit docker-compose.yml resource limits
```

### Log Analysis

```bash
# Search for errors
docker-compose logs | grep ERROR

# Filter by service and time
docker-compose logs --since=1h redis

# Follow real-time logs
docker-compose logs -f --tail=100
```

## 📖 API Documentation

### Health Endpoints

- `GET /health` - Overall system health
- `GET /health/db` - Database connectivity
- `GET /health/cache` - Redis connectivity
- `GET /health/queue` - Message queue status

### Metrics Endpoints

- `GET /metrics` - Prometheus metrics
- `GET /stats` - Service statistics
- `GET /version` - Service versions

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Add your infrastructure improvements**
4. **Test thoroughly** with `./scripts/test-infrastructure.sh`
5. **Update documentation**
6. **Submit a pull request**

### Development Guidelines

- Use Docker best practices
- Include health checks for all services
- Add monitoring for new services
- Document configuration options
- Test in both dev and prod modes

## 📜 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: See `DEPLOYMENT_GUIDE.md` for detailed setup
- **Issues**: Report problems via GitHub Issues
- **Community**: Join our Discord for real-time support
- **Enterprise**: Contact [enterprise@mcp-orchestration.com](mailto:enterprise@mcp-orchestration.com)

---

## Built with ❤️ for the MCP v2 ecosystem

*This infrastructure is designed to be production-ready, scalable, and maintainable. Whether you're running a small development setup or a large-scale production deployment, these configurations provide a solid foundation for your MCP v2 applications.*
