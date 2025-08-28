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
    
    private void loadManifest() throws IOException {
        Path manifestPath = repoRoot.resolve("meta-package.yaml");
        
        if (!Files.exists(manifestPath)) {
            log("📄 Creating default meta-package.yaml...");
            createDefaultManifest(manifestPath);
        }
        
        log("📄 Loading manifest from: " + manifestPath);
        
        ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
        this.manifest = mapper.readValue(manifestPath.toFile(), MetaPackageManifest.class);
        
        log("✅ Manifest loaded: " + manifest.getMetadata().getName() + " v" + manifest.getMetadata().getVersion());
    }
    
    private void createDefaultManifest(Path manifestPath) throws IOException {
        String defaultManifest = """
            # Captain Guthilda's Meta-Package Manifest
            apiVersion: "meta.guthilda.dev/v1"
            kind: "MetaPackageManifest"
            
            metadata:
              name: "my-polyglot-project"
              version: "1.0.0"
            
            ecosystems:
              java:
                package-manager: "maven"
                version: "3.9.9"
                dependencies:
                  - "org.springframework.boot:spring-boot-starter:3.2.0"
                  - "com.fasterxml.jackson.core:jackson-core:2.16.1"
              
              javascript:
                package-manager: "bun"
                version: "latest"
                dependencies:
                  - "express@^4.18.0"
                  - "@types/node@^20.0.0"
            
            tools:
              formatters:
                java: "google-java-format"
                javascript: "prettier"
              linters:
                java: "spotbugs"
                javascript: "eslint"
            """;
        
        Files.writeString(manifestPath, defaultManifest);
        log("✅ Created default manifest: " + manifestPath);
    }
    
    // 🎯 Package Manager Interface
    public interface PackageManager {
        String getName();
        boolean isAvailable(Path projectRoot);
        boolean hasManifest(Path projectRoot);
        List<String> getManifestFiles();
        ProcessResult executeCommand(Path projectRoot, String command, String... args);
        Map<String, String> getEnvironmentVariables(Path devToolsDir);
        String getVersion(Path projectRoot);
        List<String> listDependencies(Path projectRoot);
    }
    
    // 📦 Abstract Package Manager Base
    public abstract static class AbstractPackageManager implements PackageManager {
        protected final String name;
        protected final List<String> manifestFiles;
        protected final Map<String, String> commands;
        
        public AbstractPackageManager(String name, List<String> manifestFiles, Map<String, String> commands) {
            this.name = name;
            this.manifestFiles = manifestFiles;
            this.commands = commands;
        }
        
        @Override
        public String getName() {
            return name;
        }
        
        @Override
        public List<String> getManifestFiles() {
            return manifestFiles;
        }
        
        @Override
        public boolean hasManifest(Path projectRoot) {
            return manifestFiles.stream()
                .anyMatch(file -> Files.exists(projectRoot.resolve(file)));
        }
        
        @Override
        public ProcessResult executeCommand(Path projectRoot, String command, String... args) {
            try {
                String fullCommand = commands.getOrDefault(command, command);
                List<String> commandList = new ArrayList<>();
                commandList.addAll(Arrays.asList(fullCommand.split("\\s+")));
                commandList.addAll(Arrays.asList(args));
                
                ProcessBuilder pb = new ProcessBuilder(commandList)
                    .directory(projectRoot.toFile())
                    .redirectErrorStream(true);
                
                // Add environment variables
                pb.environment().putAll(getEnvironmentVariables(projectRoot.getParent().resolve("dev-tools")));
                
                Process process = pb.start();
                
                try (Scanner scanner = new Scanner(process.getInputStream())) {
                    StringBuilder output = new StringBuilder();
                    while (scanner.hasNextLine()) {
                        output.append(scanner.nextLine()).append("\n");
                    }
                    
                    int exitCode = process.waitFor();
                    return new ProcessResult(exitCode, output.toString());
                }
            } catch (Exception e) {
                return new ProcessResult(1, "Error executing command: " + e.getMessage());
            }
        }
        
        @Override
        public Map<String, String> getEnvironmentVariables(Path devToolsDir) {
            return new HashMap<>();
        }
    }
    
    // ☕ Maven Package Manager
    public static class MavenPackageManager extends AbstractPackageManager {
        public MavenPackageManager() {
            super("maven", 
                  List.of("pom.xml"), 
                  Map.of(
                      "install", "mvn clean install",
                      "build", "mvn compile",
                      "test", "mvn test",
                      "clean", "mvn clean"
                  ));
        }
        
        @Override
        public boolean isAvailable(Path projectRoot) {
            Path devToolsDir = projectRoot.getParent().resolve("dev-tools");
            Path mavenBin = devToolsDir.resolve("maven").resolve("bin").resolve("mvn");
            Path mavenBinCmd = devToolsDir.resolve("maven").resolve("bin").resolve("mvn.cmd");
            return Files.exists(mavenBin) || Files.exists(mavenBinCmd);
        }
        
        @Override
        public Map<String, String> getEnvironmentVariables(Path devToolsDir) {
            Map<String, String> env = new HashMap<>();
            Path javaHome = devToolsDir.resolve("java21");
            Path mavenHome = devToolsDir.resolve("maven");
            
            if (Files.exists(javaHome)) {
                env.put("JAVA_HOME", javaHome.toString());
            }
            if (Files.exists(mavenHome)) {
                env.put("MAVEN_HOME", mavenHome.toString());
            }
            
            return env;
        }
        
        @Override
        public String getVersion(Path projectRoot) {
            ProcessResult result = executeCommand(projectRoot, "mvn", "--version");
            return result.exitCode == 0 ? result.output.split("\n")[0] : "Unknown";
        }
        
        @Override
        public List<String> listDependencies(Path projectRoot) {
            ProcessResult result = executeCommand(projectRoot, "mvn", "dependency:list");
            return result.exitCode == 0 ? 
                Arrays.asList(result.output.split("\n")) : 
                List.of();
        }
    }
    
    // 🟢 Node.js Package Manager (npm/bun)
    public static class NodePackageManager extends AbstractPackageManager {
        private final String packageManager;
        
        public NodePackageManager(String packageManager) {
            super(packageManager, 
                  List.of("package.json"), 
                  Map.of(
                      "install", packageManager + " install",
                      "build", packageManager + " run build",
                      "test", packageManager + " test",
                      "clean", packageManager + " run clean"
                  ));
            this.packageManager = packageManager;
        }
        
        @Override
        public boolean isAvailable(Path projectRoot) {
            Path devToolsDir = projectRoot.getParent().resolve("dev-tools");
            return switch (packageManager) {
                case "npm" -> Files.exists(devToolsDir.resolve("node").resolve("npm.cmd"));
                case "bun" -> Files.exists(devToolsDir.resolve("bun").resolve("bun.exe"));
                default -> false;
            };
        }
        
        @Override
        public Map<String, String> getEnvironmentVariables(Path devToolsDir) {
            Map<String, String> env = new HashMap<>();
            
            if (packageManager.equals("npm")) {
                Path nodePath = devToolsDir.resolve("node");
                if (Files.exists(nodePath)) {
                    env.put("NODE_PATH", nodePath.toString());
                }
            }
            
            return env;
        }
        
        @Override
        public String getVersion(Path projectRoot) {
            ProcessResult result = executeCommand(projectRoot, packageManager, "--version");
            return result.exitCode == 0 ? result.output.trim() : "Unknown";
        }
        
        @Override
        public List<String> listDependencies(Path projectRoot) {
            ProcessResult result = executeCommand(projectRoot, packageManager, "list");
            return result.exitCode == 0 ? 
                Arrays.asList(result.output.split("\n")) : 
                List.of();
        }
    }
    
    // 🐹 Go Package Manager
    public static class GoPackageManager extends AbstractPackageManager {
        public GoPackageManager() {
            super("go", 
                  List.of("go.mod"), 
                  Map.of(
                      "install", "go mod download",
                      "build", "go build",
                      "test", "go test ./...",
                      "clean", "go clean"
                  ));
        }
        
        @Override
        public boolean isAvailable(Path projectRoot) {
            Path devToolsDir = projectRoot.getParent().resolve("dev-tools");
            Path goBin = devToolsDir.resolve("go").resolve("bin").resolve("go.exe");
            return Files.exists(goBin);
        }
        
        @Override
        public Map<String, String> getEnvironmentVariables(Path devToolsDir) {
            Map<String, String> env = new HashMap<>();
            Path goRoot = devToolsDir.resolve("go");
            
            if (Files.exists(goRoot)) {
                env.put("GOROOT", goRoot.toString());
                env.put("GO111MODULE", "on");
            }
            
            return env;
        }
        
        @Override
        public String getVersion(Path projectRoot) {
            ProcessResult result = executeCommand(projectRoot, "go", "version");
            return result.exitCode == 0 ? result.output.trim() : "Unknown";
        }
        
        @Override
        public List<String> listDependencies(Path projectRoot) {
            ProcessResult result = executeCommand(projectRoot, "go", "list", "-m", "all");
            return result.exitCode == 0 ? 
                Arrays.asList(result.output.split("\n")) : 
                List.of();
        }
    }
    
    // 🐍 Python Poetry Package Manager
    public static class PoetryPackageManager extends AbstractPackageManager {
        public PoetryPackageManager() {
            super("poetry", 
                  List.of("pyproject.toml"), 
                  Map.of(
                      "install", "poetry install",
                      "build", "poetry build",
                      "test", "poetry run pytest",
                      "clean", "poetry env remove --all"
                  ));
        }
        
        @Override
        public boolean isAvailable(Path projectRoot) {
            // For now, assume poetry is available if Python is installed
            Path devToolsDir = projectRoot.getParent().resolve("dev-tools");
            Path pythonDir = devToolsDir.resolve("python");
            return Files.exists(pythonDir);
        }
        
        @Override
        public Map<String, String> getEnvironmentVariables(Path devToolsDir) {
            Map<String, String> env = new HashMap<>();
            Path pythonPath = devToolsDir.resolve("python");
            
            if (Files.exists(pythonPath)) {
                env.put("PYTHONPATH", pythonPath.toString());
            }
            
            return env;
        }
        
        @Override
        public String getVersion(Path projectRoot) {
            ProcessResult result = executeCommand(projectRoot, "poetry", "--version");
            return result.exitCode == 0 ? result.output.trim() : "Unknown";
        }
        
        @Override
        public List<String> listDependencies(Path projectRoot) {
            ProcessResult result = executeCommand(projectRoot, "poetry", "show");
            return result.exitCode == 0 ? 
                Arrays.asList(result.output.split("\n")) : 
                List.of();
        }
    }
    
    // 🦀 Rust Cargo Package Manager
    public static class CargoPackageManager extends AbstractPackageManager {
        public CargoPackageManager() {
            super("cargo", 
                  List.of("Cargo.toml"), 
                  Map.of(
                      "install", "cargo fetch",
                      "build", "cargo build",
                      "test", "cargo test",
                      "clean", "cargo clean"
                  ));
        }
        
        @Override
        public boolean isAvailable(Path projectRoot) {
            Path devToolsDir = projectRoot.getParent().resolve("dev-tools");
            Path cargoBin = devToolsDir.resolve("rust").resolve("bin").resolve("cargo.exe");
            return Files.exists(cargoBin);
        }
        
        @Override
        public Map<String, String> getEnvironmentVariables(Path devToolsDir) {
            Map<String, String> env = new HashMap<>();
            Path cargoHome = devToolsDir.resolve("rust");
            
            if (Files.exists(cargoHome)) {
                env.put("CARGO_HOME", cargoHome.toString());
            }
            
            return env;
        }
        
        @Override
        public String getVersion(Path projectRoot) {
            ProcessResult result = executeCommand(projectRoot, "cargo", "--version");
            return result.exitCode == 0 ? result.output.trim() : "Unknown";
        }
        
        @Override
        public List<String> listDependencies(Path projectRoot) {
            ProcessResult result = executeCommand(projectRoot, "cargo", "tree");
            return result.exitCode == 0 ? 
                Arrays.asList(result.output.split("\n")) : 
                List.of();
        }
    }
    
    // 🔵 .NET Package Manager
    public static class DotNetPackageManager extends AbstractPackageManager {
        public DotNetPackageManager() {
            super("dotnet", 
                  List.of("*.csproj", "*.sln", "*.fsproj", "*.vbproj"), 
                  Map.of(
                      "install", "dotnet restore",
                      "build", "dotnet build",
                      "test", "dotnet test",
                      "clean", "dotnet clean"
                  ));
        }
        
        @Override
        public boolean isAvailable(Path projectRoot) {
            Path devToolsDir = projectRoot.getParent().resolve("dev-tools");
            Path dotnetExe = devToolsDir.resolve("dotnet").resolve("dotnet.exe");
            return Files.exists(dotnetExe);
        }
        
        @Override
        public boolean hasManifest(Path projectRoot) {
            try {
                return Files.walk(projectRoot, 1)
                    .anyMatch(path -> {
                        String fileName = path.getFileName().toString();
                        return fileName.endsWith(".csproj") || 
                               fileName.endsWith(".sln") || 
                               fileName.endsWith(".fsproj") || 
                               fileName.endsWith(".vbproj");
                    });
            } catch (IOException e) {
                return false;
            }
        }
        
        @Override
        public Map<String, String> getEnvironmentVariables(Path devToolsDir) {
            Map<String, String> env = new HashMap<>();
            Path dotnetRoot = devToolsDir.resolve("dotnet");
            
            if (Files.exists(dotnetRoot)) {
                env.put("DOTNET_ROOT", dotnetRoot.toString());
            }
            
            return env;
        }
        
        @Override
        public String getVersion(Path projectRoot) {
            ProcessResult result = executeCommand(projectRoot, "dotnet", "--version");
            return result.exitCode == 0 ? result.output.trim() : "Unknown";
        }
        
        @Override
        public List<String> listDependencies(Path projectRoot) {
            ProcessResult result = executeCommand(projectRoot, "dotnet", "list", "package");
            return result.exitCode == 0 ? 
                Arrays.asList(result.output.split("\n")) : 
                List.of();
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
    
    // 🔧 Initialize package managers
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