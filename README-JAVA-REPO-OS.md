# 🏴‍☠️ Captain Guthilda's Java-First MCP Orchestration Repository-OS

> **Strategic Java Development Environment with Full Session Continuity**
> 
> Transform your repository into a complete Java development operating system while maintaining bidirectional integrity with all established MCP v2 protocol work.

## 🎯 Overview

This Java-first Repository-OS builds upon our comprehensive session work, providing:

- **☕ Java 21 + Spring Boot 3.2** - Modern Java development with AI/ML integration
- **🔗 MCP v2 Protocol Integration** - Full protocol validation and client libraries
- **📊 Complete Monitoring Stack** - Prometheus, Grafana, Zipkin, SonarQube
- **🐳 Docker-Native Development** - Optimized for VS Code + Dev Containers
- **🚀 Polyglot Support** - Java-first, with TypeScript, Python, and more

## 🏗️ Architecture

```
🏴‍☠️ Java-First Repository-OS
├── ☕ Java Development Container (Primary)
│   ├── Java 21 (Eclipse Temurin)
│   ├── Maven 3.9.6 + Gradle 8.5
│   ├── Spring Boot 3.2 + AI Integration
│   └── IDE Support (IntelliJ + VS Code)
├── 🗄️ Data Layer
│   ├── PostgreSQL 16 (Multi-schema)
│   └── Redis 7.2 (Cache + Sessions)
├── 📊 Monitoring & Observability
│   ├── Prometheus + Grafana
│   ├── Zipkin (Distributed Tracing)
│   └── Spring Boot Actuator
├── 🔧 Development Tools
│   ├── SonarQube (Code Quality)
│   ├── Nexus (Repository Manager)
│   └── MailHog (Email Testing)
└── 🌐 API Gateway (Nginx)
    └── Routes to all Spring Boot services
```

## 🚀 Quick Start

### Prerequisites

- **Windows 11** with Docker Desktop
- **VS Code** with Dev Containers extension
- **Git** for repository operations

### 1. Initialize Java Repository-OS

```bash
# Make the script executable
chmod +x java-repo-os.sh

# Initialize the environment
./java-repo-os.sh init
```

### 2. Start Development Environment

```bash
# Start all services
./java-repo-os.sh start

# Enter Java development container
./java-repo-os.sh enter
```

### 3. Build and Test

```bash
# Build all Java modules
./java-repo-os.sh build

# Run comprehensive tests
./java-repo-os.sh test

# Validate MCP v2 integration
./java-repo-os.sh validate
```

## 🎮 Available Commands

### Environment Management
```bash
./java-repo-os.sh init       # Initialize Java-first environment
./java-repo-os.sh start      # Start all services
./java-repo-os.sh stop       # Stop services
./java-repo-os.sh restart    # Restart environment
./java-repo-os.sh status     # Show service status
./java-repo-os.sh cleanup    # Cleanup options
```

### Development Workflow
```bash
./java-repo-os.sh enter      # Enter development container
./java-repo-os.sh build      # Build Java applications
./java-repo-os.sh test       # Run test suite
./java-repo-os.sh validate   # MCP v2 validation
./java-repo-os.sh logs       # View logs
```

### Session Integration
```bash
./java-repo-os.sh integrity  # Check session work integrity
./java-repo-os.sh migrate    # Migrate from legacy setup
```

## 📊 Service URLs

### 🏴‍☠️ Spring Boot Applications
- **MCP Core**: http://localhost:8080
- **MCP Monitor**: http://localhost:8081
- **MCP Guthilda**: http://localhost:8082
- **MCP AI Integration**: http://localhost:8083
- **MCP Servers**: http://localhost:8084
- **MCP CLI**: http://localhost:8085

### 📈 Monitoring & Tools
- **Grafana Dashboard**: http://localhost:3001 (`admin`/`java_admin_2025`)
- **Prometheus Metrics**: http://localhost:9090
- **Zipkin Tracing**: http://localhost:9411
- **SonarQube Analysis**: http://localhost:9000 (`admin`/`admin`)
- **Nexus Repository**: http://localhost:8081 (`admin`/`admin123`)
- **MailHog Email Testing**: http://localhost:8025

### 🗄️ Data Services
- **PostgreSQL**: `localhost:5432` (`mcp_dev`/`java_dev_2025`)
- **Redis**: `localhost:6379` (password: `java_redis_2025`)

### 🌐 API Gateway
- **Main Gateway**: http://localhost:80
- **API Routes**: `/api/core/`, `/api/monitor/`, `/api/guthilda/`, etc.

## 🏭 Java Monorepo Structure

```
📦 MCP Java Orchestration System
├── 🏗️ mcp-core/              # Core orchestration engine
├── 📊 mcp-monitor/            # System monitoring & health
├── 🏴‍☠️ mcp-guthilda/         # Captain's command interface
├── 🤖 mcp-ai-integration/     # AI/ML integration services
├── 🌐 mcp-servers/            # MCP server implementations
├── 💻 mcp-cli/                # Command-line interface
└── 📚 mcp-shared/             # Shared libraries & utilities
```

## 🔗 MCP v2 Protocol Integration

This environment maintains full compatibility with our established MCP v2 work:

### Protocol Specifications
- **JSON Schemas**: `mcp-v2-protocol-spec/schemas/`
- **OpenAPI Definitions**: `mcp-v2-protocol-spec/transport/`
- **gRPC Protobuf**: `mcp-v2-protocol-spec/grpc/`

### Client Libraries
- **Java Client**: `mcp-v2-java-client/` ✅ Built & Tested
- **TypeScript Client**: `mcp-v2-typescript-client/` ✅ Built & Tested
- **Python Client**: `mcp-v2-python-client/` ✅ Built & Tested

### Validation & Testing
```bash
# Run comprehensive MCP v2 validation
./java-repo-os.sh validate

# Check session work integrity
./java-repo-os.sh integrity
```

## 🛠️ Development Workflow

### 1. IDE Integration

#### VS Code + Dev Containers
```bash
# Open workspace in VS Code
code mcp-v2-workspace.code-workspace

# Use "Dev Containers: Reopen in Container" for full integration
```

#### IntelliJ IDEA
```bash
# Enter development container
./java-repo-os.sh enter

# Start IntelliJ with optimized settings
idea /workspace
```

### 2. Building Applications

```bash
# Enter development environment
./java-repo-os.sh enter

# Build specific module
cd mcp-core
mvn clean compile

# Build all modules
mvn clean compile -T 1C

# Package applications
mvn clean package -DskipTests
```

### 3. Running Services

```bash
# Start MCP Core service
cd mcp-core
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run with debugging
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
```

### 4. Testing & Quality

```bash
# Run all tests
./java-repo-os.sh test

# Run specific test suite
cd mcp-core
mvn test

# Generate test coverage
mvn jacoco:report

# SonarQube analysis
mvn sonar:sonar -Dsonar.host.url=http://localhost:9000
```

## 📊 Monitoring & Observability

### Grafana Dashboards
- **JVM Metrics**: Memory, GC, threads, classes
- **Spring Boot**: HTTP requests, database connections, cache
- **Application**: Custom MCP orchestration metrics
- **Infrastructure**: PostgreSQL, Redis, system resources

### Prometheus Metrics
- **Spring Boot Actuator**: `/actuator/prometheus`
- **Custom Metrics**: MCP-specific business metrics
- **Infrastructure**: Database and cache metrics

### Distributed Tracing
- **Zipkin Integration**: Automatic trace collection
- **Spring Cloud Sleuth**: Request correlation
- **Custom Spans**: AI/ML operation tracing

## 🔧 Configuration

### Environment Variables
All configuration is in `.env.java-dev`:

```bash
# Java Development
JAVA_VERSION=21
MAVEN_VERSION=3.9.6
JAVA_OPTS=-Xmx4g -XX:+UseG1GC

# Spring Boot
SPRING_PROFILES_ACTIVE=dev,docker
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/mcp_orchestration

# AI/ML Integration
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### Spring Boot Profiles
- **`dev`**: Development settings with debug logging
- **`docker`**: Container-optimized configuration
- **`test`**: Testing with H2 in-memory database
- **`prod`**: Production-ready settings

## 🚨 Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check service health
./java-repo-os.sh status

# View logs
./java-repo-os.sh logs [service-name]

# Restart environment
./java-repo-os.sh restart
```

#### Build Failures
```bash
# Clear Maven cache
./java-repo-os.sh enter
rm -rf ~/.m2/repository

# Clean rebuild
mvn clean compile -U
```

#### Memory Issues
```bash
# Increase container memory in Docker Desktop settings
# Recommended: 8GB+ for full development environment
```

### Health Checks

```bash
# Application health
curl http://localhost:8080/actuator/health

# Database connectivity
curl http://localhost:8080/actuator/health/db

# Redis connectivity
curl http://localhost:8080/actuator/health/redis
```

## 🔄 Migration from Legacy Setup

If you have an existing `repo-os.sh` setup:

```bash
# Migrate configuration and data
./java-repo-os.sh migrate

# Verify integrity
./java-repo-os.sh integrity
```

## 🎯 Session Continuity Strategy

This Java-first Repository-OS maintains **bidirectional integrity** with all our session work:

### ✅ Preserved Components
- 🔗 Complete MCP v2 protocol specifications
- 🧪 All client library implementations (Java, TypeScript, Python)
- 📊 Comprehensive validation scripts
- 🐳 Docker and Dev Container configurations
- 📋 VS Code workspace and task definitions

### 🚀 Enhanced Features
- ☕ Optimized Java 21 development environment
- 📈 Advanced monitoring with Spring Boot Actuator
- 🔍 Integrated code quality analysis
- 🤖 AI/ML integration framework
- 🏴‍☠️ Captain Guthilda's orchestration system

### 🔄 Continuous Integration
- All existing validation scripts continue to work
- Backward compatibility with polyglot development
- Seamless transition from legacy setup
- No data loss during migration

---

## 🏴‍☠️ Captain Guthilda's Commands

*"Ahoy, matey! Ye've got yerself a proper Java development ship now. All hands on deck for some serious coding!"*

- **Initialize the ship**: `./java-repo-os.sh init`
- **Set sail**: `./java-repo-os.sh start`
- **Board the vessel**: `./java-repo-os.sh enter`
- **Raise the colors**: `./java-repo-os.sh status`
- **Battle stations**: `./java-repo-os.sh build && ./java-repo-os.sh test`

*"Remember: This be no ordinary development environment - it's a complete operating system for yer Java adventures, with all the treasures of our previous voyages intact!"*

---

**🎉 Ready to set sail with Captain Guthilda's Java-first MCP Orchestration Repository-OS!**
