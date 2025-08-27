import * as vscode from 'vscode';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GeminiCommand {
    command: string;
    description: string;
    usage: string;
}

export interface GeminiResponse {
    success: boolean;
    content: string;
    error?: string;
}

/**
 * Manages interaction with the Gemini CLI process
 * Handles process detection, message sending, and Pro account switching
 */
export class GeminiCliManager {
    private runningPid: number | null = null;
    private processCheckInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.startProcessMonitoring();
    }

    /**
     * Detect if there's a running Gemini CLI session
     */
    async detectRunningSession(): Promise<boolean> {
        try {
            const { stdout } = await execAsync('Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -match "gemini" } | Select-Object -First 1 | ConvertTo-Json', { shell: 'powershell.exe' });
            
            if (stdout.trim() && stdout.trim() !== '') {
                const processInfo = JSON.parse(stdout);
                if (processInfo && processInfo.Id) {
                    this.runningPid = processInfo.Id;
                    return true;
                }
            }
        } catch (error) {
            // Fallback: check for any node processes that might be Gemini CLI
            try {
                const { stdout: fallbackResult } = await execAsync('Get-Process node -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count', { shell: 'powershell.exe' });
                const nodeCount = parseInt(fallbackResult.trim());
                return nodeCount > 0; // Assume one of them might be Gemini CLI
            } catch {
                // Silent fail - no processes detected
            }
        }
        
        this.runningPid = null;
        return false;
    }

    /**
     * Send a message to the running Gemini CLI session
     */
    async sendMessage(message: string): Promise<string | null> {
        if (!await this.detectRunningSession()) {
            vscode.window.showWarningMessage('No active Gemini CLI session detected. Please start Gemini CLI first.');
            return null;
        }

        try {
            // Create a temporary bridge script to interact with the CLI
            const bridgeScript = this.createBridgeScript(message);
            const { stdout } = await execAsync(bridgeScript, { shell: 'powershell.exe' });
            return stdout.trim();
        } catch (error) {
            vscode.window.showErrorMessage(`Error sending message to Gemini CLI: ${error}`);
            return null;
        }
    }

    /**
     * Get available Gemini CLI commands
     */
    async getAvailableCommands(): Promise<GeminiCommand[]> {
        // Standard Gemini CLI commands based on documentation
        return [
            { command: '/help', description: 'Show available commands', usage: '/help' },
            { command: '/models', description: 'List available models', usage: '/models' },
            { command: '/clear', description: 'Clear conversation history', usage: '/clear' },
            { command: '/save', description: 'Save conversation', usage: '/save [filename]' },
            { command: '/load', description: 'Load conversation', usage: '/load [filename]' },
            { command: '/exit', description: 'Exit Gemini CLI', usage: '/exit' },
            { command: '/config', description: 'Show configuration', usage: '/config' },
            { command: '/switch', description: 'Switch model or account', usage: '/switch' }
        ];
    }

    /**
     * Switch Pro account using the established workflow
     */
    async switchProAccount(): Promise<void> {
        try {
            // Use the proven Pro switching script
            const switchScript = `
                $workspaceFolder = "${vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || ''}"
                & "$workspaceFolder\\scripts\\quick-pro-switch.ps1"
            `;
            
            await execAsync(switchScript, { shell: 'powershell.exe' });
            
            // Wait a moment for the process to start
            setTimeout(async () => {
                await this.detectRunningSession();
            }, 3000);
            
        } catch (error) {
            vscode.window.showErrorMessage(`Error switching Pro account: ${error}`);
        }
    }

    /**
     * Create a PowerShell bridge script to interact with CLI
     */
    private createBridgeScript(message: string): string {
        return `
            try {
                # Find the Gemini CLI process
                $geminiProcess = Get-Process | Where-Object { 
                    $_.ProcessName -eq "node" -and 
                    $_.CommandLine -match "gemini" 
                } | Select-Object -First 1

                if ($geminiProcess) {
                    # Use SendKeys to send the message
                    Add-Type -AssemblyName System.Windows.Forms
                    
                    # Focus on the process window (if possible)
                    $processId = $geminiProcess.Id
                    
                    # Send the message
                    [System.Windows.Forms.SendKeys]::SendWait("${message.replace(/"/g, '""')}")
                    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
                    
                    Write-Output "Message sent to Gemini CLI (PID: $processId)"
                } else {
                    Write-Error "No active Gemini CLI process found"
                }
            } catch {
                Write-Error "Failed to send message: $_"
            }
        `;
    }

    /**
     * Start monitoring the Gemini CLI process
     */
    private startProcessMonitoring(): void {
        this.processCheckInterval = setInterval(async () => {
            await this.detectRunningSession();
        }, 5000); // Check every 5 seconds
    }

    /**
     * Dispose of resources
     */
    dispose(): void {
        if (this.processCheckInterval) {
            clearInterval(this.processCheckInterval);
            this.processCheckInterval = null;
        }
    }
}
