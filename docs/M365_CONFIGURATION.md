# Microsoft 365 MCP Orchestration Configuration

## Environment Variables

The Microsoft 365 agents require the following environment variables to be set:

### Required Variables

```bash
# Microsoft 365 Application Registration
M365_CLIENT_ID=your-azure-app-client-id
M365_TENANT_ID=your-azure-tenant-id

# Optional Variables
M365_REDIRECT_URI=http://localhost:3000/auth/callback
M365_SCOPES=https://graph.microsoft.com/.default
```

### Azure App Registration Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Configure your application:
   - Name: "MCP Orchestration System"
   - Supported account types: "Accounts in this organizational directory only"
   - Redirect URI: Web → http://localhost:3000/auth/callback
5. After creation, note the "Application (client) ID" and "Directory (tenant) ID"
6. Go to "API permissions" and add Microsoft Graph permissions:
   - User.Read
   - Mail.Read
   - Calendars.Read
   - Files.Read
   - Team.ReadBasic.All
   - Channel.ReadBasic.All
   - ChatMessage.Read
7. Grant admin consent for your organization

### Available Endpoints

Once configured, the M365 agents provide these endpoints:

#### Microsoft 365 Graph API Server (Port 3013)
- `GET /status` - Server and authentication status
- `GET /user` - Current user profile
- `GET /calendar?start=ISO8601&end=ISO8601` - Calendar events
- `GET /mail?top=25&skip=0` - Mail messages
- `GET /drive?path=folder/path` - OneDrive files
- `GET /search?q=search-query&types=message,event,driveItem` - Search across M365

#### Microsoft 365 Teams Server (Port 3009)
- `GET /teams` - User's teams
- `GET /teams/{teamId}/channels` - Team channels
- `GET /teams/{teamId}/channels/{channelId}/messages` - Channel messages
- `POST /teams/{teamId}/channels/{channelId}/messages` - Send message
- `GET /meetings` - Teams meetings
- `POST /meetings` - Schedule meeting

#### Microsoft 365 Outlook Server (Port 3010)
- `GET /messages` - Inbox messages
- `POST /messages` - Send email
- `GET /events` - Calendar events
- `POST /events` - Create event
- `GET /contacts` - Contacts

### Example Usage

```bash
# Check M365 Graph API status
curl http://localhost:3013/status

# Get current user
curl http://localhost:3013/user

# Get calendar events for today
curl "http://localhost:3013/calendar?start=$(date -u +%Y-%m-%dT00:00:00Z)&end=$(date -u +%Y-%m-%dT23:59:59Z)"

# Search for files
curl "http://localhost:3013/search?q=presentation&types=driveItem"
```

### Security Notes

- Store credentials securely using environment variables or Azure Key Vault
- Use principle of least privilege for API permissions
- Regularly rotate client secrets if using them
- Monitor API usage and access logs
- Consider using Managed Identity in Azure environments

### Troubleshooting

1. **Authentication Errors**: Verify CLIENT_ID and TENANT_ID are correct
2. **Permission Denied**: Ensure proper API permissions are granted and admin consent given
3. **Network Issues**: Check firewall and proxy settings
4. **Token Expiration**: The system handles token refresh automatically

For more detailed Microsoft Graph API documentation, visit: https://docs.microsoft.com/en-us/graph/