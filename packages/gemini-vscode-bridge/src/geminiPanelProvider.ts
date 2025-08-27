import * as vscode from 'vscode';
import { GeminiCliManager } from './geminiCliManager';

/**
 * Webview Panel Provider for Gemini CLI Bridge
 * Provides a chat interface to interact with Gemini CLI
 */
export class GeminiPanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'geminibridge.chatView';

    constructor(private geminiManager: GeminiCliManager) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: []
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.type) {
                    case 'sendMessage':
                        await this.handleSendMessage(message.text, webviewView.webview);
                        break;
                    case 'getCommands':
                        await this.handleGetCommands(webviewView.webview);
                        break;
                    case 'switchAccount':
                        await this.handleSwitchAccount(webviewView.webview);
                        break;
                }
            },
            undefined,
            []
        );
    }

    private async handleSendMessage(message: string, webview: vscode.Webview) {
        // Show user message in chat
        await webview.postMessage({
            type: 'addMessage',
            message: { sender: 'user', text: message, timestamp: new Date().toLocaleTimeString() }
        });

        // Send to Gemini CLI
        const response = await this.geminiManager.sendMessage(message);
        
        // Show response in chat
        await webview.postMessage({
            type: 'addMessage',
            message: { 
                sender: 'gemini', 
                text: response || 'No response received from Gemini CLI', 
                timestamp: new Date().toLocaleTimeString() 
            }
        });
    }

    private async handleGetCommands(webview: vscode.Webview) {
        const commands = await this.geminiManager.getAvailableCommands();
        await webview.postMessage({
            type: 'showCommands',
            commands: commands
        });
    }

    private async handleSwitchAccount(webview: vscode.Webview) {
        await this.geminiManager.switchProAccount();
        await webview.postMessage({
            type: 'addMessage',
            message: { 
                sender: 'system', 
                text: '🔄 Switching Pro account... Check your browser for login!', 
                timestamp: new Date().toLocaleTimeString() 
            }
        });
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gemini CLI Bridge</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            margin: 0;
            padding: 10px;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .status {
            font-size: 12px;
            opacity: 0.8;
        }
        
        .chat-container {
            flex: 1;
            overflow-y: auto;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
            max-height: 400px;
        }
        
        .message {
            margin-bottom: 10px;
            padding: 8px;
            border-radius: 4px;
        }
        
        .user-message {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            margin-left: 20px;
        }
        
        .gemini-message {
            background-color: var(--vscode-editor-selectionBackground);
            margin-right: 20px;
        }
        
        .system-message {
            background-color: var(--vscode-notificationsInfoIcon-foreground);
            color: var(--vscode-editor-background);
            font-style: italic;
            text-align: center;
        }
        
        .timestamp {
            font-size: 10px;
            opacity: 0.6;
            margin-top: 4px;
        }
        
        .input-container {
            display: flex;
            gap: 5px;
        }
        
        .input-field {
            flex: 1;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
        }
        
        .button {
            padding: 8px 12px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .quick-commands {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-bottom: 10px;
        }
        
        .quick-command {
            padding: 4px 8px;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 11px;
        }
        
        .quick-command:hover {
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="header">
        <h3>🤖 Gemini CLI Bridge</h3>
        <div class="status" id="status">Connecting...</div>
    </div>
    
    <div class="quick-commands">
        <button class="quick-command" onclick="sendQuickCommand('/help')">Help</button>
        <button class="quick-command" onclick="sendQuickCommand('/models')">Models</button>
        <button class="quick-command" onclick="sendQuickCommand('/config')">Config</button>
        <button class="quick-command" onclick="switchAccount()">Switch Pro</button>
    </div>
    
    <div class="chat-container" id="chat"></div>
    
    <div class="input-container">
        <input type="text" class="input-field" id="messageInput" placeholder="Type your message or /command..." onkeypress="handleKeyPress(event)">
        <button class="button" onclick="sendMessage()">Send</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (message) {
                vscode.postMessage({
                    type: 'sendMessage',
                    text: message
                });
                input.value = '';
            }
        }
        
        function sendQuickCommand(command) {
            vscode.postMessage({
                type: 'sendMessage',
                text: command
            });
        }
        
        function switchAccount() {
            vscode.postMessage({
                type: 'switchAccount'
            });
        }
        
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }
        
        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'addMessage':
                    addMessageToChat(message.message);
                    break;
                case 'showCommands':
                    showCommands(message.commands);
                    break;
            }
        });
        
        function addMessageToChat(message) {
            const chat = document.getElementById('chat');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + message.sender + '-message';
            
            messageDiv.innerHTML = \`
                <div>\${message.text}</div>
                <div class="timestamp">\${message.timestamp}</div>
            \`;
            
            chat.appendChild(messageDiv);
            chat.scrollTop = chat.scrollHeight;
        }
        
        function showCommands(commands) {
            const chat = document.getElementById('chat');
            const commandsDiv = document.createElement('div');
            commandsDiv.className = 'message system-message';
            
            let commandsText = '📋 Available Commands:\\n';
            commands.forEach(cmd => {
                commandsText += \`• \${cmd.command}: \${cmd.description}\\n\`;
            });
            
            commandsDiv.innerHTML = \`
                <div style="white-space: pre-line;">\${commandsText}</div>
                <div class="timestamp">\${new Date().toLocaleTimeString()}</div>
            \`;
            
            chat.appendChild(commandsDiv);
            chat.scrollTop = chat.scrollHeight;
        }
        
        // Initialize
        document.getElementById('status').textContent = 'Ready';
        addMessageToChat({
            sender: 'system',
            text: '🚀 Gemini CLI Bridge initialized! Send messages to interact with your Gemini CLI session.',
            timestamp: new Date().toLocaleTimeString()
        });
    </script>
</body>
</html>`;
    }
}
