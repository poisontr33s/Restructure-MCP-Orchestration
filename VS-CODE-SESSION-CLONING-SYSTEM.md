# VS CODE SESSION CLONING SYSTEM
*Captain Guthilda's Advanced Session Replication & Management Protocol*

## 🎯 Overview

This system provides comprehensive VS Code session cloning capabilities, allowing you to:
- **Clone your current VS Code session** with open files, workspace state, and configuration
- **Create quick backup sessions** for rapid testing and development
- **Manage multiple session snapshots** with easy restoration
- **Preserve terminal history and commands** for seamless workflow continuity

## 🚀 Quick Start

### Create a Session Clone Now
```powershell
# Full session clone (recommended)
.\scripts\clone-vscode-session.ps1

# Quick clone for testing
.\scripts\quick-clone-session.ps1 -LaunchImmediately

# Manage existing sessions
.\scripts\session-manager.ps1 -Action list
```

## 📁 System Components

### 1. Main Session Cloner (`clone-vscode-session.ps1`)
**Full-featured session replication with advanced state detection**

**Features:**
- Detects VS Code workspace storage and extracts session state
- Attempts to read SQLite database for precise open file detection
- Creates comprehensive workspace files with all session metadata
- Backs up terminal history and common commands
- Copies extension state and VS Code configuration
- Generates detailed restoration guides
- Automatic launch of cloned session

**Usage:**
```powershell
# Basic clone
.\scripts\clone-vscode-session.ps1

# Advanced options
.\scripts\clone-vscode-session.ps1 -Verbose -CopyExtensionState -PreserveTerminals

# Clone without auto-launch
.\scripts\clone-vscode-session.ps1 -OpenInNewWindow:$false
```

### 2. Quick Session Clone (`quick-clone-session.ps1`)
**Lightweight cloning for rapid iteration and testing**

**Features:**
- Fast detection of recently modified files
- Focuses on key project files and recent development work
- Minimal overhead with quick launch times
- Perfect for temporary testing sessions

**Usage:**
```powershell
# Quick clone with immediate launch
.\scripts\quick-clone-session.ps1 -LaunchImmediately

# Create clone for later use
.\scripts\quick-clone-session.ps1
```

### 3. Session Manager (`session-manager.ps1`)
**Centralized management of all session clones**

**Features:**
- List all available session backups
- Interactive restoration interface
- Automated cleanup of old sessions
- Support for both full and quick sessions

**Usage:**
```powershell
# List all sessions
.\scripts\session-manager.ps1 -Action list

# Interactive restore
.\scripts\session-manager.ps1 -Action restore -Interactive

# Restore specific session
.\scripts\session-manager.ps1 -Action restore -SessionId 20250829-214500

# Clean up old sessions (keep last 5)
.\scripts\session-manager.ps1 -Action clean -KeepLast 5

# Create new backup
.\scripts\session-manager.ps1 -Action create
```

## 🔧 What Gets Cloned

### 📄 Files and Workspace
- **Open files**: Detected from VS Code state database and recent activity
- **Workspace configuration**: Multi-folder workspace setup preserved
- **Key project files**: Always includes README, package.json, configuration files
- **Recent development files**: Based on modification time and file patterns

### ⚙️ VS Code State
- **Extension state**: Workspace-specific extension data
- **Editor settings**: Custom workspace and user settings
- **Window layout**: Preserved through workspace configuration
- **Tasks and launch configs**: Project-specific VS Code tasks

### 💻 Terminal State
- **PowerShell history**: Complete command history backup
- **Common commands**: Pre-generated command reference for project
- **Environment variables**: Current development environment context

### 📚 Documentation
- **Restoration guides**: Step-by-step instructions for session recovery
- **Session metadata**: Creation time, file counts, and status information
- **Command references**: Quick access to project-specific commands

## 📊 File Structure

When you create a session clone, the following files are generated:

```
📁 Workspace Root/
├── 📄 session-clone-YYYYMMDD-HHMMSS.code-workspace    # Full workspace file
├── 📄 quick-session-YYYYMMDD-HHMMSS.code-workspace    # Quick workspace file
├── 📄 QUICK-SESSION-YYYYMMDD-HHMMSS.md                # Quick session reference
├── 📁 session-backup-YYYYMMDD-HHMMSS/                 # Full backup directory
│   ├── 📄 RESTORATION_GUIDE.md                        # Detailed restore instructions
│   ├── 📄 powershell_history.txt                      # Terminal command history
│   ├── 📄 common_commands.ps1                         # Project command reference
│   ├── 📄 settings.json                               # VS Code user settings
│   ├── 📄 keybindings.json                            # Custom keybindings
│   └── 📁 workspace-state/                            # VS Code workspace data
└── 📁 scripts/
    ├── 📄 launch-cloned-session-YYYYMMDD-HHMMSS.ps1   # Auto-generated launcher
    └── 📄 quick-launch-YYYYMMDD-HHMMSS.ps1             # Quick launcher
```

## 🎭 Use Cases

### 1. **Safe Experimentation**
```powershell
# Before making risky changes
.\scripts\quick-clone-session.ps1 -LaunchImmediately
# Make experimental changes in the new window
# Keep original session untouched
```

### 2. **Parallel Development**
```powershell
# Full clone for feature branch work
.\scripts\clone-vscode-session.ps1
# Work on feature in new session
# Continue main work in original session
```

### 3. **Session Recovery**
```powershell
# If VS Code crashes or behaves unexpectedly
.\scripts\session-manager.ps1 -Action restore -Interactive
# Choose from available backups
# Restore to last known good state
```

### 4. **Team Collaboration**
```powershell
# Create session backup before pair programming
.\scripts\clone-vscode-session.ps1 -OpenInNewWindow:$false
# Share session state with team member
# Restore your setup after collaboration
```

### 5. **Development Environment Snapshots**
```powershell
# Before major dependency updates
.\scripts\clone-vscode-session.ps1
# Update dependencies in original session
# Fall back to backup if issues arise
```

## ⚡ Performance Considerations

### Full Clone vs Quick Clone

| Feature | Full Clone | Quick Clone |
|---------|------------|-------------|
| **Speed** | 10-15 seconds | 2-3 seconds |
| **File Detection** | SQLite database + fallback | Pattern-based |
| **State Preservation** | Complete | Essential only |
| **Backup Size** | 5-50 MB | < 1 MB |
| **Use Case** | Long-term backup | Quick testing |

### System Requirements
- **Storage**: 10-100 MB per full backup (depending on workspace size)
- **Memory**: Minimal impact (< 50 MB during cloning)
- **Dependencies**: PowerShell 5.1+, VS Code, optional SQLite3

## 🔍 Troubleshooting

### Common Issues

1. **"Workspace storage not found"**
   ```powershell
   # Verify VS Code is running with the correct workspace
   # Check workspace root path is correct
   .\scripts\clone-vscode-session.ps1 -Verbose
   ```

2. **"No files detected"**
   ```powershell
   # Use quick clone as fallback
   .\scripts\quick-clone-session.ps1
   ```

3. **"Launch script fails"**
   ```powershell
   # Manual launch alternative
   code --new-window "session-clone-YYYYMMDD-HHMMSS.code-workspace"
   ```

4. **"SQLite errors"**
   ```powershell
   # SQLite is optional - cloning will use fallback methods
   # Install SQLite3 for better file detection (optional)
   ```

### Validation
```powershell
# Test the session cloning system
.\scripts\session-manager.ps1 -Action list
.\scripts\quick-clone-session.ps1 -Verbose
```

## 🔧 Advanced Configuration

### Customizing File Detection
Edit the file patterns in `quick-clone-session.ps1`:
```powershell
$patterns = @("*.ts", "*.js", "*.json", "*.md", "*.yml", "*.ps1", "*.py", "*.java")
```

### Adjusting Cleanup Settings
```powershell
# Keep more session backups
.\scripts\session-manager.ps1 -Action clean -KeepLast 10

# Automatic cleanup (add to your workflow)
.\scripts\session-manager.ps1 -Action clean -KeepLast 3
```

### Integration with Git
```bash
# Add to .gitignore to avoid committing session files
echo "session-backup-*/" >> .gitignore
echo "session-clone-*.code-workspace" >> .gitignore
echo "quick-session-*.code-workspace" >> .gitignore
echo "QUICK-SESSION-*.md" >> .gitignore
```

## 🌟 Best Practices

1. **Regular Backups**: Create session clones before major changes
2. **Cleanup Management**: Run cleanup weekly to manage disk space
3. **Testing Workflow**: Use quick clones for experimental changes
4. **Documentation**: Use session references to track development context
5. **Team Sharing**: Share workspace files (not full backups) for collaboration

## 🎯 Future Enhancements

Potential improvements being considered:
- **VS Code Extension**: Native integration with VS Code UI
- **Cloud Sync**: Session backup to cloud storage
- **Git Integration**: Automatic session snapshots on commits
- **Advanced Filtering**: Smart file selection based on project context
- **Session Diffing**: Compare sessions to see what changed

---

## 🏴‍☠️ Captain Guthilda's Final Words

*"With these tools, ye shall never lose a session again! Whether ye be sailin' into stormy code changes or need to clone yer development environment for a crew member, this system has ye covered. Use it wisely, and may yer VS Code sessions be forever preserved!"*

---

**Need help?** Check the restoration guides in your session backups or run any script with `-Verbose` for detailed output.
