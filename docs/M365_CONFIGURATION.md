# Microsoft 365 Configuration Guide

This guide provides comprehensive instructions for configuring and using the Microsoft 365 integration agents in the MCP Orchestration System.

## Overview

The MCP Orchestration System now includes comprehensive Microsoft 365 integration through the following agents:

- **M365 Graph Agent** - Core authentication and Graph API operations
- **Teams Agent** - Teams messages, meetings, channels, and presence
- **Outlook Agent** - Email and calendar operations with full CRUD support
- **SharePoint Agent** - Document and list management
- **OneDrive Agent** - File storage operations

## Azure App Registration Setup

### Prerequisites

1. Azure Active Directory (Azure AD) tenant
2. Global administrator or Application administrator role
3. Microsoft 365 subscription with appropriate licenses

### Step 1: Register the Application

1. Navigate to [Azure Portal](https://portal.azure.com)
2. Go to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the application details:
   - **Name**: "MCP Orchestration M365 Integration"
   - **Supported account types**: "Accounts in this organizational directory only"
   - **Redirect URI**: Leave blank for now
5. Click **Register**

### Step 2: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions**
5. Add the following permissions:

#### Required Permissions

##### Core Permissions
- `User.Read.All` - Read all users' full profiles
- `Directory.Read.All` - Read directory data

##### Teams Permissions
- `Team.ReadBasic.All` - Read the names and descriptions of teams
- `Channel.ReadBasic.All` - Read the names and descriptions of channels
- `ChannelMessage.Read.All` - Read all channel messages
- `ChannelMessage.Send` - Send channel messages
- `OnlineMeetings.ReadWrite.All` - Read and create online meetings

##### Outlook Permissions
- `Mail.Read` - Read mail in all mailboxes
- `Mail.ReadWrite` - Read and write mail in all mailboxes
- `Mail.Send` - Send mail as any user
- `Calendars.Read` - Read calendars in all mailboxes
- `Calendars.ReadWrite` - Read and write calendars in all mailboxes
- `Contacts.Read` - Read contacts in all mailboxes
- `Contacts.ReadWrite` - Read and write contacts in all mailboxes

##### SharePoint/OneDrive Permissions
- `Sites.Read.All` - Read items in all site collections
- `Sites.ReadWrite.All` - Read and write items in all site collections
- `Files.Read.All` - Read all files
- `Files.ReadWrite.All` - Read and write all files

6. Click **Grant admin consent** for your organization

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: "MCP Orchestration Secret"
4. Select expiration (recommended: 24 months)
5. Click **Add**
6. **Important**: Copy the secret value immediately - it won't be shown again

### Step 4: Note Configuration Values

You'll need these values for configuration:
- **Application (client) ID** - Found on the Overview page
- **Directory (tenant) ID** - Found on the Overview page  
- **Client secret** - The value you just created

## MCP Server Configuration

### Environment Variables

Set the following environment variables:

```bash
# Microsoft 365 Configuration
M365_CLIENT_ID=your-application-client-id
M365_CLIENT_SECRET=your-client-secret
M365_TENANT_ID=your-tenant-id
```

### Server Configuration

The M365 agents are automatically registered in the MCP orchestration system on the following ports:

- **Port 3009**: Microsoft 365 Graph MCP (unified endpoint)
- **Port 3010**: Microsoft Teams MCP
- **Port 3011**: Microsoft Outlook MCP  
- **Port 3012**: Microsoft SharePoint MCP
- **Port 3013**: Microsoft OneDrive MCP

### Example Usage

#### Initialize M365 Graph Agent

```typescript
import { M365GraphAgent } from '@mcp/agents-m365-graph';

const authConfig = {
  clientId: process.env.M365_CLIENT_ID!,
  clientSecret: process.env.M365_CLIENT_SECRET!,
  tenantId: process.env.M365_TENANT_ID!
};

const graphAgent = new M365GraphAgent(authConfig);
await graphAgent.initialize();
```

#### Send Teams Message

```typescript
import { M365TeamsAgent } from '@mcp/agents-m365-teams';

const teamsAgent = new M365TeamsAgent(authConfig);
await teamsAgent.initialize();

// Send message to a channel
await teamsAgent.sendChannelMessage(
  'team-id',
  'channel-id', 
  'Hello from MCP!',
  'text'
);
```

#### Send Email

```typescript
import { M365OutlookAgent } from '@mcp/agents-m365-outlook';

const outlookAgent = new M365OutlookAgent(authConfig);
await outlookAgent.initialize();

// Send email
await outlookAgent.sendEmail(
  ['recipient@example.com'],
  'Test Email',
  'This is a test email from MCP Orchestration System',
  'text'
);
```

## API Endpoints

### M365 Graph MCP Server (Port 3009)

The unified M365 server provides access to all services:

#### Status and Health
- `GET /api/status` - Get server and agent status
- `GET /api/health` - Health check

#### Teams Operations
- `GET /api/teams/teams` - Get user's teams
- `GET /api/teams/presence` - Get presence status
- `GET /api/teams/meetings` - Get upcoming meetings
- `POST /api/teams/message` - Send channel message
- `POST /api/teams/meeting` - Create meeting

#### Outlook Operations
- `GET /api/outlook/emails` - Get emails
- `GET /api/outlook/calendar` - Get calendar events
- `GET /api/outlook/contacts` - Get contacts
- `POST /api/outlook/send` - Send email
- `POST /api/outlook/event` - Create calendar event

#### SharePoint Operations
- `GET /api/sharepoint/sites` - Get SharePoint sites

#### OneDrive Operations
- `GET /api/onedrive/files` - Get root files
- `GET /api/onedrive/recent` - Get recent files

#### Graph Operations
- `GET /api/graph/me` - Get current user

## Troubleshooting

### Common Issues

#### Authentication Errors

1. **Invalid client secret**: Ensure the secret hasn't expired
2. **Insufficient permissions**: Verify all required permissions are granted
3. **Tenant ID mismatch**: Check the tenant ID is correct

#### API Permission Issues

1. **Access denied**: Ensure admin consent is granted
2. **Scope errors**: Verify the application has the required permissions

#### Network Issues

1. **Connection timeouts**: Check firewall and proxy settings
2. **SSL errors**: Ensure proper certificate configuration

### Logging

Enable debug logging by setting the log level:

```typescript
import { logger } from '@mcp/shared';

logger.setLevel('DEBUG');
```

### Support

For technical support:
1. Check the application logs
2. Verify Azure AD configuration
3. Test with minimal permissions first
4. Contact your Azure administrator if needed

## Security Considerations

1. **Secret Management**: Store client secrets securely, never in source code
2. **Principle of Least Privilege**: Only grant necessary permissions
3. **Regular Secret Rotation**: Update client secrets regularly
4. **Audit Logs**: Monitor application usage in Azure AD
5. **Network Security**: Use HTTPS for all communications

## Production Deployment

### Recommendations

1. Use Azure Key Vault for secret storage
2. Implement proper error handling and retry logic
3. Set up monitoring and alerting
4. Use separate Azure AD applications for different environments
5. Implement rate limiting to respect Microsoft Graph throttling limits

### Performance Optimization

1. Cache authentication tokens appropriately
2. Use batch requests when possible
3. Implement proper pagination for large result sets
4. Monitor and respect rate limits

## Compliance and Governance

Ensure compliance with your organization's:
- Data governance policies
- Privacy requirements
- Security standards
- Regulatory requirements

Review and update permissions regularly to maintain security posture.