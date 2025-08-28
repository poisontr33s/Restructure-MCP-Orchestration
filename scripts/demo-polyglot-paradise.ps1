# 🏴‍☠️ CAPTAIN GUTHILDA'S POLYGLOT PARADISE DEMONSTRATION
# A complete walkthrough of the multi-language meta-package orchestration system

Write-Host @"
╔════════════════════════════════════════════════════════════════════╗
║  🏴‍☠️ CAPTAIN GUTHILDA'S POLYGLOT PARADISE DEMONSTRATION 🏴‍☠️          ║
║                                                                    ║
║  Welcome to the most comprehensive polyglot development setup!     ║
║  This demo shows how to orchestrate multiple package managers      ║
║  in a single repository using Java 21 as the backbone.           ║
╚════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Magenta

$ErrorActionPreference = "Continue"

function Write-Captain {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "🏴‍☠️ $Message" -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n🎯 $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️ $Message" -ForegroundColor Blue
}

# Step 1: Set up the polyglot paradise
Write-Step "Setting up Polyglot Paradise Development Environment"
Write-Captain "This will install portable versions of Java, Node.js, Go, Python, Rust, and .NET..."

if (Test-Path ".\scripts\setup-polyglot-paradise.ps1") {
    Write-Info "Running polyglot paradise setup..."
    try {
        & ".\scripts\setup-polyglot-paradise.ps1" -Verbose
        Write-Success "Polyglot paradise setup completed!"
    } catch {
        Write-Warning "Polyglot setup encountered some issues: $_"
        Write-Info "Don't worry, we'll continue with what we have..."
    }
} else {
    Write-Warning "Polyglot setup script not found. Creating minimal structure..."
    New-Item -ItemType Directory -Path "dev-tools" -Force | Out-Null
    Write-Success "Created dev-tools directory"
}

# Step 2: Activate the development environment
Write-Step "Activating Development Environment"
if (Test-Path ".\setup-dev-env.ps1") {
    Write-Info "Activating portable development environment..."
    & ".\setup-dev-env.ps1"
} else {
    Write-Warning "Environment activation script not found"
    Write-Info "You can manually set up your environment or run the polyglot setup first"
}

# Step 3: Build the meta-package orchestrator
Write-Step "Building Meta-Package Orchestrator"
if (Test-Path ".\meta-package-manager\pom.xml") {
    Write-Info "Building Java 21 meta-orchestrator..."
    
    Push-Location "meta-package-manager"
    try {
        if (Get-Command "mvn" -ErrorAction SilentlyContinue) {
            Write-Info "Using Maven to build orchestrator..."
            & mvn clean compile package -DskipTests
            Write-Success "Meta-orchestrator built successfully!"
        } elseif (Test-Path "..\dev-tools\maven\bin\mvn.cmd") {
            Write-Info "Using portable Maven to build orchestrator..."
            & "..\dev-tools\maven\bin\mvn.cmd" clean compile package -DskipTests
            Write-Success "Meta-orchestrator built successfully!"
        } else {
            Write-Warning "Maven not available. Skipping build..."
        }
    } catch {
        Write-Warning "Build failed: $_"
    } finally {
        Pop-Location
    }
} else {
    Write-Warning "Meta-package manager not found at expected location"
}

# Step 4: Create a sample polyglot project structure
Write-Step "Creating Sample Polyglot Project Structure"
Write-Info "Creating example projects in multiple languages..."

# Java Spring Boot service
$javaService = "sample-projects\java-service"
if (-not (Test-Path $javaService)) {
    New-Item -ItemType Directory -Path $javaService -Force | Out-Null
    
    $javaPom = @"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>dev.guthilda.samples</groupId>
    <artifactId>java-service</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring-boot.version>3.2.1</spring-boot.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>`${spring-boot.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
            <version>`${spring-boot.version}</version>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>`${spring-boot.version}</version>
            </plugin>
        </plugins>
    </build>
</project>
"@
    $javaPom | Out-File -FilePath "$javaService\pom.xml" -Encoding UTF8
    Write-Success "Created Java Spring Boot service"
}

# Node.js React frontend
$frontend = "sample-projects\frontend"
if (-not (Test-Path $frontend)) {
    New-Item -ItemType Directory -Path $frontend -Force | Out-Null
    
    $packageJson = @"
{
  "name": "guthilda-frontend",
  "version": "1.0.0",
  "description": "Captain Guthilda's Frontend",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "react-scripts": "5.0.1",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
"@
    $packageJson | Out-File -FilePath "$frontend\package.json" -Encoding UTF8
    Write-Success "Created Node.js React frontend"
}

# Go microservice
$goService = "sample-projects\go-service"
if (-not (Test-Path $goService)) {
    New-Item -ItemType Directory -Path $goService -Force | Out-Null
    
    $goMod = @"
module github.com/guthilda/go-service

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/go-redis/redis/v8 v8.11.5
    github.com/prometheus/client_golang v1.17.0
)
"@
    $goMod | Out-File -FilePath "$goService\go.mod" -Encoding UTF8
    
    $goMain = @"
package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()
    
    r.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status": "OK",
            "service": "go-service",
            "version": "1.0.0",
        })
    })
    
    r.GET("/api/data", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "Hello from Captain Guthilda's Go service!",
            "data": []string{"item1", "item2", "item3"},
        })
    })
    
    r.Run(":8080")
}
"@
    $goMain | Out-File -FilePath "$goService\main.go" -Encoding UTF8
    Write-Success "Created Go microservice"
}

# Python ML pipeline
$mlPipeline = "sample-projects\ml-pipeline"
if (-not (Test-Path $mlPipeline)) {
    New-Item -ItemType Directory -Path $mlPipeline -Force | Out-Null
    
    $pyprojectToml = @"
[tool.poetry]
name = "guthilda-ml-pipeline"
version = "0.1.0"
description = "Captain Guthilda's ML Pipeline"
authors = ["Captain Guthilda <guthilda@pirate.ship>"]

[tool.poetry.dependencies]
python = "^3.12"
pandas = "^2.1.0"
numpy = "^1.24.0"
scikit-learn = "^1.3.0"
fastapi = "^0.104.0"
uvicorn = "^0.24.0"
pydantic = "^2.5.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
black = "^23.0.0"
flake8 = "^6.0.0"
mypy = "^1.7.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
"@
    $pyprojectToml | Out-File -FilePath "$mlPipeline\pyproject.toml" -Encoding UTF8
    Write-Success "Created Python ML pipeline"
}

# Rust WASM modules
$wasmModules = "sample-projects\wasm-modules"
if (-not (Test-Path $wasmModules)) {
    New-Item -ItemType Directory -Path $wasmModules -Force | Out-Null
    
    $cargoToml = @"
[package]
name = "guthilda-wasm-modules"
version = "0.1.0"
edition = "2021"
description = "Captain Guthilda's WASM Modules"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
js-sys = "0.3"
web-sys = "0.3"
serde = { version = "1.0", features = ["derive"] }
serde-wasm-bindgen = "0.6"

[dependencies.web-sys]
version = "0.3"
features = [
  "console",
  "Document",
  "Element",
  "HtmlElement",
  "Window",
]
"@
    $cargoToml | Out-File -FilePath "$wasmModules\Cargo.toml" -Encoding UTF8
    Write-Success "Created Rust WASM modules"
}

# .NET enterprise API
$enterpriseApi = "sample-projects\enterprise-api"
if (-not (Test-Path $enterpriseApi)) {
    New-Item -ItemType Directory -Path $enterpriseApi -Force | Out-Null
    
    $csproj = @"
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.4.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0" />
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
  </ItemGroup>

</Project>
"@
    $csproj | Out-File -FilePath "$enterpriseApi\enterprise-api.csproj" -Encoding UTF8
    Write-Success "Created .NET enterprise API"
}

# Step 5: Create meta-package.yaml
Write-Step "Creating Meta-Package Manifest"
if (-not (Test-Path "meta-package.yaml")) {
    $metaPackageYaml = @"
# 🏴‍☠️ Captain Guthilda's Meta-Package Manifest
# Universal dependency declaration for polyglot repositories

metadata:
  name: "guthilda-polyglot-paradise"
  version: "1.0.0"
  description: "Captain Guthilda's Ultimate Polyglot Development Paradise"
  authors: ["Captain Guthilda <guthilda@pirate.ship>"]

# Package manager configurations
package-managers:
  maven:
    enabled: true
    root: "./sample-projects/java-service"
    files: ["pom.xml"]
    commands:
      install: "mvn clean install"
      build: "mvn compile"
      test: "mvn test"
      run: "mvn spring-boot:run"
      
  npm:
    enabled: true
    root: "./sample-projects/frontend"
    files: ["package.json"]
    commands:
      install: "npm install"
      build: "npm run build"
      test: "npm test"
      start: "npm start"
      
  go:
    enabled: true
    root: "./sample-projects/go-service"
    files: ["go.mod"]
    commands:
      install: "go mod download"
      build: "go build"
      test: "go test ./..."
      run: "go run main.go"
      
  poetry:
    enabled: true
    root: "./sample-projects/ml-pipeline"
    files: ["pyproject.toml"]
    commands:
      install: "poetry install"
      build: "poetry build"
      test: "poetry run pytest"
      run: "poetry run uvicorn main:app --reload"
      
  cargo:
    enabled: true
    root: "./sample-projects/wasm-modules"
    files: ["Cargo.toml"]
    commands:
      install: "cargo fetch"
      build: "cargo build"
      test: "cargo test"
      wasm: "wasm-pack build --target web"
      
  dotnet:
    enabled: true
    root: "./sample-projects/enterprise-api"
    files: ["*.csproj"]
    commands:
      install: "dotnet restore"
      build: "dotnet build"
      test: "dotnet test"
      run: "dotnet run"

# Cross-language dependency mapping
dependencies:
  shared-types:
    - maven: "dev.guthilda:shared-types:1.0.0"
    - npm: "@guthilda/shared-types@^1.0.0"
    - nuget: "Guthilda.SharedTypes@1.0.0"
    
  logging:
    - maven: "org.slf4j:slf4j-api:2.0.9"
    - npm: "winston@^3.8.0"
    - go: "github.com/sirupsen/logrus@v1.9.0"
    - poetry: "loguru@^0.7.0"
    - cargo: "log@0.4.20"
    - nuget: "Serilog@3.0.1"
    
  http-client:
    - maven: "org.apache.httpcomponents.client5:httpclient5:5.3"
    - npm: "axios@^1.6.0"
    - go: "net/http (built-in)"
    - poetry: "httpx@^0.25.0"
    - cargo: "reqwest@0.11"
    - nuget: "System.Net.Http (built-in)"

# Build pipeline configuration
pipeline:
  phases:
    - name: "setup"
      parallel: false
      commands:
        - "maven: clean"
        - "npm: install"
        - "poetry: install"
        - "cargo: fetch"
        - "dotnet: restore"
        
    - name: "build"
      parallel: true
      commands:
        - "maven: compile"
        - "npm: build"
        - "go: build"
        - "poetry: build"
        - "cargo: build"
        - "dotnet: build"
        
    - name: "test"
      parallel: true
      commands:
        - "maven: test"
        - "npm: test"
        - "go: test"
        - "poetry: test"
        - "cargo: test"
        - "dotnet: test"

# Environment configuration
environment:
  variables:
    JAVA_OPTS: "-Xmx2g"
    NODE_ENV: "development"
    GO111MODULE: "on"
    CARGO_TARGET_DIR: "target"
    DOTNET_ENVIRONMENT: "Development"
    
  paths:
    - "./dev-tools/java21/bin"
    - "./dev-tools/maven/bin"
    - "./dev-tools/node"
    - "./dev-tools/bun"
    - "./dev-tools/go/bin"
    - "./dev-tools/python"
    - "./dev-tools/rust/bin"
    - "./dev-tools/dotnet"
"@
    $metaPackageYaml | Out-File -FilePath "meta-package.yaml" -Encoding UTF8
    Write-Success "Created meta-package.yaml manifest"
}

# Step 6: Demonstrate the meta-orchestrator
Write-Step "Demonstrating Meta-Package Orchestration"
if (Test-Path "meta-package-manager\target\meta-package-orchestrator-1.0.0.jar") {
    Write-Info "Running meta-orchestrator validation..."
    
    try {
        if (Get-Command "java" -ErrorAction SilentlyContinue) {
            & java -jar "meta-package-manager\target\meta-package-orchestrator-1.0.0.jar" validate --verbose
        } elseif (Test-Path "dev-tools\java21\bin\java.exe") {
            & "dev-tools\java21\bin\java.exe" -jar "meta-package-manager\target\meta-package-orchestrator-1.0.0.jar" validate --verbose
        } else {
            Write-Warning "Java not available for running orchestrator"
        }
    } catch {
        Write-Warning "Could not run orchestrator: $_"
    }
} else {
    Write-Warning "Meta-orchestrator JAR not found. Build may have failed."
}

# Step 7: Show the final structure
Write-Step "Final Project Structure"
Write-Info "Your polyglot paradise is ready! Here's what was created:"

$structure = @"
📁 Polyglot Paradise Repository Structure:
├── 🛠️ dev-tools/                    # Portable development tools
│   ├── 📦 java21/                   # Java 21 JDK
│   ├── 📦 maven/                    # Apache Maven
│   ├── 📦 node/                     # Node.js runtime
│   ├── 📦 bun/                      # Bun runtime
│   ├── 📦 go/                       # Go toolchain
│   ├── 📦 python/                   # Python runtime
│   ├── 📦 rust/                     # Rust + Cargo
│   └── 📦 dotnet/                   # .NET SDK
├── 🎼 meta-package-manager/          # Java-based orchestration
│   ├── 📄 pom.xml                   # Maven configuration
│   ├── 📁 src/main/java/            # Orchestrator source
│   └── 📁 target/                   # Built JAR
├── 📂 sample-projects/               # Multi-language projects
│   ├── ☕ java-service/             # Spring Boot API
│   ├── 🟢 frontend/                 # React frontend
│   ├── 🐹 go-service/               # Go microservice
│   ├── 🐍 ml-pipeline/              # Python ML pipeline
│   ├── 🦀 wasm-modules/             # Rust WASM modules
│   └── 🔵 enterprise-api/           # .NET Core API
├── 📄 meta-package.yaml             # Universal manifest
├── 🔧 setup-dev-env.ps1            # Environment activation
└── 📄 .gitignore                    # Excludes dev-tools/
"@

Write-Host $structure -ForegroundColor Green

Write-Step "Usage Instructions"
Write-Info @"
🚀 To get started:

1. Activate the environment:
   .\setup-dev-env.ps1

2. Run the meta-orchestrator:
   java -jar meta-package-manager\target\meta-package-orchestrator-1.0.0.jar orchestrate

3. Build all projects:
   java -jar meta-package-manager\target\meta-package-orchestrator-1.0.0.jar install

4. Test all projects:
   java -jar meta-package-manager\target\meta-package-orchestrator-1.0.0.jar validate

5. Individual project commands:
   # Java service
   cd sample-projects\java-service && mvn spring-boot:run
   
   # React frontend  
   cd sample-projects\frontend && npm start
   
   # Go microservice
   cd sample-projects\go-service && go run main.go
   
   # Python ML pipeline
   cd sample-projects\ml-pipeline && poetry run uvicorn main:app
   
   # .NET API
   cd sample-projects\enterprise-api && dotnet run
"@

Write-Captain "🎉 Captain Guthilda's Polyglot Paradise is ready for action!" "Green"
Write-Host ""
Write-Host "🏴‍☠️ May your code be bug-free and your deployments swift!" -ForegroundColor Magenta
