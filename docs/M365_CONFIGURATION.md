# Microsoft 365 Configuration Guide - VS Code Integrated

This guide provides instructions for using the simplified Microsoft 365 integration in the MCP Orchestration System, designed for seamless VS Code IDE integration similar to GitHub Copilot.

## Overview

The MCP Orchestration System now includes **VS Code-style authentication** for Microsoft 365 integration through the following agents:

- **M365 Graph Agent** - Core authentication and Graph API operations with device flow
- **Teams Agent** - Teams messages, meetings, channels, and presence  
- **Outlook Agent** - Email and calendar operations with full CRUD support
- **SharePoint Agent** - Document and list management
- **OneDrive Agent** - File storage operations

## 🚀 Quick Start (No Complex Setup Required!)

Unlike traditional Azure app registrations, this integration works like **GitHub Copilot** - simple authentication that "just works" in your development environment.

### Personal Microsoft Account

```typescript
import { M365GraphAgent } from '@mcp/agents-m365-graph';

// Simple one-liner for personal accounts
const agent = await M365GraphAgent.createPersonalAccount();

// Use immediately - authentication handled automatically
const user = await agent.getCurrentUser();
console.log(`Authenticated as: ${user.displayName}`);
```

### Business Account (.onmicrosoft.com or custom domain)

```typescript
import { M365GraphAgent } from '@mcp/agents-m365-graph';

// For business accounts - specify your domain
const agent = await M365GraphAgent.createBusinessAccount('yourcompany.onmicrosoft.com');

// Or let it auto-detect business context
const agent = await M365GraphAgent.createBusinessAccount();
```

## 🔐 Authentication Flow

The authentication process is designed to be **user-friendly** and **VS Code-native**:

1. **No Environment Variables** - No need to manage client secrets or tenant IDs
2. **Device Code Flow** - Similar to `git` or `gh` CLI tools
3. **Automatic Token Management** - Handles refresh automatically
4. **Multiple Account Support** - Switch between personal and business accounts

### First-Time Authentication

When you first use any M365 agent:

```bash
🔐 Microsoft 365 authentication required...
📱 This will open a device authentication flow (like GitHub Copilot)

👉 Visit: https://microsoft.com/devicelogin
🔑 Enter code: ABC-DEF-123
⏱️  Code expires in 15 minutes

✅ Successfully authenticated as John Doe (john@example.com)
```

### Subsequent Usage

After initial authentication, tokens are managed automatically:

```typescript
// No authentication code needed - handled transparently
const emails = await outlookAgent.getEmails();
const meetings = await teamsAgent.getMeetings();
```

## 🏗️ Architecture Benefits

### Simplified vs. Complex Approach

**❌ Old Way (Complex Azure Setup):**
```typescript
const authConfig = {
  clientId: 'complex-app-registration-id',
  clientSecret: 'secret-you-must-manage',
  tenantId: 'tenant-you-must-find',
  scopes: ['list-of-permissions-you-must-configure']
};

const agent = new M365GraphAgent(authConfig);
```

**✅ New Way (VS Code Integrated):**
```typescript
// Personal account
const agent = await M365GraphAgent.createPersonalAccount();

// Business account  
const agent = await M365GraphAgent.createBusinessAccount('yourcompany.com');
```

### Key Improvements

1. **No Azure Portal Configuration** - Uses well-known public client applications
2. **Automatic Scope Management** - Requests appropriate permissions based on usage
3. **Unified Experience** - Same flow for personal and business accounts
4. **VS Code Native** - Integrates with VS Code authentication providers
5. **Secure by Design** - No secrets stored in code or environment

## 🔧 Configuration Options

### Account Types

```typescript
import { UnifiedAuthProvider, AccountType } from '@mcp/auth';

// Personal Microsoft account
const personalAuth = createMicrosoft365Auth('personal');

// Business account with auto-detection
const businessAuth = createMicrosoft365Auth('business');

// Business account with specific domain
const domainAuth = createMicrosoft365Auth('business', 'contoso.onmicrosoft.com');
```

### Google Workspace Integration

The same pattern works for Google Workspace:

```typescript
import { createGoogleWorkspaceAuth } from '@mcp/auth';

// Personal Google account
const personalGoogle = createGoogleWorkspaceAuth('personal');

// Google Workspace account
const workspaceGoogle = createGoogleWorkspaceAuth('business', 'company.com');
```

## 📡 MCP Server Configuration

The M365 agents integrate automatically with the MCP orchestration system:

```typescript
// Server configuration is unchanged
const servers = [
  { name: 'Microsoft 365 Graph MCP', type: 'm365-graph', port: 3009, enabled: true },
  { name: 'Microsoft Teams MCP', type: 'm365-teams', port: 3010, enabled: true },
  { name: 'Microsoft Outlook MCP', type: 'm365-outlook', port: 3011, enabled: true },
];
```

**No environment variables required!** Authentication is handled through the device flow.

## 🔄 Migration from Complex Setup

If you're migrating from the previous Azure app registration setup:

### Before (Complex)
```bash
# Environment variables you can remove
M365_CLIENT_ID=your-application-client-id
M365_CLIENT_SECRET=your-client-secret  
M365_TENANT_ID=your-tenant-id
```

```typescript
const authConfig = {
  clientId: process.env.M365_CLIENT_ID!,
  clientSecret: process.env.M365_CLIENT_SECRET!,
  tenantId: process.env.M365_TENANT_ID!
};

const graphAgent = new M365GraphAgent(authConfig);
await graphAgent.initialize();
```

### After (Simple)
```typescript
// Remove environment variables entirely
// Simple one-liner replacement
const graphAgent = await M365GraphAgent.createBusinessAccount();
```

## 🛠️ Usage Examples

### Send Teams Message
```typescript
import { M365TeamsAgent } from '@mcp/agents-m365-teams';

const teams = new M365TeamsAgent({ accountType: 'business' });
await teams.initialize();

await teams.sendChannelMessage(
  'team-id',
  'channel-id', 
  'Hello from MCP! 🚀',
  'text'
);
```

### Send Email
```typescript
import { M365OutlookAgent } from '@mcp/agents-m365-outlook';

const outlook = new M365OutlookAgent({ accountType: 'personal' });
await outlook.initialize();

await outlook.sendEmail(
  ['recipient@example.com'],
  'Test Email',
  'This email was sent through simplified MCP authentication!',
  'text'
);
```

### Access OneDrive Files
```typescript
import { M365OneDriveAgent } from '@mcp/agents-m365-onedrive';

const oneDrive = new M365OneDriveAgent({ accountType: 'business' });
await oneDrive.initialize();

const files = await oneDrive.listFiles();
console.log('Your files:', files);
```

## 🔍 Troubleshooting

### Common Issues

**Authentication Fails**
```bash
❌ Authentication cancelled by user
```
- Solution: Complete the device code flow in your browser

**Wrong Account Type**
```bash
❌ Access denied: User account not found
```
- Solution: Use `'business'` for work accounts, `'personal'` for Microsoft accounts

**Network Issues**
```bash
❌ Device code request failed
```
- Solution: Check internet connection and firewall settings

### Debug Mode

Enable detailed logging:
```typescript
import { logger } from '@mcp/shared';

logger.setLevel('DEBUG');
const agent = await M365GraphAgent.createPersonalAccount();
```

## 🎯 VS Code Extension (Coming Soon)

The authentication will be further enhanced with a VS Code extension that provides:

- **Native VS Code Authentication UI** - Like GitHub Copilot's sign-in experience
- **Account Management** - Switch between multiple accounts easily  
- **Status Bar Integration** - See authentication status at a glance
- **Command Palette** - Sign in/out via VS Code commands

## 🔒 Security & Privacy

- **No Secrets in Code** - Uses public client application flow
- **Limited Scope Permissions** - Only requests permissions as needed
- **Secure Token Storage** - Tokens stored securely by OS credential manager
- **User Consent** - Clear permission prompts during authentication
- **Easy Revocation** - Disconnect access through Microsoft/Google account settings

## 🌟 Benefits Summary

✅ **No Complex Azure Setup** - No app registrations or tenant configuration
✅ **No Environment Variables** - No secrets to manage
✅ **Works Like Copilot** - Familiar authentication experience
✅ **Multi-Account Support** - Switch between personal and business accounts
✅ **Automatic Token Management** - Handles refresh automatically
✅ **Google Workspace Ready** - Same pattern for Google integration
✅ **VS Code Native** - Designed for IDE integration

This simplified approach removes the complexity barriers while maintaining enterprise-grade security and functionality.