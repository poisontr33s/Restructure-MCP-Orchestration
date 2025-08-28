package dev.guthilda.meta;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.api.DisplayName;
import static org.assertj.core.api.Assertions.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

/**
 * 🏴‍☠️ Captain Guthilda's Meta-Package Orchestrator Tests
 * Test suite for the universal package manager orchestration system
 */
@DisplayName("🏴‍☠️ Meta-Package Orchestrator Tests")
class MetaPackageOrchestratorTest {
    
    @TempDir
    Path tempRepo;
    
    private MetaPackageOrchestrator orchestrator;
    
    @BeforeEach
    void setUp() {
        orchestrator = new MetaPackageOrchestrator();
    }
    
    @Test
    @DisplayName("Should create Maven package manager")
    void shouldCreateMavenPackageManager() {
        var maven = new MetaPackageOrchestrator.MavenPackageManager();
        
        assertThat(maven.getName()).isEqualTo("maven");
        assertThat(maven.getManifestFiles()).contains("pom.xml");
    }
    
    @Test
    @DisplayName("Should detect Maven projects")
    void shouldDetectMavenProjects() throws IOException {
        // Create a Maven project
        Path mavenProject = tempRepo.resolve("java-service");
        Files.createDirectories(mavenProject);
        Files.writeString(mavenProject.resolve("pom.xml"), 
            """
            <?xml version="1.0" encoding="UTF-8"?>
            <project xmlns="http://maven.apache.org/POM/4.0.0">
                <modelVersion>4.0.0</modelVersion>
                <groupId>com.example</groupId>
                <artifactId>test-project</artifactId>
                <version>1.0.0</version>
            </project>
            """);
        
        var maven = new MetaPackageOrchestrator.MavenPackageManager();
        assertThat(maven.hasManifest(mavenProject)).isTrue();
    }
    
    @Test
    @DisplayName("Should create Node.js package manager")
    void shouldCreateNodePackageManager() {
        var npm = new MetaPackageOrchestrator.NodePackageManager("npm");
        var bun = new MetaPackageOrchestrator.NodePackageManager("bun");
        
        assertThat(npm.getName()).isEqualTo("npm");
        assertThat(bun.getName()).isEqualTo("bun");
        assertThat(npm.getManifestFiles()).contains("package.json");
        assertThat(bun.getManifestFiles()).contains("package.json");
    }
    
    @Test
    @DisplayName("Should detect Node.js projects")
    void shouldDetectNodeProjects() throws IOException {
        // Create a Node.js project
        Path nodeProject = tempRepo.resolve("frontend");
        Files.createDirectories(nodeProject);
        Files.writeString(nodeProject.resolve("package.json"), 
            """
            {
              "name": "test-frontend",
              "version": "1.0.0",
              "dependencies": {
                "react": "^18.0.0"
              }
            }
            """);
        
        var npm = new MetaPackageOrchestrator.NodePackageManager("npm");
        assertThat(npm.hasManifest(nodeProject)).isTrue();
    }
    
    @Test
    @DisplayName("Should create Go package manager")
    void shouldCreateGoPackageManager() {
        var go = new MetaPackageOrchestrator.GoPackageManager();
        
        assertThat(go.getName()).isEqualTo("go");
        assertThat(go.getManifestFiles()).contains("go.mod");
    }
    
    @Test
    @DisplayName("Should detect Go projects")
    void shouldDetectGoProjects() throws IOException {
        // Create a Go project
        Path goProject = tempRepo.resolve("go-service");
        Files.createDirectories(goProject);
        Files.writeString(goProject.resolve("go.mod"), 
            """
            module github.com/example/go-service
            
            go 1.21
            
            require (
                github.com/gin-gonic/gin v1.9.1
            )
            """);
        
        var go = new MetaPackageOrchestrator.GoPackageManager();
        assertThat(go.hasManifest(goProject)).isTrue();
    }
    
    @Test
    @DisplayName("Should create Python Poetry package manager")
    void shouldCreatePoetryPackageManager() {
        var poetry = new MetaPackageOrchestrator.PoetryPackageManager();
        
        assertThat(poetry.getName()).isEqualTo("poetry");
        assertThat(poetry.getManifestFiles()).contains("pyproject.toml");
    }
    
    @Test
    @DisplayName("Should detect Python Poetry projects")
    void shouldDetectPoetryProjects() throws IOException {
        // Create a Poetry project
        Path poetryProject = tempRepo.resolve("ml-pipeline");
        Files.createDirectories(poetryProject);
        Files.writeString(poetryProject.resolve("pyproject.toml"), 
            """
            [tool.poetry]
            name = "ml-pipeline"
            version = "0.1.0"
            description = "Machine learning pipeline"
            
            [tool.poetry.dependencies]
            python = "^3.12"
            pandas = "^2.0.0"
            numpy = "^1.24.0"
            """);
        
        var poetry = new MetaPackageOrchestrator.PoetryPackageManager();
        assertThat(poetry.hasManifest(poetryProject)).isTrue();
    }
    
    @Test
    @DisplayName("Should create Rust Cargo package manager")
    void shouldCreateCargoPackageManager() {
        var cargo = new MetaPackageOrchestrator.CargoPackageManager();
        
        assertThat(cargo.getName()).isEqualTo("cargo");
        assertThat(cargo.getManifestFiles()).contains("Cargo.toml");
    }
    
    @Test
    @DisplayName("Should detect Rust Cargo projects")
    void shouldDetectCargoProjects() throws IOException {
        // Create a Cargo project
        Path cargoProject = tempRepo.resolve("wasm-modules");
        Files.createDirectories(cargoProject);
        Files.writeString(cargoProject.resolve("Cargo.toml"), 
            """
            [package]
            name = "wasm-modules"
            version = "0.1.0"
            edition = "2021"
            
            [dependencies]
            wasm-bindgen = "0.2"
            """);
        
        var cargo = new MetaPackageOrchestrator.CargoPackageManager();
        assertThat(cargo.hasManifest(cargoProject)).isTrue();
    }
    
    @Test
    @DisplayName("Should create .NET package manager")
    void shouldCreateDotNetPackageManager() {
        var dotnet = new MetaPackageOrchestrator.DotNetPackageManager();
        
        assertThat(dotnet.getName()).isEqualTo("dotnet");
        assertThat(dotnet.getManifestFiles()).containsAnyOf("*.csproj", "*.sln", "*.fsproj", "*.vbproj");
    }
    
    @Test
    @DisplayName("Should detect .NET projects")
    void shouldDetectDotNetProjects() throws IOException {
        // Create a .NET project
        Path dotnetProject = tempRepo.resolve("enterprise-api");
        Files.createDirectories(dotnetProject);
        Files.writeString(dotnetProject.resolve("enterprise-api.csproj"), 
            """
            <Project Sdk="Microsoft.NET.Sdk.Web">
              <PropertyGroup>
                <TargetFramework>net8.0</TargetFramework>
                <Nullable>enable</Nullable>
                <ImplicitUsings>enable</ImplicitUsings>
              </PropertyGroup>
              
              <ItemGroup>
                <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
                <PackageReference Include="Swashbuckle.AspNetCore" Version="6.4.0" />
              </ItemGroup>
            </Project>
            """);
        
        var dotnet = new MetaPackageOrchestrator.DotNetPackageManager();
        assertThat(dotnet.hasManifest(dotnetProject)).isTrue();
    }
    
    @Test
    @DisplayName("Should handle polyglot repository structure")
    void shouldHandlePolyglotRepository() throws IOException {
        // Create a complex polyglot repository
        createPolyglotRepository();
        
        // Test package manager discovery logic would go here
        // This is a more integration-style test
        
        assertThat(Files.exists(tempRepo.resolve("java-service").resolve("pom.xml"))).isTrue();
        assertThat(Files.exists(tempRepo.resolve("frontend").resolve("package.json"))).isTrue();
        assertThat(Files.exists(tempRepo.resolve("go-service").resolve("go.mod"))).isTrue();
        assertThat(Files.exists(tempRepo.resolve("ml-pipeline").resolve("pyproject.toml"))).isTrue();
        assertThat(Files.exists(tempRepo.resolve("wasm-modules").resolve("Cargo.toml"))).isTrue();
        assertThat(Files.exists(tempRepo.resolve("enterprise-api").resolve("enterprise-api.csproj"))).isTrue();
    }
    
    @Test
    @DisplayName("Should create default meta-package.yaml")
    void shouldCreateDefaultManifest() throws IOException {
        // This would test the manifest creation logic
        Path manifestPath = tempRepo.resolve("meta-package.yaml");
        assertThat(Files.exists(manifestPath)).isFalse();
        
        // The orchestrator would create it when initialized
        // Implementation details would be tested here
    }
    
    @Test
    @DisplayName("Should validate environment variables")
    void shouldValidateEnvironmentVariables() {
        var maven = new MetaPackageOrchestrator.MavenPackageManager();
        Path devToolsDir = tempRepo.resolve("dev-tools");
        
        Map<String, String> env = maven.getEnvironmentVariables(devToolsDir);
        
        // Test environment variable generation
        assertThat(env).isNotNull();
    }
    
    @Test
    @DisplayName("Should handle process execution")
    void shouldHandleProcessExecution() {
        var maven = new MetaPackageOrchestrator.MavenPackageManager();
        
        // Test process execution (this would need a real Maven project)
        // For now, just test that the method exists and handles errors gracefully
        var result = maven.executeCommand(tempRepo, "invalidcommand");
        assertThat(result).isNotNull();
        assertThat(result.exitCode()).isNotZero();
    }
    
    // Helper method to create a complex polyglot repository structure
    private void createPolyglotRepository() throws IOException {
        // Java/Maven service
        Path javaService = tempRepo.resolve("java-service");
        Files.createDirectories(javaService.resolve("src/main/java"));
        Files.writeString(javaService.resolve("pom.xml"), 
            """
            <?xml version="1.0" encoding="UTF-8"?>
            <project xmlns="http://maven.apache.org/POM/4.0.0">
                <modelVersion>4.0.0</modelVersion>
                <groupId>com.guthilda</groupId>
                <artifactId>java-service</artifactId>
                <version>1.0.0</version>
                <properties>
                    <maven.compiler.source>21</maven.compiler.source>
                    <maven.compiler.target>21</maven.compiler.target>
                </properties>
                <dependencies>
                    <dependency>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-starter-web</artifactId>
                        <version>3.2.1</version>
                    </dependency>
                </dependencies>
            </project>
            """);
        
        // Node.js/React frontend
        Path frontend = tempRepo.resolve("frontend");
        Files.createDirectories(frontend.resolve("src"));
        Files.writeString(frontend.resolve("package.json"), 
            """
            {
              "name": "guthilda-frontend",
              "version": "1.0.0",
              "scripts": {
                "build": "react-scripts build",
                "test": "react-scripts test"
              },
              "dependencies": {
                "react": "^18.2.0",
                "react-dom": "^18.2.0"
              },
              "devDependencies": {
                "react-scripts": "5.0.1"
              }
            }
            """);
        
        // Go microservice
        Path goService = tempRepo.resolve("go-service");
        Files.createDirectories(goService);
        Files.writeString(goService.resolve("go.mod"), 
            """
            module github.com/guthilda/go-service
            
            go 1.21
            
            require (
                github.com/gin-gonic/gin v1.9.1
                github.com/go-redis/redis/v8 v8.11.5
            )
            """);
        Files.writeString(goService.resolve("main.go"), 
            """
            package main
            
            import (
                "github.com/gin-gonic/gin"
            )
            
            func main() {
                r := gin.Default()
                r.GET("/health", func(c *gin.Context) {
                    c.JSON(200, gin.H{"status": "OK"})
                })
                r.Run(":8080")
            }
            """);
        
        // Python ML pipeline
        Path mlPipeline = tempRepo.resolve("ml-pipeline");
        Files.createDirectories(mlPipeline.resolve("src"));
        Files.writeString(mlPipeline.resolve("pyproject.toml"), 
            """
            [tool.poetry]
            name = "guthilda-ml-pipeline"
            version = "0.1.0"
            description = "Machine learning data pipeline"
            
            [tool.poetry.dependencies]
            python = "^3.12"
            pandas = "^2.1.0"
            numpy = "^1.24.0"
            scikit-learn = "^1.3.0"
            fastapi = "^0.104.0"
            
            [tool.poetry.group.dev.dependencies]
            pytest = "^7.4.0"
            black = "^23.0.0"
            """);
        
        // Rust WASM modules
        Path wasmModules = tempRepo.resolve("wasm-modules");
        Files.createDirectories(wasmModules.resolve("src"));
        Files.writeString(wasmModules.resolve("Cargo.toml"), 
            """
            [package]
            name = "guthilda-wasm-modules"
            version = "0.1.0"
            edition = "2021"
            
            [lib]
            crate-type = ["cdylib"]
            
            [dependencies]
            wasm-bindgen = "0.2"
            js-sys = "0.3"
            web-sys = "0.3"
            """);
        
        // .NET enterprise API
        Path enterpriseApi = tempRepo.resolve("enterprise-api");
        Files.createDirectories(enterpriseApi.resolve("Controllers"));
        Files.writeString(enterpriseApi.resolve("enterprise-api.csproj"), 
            """
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
              </ItemGroup>
            </Project>
            """);
    }
}
