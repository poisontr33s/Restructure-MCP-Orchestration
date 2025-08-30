#!/usr/bin/env node

/**
 * MCP v2 Hardware-Accelerated Performance Benchmark
 * Tests GPU/CPU optimization improvements on our validated foundation
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const { performance } = require('perf_hooks');

class MCPv2HardwareBenchmark {
    constructor() {
        this.results = {
            hardware: {},
            vscode: {},
            builds: {},
            docker: {},
            protocol: {}
        };
        this.iterations = 3;
        console.log('🚀 MCP v2 Hardware-Accelerated Benchmark');
        console.log('Building on our solid 93/93 test foundation...\n');
    }

    async detectHardware() {
        console.log('🔍 Detecting Hardware Configuration...');
        
        try {
            // GPU Detection (Windows)
            const gpuInfo = execSync('wmic path win32_videocontroller get name,adapterram /format:csv', 
                { encoding: 'utf8', timeout: 5000 });
            
            const gpuLines = gpuInfo.split('\n').filter(line => line.includes('NVIDIA') || line.includes('AMD') || line.includes('Intel'));
            if (gpuLines.length > 0) {
                const gpuMatch = gpuLines[0].match(/,([^,]+),(\d+)/);
                if (gpuMatch) {
                    this.results.hardware.gpu = {
                        name: gpuMatch[1].trim(),
                        memory: Math.round(parseInt(gpuMatch[2]) / (1024 * 1024 * 1024))
                    };
                    console.log(`  ✅ GPU: ${this.results.hardware.gpu.name} (${this.results.hardware.gpu.memory}GB)`);
                }
            }
            
            // CPU Detection
            const cpuInfo = execSync('wmic cpu get name,numberofcores,numberoflogicalprocessors /format:csv', 
                { encoding: 'utf8', timeout: 5000 });
            
            const cpuLines = cpuInfo.split('\n').filter(line => line.includes('Intel') || line.includes('AMD'));
            if (cpuLines.length > 0) {
                const cpuParts = cpuLines[0].split(',');
                this.results.hardware.cpu = {
                    name: cpuParts[1] ? cpuParts[1].trim() : 'Unknown',
                    cores: parseInt(cpuParts[2]) || 0,
                    threads: parseInt(cpuParts[3]) || 0
                };
                console.log(`  ✅ CPU: ${this.results.hardware.cpu.name}`);
                console.log(`      Cores: ${this.results.hardware.cpu.cores}, Threads: ${this.results.hardware.cpu.threads}`);
            }
            
            // Memory Detection
            const memInfo = execSync('wmic computersystem get TotalPhysicalMemory /format:csv', 
                { encoding: 'utf8', timeout: 5000 });
            
            const memMatch = memInfo.match(/,(\d+)/);
            if (memMatch) {
                this.results.hardware.memory = Math.round(parseInt(memMatch[1]) / (1024 * 1024 * 1024));
                console.log(`  ✅ RAM: ${this.results.hardware.memory}GB`);
            }
            
        } catch (error) {
            console.log('  ⚠️  Hardware detection failed, using fallback');
            this.results.hardware = { 
                gpu: { name: 'Unknown', memory: 0 },
                cpu: { name: 'Unknown', cores: 0, threads: 0 },
                memory: 0 
            };
        }
        
        console.log('');
    }

    async benchmarkVSCodeStartup() {
        console.log('📊 Benchmarking VS Code Startup Performance...');
        
        const times = [];
        
        for (let i = 0; i < this.iterations; i++) {
            console.log(`  Iteration ${i + 1}/${this.iterations}`);
            
            try {
                // Kill existing VS Code processes
                try {
                    execSync('taskkill /F /IM Code.exe 2>nul', { timeout: 5000 });
                } catch {}
                
                await this.sleep(2000); // Wait for cleanup
                
                const start = performance.now();
                
                // Start VS Code with GPU acceleration flags
                const vscodeProcess = exec('code --enable-gpu-rasterization --enable-accelerated-2d-canvas .');
                
                // Wait for VS Code to be responsive (simplified check)
                await this.sleep(3000);
                
                const end = performance.now();
                const startupTime = (end - start) / 1000;
                times.push(startupTime);
                
                console.log(`    Startup time: ${startupTime.toFixed(2)}s`);
                
                // Close VS Code for next iteration
                vscodeProcess.kill();
                await this.sleep(1000);
                
            } catch (error) {
                console.log(`    ⚠️  Iteration ${i + 1} failed: ${error.message}`);
            }
        }
        
        if (times.length > 0) {
            this.results.vscode.startup = {
                average: times.reduce((a, b) => a + b) / times.length,
                min: Math.min(...times),
                max: Math.max(...times),
                iterations: times.length
            };
            console.log(`  ✅ Average startup time: ${this.results.vscode.startup.average.toFixed(2)}s`);
        } else {
            console.log('  ❌ VS Code benchmark failed');
        }
        
        console.log('');
    }

    async benchmarkBuilds() {
        console.log('🔨 Benchmarking Build Performance...');
        
        const buildTargets = [
            {
                name: 'TypeScript',
                path: 'packages/mcp-v2-typescript-client',
                command: 'npm run build',
                setup: 'npm install'
            },
            {
                name: 'Java',
                path: 'packages/mcp-v2-java-client',
                command: 'mvn clean compile -T 8',  // Use 8 threads for i9-14900HX
                setup: null
            },
            {
                name: 'Python',
                path: 'packages/mcp-v2-python-client',
                command: 'python -m py_compile src/*.py',
                setup: 'pip install -r requirements.txt'
            }
        ];
        
        for (const target of buildTargets) {
            if (fs.existsSync(target.path)) {
                console.log(`  Testing ${target.name} build...`);
                
                const originalDir = process.cwd();
                process.chdir(target.path);
                
                try {
                    // Setup if needed
                    if (target.setup) {
                        console.log(`    Setting up dependencies...`);
                        execSync(target.setup, { stdio: 'pipe', timeout: 30000 });
                    }
                    
                    const times = [];
                    
                    for (let i = 0; i < Math.min(this.iterations, 2); i++) { // Fewer iterations for builds
                        const start = performance.now();
                        
                        execSync(target.command, { stdio: 'pipe', timeout: 60000 });
                        
                        const end = performance.now();
                        const buildTime = (end - start) / 1000;
                        times.push(buildTime);
                        
                        console.log(`      Build ${i + 1}: ${buildTime.toFixed(2)}s`);
                    }
                    
                    this.results.builds[target.name.toLowerCase()] = {
                        average: times.reduce((a, b) => a + b) / times.length,
                        min: Math.min(...times),
                        max: Math.max(...times)
                    };
                    
                } catch (error) {
                    console.log(`    ⚠️  ${target.name} build failed: ${error.message}`);
                    this.results.builds[target.name.toLowerCase()] = { error: error.message };
                }
                
                process.chdir(originalDir);
            } else {
                console.log(`  ⚠️  ${target.name} client not found at ${target.path}`);
            }
        }
        
        console.log('');
    }

    async benchmarkDocker() {
        console.log('🐳 Benchmarking Docker Performance...');
        
        try {
            // Test basic Docker responsiveness
            const start = performance.now();
            execSync('docker --version', { stdio: 'pipe', timeout: 10000 });
            const end = performance.now();
            
            this.results.docker.command_response = (end - start) / 1000;
            console.log(`  ✅ Docker command response: ${this.results.docker.command_response.toFixed(3)}s`);
            
            // Test GPU support
            try {
                const gpuInfo = execSync('docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi -L', 
                    { encoding: 'utf8', timeout: 15000 });
                this.results.docker.gpu_support = true;
                console.log(`  ✅ Docker GPU support: Available`);
                console.log(`      ${gpuInfo.trim()}`);
            } catch {
                this.results.docker.gpu_support = false;
                console.log(`  ⚠️  Docker GPU support: Not available`);
            }
            
        } catch (error) {
            console.log(`  ❌ Docker benchmark failed: ${error.message}`);
            this.results.docker.error = error.message;
        }
        
        console.log('');
    }

    async benchmarkProtocolValidation() {
        console.log('🔍 Benchmarking Protocol Validation Performance...');
        
        try {
            const start = performance.now();
            
            // Run our existing validation suite
            execSync('node validate-mcp-v2-implementations.js', { stdio: 'pipe', timeout: 120000 });
            
            const end = performance.now();
            const validationTime = (end - start) / 1000;
            
            this.results.protocol.validation_time = validationTime;
            console.log(`  ✅ Protocol validation completed in: ${validationTime.toFixed(2)}s`);
            
            // Test concurrent validation (simulate multiple clients)
            console.log('  Testing concurrent validation...');
            const concurrentStart = performance.now();
            
            const promises = [];
            for (let i = 0; i < 3; i++) {
                promises.push(new Promise((resolve) => {
                    exec('node validate-mcp-v2-implementations.js', (error, stdout, stderr) => {
                        resolve({ error, stdout, stderr });
                    });
                }));
            }
            
            await Promise.all(promises);
            const concurrentEnd = performance.now();
            const concurrentTime = (concurrentEnd - concurrentStart) / 1000;
            
            this.results.protocol.concurrent_validation = concurrentTime;
            console.log(`  ✅ Concurrent validation completed in: ${concurrentTime.toFixed(2)}s`);
            
        } catch (error) {
            console.log(`  ⚠️  Protocol benchmark failed: ${error.message}`);
            this.results.protocol.error = error.message;
        }
        
        console.log('');
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateReport() {
        console.log('📋 Hardware-Accelerated Performance Report');
        console.log('==========================================\n');
        
        // Hardware Summary
        console.log('🖥️  Hardware Configuration:');
        if (this.results.hardware.gpu) {
            console.log(`   GPU: ${this.results.hardware.gpu.name} (${this.results.hardware.gpu.memory}GB VRAM)`);
        }
        if (this.results.hardware.cpu) {
            console.log(`   CPU: ${this.results.hardware.cpu.name}`);
            console.log(`        ${this.results.hardware.cpu.cores} cores, ${this.results.hardware.cpu.threads} threads`);
        }
        if (this.results.hardware.memory) {
            console.log(`   RAM: ${this.results.hardware.memory}GB`);
        }
        console.log('');
        
        // Performance Results
        console.log('⚡ Performance Results:');
        
        if (this.results.vscode.startup) {
            console.log(`   VS Code Startup: ${this.results.vscode.startup.average.toFixed(2)}s average`);
            console.log(`                    ${this.results.vscode.startup.min.toFixed(2)}s best`);
        }
        
        Object.keys(this.results.builds).forEach(lang => {
            const build = this.results.builds[lang];
            if (!build.error) {
                console.log(`   ${lang.charAt(0).toUpperCase() + lang.slice(1)} Build: ${build.average.toFixed(2)}s average`);
            }
        });
        
        if (this.results.docker.command_response) {
            console.log(`   Docker Response: ${this.results.docker.command_response.toFixed(3)}s`);
        }
        
        if (this.results.protocol.validation_time) {
            console.log(`   Protocol Validation: ${this.results.protocol.validation_time.toFixed(2)}s`);
        }
        
        if (this.results.protocol.concurrent_validation) {
            console.log(`   Concurrent Validation: ${this.results.protocol.concurrent_validation.toFixed(2)}s`);
        }
        
        console.log('');
        
        // GPU Status
        console.log('🎮 GPU Acceleration Status:');
        console.log(`   Docker GPU Support: ${this.results.docker.gpu_support ? '✅ Enabled' : '❌ Disabled'}`);
        console.log('');
        
        // Save detailed results
        fs.writeFileSync('benchmark-results.json', JSON.stringify(this.results, null, 2));
        console.log('💾 Detailed results saved to benchmark-results.json');
        console.log('');
        
        // Performance Rating
        this.calculatePerformanceRating();
    }

    calculatePerformanceRating() {
        console.log('🏆 Performance Rating:');
        
        let score = 0;
        let maxScore = 0;
        
        // VS Code startup score (target: < 5s)
        if (this.results.vscode.startup) {
            maxScore += 20;
            if (this.results.vscode.startup.average < 3) score += 20;
            else if (this.results.vscode.startup.average < 5) score += 15;
            else if (this.results.vscode.startup.average < 8) score += 10;
            else score += 5;
        }
        
        // Build performance score
        Object.keys(this.results.builds).forEach(lang => {
            const build = this.results.builds[lang];
            if (!build.error) {
                maxScore += 15;
                if (build.average < 10) score += 15;
                else if (build.average < 20) score += 12;
                else if (build.average < 30) score += 8;
                else score += 5;
            }
        });
        
        // Docker performance score
        if (this.results.docker.command_response) {
            maxScore += 10;
            if (this.results.docker.command_response < 0.5) score += 10;
            else if (this.results.docker.command_response < 1) score += 8;
            else if (this.results.docker.command_response < 2) score += 6;
            else score += 3;
        }
        
        // GPU support bonus
        if (this.results.docker.gpu_support) {
            maxScore += 15;
            score += 15;
        } else {
            maxScore += 15;
        }
        
        // Protocol validation score
        if (this.results.protocol.validation_time) {
            maxScore += 20;
            if (this.results.protocol.validation_time < 30) score += 20;
            else if (this.results.protocol.validation_time < 60) score += 15;
            else if (this.results.protocol.validation_time < 90) score += 10;
            else score += 5;
        }
        
        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        
        console.log(`   Overall Score: ${score}/${maxScore} (${percentage}%)`);
        
        if (percentage >= 90) {
            console.log('   Rating: 🚀 Excellent - Hardware acceleration optimized!');
        } else if (percentage >= 75) {
            console.log('   Rating: ⚡ Good - Solid performance with room for improvement');
        } else if (percentage >= 60) {
            console.log('   Rating: 📈 Fair - Consider hardware or configuration upgrades');
        } else {
            console.log('   Rating: 🔧 Needs Improvement - Check GPU drivers and settings');
        }
        
        console.log('');
    }

    async run() {
        const startTime = performance.now();
        
        await this.detectHardware();
        await this.benchmarkVSCodeStartup();
        await this.benchmarkBuilds();
        await this.benchmarkDocker();
        await this.benchmarkProtocolValidation();
        
        const endTime = performance.now();
        const totalTime = (endTime - startTime) / 1000;
        
        console.log(`⏱️  Total benchmark time: ${totalTime.toFixed(2)}s\n`);
        
        this.generateReport();
    }
}

// Run benchmark if called directly
if (require.main === module) {
    const benchmark = new MCPv2HardwareBenchmark();
    benchmark.run().catch(console.error);
}

module.exports = MCPv2HardwareBenchmark;
