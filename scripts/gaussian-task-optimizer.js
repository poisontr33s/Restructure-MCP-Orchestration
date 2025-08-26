#!/usr/bin/env node
/**
 * 📊✨ GAUSSIAN TASK OPTIMIZER ✨📊
 * μ=50, σ=10 - Optimize task distribution using normal distribution
 * Mathematical load balancing with statistical precision
 */

const fs = require('fs').promises;

class GaussianTaskOptimizer {
    constructor(options = {}) {
        this.mean = options.mean || 50;
        this.stddev = options.stddev || 10;
        this.sampleSize = options.sampleSize || 100;
        
        console.log('📊 Gaussian Task Optimizer Initializing...');
        console.log(`   μ (mean) = ${this.mean}`);
        console.log(`   σ (standard deviation) = ${this.stddev}`);
        console.log(`   Sample size = ${this.sampleSize}`);
    }

    // Box-Muller transformation for generating normal distribution
    generateNormalDistribution() {
        const samples = [];
        
        for (let i = 0; i < this.sampleSize; i += 2) {
            // Box-Muller transformation
            const u1 = Math.random();
            const u2 = Math.random();
            
            const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
            
            // Transform to desired mean and standard deviation
            const x0 = z0 * this.stddev + this.mean;
            const x1 = z1 * this.stddev + this.mean;
            
            samples.push(x0);
            if (i + 1 < this.sampleSize) {
                samples.push(x1);
            }
        }
        
        return samples.slice(0, this.sampleSize);
    }

    // Calculate statistical properties
    calculateStatistics(samples) {
        const n = samples.length;
        const sum = samples.reduce((a, b) => a + b, 0);
        const mean = sum / n;
        
        const variance = samples.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
        const stddev = Math.sqrt(variance);
        
        const sorted = [...samples].sort((a, b) => a - b);
        const median = n % 2 === 0 
            ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
            : sorted[Math.floor(n/2)];
        
        const min = Math.min(...samples);
        const max = Math.max(...samples);
        
        return {
            count: n,
            sum: sum,
            mean: mean,
            median: median,
            variance: variance,
            stddev: stddev,
            min: min,
            max: max,
            range: max - min
        };
    }

    // Create task distribution bins
    createTaskBins(samples) {
        console.log('📦 Creating task distribution bins...');
        
        const stats = this.calculateStatistics(samples);
        const numBins = Math.ceil(Math.sqrt(this.sampleSize)); // Square root rule
        const binWidth = stats.range / numBins;
        
        const bins = [];
        for (let i = 0; i < numBins; i++) {
            const binStart = stats.min + (i * binWidth);
            const binEnd = binStart + binWidth;
            
            bins.push({
                id: i,
                range: [binStart, binEnd],
                center: binStart + (binWidth / 2),
                tasks: [],
                load_factor: 0,
                mathematical_weight: Math.exp(-Math.pow(binStart + binWidth/2 - this.mean, 2) / (2 * Math.pow(this.stddev, 2)))
            });
        }
        
        // Distribute samples into bins
        samples.forEach((sample, index) => {
            const binIndex = Math.min(Math.floor((sample - stats.min) / binWidth), numBins - 1);
            bins[binIndex].tasks.push({
                id: index,
                value: sample,
                priority: Math.round((sample - stats.min) / stats.range * 10), // 0-10 priority
                execution_time: Math.abs(sample - this.mean) / this.stddev, // Normalized time
                complexity: Math.ceil(Math.abs(sample - this.mean) / 5) // Complexity based on deviation
            });
            bins[binIndex].load_factor++;
        });
        
        console.log(`   📊 Created ${numBins} bins with width ${binWidth.toFixed(2)}`);
        console.log(`   🎯 Load factors: ${bins.map(b => b.load_factor).join(', ')}`);
        
        return { bins, stats, binWidth };
    }

    // Optimize task execution order
    optimizeExecution(bins) {
        console.log('⚡ Optimizing task execution order...');
        
        // Sort bins by mathematical weight (normal distribution peak gets priority)
        const sortedBins = [...bins].sort((a, b) => b.mathematical_weight - a.mathematical_weight);
        
        const executionPlan = [];
        let totalExecutionTime = 0;
        
        sortedBins.forEach((bin, binIndex) => {
            // Sort tasks within bin by priority and complexity
            const sortedTasks = bin.tasks.sort((a, b) => {
                if (a.priority !== b.priority) return b.priority - a.priority; // Higher priority first
                return a.complexity - b.complexity; // Lower complexity first for ties
            });
            
            sortedTasks.forEach((task, taskIndex) => {
                const executionOrder = executionPlan.length;
                const scheduledTime = totalExecutionTime;
                
                executionPlan.push({
                    execution_order: executionOrder,
                    bin_id: bin.id,
                    task_id: task.id,
                    scheduled_time: scheduledTime,
                    estimated_duration: task.execution_time,
                    priority: task.priority,
                    complexity: task.complexity,
                    value: task.value,
                    mathematical_weight: bin.mathematical_weight,
                    gaussian_position: Math.abs(task.value - this.mean) / this.stddev // How many σ from mean
                });
                
                totalExecutionTime += task.execution_time;
            });
        });
        
        console.log(`   ⏱️ Total execution time: ${totalExecutionTime.toFixed(2)} time units`);
        console.log(`   📈 Optimized ${executionPlan.length} tasks across ${bins.length} bins`);
        
        return {
            execution_plan: executionPlan,
            total_time: totalExecutionTime,
            optimization_score: this.calculateOptimizationScore(executionPlan)
        };
    }

    // Calculate optimization score based on mathematical principles
    calculateOptimizationScore(executionPlan) {
        let score = 0;
        
        // Score based on gaussian distribution adherence
        const gaussianScore = executionPlan.reduce((sum, task) => {
            return sum + (1 / (1 + task.gaussian_position)); // Higher score for tasks closer to mean
        }, 0);
        
        // Score based on priority optimization
        const priorityScore = executionPlan.reduce((sum, task, index) => {
            const positionPenalty = index * 0.01; // Earlier execution is better
            return sum + (task.priority * 10) - positionPenalty;
        }, 0);
        
        // Score based on complexity balancing
        const complexityScore = executionPlan.reduce((sum, task, index) => {
            const earlyComplexityBonus = task.complexity > 5 && index < executionPlan.length / 3 ? 5 : 0;
            return sum + earlyComplexityBonus;
        }, 0);
        
        score = gaussianScore + priorityScore + complexityScore;
        
        return {
            total: score,
            gaussian_component: gaussianScore,
            priority_component: priorityScore,
            complexity_component: complexityScore,
            efficiency_rating: score / executionPlan.length
        };
    }

    // Main optimization process
    async optimize() {
        console.log('🌟 Starting Gaussian task optimization...');
        
        try {
            // Generate normal distribution samples
            const samples = this.generateNormalDistribution();
            console.log(`📈 Generated ${samples.length} normally distributed task values`);
            
            // Create task distribution
            const { bins, stats, binWidth } = this.createTaskBins(samples);
            
            // Optimize execution
            const optimization = this.optimizeExecution(bins);
            
            // Create comprehensive report
            const report = {
                timestamp: new Date().toISOString(),
                parameters: {
                    mean: this.mean,
                    stddev: this.stddev,
                    sample_size: this.sampleSize
                },
                statistics: stats,
                distribution: {
                    bins: bins,
                    bin_width: binWidth,
                    total_bins: bins.length
                },
                optimization: optimization,
                mathematical_analysis: {
                    normal_distribution_verified: Math.abs(stats.mean - this.mean) < this.stddev / 2,
                    stddev_accuracy: Math.abs(stats.stddev - this.stddev) / this.stddev,
                    distribution_quality: 1 - Math.abs(stats.mean - this.mean) / this.stddev
                }
            };
            
            // Save optimization report
            const reportPath = `gaussian-optimization-${Date.now()}.json`;
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            
            console.log('🎊 Gaussian task optimization complete!');
            console.log(`📊 Statistical Summary:`);
            console.log(`   Mean: ${stats.mean.toFixed(2)} (target: ${this.mean})`);
            console.log(`   Std Dev: ${stats.stddev.toFixed(2)} (target: ${this.stddev})`);
            console.log(`   Optimization Score: ${optimization.optimization_score.total.toFixed(2)}`);
            console.log(`   Efficiency Rating: ${optimization.optimization_score.efficiency_rating.toFixed(3)}`);
            console.log(`📋 Report saved to: ${reportPath}`);
            
            return report;
            
        } catch (error) {
            console.error('❌ Gaussian optimization error:', error);
            throw error;
        }
    }
}

// CLI execution
async function main() {
    const args = process.argv.slice(2);
    const options = {};
    
    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--mean=')) {
            options.mean = parseFloat(arg.split('=')[1]);
        } else if (arg.startsWith('--stddev=')) {
            options.stddev = parseFloat(arg.split('=')[1]);
        } else if (arg.startsWith('--size=')) {
            options.sampleSize = parseInt(arg.split('=')[1]);
        }
    }
    
    console.log('📊 Gaussian Task Optimizer');
    console.log('===========================');
    
    const optimizer = new GaussianTaskOptimizer(options);
    
    try {
        await optimizer.optimize();
        process.exit(0);
    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { GaussianTaskOptimizer };
