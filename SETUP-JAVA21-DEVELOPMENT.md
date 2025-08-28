# 🏴‍☠️ CAPTAIN GUTHILDA'S NATIVE JAVA 21 DEVELOPMENT ENVIRONMENT SETUP

> **"Before we sail the Java 21 seas, we must prepare our ship with the proper tools - using only the official channels!"**  
> _Java 21 + Maven + VS Code Configuration Guide (Native Installation Only)_

---

## 🚨 **IMMEDIATE ACTION REQUIRED**

The Java 21 MCP Orchestration System requires:

1. **Java 21 JDK** (official Oracle or Eclipse Adoptium installer)
2. **Maven 3.9+** (official Apache binary distribution)
3. **VS Code Java Extension Configuration** (needs JDK path)

**⚠️ This guide uses ONLY official native installers - no third-party package managers required!**

---

## 🛠️ **STEP 1: Install Java 21 JDK (Native Official Installation)**

### Option A: Eclipse Adoptium (Recommended - Official)

1. **Navigate to**: <https://adoptium.net/temurin/releases/?version=21>
2. **Select**:
   - Operating System: **Windows**
   - Architecture: **x64**
   - Package Type: **JDK**
   - Version: **21 (LTS)**
3. **Download**: `.msi` installer (e.g., `OpenJDK21U-jdk_x64_windows_hotspot_21.0.x_xx.msi`)
4. **Install**:
   - Run the `.msi` installer as Administrator
   - ✅ Check "Set JAVA_HOME variable"
   - ✅ Check "Add to PATH"
   - ✅ Check "Associate .jar files"
5. **Installation Path**: Typically `C:\Program Files\Eclipse Adoptium\jdk-21.0.x+xx-hotspot\`

### Option B: Oracle JDK (Official Alternative)

1. **Navigate to**: <https://www.oracle.com/java/technologies/downloads/#java21>
2. **Select**: Windows x64 Installer
3. **Download**: `jdk-21_windows-x64_bin.exe`
4. **Install**:
   - Run the installer as Administrator
   - Follow the installation wizard with default settings
5. **Installation Path**: Typically `C:\Program Files\Java\jdk-21\`

---

## 🛠️ **STEP 2: Install Maven (Native Official Installation)**

### Official Apache Maven Binary Distribution

1. **Navigate to**: <https://maven.apache.org/download.cgi>
2. **Download**:
   - **Binary zip archive**: `apache-maven-3.9.x-bin.zip`
   - ⚠️ Do NOT download the source archive
3. **Extract**:
   - Create directory: `C:\Program Files\Apache\`
   - Extract zip contents to: `C:\Program Files\Apache\maven\`
   - Final path should be: `C:\Program Files\Apache\maven\bin\mvn.cmd`
4. **Configure Environment Variables**:

   ```powershell
   # Run as Administrator in PowerShell

   # Set MAVEN_HOME
   [Environment]::SetEnvironmentVariable("MAVEN_HOME", "C:\Program Files\Apache\maven", "Machine")

   # Add Maven to PATH
   $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
   $newPath = $currentPath + ";C:\Program Files\Apache\maven\bin"
   [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
   ```

### Manual PATH Configuration (Alternative)

1. **Open System Properties**: `Win + R` → `sysdm.cpl` → **Advanced** tab
2. **Environment Variables** → **System Variables**
3. **New Variable**:
   - Variable name: `MAVEN_HOME`
   - Variable value: `C:\Program Files\Apache\maven`
4. **Edit PATH**:
   - Find `Path` in System Variables → **Edit**
   - **New** → Add: `%MAVEN_HOME%\bin`

---

## 🛠️ **STEP 3: Verify Native Installation**

**Restart PowerShell/Command Prompt** and verify:

```powershell
# Check Java version (should show Java 21)
java -version

# Check Java compiler
javac -version

# Check Maven version (should show 3.9+)
mvn -version

# Check environment variables
echo $env:JAVA_HOME
echo $env:MAVEN_HOME
```

**Expected Output:**

`
java version "21.0.x" 2024-xx-xx LTS
OpenJDK Runtime Environment Temurin-21.0.x+xx (build 21.0.x+xx-LTS)
OpenJDK 64-Bit Server VM Temurin-21.0.x+xx (build 21.0.x+xx-LTS, mixed mode)

javac 21.0.x

Apache Maven 3.9.x (xxxxxxx)
Maven home: C:\Program Files\Apache\maven
Java version: 21.0.x, vendor: Eclipse Adoptium
Java home: C:\Program Files\Eclipse Adoptium\jdk-21.0.x+xx-hotspot
`

---

## 🛠️ **STEP 4: Configure VS Code Java Extensions**

### Native JDK Configuration in VS Code

1. **Open VS Code User Settings**: `Ctrl + ,`
2. **Search for**: "java home"
3. **Configure java.jdt.ls.java.home**:

   ```json
   {
     "java.jdt.ls.java.home": "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.x+xx-hotspot",
     "java.configuration.runtimes": [
       {
         "name": "JavaSE-21",
         "path": "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.x+xx-hotspot",
         "default": true
       }
     ],
     "java.compile.nullAnalysis.mode": "automatic",
     "java.configuration.detectJdksAtStart": true,
     "maven.executable.path": "C:\\Program Files\\Apache\\maven\\bin\\mvn.cmd"
   }
   ```

### Required VS Code Extensions (Official)

Install from VS Code Marketplace:

- ✅ **Extension Pack for Java** (Microsoft) - `vscjava.vscode-java-pack`
- ✅ **Maven for Java** (Microsoft) - `vscjava.vscode-maven`
- ✅ **GitHub Copilot** (GitHub) - `github.copilot`

---

## 🛠️ **STEP 5: Native Installation Verification Script**

Save as `verify-native-java-setup.ps1`:

```powershell
# Captain Guthilda's Native Installation Verification
Write-Host "🏴‍☠️ Verifying Native Java 21 + Maven Installation..." -ForegroundColor Cyan

# Check Java
try {
     $javaVersion = java -version 2>&1 | Select-String "version"
     if ($javaVersion -match "21\.") {
          Write-Host "✅ Java 21 installed correctly" -ForegroundColor Green
          Write-Host "   $javaVersion" -ForegroundColor Gray
     } else {
          Write-Host "❌ Java 21 not found" -ForegroundColor Red
     }
} catch {
     Write-Host "❌ Java not installed or not in PATH" -ForegroundColor Red
}

# Check Maven
try {
     $mavenVersion = mvn -version 2>&1 | Select-String "Apache Maven"
     if ($mavenVersion -match "3\.9\.|3\.1[0-9]\.") {
          Write-Host "✅ Maven 3.9+ installed correctly" -ForegroundColor Green
          Write-Host "   $mavenVersion" -ForegroundColor Gray
     } else {
          Write-Host "❌ Maven 3.9+ not found" -ForegroundColor Red
     }
} catch {
     Write-Host "❌ Maven not installed or not in PATH" -ForegroundColor Red
}

# Check Environment Variables
Write-Host "`n🔍 Environment Variables:" -ForegroundColor Yellow
Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Gray
Write-Host "MAVEN_HOME: $env:MAVEN_HOME" -ForegroundColor Gray

Write-Host "`n🎯 If all checks pass, your native installation is ready!" -ForegroundColor Cyan
```

---

## 🔧 **TROUBLESHOOTING NATIVE INSTALLATION**

### Issue 1: "java/javac command not found"

- **Solution**: Reinstall Java with "Add to PATH" option checked
- **Manual Fix**: Add `C:\Program Files\Eclipse Adoptium\jdk-21.0.x+xx-hotspot\bin` to system PATH

### Issue 2: "mvn command not found"

- **Solution**: Verify Maven bin directory is in PATH
- **Check**: `C:\Program Files\Apache\maven\bin\mvn.cmd` exists

### Issue 3: "JAVA_HOME not set"

- **Solution**: Set via System Properties or PowerShell:

  ```powershell
  [Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-21.0.x+xx-hotspot", "Machine")
  ```

### Issue 4: VS Code Java Extension Errors

1. **Restart VS Code** after Java installation
2. **Clean Java Workspace**: `Ctrl+Shift+P` → "Java: Clean Workspace"
3. **Reload Window**: `Ctrl+Shift+P` → "Developer: Reload Window"

---

## 🎯 **NATIVE INSTALLATION COMPLETE**

Your system now has:

- ✅ **Java 21 JDK** (native official installation)
- ✅ **Maven 3.9+** (native Apache distribution)
- ✅ **Proper environment variables** (JAVA_HOME, MAVEN_HOME, PATH)
- ✅ **VS Code Java support** (configured for native JDK)

**Ready to build the Java 21 MCP Orchestration System with native tools only!** 🏴‍☠️⚓

---

*Captain Guthilda's Native Development Environment - No package managers, just official installations!*🏴‍☠️ CAPTAIN GUTHILDA'S JAVA 21 DEVELOPMENT ENVIRONMENT SETUP

> **"Before we sail the Java 21 seas, we must prepare our ship with the proper tools!"**  
> _Java 21 + Maven + VS Code Configuration Guide_

---

## **🚨** \*IMMEDIATE ACTION REQUIRED

The Java 21 MCP Orchestration System requires:

1. **Java 21 JDK** (currently not installed)
2. **Maven 3.9+** (currently not installed)
3. **VS Code Java Extension Configuration** (needs JDK path)

---

## 🛠️ **STEP 1: Install Java 21 JDK**

### Option A: Eclipse Temurin (Recommended)

```powershell
# Using Chocolatey (if available)
choco install temurin21

# OR using winget
winget install EclipseAdoptium.Temurin.21.JDK

# OR using Scoop (if available)
scoop bucket add java
scoop install temurin21-jdk
```

### Option B: Manual Installation

1. **Download**: <https://adoptium.net/temurin/releases/?version=21>
2. **Select**: Windows x64 JDK (.msi installer)
3. **Install**: Run the installer with default settings
4. **Verify**: The installer should add to PATH automatically

### Option C: Oracle JDK (Alternative)

1. **Download**: <https://www.oracle.com/java/technologies/downloads/#java21>
2. **Select**: Windows x64 Installer
3. **Install**: Follow the installation wizard

---

## 🛠️ **STEP 2: Install Maven**

### Option A: Package Manager (Recommended)

```powershell
# Using Chocolatey
choco install maven

# OR using winget
winget install Apache.Maven

# OR using Scoop
scoop install maven
```

### (Option B: Manual Installation)

1. **Download**: <https://maven.apache.org/download.cgi>
2. **Extract**: To `C:\Program Files\Apache\maven\`
3. **Add to PATH**: Add `C:\Program Files\Apache\maven\bin` to system PATH
4. **Set JAVA_HOME**: Add environment variable pointing to JDK installation

---

## 🛠️ **STEP 3: Verify Installation**

After installation, restart PowerShell and verify:

```powershell
# Check Java version (should show Java 21)
java -version

# Check Maven version (should show 3.9+)
mvn -version

# Check JAVA_HOME is set correctly
echo $env:JAVA_HOME
```

**Expected Output:**

`
java version "21.0.x" 2024-xx-xx LTS
OpenJDK Runtime Environment Temurin-21.0.x+xx (build 21.0.x+xx-LTS)
OpenJDK 64-Bit Server VM Temurin-21.0.x+xx (build 21.0.x+xx-LTS, mixed mode, sharing)

Apache Maven 3.9.x
Maven home: C:\Program Files\Apache\maven
Java version: 21.0.x, vendor: Eclipse Adoptium
`

---

## **🛠️** (_STEP 4: Configure VS Code Java Extensions_)

### Fix the Extension Issues

1. **Reload VS Code Extensions**:

   `Ctrl+Shift+P → "Developer: Reload Window"`

2. **Configure Java Runtime** in VS Code:

   `Ctrl+Shift+P → "Java: Configure Java Runtime"`

3. **Set java.configuration.runtimes** in VS Code settings.json:

   ```json
   {
     "java.configuration.runtimes": [
       {
         "name": "JavaSE-21",
         "path": "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.x+xx-hotspot",
         "default": true
       }
     ],
     "java.compile.nullAnalysis.mode": "automatic",
     "java.configuration.detectJdksAtStart": true,
     "maven.executable.path": "mvn"
   }
   ```

### Recommended VS Code Extensions

Ensure these extensions are installed and enabled:

- ✅ **Extension Pack for Java** (Microsoft)
- ✅ **Maven for Java** (Microsoft)
- ✅ **Test Runner for Java** (Microsoft)
- ✅ **Debugger for Java** (Microsoft)
- ✅ **GitHub Copilot** (GitHub)
- ✅ **GitHub Copilot Chat** (GitHub)

---

## 🛠️ **STEP 5: Test Java 21 Project Build**

Once Java and Maven are installed:

```powershell
# Navigate to project root
cd "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration"

# Clean and compile the project
mvn clean compile

# Run tests
mvn test

# Package the application
mvn package -DskipTests
```

---

## 🚀 **STEP 6: Launch the Java 21 MCP System**

After successful build:

```powershell
# Start the core orchestration service
java -jar mcp-core/target/mcp-core-*.jar

# OR use Maven to run
mvn spring-boot:run -pl mcp-core
```

---

## 🔧 **TROUBLESHOOTING COMMON ISSUES**

### Issue 1: "JAVA_HOME not set"

```powershell
# Set JAVA_HOME environment variable
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.x+xx-hotspot"
[Environment]::SetEnvironmentVariable("JAVA_HOME", $env:JAVA_HOME, "Machine")
```

### Issue 2: "Maven not found"

```powershell
# Add Maven to PATH
$env:PATH += ";C:\Program Files\Apache\maven\bin"
```

### Issue 3: VS Code Java Extension Errors

1. **Uninstall and reinstall** Extension Pack for Java
2. **Clear workspace cache**:

   `Ctrl+Shift+P → "Java: Clean Workspace"`

3. **Reload window**:

   `Ctrl+Shift+P → "Developer: Reload Window"`

### Issue 4: "Cannot read properties of undefined"

This error suggests the Java Language Server isn't properly initialized:

1. **Check Java installation** with `java -version`
2. **Restart VS Code** completely
3. **Wait for indexing** to complete (check bottom status bar)

---

## 🎯 **QUICK SETUP SCRIPT**

Save this as `setup-java21-dev.ps1` and run as Administrator:

```powershell
# Captain Guthilda's Java 21 Quick Setup Script
Write-Host "🏴‍☠️ Captain Guthilda's Java 21 Setup - Preparing for Renaissance!" -ForegroundColor Cyan

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Please run as Administrator!" -ForegroundColor Red
    exit 1
}

# Install Java 21 using winget
Write-Host "🚀 Installing Java 21 JDK..." -ForegroundColor Yellow
winget install EclipseAdoptium.Temurin.21.JDK

# Install Maven using winget
Write-Host "🚀 Installing Maven..." -ForegroundColor Yellow
winget install Apache.Maven

# Refresh environment variables
Write-Host "🔄 Refreshing environment..." -ForegroundColor Yellow
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "✅ Setup complete! Restart PowerShell and VS Code." -ForegroundColor Green
Write-Host "🎯 Next: Run 'java -version' and 'mvn -version' to verify" -ForegroundColor Cyan
```

---

## 🎉 **READY TO SAIL!**

Once Java 21 and Maven are installed:

1. ✅ **Java -version** shows Java 21
2. ✅ **mvn -version** shows Maven 3.9+
3. ✅ **VS Code Java extensions** work without errors
4. ✅ **Project builds** successfully with `mvn compile`
5. ✅ **Tests run** successfully with `mvn test`

**Then you're ready to experience the full Java 21 MCP Orchestration System!** 🏴‍☠️⚓🚀

---

_Captain Guthilda's Renaissance Development Environment - Ready for AI-Assisted Java 21 Development!_
