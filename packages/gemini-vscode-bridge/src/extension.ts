import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import { GeminiCliManager } from './geminiCliManager';
import { GeminiPanelProvider } from './geminiPanelProvider';

/**
 * Gemini CLI Bridge Extension for Restructure-MCP-Orchestration
 * 
 * This extension provides a GUI bridge to the working Gemini CLI session,
 * specifically designed for this repository's pocket plane architecture.
 */
export class GeminiBridgeExtension {
    private geminiManager: GeminiCliManager;
    private panelProvider: GeminiPanelProvider;
    private statusBarItem: vscode.StatusBarItem;

    constructor(private context: vscode.ExtensionContext) {
        this.geminiManager = new GeminiCliManager();
        this.panelProvider = new GeminiPanelProvider(this.geminiManager);
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    }

    async activate() {
        console.log('🚀 Gemini CLI Bridge is now active!');
        
        // Register commands
        this.registerCommands();
        
        // Setup status bar
        this.setupStatusBar();
        
        // Register panel provider
        vscode.window.registerWebviewViewProvider('geminibridge.chatView', this.panelProvider);
        
        // Auto-detect existing Gemini CLI session
        await this.detectExistingSession();
        
        // Watch for Gemini CLI process changes
        this.watchGeminiProcess();
    }

    private registerCommands() {
        const commands = [
            vscode.commands.registerCommand('geminibridge.sendToGemini', this.sendToGemini.bind(this)),
            vscode.commands.registerCommand('geminibridge.showGeminiPanel', this.showGeminiPanel.bind(this)),
            vscode.commands.registerCommand('geminibridge.listGeminiCommands', this.listGeminiCommands.bind(this)),
            vscode.commands.registerCommand('geminibridge.switchProAccount', this.switchProAccount.bind(this)),
            vscode.commands.registerCommand('geminibridge.sendFileToGemini', this.sendFileToGemini.bind(this))
        ];

        commands.forEach(command => this.context.subscriptions.push(command));
    }

    private setupStatusBar() {
        this.statusBarItem.text = "$(robot) Gemini CLI";
        this.statusBarItem.tooltip = "Gemini CLI Bridge Status";
        this.statusBarItem.command = 'geminibridge.showGeminiPanel';
        this.statusBarItem.show();
        this.context.subscriptions.push(this.statusBarItem);
    }

    private async detectExistingSession() {
        const isRunning = await this.geminiManager.detectRunningSession();
        if (isRunning) {
            this.statusBarItem.text = "$(robot) Gemini ✅";
            this.statusBarItem.tooltip = "Gemini CLI Connected";
            vscode.window.showInformationMessage('🎉 Detected running Gemini CLI session!', 'Show Panel')
                .then(selection => {
                    if (selection === 'Show Panel') {
                        this.showGeminiPanel();
                    }
                });
        } else {
            this.statusBarItem.text = "$(robot) Gemini ❌";
            this.statusBarItem.tooltip = "Gemini CLI Not Connected";
        }
    }

    private watchGeminiProcess() {
        // Check process status every 10 seconds
        const interval = setInterval(async () => {
            const isRunning = await this.geminiManager.detectRunningSession();
            if (isRunning) {
                this.statusBarItem.text = "$(robot) Gemini ✅";
                this.statusBarItem.tooltip = "Gemini CLI Connected";
            } else {
                this.statusBarItem.text = "$(robot) Gemini ❌";
                this.statusBarItem.tooltip = "Gemini CLI Not Connected";
            }
        }, 10000);

        this.context.subscriptions.push({ dispose: () => clearInterval(interval) });
    }

    private async sendToGemini() {
        const message = await vscode.window.showInputBox({
            prompt: 'Enter message for Gemini CLI',
            placeHolder: 'Type your message or /help for commands'
        });

        if (message) {
            const response = await this.geminiManager.sendMessage(message);
            if (response) {
                vscode.window.showInformationMessage(`Gemini: ${response.substring(0, 100)}...`, 'Show Full Response')
                    .then(selection => {
                        if (selection === 'Show Full Response') {
                            this.showResponseInEditor(response);
                        }
                    });
            }
        }
    }

    private async showGeminiPanel() {
        vscode.commands.executeCommand('workbench.view.extension.geminibridge');
    }

    private async listGeminiCommands() {
        const commands = await this.geminiManager.getAvailableCommands();
        const items = commands.map(cmd => ({
            label: cmd.command,
            description: cmd.description,
            detail: cmd.usage
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a Gemini CLI command to execute'
        });

        if (selected) {
            const response = await this.geminiManager.sendMessage(selected.label);
            if (response) {
                this.showResponseInEditor(response);
            }
        }
    }

    private async switchProAccount() {
        const choice = await vscode.window.showInformationMessage(
            'Switch Gemini Pro Account?',
            'This will restart Gemini CLI and open browser for account selection.',
            'Switch Account',
            'Cancel'
        );

        if (choice === 'Switch Account') {
            await this.geminiManager.switchProAccount();
            vscode.window.showInformationMessage('✅ Account switching initiated. Check your browser!');
        }
    }

    private async sendFileToGemini() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to send to Gemini');
            return;
        }

        const fileName = editor.document.fileName;
        const fileContent = editor.document.getText();
        const selectedText = editor.document.getText(editor.selection);

        let message: string;
        if (selectedText) {
            message = `Analyze this selected code from ${fileName}:\n\`\`\`\n${selectedText}\n\`\`\``;
        } else {
            message = `Analyze this file: @${fileName}`;
        }

        const response = await this.geminiManager.sendMessage(message);
        if (response) {
            this.showResponseInEditor(response, `Gemini Analysis: ${fileName}`);
        }
    }

    private async showResponseInEditor(content: string, title: string = 'Gemini Response') {
        const doc = await vscode.workspace.openTextDocument({
            content: content,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    }

    deactivate() {
        this.geminiManager.dispose();
    }
}

// Extension activation function
export function activate(context: vscode.ExtensionContext) {
    const extension = new GeminiBridgeExtension(context);
    return extension.activate();
}

export function deactivate() {
    // Extension cleanup is handled by the GeminiBridgeExtension class
}
