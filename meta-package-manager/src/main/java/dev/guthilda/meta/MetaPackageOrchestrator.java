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
    
    private void initializePackageManagers() {
        log("🔧 Initializing package managers...");
        
        // Register available package managers
        packageManagers.put("maven", new MavenPackageManager(devToolsDir, repoRoot));
        packageManagers.put("bun", new BunPackageManager(devToolsDir, repoRoot));
        packageManagers.put("npm", new NpmPackageManager(devToolsDir, repoRoot));
        packageManagers.put("poetry", new PoetryPackageManager(devToolsDir, repoRoot));
        packageManagers.put("cargo", new CargoPackageManager(devToolsDir, repoRoot));
        packageManagers.put("go-mod", new GoModPackageManager(devToolsDir, repoRoot));
        
        log("✅ Package managers registered: " + String.join(", ", packageManagers.keySet()));
    }
    
    private int orchestrateAll() {
        log("🎼 Beginning orchestration of all ecosystems...");
        
        try {
            // 1. Ensure package managers are ready
            ensurePackageManagersReady();
            
            // 2. Install dependencies for each ecosystem
            installAllEcosystemDependencies();
            
            // 3. Setup development tools
            setupDevelopmentTools();
            
            log("🎉 Orchestration complete!");
            return 0;
            
        } catch (Exception e) {
            System.err.println("❌ Orchestration failed: " + e.getMessage());
            if (verbose) {
                e.printStackTrace();
            }
            return 1;
        }
    }
    
    private void ensurePackageManagersReady() {
        log("📦 Ensuring package managers are ready...");
        
        manifest.getEcosystems().forEach((ecosystem, config) -> {
            String pmName = config.getPackageManager();
            PackageManager pm = packageManagers.get(pmName);
            
            if (pm == null) {
                throw new RuntimeException("Unknown package manager: " + pmName);
            }
            
            if (!pm.isAvailable()) {
                log("📦 Setting up portable " + pmName + "...");
                pm.setupPortable();
            } else {
                log("✅ " + pmName + " is ready");
            }
        });
    }
    
    private void installAllEcosystemDependencies() {
        log("🔧 Installing dependencies for all ecosystems...");
        
        manifest.getEcosystems().forEach((ecosystem, config) -> {
            log("🔧 Installing " + ecosystem + " dependencies...");
            
            PackageManager pm = packageManagers.get(config.getPackageManager());
            pm.installDependencies(config.getDependencies());
        });
    }
    
    private void setupDevelopmentTools() {
        log("🛠️ Setting up development tools...");
        
        if (manifest.getTools() != null) {
            if (manifest.getTools().getFormatters() != null) {
                log("🎨 Setting up formatters...");
                // Setup formatters for each language
            }
            
            if (manifest.getTools().getLinters() != null) {
                log("🔍 Setting up linters...");
                // Setup linters for each language
            }
        }
    }
    
    private int installDependencies() {
        log("📦 Installing dependencies...");
        try {
            installAllEcosystemDependencies();
            return 0;
        } catch (Exception e) {
            System.err.println("❌ Installation failed: " + e.getMessage());
            return 1;
        }
    }
    
    private int updateDependencies() {
        log("🔄 Updating dependencies...");
        
        try {
            manifest.getEcosystems().forEach((ecosystem, config) -> {
                PackageManager pm = packageManagers.get(config.getPackageManager());
                pm.updateDependencies();
            });
            return 0;
        } catch (Exception e) {
            System.err.println("❌ Update failed: " + e.getMessage());
            return 1;
        }
    }
    
    private int cleanEnvironment() {
        log("🧹 Cleaning environment...");
        
        try {
            packageManagers.values().forEach(PackageManager::clean);
            return 0;
        } catch (Exception e) {
            System.err.println("❌ Clean failed: " + e.getMessage());
            return 1;
        }
    }
    
    private int validateEnvironment() {
        log("🔍 Validating environment...");
        
        try {
            boolean allValid = packageManagers.values().stream()
                .allMatch(PackageManager::validateEnvironment);
            
            if (allValid) {
                log("✅ Environment validation passed");
                return 0;
            } else {
                log("❌ Environment validation failed");
                return 1;
            }
        } catch (Exception e) {
            System.err.println("❌ Validation failed: " + e.getMessage());
            return 1;
        }
    }
    
    private void log(String message) {
        System.out.println(message);
    }
    
    /**
     * Package manager interface for consistency
     */
    public interface PackageManager {
        boolean isAvailable();
        void setupPortable();
        void installDependencies(List<String> dependencies);
        void updateDependencies();
        boolean validateEnvironment();
        void clean();
    }
    
    /**
     * Base implementation for package managers
     */
    public abstract static class BasePackageManager implements PackageManager {
        protected final Path devToolsDir;
        protected final Path repoRoot;
        protected final String name;
        
        public BasePackageManager(Path devToolsDir, Path repoRoot, String name) {
            this.devToolsDir = devToolsDir;
            this.repoRoot = repoRoot;
            this.name = name;
        }
        
        protected void executeProcess(ProcessBuilder pb) {
            try {
                pb.directory(repoRoot.toFile());
                Process process = pb.start();
                int exitCode = process.waitFor();
                
                if (exitCode != 0) {
                    throw new RuntimeException("Process failed with exit code: " + exitCode);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to execute process: " + e.getMessage(), e);
            }
        }
        
        @Override
        public void clean() {
            // Default implementation - can be overridden
            System.out.println("🧹 Cleaning " + name + " artifacts...");
        }
    }
    
    /**
     * Maven package manager implementation
     */
    public static class MavenPackageManager extends BasePackageManager {
        private final Path mavenHome;
        
        public MavenPackageManager(Path devToolsDir, Path repoRoot) {
            super(devToolsDir, repoRoot, "maven");
            this.mavenHome = devToolsDir.resolve("maven");
        }
        
        @Override
        public boolean isAvailable() {
            return Files.exists(mavenHome.resolve("bin").resolve("mvn.cmd"));
        }
        
        @Override
        public void setupPortable() {
            // Maven setup is handled by setup-portable-java21.ps1
            System.out.println("📦 Maven setup delegated to PowerShell script");
        }
        
        @Override
        public void installDependencies(List<String> dependencies) {
            System.out.println("📦 Installing Maven dependencies...");
            
            ProcessBuilder pb = new ProcessBuilder(
                mavenHome.resolve("bin").resolve("mvn.cmd").toString(),
                "clean", "install"
            );
            pb.environment().put("MAVEN_HOME", mavenHome.toString());
            executeProcess(pb);
        }
        
        @Override
        public void updateDependencies() {
            System.out.println("🔄 Updating Maven dependencies...");
            
            ProcessBuilder pb = new ProcessBuilder(
                mavenHome.resolve("bin").resolve("mvn.cmd").toString(),
                "versions:update-dependencies"
            );
            executeProcess(pb);
        }
        
        @Override
        public boolean validateEnvironment() {
            try {
                ProcessBuilder pb = new ProcessBuilder(
                    mavenHome.resolve("bin").resolve("mvn.cmd").toString(),
                    "--version"
                );
                executeProcess(pb);
                return true;
            } catch (Exception e) {
                return false;
            }
        }
        
        @Override
        public void clean() {
            super.clean();
            
            ProcessBuilder pb = new ProcessBuilder(
                mavenHome.resolve("bin").resolve("mvn.cmd").toString(),
                "clean"
            );
            executeProcess(pb);
        }
    }
    
    /**
     * Bun package manager implementation (ultra-fast JS/TS)
     */
    public static class BunPackageManager extends BasePackageManager {
        private final Path bunHome;
        
        public BunPackageManager(Path devToolsDir, Path repoRoot) {
            super(devToolsDir, repoRoot, "bun");
            this.bunHome = devToolsDir.resolve("bun");
        }
        
        @Override
        public boolean isAvailable() {
            return Files.exists(bunHome.resolve("bun.exe"));
        }
        
        @Override
        public void setupPortable() {
            System.out.println("📦 Bun setup delegated to PowerShell script");
            // Bun setup would be handled by setup-portable-bun.ps1
        }
        
        @Override
        public void installDependencies(List<String> dependencies) {
            System.out.println("📦 Installing Bun dependencies...");
            
            ProcessBuilder pb = new ProcessBuilder(
                bunHome.resolve("bun.exe").toString(),
                "install"
            );
            executeProcess(pb);
        }
        
        @Override
        public void updateDependencies() {
            System.out.println("🔄 Updating Bun dependencies...");
            
            ProcessBuilder pb = new ProcessBuilder(
                bunHome.resolve("bun.exe").toString(),
                "update"
            );
            executeProcess(pb);
        }
        
        @Override
        public boolean validateEnvironment() {
            try {
                ProcessBuilder pb = new ProcessBuilder(
                    bunHome.resolve("bun.exe").toString(),
                    "--version"
                );
                executeProcess(pb);
                return true;
            } catch (Exception e) {
                return false;
            }
        }
    }
    
    // Placeholder implementations for other package managers
    public static class NpmPackageManager extends BasePackageManager {
        public NpmPackageManager(Path devToolsDir, Path repoRoot) {
            super(devToolsDir, repoRoot, "npm");
        }
        
        @Override
        public boolean isAvailable() { return false; }
        
        @Override
        public void setupPortable() {}
        
        @Override
        public void installDependencies(List<String> dependencies) {}
        
        @Override
        public void updateDependencies() {}
        
        @Override
        public boolean validateEnvironment() { return false; }
    }
    
    public static class PoetryPackageManager extends BasePackageManager {
        public PoetryPackageManager(Path devToolsDir, Path repoRoot) {
            super(devToolsDir, repoRoot, "poetry");
        }
        
        @Override
        public boolean isAvailable() { return false; }
        
        @Override
        public void setupPortable() {}
        
        @Override
        public void installDependencies(List<String> dependencies) {}
        
        @Override
        public void updateDependencies() {}
        
        @Override
        public boolean validateEnvironment() { return false; }
    }
    
    public static class CargoPackageManager extends BasePackageManager {
        public CargoPackageManager(Path devToolsDir, Path repoRoot) {
            super(devToolsDir, repoRoot, "cargo");
        }
        
        @Override
        public boolean isAvailable() { return false; }
        
        @Override
        public void setupPortable() {}
        
        @Override
        public void installDependencies(List<String> dependencies) {}
        
        @Override
        public void updateDependencies() {}
        
        @Override
        public boolean validateEnvironment() { return false; }
    }
    
    public static class GoModPackageManager extends BasePackageManager {
        public GoModPackageManager(Path devToolsDir, Path repoRoot) {
            super(devToolsDir, repoRoot, "go-mod");
        }
        
        @Override
        public boolean isAvailable() { return false; }
        
        @Override
        public void setupPortable() {}
        
        @Override
        public void installDependencies(List<String> dependencies) {}
        
        @Override
        public void updateDependencies() {}
        
        @Override
        public boolean validateEnvironment() { return false; }
    }
}
