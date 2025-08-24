# Intelligent VS Code Authentication System

The MCP Orchestration System now features an intelligent, VS Code-integrated authentication system that **discovers available content and capabilities** based on your actual account login, rather than providing predetermined functionality.

## 🔑 Key Features

### GitHub Copilot-Style Authentication
- **No environment variables** - No secrets to manage or complex setup
- **Device code flow** - Same UX as `gh auth login` or VS Code's built-in authentication
- **VS Code native integration** - Works seamlessly within VS Code
- **Multi-account support** - Switch between personal and business accounts easily

### Intelligent Content Discovery
Instead of predetermined functionality, the system **intelligently discovers** what content and services are available based on your authenticated account:

```typescript
// Before: Predetermined functionality
const agent = new M365Agent();
await agent.getEmails(); // May fail if no email access

// After: Intelligent discovery
const auth = new VSCodeAuthManager();
await auth.initialize();
const authResult = await auth.authenticateWithUI('microsoft');

// System automatically discovers what's available
const capabilities = auth.getCurrentCapabilities();
if (capabilities.contentAccess.emails.available) {
  // Only show email features if actually available
  console.log(`Found ${capabilities.contentAccess.emails.count} emails`);
}
```

### Unified Platform Support

#### Microsoft 365 (Personal & Business)
```typescript
// Personal Microsoft account
const personalAuth = await auth.authenticateWithUI('microsoft');

// Business/OnMicrosoft account  
const businessAuth = await auth.authenticateWithUI('microsoft');
// System automatically detects business vs personal based on tenant
```

Discovers:
- ✅ **Outlook** - Emails, folders, message counts
- ✅ **Calendar** - Available calendars and events
- ✅ **OneDrive** - Drives, storage quota, file access
- ✅ **Teams** - Team memberships and conversations
- ✅ **SharePoint** - Site access and permissions
- ✅ **Contacts** - Contact lists and directories

#### Google Workspace (Personal & Business)
```typescript
// Personal Google account
const googlePersonal = await auth.authenticateWithUI('google');

// Google Workspace account
const googleWorkspace = await auth.authenticateWithUI('google');
// System detects workspace domain automatically
```

Discovers:
- ✅ **Gmail** - Message access and labels
- ✅ **Google Calendar** - Calendar availability
- ✅ **Google Drive** - File access and storage
- ✅ **Google Contacts** - Contact management

#### X/Twitter Integration (Framework Ready)
```typescript
const xAuth = await auth.authenticateWithUI('x');
```

## 🎯 Content-Aware Authentication

The system replaces static functionality with **dynamic content discovery**:

### Real-Time Capability Detection
```typescript
const capabilities = await auth.getAvailableContent();

// Each account shows only what's actually available
capabilities.forEach(account => {
  console.log(`${account.provider} (${account.accountType}):`);
  
  account.availableServices.forEach(service => {
    if (service.available) {
      console.log(`  ✅ ${service.displayName}: ${service.description}`);
    }
  });
});
```

### Intelligent Workflow Suggestions
Based on discovered content, the system suggests relevant workflows:

```typescript
// If user has both email and calendar access
if (hasEmail && hasCalendar) {
  suggest("Create calendar events from email invitations");
  suggest("Send meeting summaries via email");
}

// If user has multiple platforms
if (microsoftAccount && googleAccount) {
  suggest("Sync calendars between Microsoft and Google");
  suggest("Cross-platform unified search");
}
```

## 🛠️ VS Code Integration

### Task-Based Authentication Testing
The system includes VS Code tasks for testing authentication flows:

1. **🔐 Test Microsoft 365 Intelligent Auth**
2. **🔐 Test Google Workspace Intelligent Auth** 
3. **🔍 Discover Account Capabilities**

### Status Bar Integration
Shows current authentication status and available services:
```
🔐 MCP: microsoft (6 services) | google (4 services)
```

### Authentication Notifications
GitHub Copilot-style notifications for authentication prompts:

```
MCP Orchestration: Sign in to access your accounts
[Sign in with Microsoft 365] [Sign in with Google] [Not now]
```

## 📋 Usage Examples

### Basic Authentication Flow
```typescript
import { VSCodeAuthManager } from '@mcp/auth';

const auth = new VSCodeAuthManager();

// Initialize (checks for existing sessions)
await auth.initialize();

// Authenticate with automatic capability discovery
const result = await auth.authenticateWithUI('microsoft');

// Access discovered capabilities
const capabilities = auth.getCurrentCapabilities();
console.log('Available services:', capabilities.availableServices);
```

### Multi-Account Management
```typescript
// Authenticate with multiple providers
await auth.authenticateWithUI('microsoft');
await auth.authenticateWithUI('google');

// Get unified view of all content
const allContent = await auth.getAvailableContent();

// Switch between accounts
await auth.switchAccount('microsoft', 'company.onmicrosoft.com');
await auth.switchAccount('google', 'personal');
```

### Content Discovery
```typescript
const capabilities = auth.getCurrentCapabilities();

// Check what's actually available
if (capabilities.contentAccess.emails.available) {
  console.log(`Emails: ${capabilities.contentAccess.emails.count} messages`);
  console.log(`Mailboxes: ${capabilities.contentAccess.emails.mailboxes.join(', ')}`);
}

if (capabilities.contentAccess.files.available) {
  capabilities.contentAccess.files.drives.forEach(drive => {
    console.log(`${drive.name}: ${drive.quota.used}/${drive.quota.total} bytes`);
  });
}
```

## 🔧 Architecture

### Content Discovery Engine
- **Real-time API testing** - Checks actual endpoint access
- **Capability mapping** - Maps API responses to available features
- **Permission detection** - Discovers what the account can actually do

### VS Code Integration Layer
- **Authentication UI** - Native VS Code authentication experience
- **Session management** - Secure token storage and refresh
- **Status updates** - Real-time capability status in VS Code

### Unified Authentication Provider
- **Multi-platform support** - Microsoft, Google, X in one interface
- **Account type detection** - Automatic personal vs business detection
- **Token lifecycle** - Automatic refresh and expiry handling

## 🚀 Benefits

✅ **Zero Configuration** - No environment setup or Azure portal configuration  
✅ **Intelligent Discovery** - Shows only what's actually available  
✅ **VS Code Native** - Same experience as GitHub Copilot  
✅ **Multi-Platform** - Unified interface for Microsoft, Google, X  
✅ **Account Flexibility** - Easy switching between personal/business  
✅ **Real-Time Updates** - Dynamic capability detection  
✅ **Workflow Intelligence** - Smart suggestions based on available content  

This transformation removes complexity barriers while providing enterprise-grade functionality that adapts to each user's actual account capabilities and content access.