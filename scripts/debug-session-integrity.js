#!/usr/bin/env node

/**
 * Session Integrity Debug System
 * Systematically diagnoses and resolves authentication issues while maintaining session integrity
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

class SessionIntegrityDebugger {
    constructor() {
        this.debugLog = [];
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.logFile = path.join(__dirname, '..', 'logs', `session-integrity-debug-${this.timestamp}.json`);
        this.tempDir = path.join(os.tmpdir());
        
        // Ensure logs directory exists
        const logsDir = path.dirname(this.logFile);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
    }

    log(category, action, data) {
        const entry = {
            timestamp: new Date().toISOString(),
            category,
            action,
            data,
            session: process.env.VSCODE_PID || 'unknown'
        };
        this.debugLog.push(entry);
        console.log(`[${category}] ${action}:`, data);
    }

    async diagnoseAuthentication() {
        this.log('AUTH', 'STARTING_DIAGNOSIS', 'Checking authentication state');
        
        const authState = {
            environment: {},
            credentials: {},
            geminiState: {},
            sessionFiles: []
        };

        // Check environment variables
        const authVars = [
            'GEMINI_API_KEY',
            'GOOGLE_API_KEY', 
            'OPENAI_API_KEY',
            'ANTHROPIC_API_KEY',
            'CLAUDE_CODE_SSE_PORT',
            'ENABLE_IDE_INTEGRATION',
            'GEMINI_CLI_IDE_WORKSPACE_PATH',
            'GEMINI_CLI_IDE_SERVER_PORT'
        ];

        authVars.forEach(varName => {
            authState.environment[varName] = {
                exists: !!process.env[varName],
                value: process.env[varName] ? '[REDACTED]' : null,
                length: process.env[varName] ? process.env[varName].length : 0
            };
        });

        this.log('AUTH', 'ENVIRONMENT_CHECK', authState.environment);

        // Check for credential files
        const credentialPaths = [
            path.join(os.homedir(), '.config', 'gcloud', 'application_default_credentials.json'),
            path.join(os.homedir(), '.google', 'credentials.json'),
            path.join(os.homedir(), '.gemini', 'credentials'),
            path.join(os.homedir(), '.claude', 'config'),
            path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'globalStorage'),
        ];

        credentialPaths.forEach(credPath => {
            authState.credentials[credPath] = {
                exists: fs.existsSync(credPath),
                isDirectory: fs.existsSync(credPath) && fs.lstatSync(credPath).isDirectory(),
                modified: fs.existsSync(credPath) ? fs.statSync(credPath).mtime : null
            };
        });

        this.log('AUTH', 'CREDENTIAL_FILES', authState.credentials);

        // Check Gemini error files in temp
        const tempFiles = fs.readdirSync(this.tempDir)
            .filter(file => file.includes('gemini-client-error'))
            .map(file => ({
                name: file,
                path: path.join(this.tempDir, file),
                modified: fs.statSync(path.join(this.tempDir, file)).mtime,
                size: fs.statSync(path.join(this.tempDir, file)).size
            }))
            .sort((a, b) => b.modified - a.modified);

        authState.sessionFiles = tempFiles.slice(0, 5); // Get 5 most recent
        this.log('AUTH', 'ERROR_FILES', authState.sessionFiles);

        return authState;
    }

    async checkGeminiCliState() {
        this.log('GEMINI', 'CHECKING_CLI_STATE', 'Examining Gemini CLI installation and state');
        
        const geminiState = {
            installations: [],
            processes: [],
            versions: {},
            configs: []
        };

        // Find Gemini installations
        const possiblePaths = [
            'C:\\Users\\erdno\\AppData\\Roaming\\npm\\gemini.cmd',
            'C:\\Users\\erdno\\AppData\\Local\\pnpm\\global\\5\\.pnpm\\@google+gemini-cli@0.2.1\\node_modules\\@google\\gemini-cli\\bin\\gemini.js',
            path.join(os.homedir(), '.local', 'bin', 'gemini'),
            path.join(process.cwd(), 'node_modules', '.bin', 'gemini')
        ];

        possiblePaths.forEach(geminiPath => {
            if (fs.existsSync(geminiPath)) {
                const stats = fs.statSync(geminiPath);
                geminiState.installations.push({
                    path: geminiPath,
                    modified: stats.mtime,
                    size: stats.size,
                    isExecutable: !!(stats.mode & parseInt('111', 8))
                });
            }
        });

        this.log('GEMINI', 'INSTALLATIONS_FOUND', geminiState.installations);

        // Check running processes
        try {
            const processOutput = execSync('Get-Process -Name node,gemini -ErrorAction SilentlyContinue | ConvertTo-Json', 
                { shell: 'powershell', encoding: 'utf8' });
            const processes = JSON.parse(processOutput || '[]');
            geminiState.processes = Array.isArray(processes) ? processes : [processes];
        } catch (error) {
            this.log('GEMINI', 'PROCESS_CHECK_ERROR', error.message);
        }

        // Check versions
        geminiState.installations.forEach(installation => {
            try {
                const versionOutput = execSync(`"${installation.path}" --version`, 
                    { encoding: 'utf8', timeout: 5000 });
                geminiState.versions[installation.path] = versionOutput.trim();
            } catch (error) {
                geminiState.versions[installation.path] = `Error: ${error.message}`;
            }
        });

        this.log('GEMINI', 'VERSIONS', geminiState.versions);

        return geminiState;
    }

    async analyzeRecentErrors() {
        this.log('ERROR', 'ANALYZING_RECENT', 'Examining recent error patterns');
        
        const errorAnalysis = {
            patterns: {},
            solutions: [],
            loopDetection: false
        };

        // Analyze the current error file
        const currentErrorFile = 'c:\\Users\\erdno\\AppData\\Local\\Temp\\gemini-client-error-generateJson-api-2025-08-27T14-30-55-926Z.json';
        
        if (fs.existsSync(currentErrorFile)) {
            try {
                const errorData = JSON.parse(fs.readFileSync(currentErrorFile, 'utf8'));
                
                // Detect loop pattern
                const context = errorData.context || [];
                let emptryModelResponses = 0;
                let repetitiveContinueRequests = 0;
                
                context.forEach(turn => {
                    if (turn.role === 'model' && (!turn.parts || turn.parts.length === 0)) {
                        emptryModelResponses++;
                    }
                    if (turn.role === 'user' && turn.parts && turn.parts[0]?.text === 'Please continue.') {
                        repetitiveContinueRequests++;
                    }
                });

                errorAnalysis.patterns = {
                    emptyModelResponses: emptryModelResponses,
                    repetitiveContinueRequests,
                    totalTurns: context.length,
                    errorMessage: errorData.error?.message,
                    stackTrace: errorData.error?.stack?.split('\n')[0] // Just first line
                };

                errorAnalysis.loopDetection = repetitiveContinueRequests > 3 && emptryModelResponses > 3;

                this.log('ERROR', 'LOOP_DETECTION', {
                    isLoop: errorAnalysis.loopDetection,
                    patterns: errorAnalysis.patterns
                });

                // Generate solutions based on patterns
                if (errorAnalysis.patterns.errorMessage?.includes('parts field')) {
                    errorAnalysis.solutions.push({
                        priority: 'HIGH',
                        category: 'API_REQUEST',
                        solution: 'API request malformed - empty parts field detected',
                        action: 'Reset Gemini CLI session and clear conversation context'
                    });
                }

                if (errorAnalysis.loopDetection) {
                    errorAnalysis.solutions.push({
                        priority: 'CRITICAL',
                        category: 'SESSION_LOOP', 
                        solution: 'Conversation stuck in unproductive loop',
                        action: 'Terminate current session and start fresh conversation'
                    });
                }

            } catch (parseError) {
                this.log('ERROR', 'PARSE_FAILED', parseError.message);
            }
        }

        return errorAnalysis;
    }

    async generateKeySwapStrategy() {
        this.log('STRATEGY', 'GENERATING_SWAP', 'Creating key rotation strategy');
        
        const strategy = {
            currentState: {},
            swapMethods: [],
            sessionPreservation: [],
            fallbackOptions: []
        };

        // Current authentication method detection
        if (process.env.GEMINI_API_KEY) {
            strategy.currentState.method = 'API_KEY';
            strategy.currentState.provider = 'GEMINI';
        } else if (fs.existsSync(path.join(os.homedir(), '.config', 'gcloud'))) {
            strategy.currentState.method = 'GCLOUD_AUTH';
            strategy.currentState.provider = 'GOOGLE_CLOUD';
        }

        // Swap methods in order of preference
        strategy.swapMethods = [
            {
                method: 'ENVIRONMENT_VARIABLE',
                steps: [
                    'Export new GEMINI_API_KEY in terminal',
                    'Restart Gemini CLI process',
                    'Verify authentication with simple query'
                ],
                preservesSession: false,
                riskLevel: 'LOW'
            },
            {
                method: 'GCLOUD_REAUTH',
                steps: [
                    'Run: gcloud auth application-default login',
                    'Run: gcloud auth login',
                    'Restart Gemini CLI',
                    'Test with: echo "test" | gemini'
                ],
                preservesSession: false,
                riskLevel: 'MEDIUM'
            },
            {
                method: 'USER_ACCOUNT_SWITCH',
                steps: [
                    'Switch Google account in browser',
                    'Clear cached credentials',
                    'Re-authenticate through CLI',
                    'Verify workspace access'
                ],
                preservesSession: true,
                riskLevel: 'HIGH'
            }
        ];

        // Session preservation strategies
        strategy.sessionPreservation = [
            {
                method: 'EXPORT_CONVERSATION',
                description: 'Save current conversation state before key swap',
                command: 'echo "Export conversation history" | gemini > session-backup.md'
            },
            {
                method: 'WORKSPACE_SNAPSHOT', 
                description: 'Capture VS Code workspace state',
                command: 'code --list-extensions > extensions-backup.txt'
            },
            {
                method: 'ENVIRONMENT_BACKUP',
                description: 'Backup current environment variables',
                command: 'Get-ChildItem Env: | Out-File env-backup.txt'
            }
        ];

        // Fallback options if main methods fail
        strategy.fallbackOptions = [
            'Use different Google account',
            'Switch to OpenAI/Claude temporarily', 
            'Use Gemini web interface as bridge',
            'Create new Google Cloud project',
            'Use organization account if available'
        ];

        this.log('STRATEGY', 'SWAP_PLAN', strategy);
        return strategy;
    }

    async executeRecoveryPlan(strategy) {
        this.log('RECOVERY', 'STARTING_EXECUTION', 'Beginning systematic recovery');
        
        const recoverySteps = [];

        // Step 1: Session backup
        this.log('RECOVERY', 'STEP_1', 'Backing up current session');
        try {
            // Save current environment
            execSync('Get-ChildItem Env: | Out-File env-backup.txt', { shell: 'powershell' });
            recoverySteps.push({ step: 'ENV_BACKUP', status: 'SUCCESS' });
        } catch (error) {
            recoverySteps.push({ step: 'ENV_BACKUP', status: 'FAILED', error: error.message });
        }

        // Step 2: Kill stuck processes
        this.log('RECOVERY', 'STEP_2', 'Terminating stuck Gemini processes');
        try {
            execSync('Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force', 
                { shell: 'powershell' });
            recoverySteps.push({ step: 'KILL_PROCESSES', status: 'SUCCESS' });
        } catch (error) {
            recoverySteps.push({ step: 'KILL_PROCESSES', status: 'FAILED', error: error.message });
        }

        // Step 3: Clear temp error files
        this.log('RECOVERY', 'STEP_3', 'Clearing temporary error files');
        try {
            const tempFiles = fs.readdirSync(this.tempDir)
                .filter(file => file.includes('gemini-client-error'));
            tempFiles.forEach(file => {
                fs.unlinkSync(path.join(this.tempDir, file));
            });
            recoverySteps.push({ step: 'CLEAR_TEMP', status: 'SUCCESS', filesRemoved: tempFiles.length });
        } catch (error) {
            recoverySteps.push({ step: 'CLEAR_TEMP', status: 'FAILED', error: error.message });
        }

        return recoverySteps;
    }

    async saveReport() {
        const report = {
            timestamp: new Date().toISOString(),
            debugLog: this.debugLog,
            summary: {
                totalIssues: this.debugLog.filter(entry => entry.category === 'ERROR').length,
                criticalIssues: this.debugLog.filter(entry => entry.data?.priority === 'CRITICAL').length,
                recommendedActions: this.debugLog.filter(entry => entry.action.includes('SOLUTION')).length
            }
        };

        fs.writeFileSync(this.logFile, JSON.stringify(report, null, 2));
        this.log('SYSTEM', 'REPORT_SAVED', `Debug report saved to: ${this.logFile}`);
        
        return this.logFile;
    }

    async runFullDiagnosis() {
        console.log('🔍 Starting Session Integrity Debug Analysis...\n');
        
        const authState = await this.diagnoseAuthentication();
        const geminiState = await this.checkGeminiCliState(); 
        const errorAnalysis = await this.analyzeRecentErrors();
        const strategy = await this.generateKeySwapStrategy();
        
        // Only execute recovery if critical issues detected
        let recoverySteps = [];
        if (errorAnalysis.loopDetection || errorAnalysis.solutions.some(s => s.priority === 'CRITICAL')) {
            console.log('⚠️  Critical issues detected. Executing recovery plan...\n');
            recoverySteps = await this.executeRecoveryPlan(strategy);
        }

        const reportPath = await this.saveReport();
        
        // Print summary
        console.log('\n📊 DIAGNOSIS SUMMARY:');
        console.log('===================');
        console.log(`Authentication State: ${authState.environment.GEMINI_API_KEY?.exists ? '✅ API Key Found' : '❌ No API Key'}`);
        console.log(`Gemini Installations: ${geminiState.installations.length} found`);
        console.log(`Loop Detection: ${errorAnalysis.loopDetection ? '🔴 DETECTED' : '✅ Clean'}`);
        console.log(`Recovery Steps: ${recoverySteps.length} executed`);
        console.log(`Report Location: ${reportPath}`);
        
        return {
            authState,
            geminiState, 
            errorAnalysis,
            strategy,
            recoverySteps,
            reportPath
        };
    }
}

// Execute if run directly
if (require.main === module) {
    const sessionDebugger = new SessionIntegrityDebugger();
    sessionDebugger.runFullDiagnosis()
        .then(results => {
            console.log('\n✅ Diagnosis complete!');
            if (results.errorAnalysis.solutions.length > 0) {
                console.log('\n🔧 RECOMMENDED ACTIONS:');
                results.errorAnalysis.solutions.forEach(solution => {
                    console.log(`${solution.priority}: ${solution.solution}`);
                    console.log(`   Action: ${solution.action}\n`);
                });
            }
        })
        .catch(error => {
            console.error('❌ Diagnosis failed:', error);
            process.exit(1);
        });
}

module.exports = SessionIntegrityDebugger;
