package dev.guthilda.meta;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.Callable;

/**
 * Captain Guthilda's Meta-Package Orchestrator
 * 🏴‍☠️ Universal package manager coordination for polyglot repositories
 */
@Command(
    name = "meta-orchestrator",
    description = "🏴‍☠️ Captain Guthilda's Meta-Package Orchestrator",
    mixinStandardHelpOptions = true,
    version = "1.0.0"
)
public class MetaPackageOrchestrator implements Callable<Integer> {
    
    @Option(names = {"-r", "--repo-root"}, 
            description = "Repository root directory (default: current directory)")
    private Path repoRoot = Paths.get(".");
    
    @Option(names = {"-v", "--verbose"}, 
            description = "Enable verbose output")
    private boolean verbose = false;
    
    @Parameters(index = "0", 
               description = "Command to execute: orchestrate, install, update, clean")
    private String command = "orchestrate";
    
    private Path devToolsDir;
    private MetaPackageManifest manifest;
    private final Map<String, PackageManager> packageManagers = new HashMap<>();
    
    public static void main(String[] args) {
        int exitCode = new CommandLine(new MetaPackageOrchestrator()).execute(args);
        System.exit(exitCode);
    }
    
    // --- Package manager interface and implementations are now in dev.guthilda.meta.packagemanager ---
    import dev.guthilda.meta.packagemanager.PackageManager;
    import dev.guthilda.meta.packagemanager.MavenPackageManager;
    import dev.guthilda.meta.packagemanager.NodePackageManager;
    import dev.guthilda.meta.packagemanager.GoPackageManager;
    import dev.guthilda.meta.packagemanager.PoetryPackageManager;
    import dev.guthilda.meta.packagemanager.CargoPackageManager;
    import dev.guthilda.meta.packagemanager.DotNetPackageManager;
    
    @Override
    public Integer call() throws Exception {
        printBanner();
        
        // Initialize paths
        repoRoot = repoRoot.toAbsolutePath().normalize();
        devToolsDir = repoRoot.resolve("dev-tools");
        
        log("🏴‍☠️ Repository Root: " + repoRoot);
        log("🛠️ Dev Tools Directory: " + devToolsDir);
        
        // Load manifest
        try {
            loadManifest();
        } catch (IOException e) {
            System.err.println("❌ Failed to load meta-package.yaml: " + e.getMessage());
            return 1;
        }
        
        // Initialize package managers
        initializePackageManagers();
        
        // Execute command
        return switch (command.toLowerCase()) {
            case "orchestrate" -> orchestrateAll();
            case "install" -> installDependencies();
            case "update" -> updateDependencies();
            case "clean" -> cleanEnvironment();
            case "validate" -> validateEnvironment();
            default -> {
                System.err.println("❌ Unknown command: " + command);
                yield 1;
            }
        };
    }
    
    private void printBanner() {
        System.out.println("""
            ╔════════════════════════════════════════════════════════════════════╗
            ║  🏴‍☠️ CAPTAIN GUTHILDA'S META-PACKAGE ORCHESTRATOR 🏴‍☠️              ║
            ║                                                                    ║
            ║  "Why choose one package manager when you can command them all?"  ║
            ╚════════════════════════════════════════════════════════════════════╝
            """);
    }
    
    // 📄 Create default manifest
    private void createDefaultManifest(Path manifestPath) throws IOException {
        String defaultManifest = """
# 🏴‍☠️ Captain Guthilda's Meta-Package Manifest
# Universal dependency declaration for polyglot repositories

metadata:
  name: "polyglot-paradise"
  version: "1.0.0"
  description: "Captain Guthilda's Universal Multi-Language Project"
  authors: ["Captain Guthilda"]

# Package manager configurations
package-managers:
  maven:
    enabled: true
    root: "."
    files: ["pom.xml"]
    commands:
      install: "mvn clean install"
      build: "mvn compile"
      test: "mvn test"
      
  npm:
    enabled: true
    root: "./frontend"
    files: ["package.json"]
    commands:
      install: "npm install"
      build: "npm run build"
      test: "npm test"
      
  bun:
    enabled: true
    root: "./modern-frontend"
    files: ["package.json"]
    commands:
      install: "bun install"
      build: "bun run build"
      test: "bun test"
      
  go:
    enabled: true
    root: "./services/go-service"
    files: ["go.mod"]
    commands:
      install: "go mod download"
      build: "go build"
      test: "go test ./..."
      
  poetry:
    enabled: true
    root: "./ml-pipeline"
    files: ["pyproject.toml"]
    commands:
      install: "poetry install"
      build: "poetry build"
      test: "poetry run pytest"
      
  cargo:
    enabled: true
    root: "./wasm-modules"
    files: ["Cargo.toml"]
    commands:
      install: "cargo fetch"
      build: "cargo build"
      test: "cargo test"
      
  dotnet:
    enabled: true
    root: "./enterprise-api"
    files: ["*.csproj", "*.sln"]
    commands:
      install: "dotnet restore"
      build: "dotnet build"
      test: "dotnet test"

# Cross-language dependency mapping
dependencies:
  shared-types:
    - maven: "com.guthilda:shared-types:1.0.0"
    - npm: "@guthilda/shared-types@^1.0.0"
    - nuget: "Guthilda.SharedTypes@1.0.0"
    
  logging:
    - maven: "org.slf4j:slf4j-api:2.0.9"
    - npm: "winston@^3.8.0"
    - go: "github.com/sirupsen/logrus@v1.9.0"
    - poetry: "loguru@^0.7.0"
    - cargo: "log@0.4.20"
    - nuget: "Serilog@3.0.1"

# Build pipeline configuration
pipeline:
  phases:
    - name: "setup"
      parallel: false
      commands:
        - "maven: clean"
        - "npm: install"
        - "poetry: install"
        
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
    
  paths:
    - "./dev-tools/java21/bin"
    - "./dev-tools/maven/bin"
    - "./dev-tools/node"
    - "./dev-tools/bun"
    - "./dev-tools/go/bin"
    - "./dev-tools/python"
    - "./dev-tools/rust/bin"
    - "./dev-tools/dotnet"
""";
        
        Files.writeString(manifestPath, defaultManifest);
        log("📄 Created default meta-package.yaml");
    }
    
    // 📋 Load manifest from file
    private void loadManifest() throws IOException {
        Path manifestPath = repoRoot.resolve("meta-package.yaml");
        
        if (!Files.exists(manifestPath)) {
            createDefaultManifest(manifestPath);
        }
        
        ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
        manifest = mapper.readValue(manifestPath.toFile(), MetaPackageManifest.class);
        
        log("📋 Loaded manifest: " + (manifest.metadata != null ? manifest.metadata.name : "unknown"));
    }
    
    // 🎩 Initialize package managers
    private void initializePackageManagers() {
        packageManagers.put("maven", new MavenPackageManager());
        packageManagers.put("npm", new NodePackageManager("npm"));
        packageManagers.put("bun", new NodePackageManager("bun"));
        packageManagers.put("go", new GoPackageManager());
        packageManagers.put("poetry", new PoetryPackageManager());
        packageManagers.put("cargo", new CargoPackageManager());
        packageManagers.put("dotnet", new DotNetPackageManager());
        
        log("🎼 Initialized " + packageManagers.size() + " package managers");
    }
    
    // 🎯 Orchestrate all package managers
    private int orchestrateAll() {
        log("🎼 Starting meta-package orchestration...");
        
        try {
            // Discover projects
            Map<String, List<Path>> projectsByManager = discoverProjects();
            
            if (projectsByManager.isEmpty()) {
                log("⚠️ No projects found for any package manager");
                return 0;
            }
            
            // Execute pipeline phases
            if (manifest.pipeline != null && manifest.pipeline.phases != null) {
                for (var phase : manifest.pipeline.phases) {
                    log("🚀 Executing phase: " + phase.name);
                    
                    if (phase.parallel) {
                        executePhaseParallel(phase, projectsByManager);
                    } else {
                        executePhaseSequential(phase, projectsByManager);
                    }
                }
            } else {
                // Default orchestration
                executeDefaultOrchestration(projectsByManager);
            }
            
            log("✅ Meta-package orchestration completed successfully");
            return 0;
            
        } catch (Exception e) {
            System.err.println("❌ Orchestration failed: " + e.getMessage());
            if (verbose) {
                e.printStackTrace();
            }
            return 1;
        }
    }
    
    // 🔍 Discover projects for each package manager
    private Map<String, List<Path>> discoverProjects() throws IOException {
        Map<String, List<Path>> projectsByManager = new HashMap<>();
        
        for (var entry : packageManagers.entrySet()) {
            String managerName = entry.getKey();
            PackageManager manager = entry.getValue();
            
            List<Path> projects = new ArrayList<>();
            
            // Check if manager is enabled in manifest
            if (manifest.packageManagers != null) {
                var config = manifest.packageManagers.get(managerName);
                if (config != null && !config.enabled) {
                    continue;
                }
                
                if (config != null && config.root != null) {
                    Path projectPath = repoRoot.resolve(config.root);
                    if (manager.hasManifest(projectPath)) {
                        projects.add(projectPath);
                    }
                }
            }
            
            // Auto-discovery if no specific configuration
            if (projects.isEmpty()) {
                projects.addAll(discoverProjectsForManager(manager));
            }
            
            if (!projects.isEmpty()) {
                projectsByManager.put(managerName, projects);
                log("📦 Found " + projects.size() + " " + managerName + " project(s)");
            }
        }
        
        return projectsByManager;
    }
    
    // 🔍 Auto-discover projects for a specific package manager
    private List<Path> discoverProjectsForManager(PackageManager manager) throws IOException {
        List<Path> projects = new ArrayList<>();
        
        Files.walkFileTree(repoRoot, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, java.nio.file.attribute.BasicFileAttributes attrs) {
                // Skip dev-tools and hidden directories
                String dirName = dir.getFileName().toString();
                if (dirName.equals("dev-tools") || dirName.startsWith(".") || dirName.equals("target") || dirName.equals("node_modules")) {
                    return FileVisitResult.SKIP_SUBTREE;
                }
                return FileVisitResult.CONTINUE;
            }
            
            @Override
            public FileVisitResult visitFile(Path file, java.nio.file.attribute.BasicFileAttributes attrs) {
                Path dir = file.getParent();
                if (manager.hasManifest(dir) && !projects.contains(dir)) {
                    projects.add(dir);
                }
                return FileVisitResult.CONTINUE;
            }
        });
        
        return projects;
    }
    
    // ⚡ Execute phase in parallel
    private void executePhaseParallel(MetaPackageManifest.PipelineConfig.PipelinePhase phase, 
                                     Map<String, List<Path>> projectsByManager) {
        // Implementation for parallel execution would use Java's parallel streams
        phase.commands.parallelStream().forEach(command -> {
            executePhaseCommand(command, projectsByManager);
        });
    }
    
    // 🔄 Execute phase sequentially
    private void executePhaseSequential(MetaPackageManifest.PipelineConfig.PipelinePhase phase, 
                                       Map<String, List<Path>> projectsByManager) {
        for (String command : phase.commands) {
            executePhaseCommand(command, projectsByManager);
        }
    }
    
    // 🎯 Execute a single phase command
    private void executePhaseCommand(String command, Map<String, List<Path>> projectsByManager) {
        String[] parts = command.split(":", 2);
        if (parts.length != 2) {
            log("⚠️ Invalid command format: " + command);
            return;
        }
        
        String managerName = parts[0].trim();
        String actualCommand = parts[1].trim();
        
        PackageManager manager = packageManagers.get(managerName);
        List<Path> projects = projectsByManager.get(managerName);
        
        if (manager == null || projects == null) {
            log("⚠️ No projects found for " + managerName);
            return;
        }
        
        for (Path project : projects) {
            log("🔨 Executing '" + actualCommand + "' for " + managerName + " in " + project);
            ProcessResult result = manager.executeCommand(project, actualCommand);
            
            if (result.isSuccess()) {
                log("✅ " + managerName + " " + actualCommand + " succeeded");
            } else {
                log("❌ " + managerName + " " + actualCommand + " failed: " + result.output);
            }
            
            if (verbose) {
                System.out.println(result.output);
            }
        }
    }
    
    // 🎯 Default orchestration (install -> build -> test)
    private void executeDefaultOrchestration(Map<String, List<Path>> projectsByManager) {
        String[] defaultPhases = {"install", "build", "test"};
        
        for (String phase : defaultPhases) {
            log("🚀 Executing default phase: " + phase);
            
            for (var entry : projectsByManager.entrySet()) {
                String managerName = entry.getKey();
                List<Path> projects = entry.getValue();
                PackageManager manager = packageManagers.get(managerName);
                
                for (Path project : projects) {
                    log("🔨 " + phase + " for " + managerName + " in " + project);
                    ProcessResult result = manager.executeCommand(project, phase);
                    
                    if (result.isSuccess()) {
                        log("✅ " + managerName + " " + phase + " succeeded");
                    } else {
                        log("❌ " + managerName + " " + phase + " failed");
                        if (verbose) {
                            System.out.println(result.output);
                        }
                    }
                }
            }
        }
    }
    
    // 📦 Install dependencies
    private int installDependencies() {
        return executeUniversalCommand("install");
    }
    
    // 🔄 Update dependencies
    private int updateDependencies() {
        return executeUniversalCommand("update");
    }
    
    // 🧹 Clean environment
    private int cleanEnvironment() {
        return executeUniversalCommand("clean");
    }
    
    // ✅ Validate environment
    private int validateEnvironment() {
        log("🔍 Validating development environment...");
        
        boolean allValid = true;
        
        // Check dev-tools directory
        if (!Files.exists(devToolsDir)) {
            log("❌ dev-tools directory not found");
            allValid = false;
        } else {
            log("✅ dev-tools directory exists");
        }
        
        // Check each package manager
        for (var entry : packageManagers.entrySet()) {
            String name = entry.getKey();
            PackageManager manager = entry.getValue();
            
            if (manager.isAvailable(repoRoot)) {
                String version = manager.getVersion(repoRoot);
                log("✅ " + name + " is available (version: " + version + ")");
            } else {
                log("❌ " + name + " is not available");
                allValid = false;
            }
        }
        
        return allValid ? 0 : 1;
    }
    
    // 🎯 Execute universal command across all managers
    private int executeUniversalCommand(String command) {
        try {
            Map<String, List<Path>> projectsByManager = discoverProjects();
            
            for (var entry : projectsByManager.entrySet()) {
                String managerName = entry.getKey();
                List<Path> projects = entry.getValue();
                PackageManager manager = packageManagers.get(managerName);
                
                for (Path project : projects) {
                    log("🔨 " + command + " for " + managerName + " in " + project);
                    ProcessResult result = manager.executeCommand(project, command);
                    
                    if (!result.isSuccess()) {
                        log("❌ " + command + " failed for " + managerName);
                        return 1;
                    }
                }
            }
            
            return 0;
        } catch (Exception e) {
            System.err.println("❌ Command failed: " + e.getMessage());
            return 1;
        }
    }
    
    // 📦 Process Result Record
    public record ProcessResult(int exitCode, String output) {
        public boolean isSuccess() {
            return exitCode == 0;
        }
    }
    
    // 📋 Meta Package Manifest Structure
    public static class MetaPackageManifest {
        public Metadata metadata;
        public Map<String, PackageManagerConfig> packageManagers;
        public Map<String, List<DependencyMapping>> dependencies;
        public PipelineConfig pipeline;
        public EnvironmentConfig environment;
        
        public static class Metadata {
            public String name;
            public String version;
            public String description;
            public List<String> authors;
        }
        
        public static class PackageManagerConfig {
            public boolean enabled;
            public String root;
            public List<String> files;
            public Map<String, String> commands;
        }
        
        public static class DependencyMapping {
            public String name;
            public Map<String, String> versions;
        }
        
        public static class PipelineConfig {
            public List<PipelinePhase> phases;
            
            public static class PipelinePhase {
                public String name;
                public boolean parallel;
                public List<String> commands;
            }
        }
        
        public static class EnvironmentConfig {
            public Map<String, String> variables;
            public List<String> paths;
        }
    }
}
