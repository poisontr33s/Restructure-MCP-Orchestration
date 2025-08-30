#!/usr/bin/env node

/**
 * Comprehensive validation script for MCP v2 protocol implementations.
 * 
 * This script validates:
 * 1. Protocol specifications and schemas
 * 2. TypeScript client library
 * 3. Java client library
 * 4. Python client library
 * 5. Shared infrastructure
 * 6. Documentation completeness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MCPv2Validator {
    constructor() {
        this.results = {
            protocol: { passed: 0, failed: 0, tests: [] },
            typescript: { passed: 0, failed: 0, tests: [] },
            java: { passed: 0, failed: 0, tests: [] },
            python: { passed: 0, failed: 0, tests: [] },
            infrastructure: { passed: 0, failed: 0, tests: [] },
            documentation: { passed: 0, failed: 0, tests: [] }
        };
        this.rootDir = process.cwd();
    }

    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            error: '\x1b[31m',
            warning: '\x1b[33m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[level]}[${timestamp}] ${message}${colors.reset}`);
    }

    addTest(category, name, passed, details = '') {
        const test = { name, passed, details };
        this.results[category].tests.push(test);
        if (passed) {
            this.results[category].passed++;
            this.log(`✓ ${name}`, 'success');
        } else {
            this.results[category].failed++;
            this.log(`✗ ${name} - ${details}`, 'error');
        }
    }

    fileExists(filePath) {
        try {
            return fs.existsSync(filePath);
        } catch (error) {
            return false;
        }
    }

    readJsonFile(filePath) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            return null;
        }
    }

    runCommand(command, cwd = this.rootDir, timeout = 30000) {
        try {
            const result = execSync(command, { 
                cwd, 
                timeout,
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            return { success: true, output: result };
        } catch (error) {
            return { success: false, error: error.message, output: error.stdout || error.stderr };
        }
    }

    async validateProtocolSpecifications() {
        this.log('Validating MCP v2 Protocol Specifications...', 'info');

        const specDir = path.join(this.rootDir, 'packages', 'mcp-v2-protocol');
        
        // Check if protocol spec directory exists
        this.addTest('protocol', 'Protocol specification directory exists', 
            this.fileExists(specDir));

        // Check schema files
        const schemaFiles = [
            'schemas/request.json',
            'schemas/response.json', 
            'schemas/context.json',
            'schemas/metadata.json'
        ];

        for (const file of schemaFiles) {
            const filePath = path.join(specDir, file);
            const exists = this.fileExists(filePath);
            this.addTest('protocol', `Schema file ${file} exists`, exists);

            if (exists) {
                const schema = this.readJsonFile(filePath);
                this.addTest('protocol', `Schema ${file} is valid JSON`, 
                    schema !== null, schema ? '' : 'Invalid JSON format');
            }
        }

        // Check transport definitions
        const transportFiles = [
            'transport/http-jsonrpc.yml',
            'transport/websocket.yml',
            'transport/grpc.proto'
        ];

        for (const file of transportFiles) {
            const filePath = path.join(specDir, file);
            this.addTest('protocol', `Transport definition ${file} exists`, 
                this.fileExists(filePath));
        }

        // Check example files
        const exampleFiles = [
            'examples/common-operations.json',
            'examples/advanced-workflows.json'
        ];

        for (const file of exampleFiles) {
            const filePath = path.join(specDir, file);
            const exists = this.fileExists(filePath);
            this.addTest('protocol', `Example file ${file} exists`, exists);

            if (exists) {
                const examples = this.readJsonFile(filePath);
                this.addTest('protocol', `Example ${file} is valid JSON`, 
                    examples !== null);
            }
        }

        // Check protocol README
        const readmePath = path.join(specDir, 'README.md');
        this.addTest('protocol', 'Protocol README exists', this.fileExists(readmePath));
    }

    async validateTypeScriptClient() {
        this.log('Validating TypeScript MCP v2 Client...', 'info');

        const clientDir = path.join(this.rootDir, 'packages', 'mcp-v2-typescript-client');
        
        // Check directory structure
        this.addTest('typescript', 'TypeScript client directory exists', 
            this.fileExists(clientDir));

        // Check package.json
        const packagePath = path.join(clientDir, 'package.json');
        const packageExists = this.fileExists(packagePath);
        this.addTest('typescript', 'package.json exists', packageExists);

        if (packageExists) {
            const packageJson = this.readJsonFile(packagePath);
            this.addTest('typescript', 'package.json is valid', packageJson !== null);
            
            if (packageJson) {
                this.addTest('typescript', 'Package has correct name', 
                    packageJson.name === '@mcp-v2/typescript-client');
                this.addTest('typescript', 'Package has correct version', 
                    packageJson.version === '2.0.0');
                this.addTest('typescript', 'Package has dependencies', 
                    packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0);
            }
        }

        // Check TypeScript configuration
        const tsconfigPath = path.join(clientDir, 'tsconfig.json');
        this.addTest('typescript', 'tsconfig.json exists', this.fileExists(tsconfigPath));

        // Check source files
        const sourceFiles = [
            'src/index.ts',
            'src/types/index.ts',
            'src/client/index.ts',
            'src/transport/index.ts',
            'src/context/index.ts',
            'src/utils/index.ts'
        ];

        for (const file of sourceFiles) {
            const filePath = path.join(clientDir, file);
            this.addTest('typescript', `Source file ${file} exists`, 
                this.fileExists(filePath));
        }

        // Try to build the TypeScript client
        if (this.fileExists(clientDir)) {
            this.log('Building TypeScript client...', 'info');
            const buildResult = this.runCommand('npm run build', clientDir);
            this.addTest('typescript', 'TypeScript client builds successfully', 
                buildResult.success, buildResult.error || '');

            // Check for build artifacts
            if (buildResult.success) {
                const distFiles = [
                    'dist/index.js',
                    'dist/index.d.ts',
                    'dist/index.mjs',
                    'dist/index.d.mts'
                ];

                for (const file of distFiles) {
                    const filePath = path.join(clientDir, file);
                    this.addTest('typescript', `Build artifact ${file} exists`, 
                        this.fileExists(filePath));
                }
            }

            // Try to run tests
            this.log('Running TypeScript tests...', 'info');
            const testResult = this.runCommand('npx vitest run', clientDir);
            this.addTest('typescript', 'TypeScript tests pass', 
                testResult.success, testResult.error || '');
        }

        // Check README
        const readmePath = path.join(clientDir, 'README.md');
        this.addTest('typescript', 'TypeScript client README exists', 
            this.fileExists(readmePath));
    }

    async validateJavaClient() {
        this.log('Validating Java MCP v2 Client...', 'info');

        const clientDir = path.join(this.rootDir, 'packages', 'mcp-v2-java-client');
        
        // Check directory structure
        this.addTest('java', 'Java client directory exists', 
            this.fileExists(clientDir));

        // Check pom.xml
        const pomPath = path.join(clientDir, 'pom.xml');
        this.addTest('java', 'pom.xml exists', this.fileExists(pomPath));

        // Check source structure
        const sourceDir = path.join(clientDir, 'src/main/java/com/mcp/v2/client');
        this.addTest('java', 'Java source directory exists', 
            this.fileExists(sourceDir));

        // Check key Java files
        const javaFiles = [
            'src/main/java/com/mcp/v2/client/types/MCPTypes.java',
            'src/main/java/com/mcp/v2/client/MCPClient.java',
            'src/main/java/com/mcp/v2/client/impl/BaseMCPClient.java',
            'src/main/java/com/mcp/v2/client/factory/MCPClientFactory.java',
            'src/main/java/com/mcp/v2/client/transport/MCPTransport.java',
            'src/main/java/com/mcp/v2/client/transport/http/HttpTransport.java'
        ];

        for (const file of javaFiles) {
            const filePath = path.join(clientDir, file);
            this.addTest('java', `Java file ${file} exists`, 
                this.fileExists(filePath));
        }

        // Check test directory
        const testDir = path.join(clientDir, 'src/test/java');
        this.addTest('java', 'Java test directory exists', 
            this.fileExists(testDir));

        // Try to compile the Java client
        if (this.fileExists(clientDir) && this.fileExists(pomPath)) {
            this.log('Compiling Java client...', 'info');
            
            // Check if Maven is available
            const mvnCheck = this.runCommand('mvn --version');
            if (mvnCheck.success) {
                const compileResult = this.runCommand('mvn clean compile -q', clientDir, 60000);
                this.addTest('java', 'Java client compiles successfully', 
                    compileResult.success, compileResult.error || '');

                if (compileResult.success) {
                    // Try to run tests
                    this.log('Running Java tests...', 'info');
                    const testResult = this.runCommand('mvn test -q', clientDir, 60000);
                    this.addTest('java', 'Java tests pass', 
                        testResult.success, testResult.error || '');
                }
            } else {
                this.addTest('java', 'Maven available for build', false, 
                    'Maven not found in PATH');
            }
        }

        // Check README
        const readmePath = path.join(clientDir, 'README.md');
        this.addTest('java', 'Java client README exists', 
            this.fileExists(readmePath));
    }

    async validatePythonClient() {
        this.log('Validating Python MCP v2 Client...', 'info');

        const clientDir = path.join(this.rootDir, 'packages', 'mcp-v2-python-client');
        
        // Check directory structure
        this.addTest('python', 'Python client directory exists', 
            this.fileExists(clientDir));

        // Check pyproject.toml
        const pyprojectPath = path.join(clientDir, 'pyproject.toml');
        this.addTest('python', 'pyproject.toml exists', this.fileExists(pyprojectPath));

        // Check source structure
        const sourceDir = path.join(clientDir, 'src/mcp_v2_client');
        this.addTest('python', 'Python source directory exists', 
            this.fileExists(sourceDir));

        // Check key Python files
        const pythonFiles = [
            'src/mcp_v2_client/__init__.py',
            'src/mcp_v2_client/types.py',
            'src/mcp_v2_client/client.py',
            'src/mcp_v2_client/factory.py',
            'src/mcp_v2_client/exceptions.py',
            'src/mcp_v2_client/transport/__init__.py',
            'src/mcp_v2_client/transport/base.py',
            'src/mcp_v2_client/transport/http.py',
            'src/mcp_v2_client/transport/websocket.py'
        ];

        for (const file of pythonFiles) {
            const filePath = path.join(clientDir, file);
            this.addTest('python', `Python file ${file} exists`, 
                this.fileExists(filePath));
        }

        // Check test directory
        const testDir = path.join(clientDir, 'tests');
        this.addTest('python', 'Python test directory exists', 
            this.fileExists(testDir));

        // Try to validate Python syntax
        if (this.fileExists(clientDir)) {
            this.log('Validating Python syntax...', 'info');
            
            // Check if Python is available
            const pythonCheck = this.runCommand('python --version');
            if (pythonCheck.success) {
                // Try to compile Python files
                let syntaxValid = true;
                for (const file of pythonFiles) {
                    const filePath = path.join(clientDir, file);
                    if (this.fileExists(filePath)) {
                        const compileResult = this.runCommand(`python -m py_compile "${filePath}"`);
                        if (!compileResult.success) {
                            syntaxValid = false;
                            this.log(`Syntax error in ${file}: ${compileResult.error}`, 'error');
                            break;
                        }
                    }
                }
                this.addTest('python', 'Python files have valid syntax', syntaxValid);
            } else {
                this.addTest('python', 'Python available for validation', false, 
                    'Python not found in PATH');
            }
        }

        // Check README
        const readmePath = path.join(clientDir, 'README.md');
        this.addTest('python', 'Python client README exists', 
            this.fileExists(readmePath));
    }

    async validateSharedInfrastructure() {
        this.log('Validating Shared Infrastructure...', 'info');

        const infraDir = path.join(this.rootDir, 'packages', 'mcp-v2-infrastructure');
        
        // Check directory structure
        this.addTest('infrastructure', 'Infrastructure directory exists', 
            this.fileExists(infraDir));

        // Check Docker Compose files
        const dockerFiles = [
            'docker-compose.yml',
            'docker-compose.dev.yml',
            'docker-compose.prod.yml'
        ];

        for (const file of dockerFiles) {
            const filePath = path.join(infraDir, file);
            this.addTest('infrastructure', `Docker Compose file ${file} exists`, 
                this.fileExists(filePath));
        }

        // Check environment files
        const envFiles = [
            '.env.example'
        ];

        for (const file of envFiles) {
            const filePath = path.join(infraDir, file);
            this.addTest('infrastructure', `Environment file ${file} exists`, 
                this.fileExists(filePath));
        }

        // Check scripts
        const scriptFiles = [
            'scripts/health-check.sh',
            'scripts/backup.sh'
        ];

        for (const file of scriptFiles) {
            const filePath = path.join(infraDir, file);
            this.addTest('infrastructure', `Script ${file} exists`, 
                this.fileExists(filePath));
        }

        // Check deployment guide
        const deploymentGuide = path.join(infraDir, 'DEPLOYMENT_GUIDE.md');
        this.addTest('infrastructure', 'Deployment guide exists', 
            this.fileExists(deploymentGuide));

        // Validate Docker Compose syntax
        if (this.fileExists(infraDir)) {
            const dockerCheck = this.runCommand('docker-compose --version');
            if (dockerCheck.success) {
                for (const file of dockerFiles) {
                    const filePath = path.join(infraDir, file);
                    if (this.fileExists(filePath)) {
                        const validateResult = this.runCommand(
                            `docker-compose -f "${filePath}" config`, infraDir
                        );
                        this.addTest('infrastructure', 
                            `Docker Compose ${file} syntax is valid`, 
                            validateResult.success, validateResult.error || '');
                    }
                }
            } else {
                this.addTest('infrastructure', 'Docker Compose available for validation', 
                    false, 'docker-compose not found in PATH');
            }
        }
    }

    async validateDocumentation() {
        this.log('Validating Documentation...', 'info');

        // Check root documentation
        const rootDocs = [
            'README.md',
            'CLAUDE-COPILOT-COLLABORATION.md',
            'ARTIFACT-V4-MIGRATION.md'
        ];

        for (const file of rootDocs) {
            const filePath = path.join(this.rootDir, file);
            this.addTest('documentation', `Root documentation ${file} exists`, 
                this.fileExists(filePath));
        }

        // Check docs directory
        const docsDir = path.join(this.rootDir, 'docs');
        this.addTest('documentation', 'Documentation directory exists', 
            this.fileExists(docsDir));

        if (this.fileExists(docsDir)) {
            const docFiles = [
                'agents.md',
                'AUTOMATION_SUMMARY.md',
                'AUTONOMOUS_CAPABILITY_FRAMEWORK.md',
                'CAPTAIN_GUTHILDA_UNIFIED_GUIDE.md',
                'CLAUDE_CODE_CHECKER.md',
                'EMERGENCY_CONSOLIDATION_PROTOCOL.md',
                'GEMINI_INTEGRATION_GUIDE.md',
                'UNIVERSAL_BRANCH_MANAGEMENT.md'
            ];

            for (const file of docFiles) {
                const filePath = path.join(docsDir, file);
                this.addTest('documentation', `Documentation file ${file} exists`, 
                    this.fileExists(filePath));
            }
        }

        // Check component README files
        const componentDirs = [
            'packages/mcp-v2-protocol',
            'packages/mcp-v2-typescript-client',
            'packages/mcp-v2-java-client',
            'packages/mcp-v2-python-client',
            'packages/mcp-v2-infrastructure'
        ];

        for (const dir of componentDirs) {
            const readmePath = path.join(this.rootDir, dir, 'README.md');
            this.addTest('documentation', `${dir} README exists`, 
                this.fileExists(readmePath));
        }
    }

    printSummary() {
        this.log('\n=== MCP v2 Validation Summary ===', 'info');
        
        let totalPassed = 0;
        let totalFailed = 0;

        for (const [category, results] of Object.entries(this.results)) {
            const { passed, failed } = results;
            totalPassed += passed;
            totalFailed += failed;
            
            const status = failed === 0 ? '✓' : '✗';
            const color = failed === 0 ? 'success' : 'error';
            
            this.log(`${status} ${category.toUpperCase()}: ${passed} passed, ${failed} failed`, color);
        }

        this.log(`\nOVERALL: ${totalPassed} passed, ${totalFailed} failed`, 
            totalFailed === 0 ? 'success' : 'error');

        if (totalFailed > 0) {
            this.log('\nFailed Tests:', 'error');
            for (const [category, results] of Object.entries(this.results)) {
                const failedTests = results.tests.filter(test => !test.passed);
                if (failedTests.length > 0) {
                    this.log(`\n${category.toUpperCase()}:`, 'error');
                    for (const test of failedTests) {
                        this.log(`  ✗ ${test.name}: ${test.details}`, 'error');
                    }
                }
            }
        }

        return totalFailed === 0;
    }

    async run() {
        this.log('Starting MCP v2 Comprehensive Validation...', 'info');
        
        await this.validateProtocolSpecifications();
        await this.validateTypeScriptClient();
        await this.validateJavaClient();
        await this.validatePythonClient();
        await this.validateSharedInfrastructure();
        await this.validateDocumentation();
        
        const allPassed = this.printSummary();
        
        if (allPassed) {
            this.log('\n🎉 All MCP v2 implementations are valid and functional!', 'success');
            process.exit(0);
        } else {
            this.log('\n❌ Some validations failed. Please check the details above.', 'error');
            process.exit(1);
        }
    }
}

// Run the validator
if (require.main === module) {
    const validator = new MCPv2Validator();
    validator.run().catch(error => {
        console.error('Validation failed with error:', error);
        process.exit(1);
    });
}

module.exports = MCPv2Validator;
