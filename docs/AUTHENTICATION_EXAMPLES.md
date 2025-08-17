# Unified Authentication Examples - VS Code Integrated

This document demonstrates the simplified authentication approach for both Microsoft 365 and Google Workspace integration in the MCP Orchestration System.

## 🚀 Quick Start Examples

### Microsoft 365 Authentication

#### Personal Microsoft Account
```typescript
import { M365GraphAgent } from '@mcp/agents-m365-graph';

// One-liner setup - no environment variables or Azure configuration needed!
const agent = await M365GraphAgent.createPersonalAccount();

// Use immediately
const user = await agent.getCurrentUser();
const emails = await agent.makeRequest('/me/messages?$top=5');
console.log(`Authenticated as: ${user.displayName}`);
```

#### Business Account (.onmicrosoft.com)
```typescript
import { M365GraphAgent } from '@mcp/agents-m365-graph';

// For business accounts
const agent = await M365GraphAgent.createBusinessAccount('contoso.onmicrosoft.com');

// Or auto-detect business context
const agent = await M365GraphAgent.createBusinessAccount();

// Access Teams, SharePoint, etc.
const teams = await agent.makeRequest('/me/joinedTeams');
const sites = await agent.makeRequest('/sites?search=*');
```

### Google Workspace Authentication

#### Personal Google Account
```typescript
import { GoogleWorkspaceAgent } from '@mcp/agents-google-workspace';

// One-liner setup for personal Google account
const agent = await GoogleWorkspaceAgent.createPersonalAccount();

// Access Gmail, Drive, Calendar
const emails = await agent.getRecentEmails(10);
const files = await agent.getDriveFiles(10);
const events = await agent.getCalendarEvents(5);
```

#### Google Workspace (Business)
```typescript
import { GoogleWorkspaceAgent } from '@mcp/agents-google-workspace';

// For Google Workspace accounts
const agent = await GoogleWorkspaceAgent.createWorkspaceAccount('company.com');

// Access workspace features
const driveFiles = await agent.getDriveFiles(20);
const calendar = await agent.getCalendarService();
```

## 🔄 Migration Examples

### Before: Complex Azure Setup
```typescript
// ❌ Old way - complex environment variables and Azure setup
const authConfig = {
  clientId: process.env.M365_CLIENT_ID!,          // Had to manage
  clientSecret: process.env.M365_CLIENT_SECRET!,  // Had to manage
  tenantId: process.env.M365_TENANT_ID!           // Had to find
};

const agent = new M365GraphAgent(authConfig);
await agent.initialize(); // Could fail with auth errors
```

### After: VS Code Integrated
```typescript
// ✅ New way - GitHub Copilot-style authentication
const agent = await M365GraphAgent.createBusinessAccount();
// That's it! Handles everything automatically
```

## 🎯 Real-World Usage Scenarios

### Scenario 1: Cross-Platform Email Integration
```typescript
// Authenticate to both Microsoft and Google
const microsoftAgent = await M365GraphAgent.createBusinessAccount();
const googleAgent = await GoogleWorkspaceAgent.createPersonalAccount();

// Get emails from both platforms
const outlookEmails = await microsoftAgent.makeRequest('/me/messages?$top=10');
const gmailEmails = await googleAgent.getRecentEmails(10);

// Unified email processing
const allEmails = [...outlookEmails.value, ...gmailEmails.messages];
console.log(`Total emails across platforms: ${allEmails.length}`);
```

### Scenario 2: File Management Across Services
```typescript
// Access files from Microsoft OneDrive and Google Drive
const m365Agent = await M365GraphAgent.createPersonalAccount();
const googleAgent = await GoogleWorkspaceAgent.createPersonalAccount();

// Get files from both services
const oneDriveFiles = await m365Agent.makeRequest('/me/drive/root/children');
const driveFiles = await googleAgent.getDriveFiles(20);

console.log('Files in OneDrive:', oneDriveFiles.value?.length);
console.log('Files in Google Drive:', driveFiles.files?.length);
```

### Scenario 3: Calendar Synchronization
```typescript
// Sync events between Microsoft Calendar and Google Calendar
const microsoftAgent = await M365GraphAgent.createBusinessAccount();
const googleAgent = await GoogleWorkspaceAgent.createWorkspaceAccount();

// Get upcoming events from both calendars
const outlookEvents = await microsoftAgent.makeRequest(
  `/me/calendar/events?$filter=start/dateTime ge '${new Date().toISOString()}'&$top=10`
);
const googleEvents = await googleAgent.getCalendarEvents(10);

// Process and sync logic here
console.log('Microsoft events:', outlookEvents.value?.length);
console.log('Google events:', googleEvents.items?.length);
```

## 🔧 Advanced Configuration

### Custom Authentication Configuration
```typescript
import { UnifiedAuthProvider, createMicrosoft365Auth, createGoogleWorkspaceAuth } from '@mcp/auth';

// Custom Microsoft 365 configuration
const microsoftAuth = createMicrosoft365Auth('business', 'contoso.onmicrosoft.com');
await microsoftAuth.authenticate();

// Custom Google Workspace configuration  
const googleAuth = createGoogleWorkspaceAuth('business', 'company.com');
await googleAuth.authenticate();

// Check authentication status
console.log('Microsoft authenticated:', microsoftAuth.isAuthenticated());
console.log('Google authenticated:', googleAuth.isAuthenticated());
```

### Multi-Account Management
```typescript
// Handle multiple accounts of the same type
const personalMicrosoft = await M365GraphAgent.createPersonalAccount();
const businessMicrosoft = await M365GraphAgent.createBusinessAccount();

const personalGoogle = await GoogleWorkspaceAgent.createPersonalAccount();
const workspaceGoogle = await GoogleWorkspaceAgent.createWorkspaceAccount();

// Switch between accounts as needed
console.log('Personal Microsoft:', personalMicrosoft.getAuthInfo()?.email);
console.log('Business Microsoft:', businessMicrosoft.getAuthInfo()?.email);
console.log('Personal Google:', personalGoogle.getAuthInfo()?.email);
console.log('Workspace Google:', workspaceGoogle.getAuthInfo()?.email);
```

## 🎮 VS Code Integration

### Using VS Code Tasks
Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type "Tasks: Run Task":

- **Microsoft 365 - Personal Account** - Authenticate with personal Microsoft account
- **Microsoft 365 - Business Account** - Authenticate with business Microsoft account  
- **Google Workspace - Personal Account** - Authenticate with personal Google account
- **Google Workspace - Business Account** - Authenticate with Google Workspace account

### Authentication Status in VS Code
```typescript
// Check authentication status programmatically
const m365Agent = new M365GraphAgent();
const googleAgent = new GoogleWorkspaceAgent();

console.log('M365 Status:', m365Agent.isAuthenticated() ? '✅' : '❌');
console.log('Google Status:', googleAgent.isAuthenticated() ? '✅' : '❌');
```

## 🔒 Security Best Practices

### Token Management
```typescript
// Tokens are managed automatically - no manual handling needed
const agent = await M365GraphAgent.createPersonalAccount();

// Get fresh token (handles refresh automatically)
const freshToken = await agent.getAccessToken();

// Sign out when done (optional - tokens expire automatically)
await agent.signOut();
```

### Account Switching
```typescript
// Safe account switching
const currentAgent = await M365GraphAgent.createPersonalAccount();
console.log('Current user:', currentAgent.getAuthInfo()?.email);

// Switch to different account
await currentAgent.signOut();
const newAgent = await M365GraphAgent.createBusinessAccount();
console.log('New user:', newAgent.getAuthInfo()?.email);
```

## 🐛 Troubleshooting

### Common Authentication Issues
```typescript
try {
  const agent = await M365GraphAgent.createPersonalAccount();
} catch (error) {
  if (error.message.includes('cancelled')) {
    console.log('❌ User cancelled authentication');
  } else if (error.message.includes('network')) {
    console.log('❌ Network connectivity issue');
  } else {
    console.log('❌ Unknown authentication error:', error.message);
  }
}
```

### Debug Mode
```typescript
import { logger } from '@mcp/shared';

// Enable debug logging
logger.setLevel('DEBUG');

// Now all authentication steps will be logged
const agent = await M365GraphAgent.createPersonalAccount();
```

### Verify Authentication
```typescript
// Quick authentication test
const agent = await M365GraphAgent.createPersonalAccount();

if (agent.isAuthenticated()) {
  const user = await agent.getCurrentUser();
  console.log('✅ Authentication successful:', user.displayName);
} else {
  console.log('❌ Authentication failed');
}
```

## 🌟 Benefits Summary

**✅ No Environment Variables** - No secrets to manage or environment setup  
**✅ No Azure Portal Configuration** - No app registrations or tenant setup  
**✅ Works Like GitHub Copilot** - Familiar device code authentication flow  
**✅ Multi-Platform Support** - Same pattern for Microsoft 365 and Google Workspace  
**✅ Account Type Flexibility** - Easy switching between personal and business accounts  
**✅ Automatic Token Management** - Handles refresh and expiry automatically  
**✅ VS Code Native Integration** - Built for IDE-first development experience  
**✅ Type-Safe APIs** - Full TypeScript support with proper interfaces  

This approach transforms complex enterprise authentication into a simple, developer-friendly experience that scales from personal projects to enterprise deployments.