/**
 * Example: Intelligent Authentication System for VS Code
 * Demonstrates content-aware authentication that discovers available services
 */

import { VSCodeAuthManager } from './vscode-integration';
import type { AccountCapabilities } from './content-discovery';
import { ContentDiscoveryEngine } from './content-discovery';
import { logger } from '@mcp/shared';

/**
 * Example usage of the intelligent authentication system
 */
export class MCPAuthenticationExample {
  private authManager: VSCodeAuthManager;

  constructor() {
    this.authManager = new VSCodeAuthManager();
  }

  /**
   * Demonstrate the complete authentication flow
   */
  async demonstrateIntelligentAuth() {
    logger.info('🚀 Starting MCP Intelligent Authentication Demo');
    
    try {
      // Initialize the authentication manager
      await this.authManager.initialize();
      
      // Show authentication notification (like GitHub Copilot)
      await this.authManager.showAuthNotification();
      
      // Simulate user choosing Microsoft 365
      logger.info('\n👤 User chose: Microsoft 365');
      const microsoftAuth = await this.authManager.authenticateWithUI('microsoft');
      
      // Show what content was discovered
      await this.showDiscoveredContent('Microsoft 365', microsoftAuth);
      
      // Simulate authenticating with Google as well
      logger.info('\n👤 User also wants to connect Google Workspace');
      const googleAuth = await this.authManager.authenticateWithUI('google');
      
      // Show what content was discovered
      await this.showDiscoveredContent('Google Workspace', googleAuth);
      
      // Show unified view of all available content
      await this.showUnifiedContentView();
      
      // Demonstrate account switching
      await this.demonstrateAccountSwitching();
      
    } catch (error) {
      logger.error(`Authentication demo failed: ${error}`);
    }
  }

  /**
   * Show what content was discovered for an account
   */
  private async showDiscoveredContent(provider: string, authResult: any) {
    logger.info(`\n📊 Content Discovery Results for ${provider}:`);
    
    const capabilities = this.authManager.getCurrentCapabilities();
    if (!capabilities) {
      logger.warn('No capabilities discovered');
      return;
    }
    
    logger.info(`Account Type: ${capabilities.accountType}`);
    if (capabilities.domain) {
      logger.info(`Domain: ${capabilities.domain}`);
    }
    
    logger.info('\n🛠️  Available Services:');
    capabilities.availableServices.forEach(service => {
      const status = service.available ? '✅' : '❌';
      logger.info(`  ${status} ${service.displayName}: ${service.description}`);
    });
    
    logger.info('\n📁 Content Access:');
    const { contentAccess } = capabilities;
    
    if (contentAccess.emails.available) {
      logger.info(`  📧 Emails: ${contentAccess.emails.count || 'Unknown'} messages`);
      if (contentAccess.emails.mailboxes?.length) {
        logger.info(`      Mailboxes: ${contentAccess.emails.mailboxes.join(', ')}`);
      }
    }
    
    if (contentAccess.calendar.available) {
      logger.info(`  📅 Calendar: ${contentAccess.calendar.calendars?.length || 0} calendars`);
    }
    
    if (contentAccess.files.available) {
      logger.info(`  📂 Files: ${contentAccess.files.drives?.length || 0} drives`);
      contentAccess.files.drives?.forEach(drive => {
        const quota = drive.quota;
        if (quota) {
          const usedGB = (quota.used / (1024 * 1024 * 1024)).toFixed(2);
          const totalGB = (quota.total / (1024 * 1024 * 1024)).toFixed(2);
          logger.info(`      ${drive.name}: ${usedGB} GB / ${totalGB} GB used`);
        } else {
          logger.info(`      ${drive.name} (${drive.type})`);
        }
      });
    }
    
    if (contentAccess.teams.available) {
      logger.info(`  👥 Teams: ${contentAccess.teams.teams?.length || 0} teams`);
      contentAccess.teams.teams?.slice(0, 3).forEach(team => {
        logger.info(`      ${team.displayName}`);
      });
    }
    
    if (contentAccess.sites.available) {
      logger.info(`  🌐 Sites: ${contentAccess.sites.sites?.length || 0} SharePoint sites`);
    }
  }

  /**
   * Show unified view of all authenticated accounts
   */
  private async showUnifiedContentView() {
    logger.info('\n🌐 Unified Content View - All Accounts:');
    
    const allCapabilities = await this.authManager.getAvailableContent();
    
    if (allCapabilities.length === 0) {
      logger.info('No authenticated accounts found');
      return;
    }
    
    // Group by content type
    const unifiedView = {
      emails: [] as string[],
      calendars: [] as string[],
      files: [] as string[],
      teams: [] as string[],
      sites: [] as string[]
    };
    
    allCapabilities.forEach(account => {
      const prefix = `${account.provider}:${account.domain || 'personal'}`;
      
      if (account.contentAccess.emails.available) {
        unifiedView.emails.push(`${prefix} (${account.contentAccess.emails.count || 0} messages)`);
      }
      
      if (account.contentAccess.calendar.available) {
        unifiedView.calendars.push(`${prefix} (${account.contentAccess.calendar.calendars?.length || 0} calendars)`);
      }
      
      if (account.contentAccess.files.available) {
        unifiedView.files.push(`${prefix} (${account.contentAccess.files.drives?.length || 0} drives)`);
      }
      
      if (account.contentAccess.teams.available) {
        unifiedView.teams.push(`${prefix} (${account.contentAccess.teams.teams?.length || 0} teams)`);
      }
      
      if (account.contentAccess.sites.available) {
        unifiedView.sites.push(`${prefix} (${account.contentAccess.sites.sites?.length || 0} sites)`);
      }
    });
    
    Object.entries(unifiedView).forEach(([type, sources]) => {
      if (sources.length > 0) {
        logger.info(`📋 ${type.toUpperCase()}:`);
        sources.forEach(source => logger.info(`  • ${source}`));
      }
    });
  }

  /**
   * Demonstrate account switching functionality
   */
  private async demonstrateAccountSwitching() {
    logger.info('\n🔄 Account Switching Demo:');
    
    const allCapabilities = await this.authManager.getAvailableContent();
    
    for (const account of allCapabilities) {
      const accountId = account.domain || 'personal';
      logger.info(`\n🔄 Switching to ${account.provider}:${accountId}`);
      
      try {
        await this.authManager.switchAccount(account.provider, accountId);
        const current = this.authManager.getCurrentCapabilities();
        
        if (current) {
          const serviceCount = current.availableServices.filter(s => s.available).length;
          logger.info(`✅ Now using ${current.provider} account with ${serviceCount} services`);
        }
      } catch (error) {
        logger.warn(`Failed to switch to ${account.provider}:${accountId}: ${error}`);
      }
    }
  }

  /**
   * Demonstrate content-based workflow suggestions
   */
  async demonstrateWorkflowSuggestions() {
    logger.info('\n💡 Intelligent Workflow Suggestions:');
    
    const allCapabilities = await this.authManager.getAvailableContent();
    const suggestions: string[] = [];
    
    // Analyze available content and suggest workflows
    const hasEmail = allCapabilities.some(acc => acc.contentAccess.emails.available);
    const hasCalendar = allCapabilities.some(acc => acc.contentAccess.calendar.available);
    const hasFiles = allCapabilities.some(acc => acc.contentAccess.files.available);
    const hasTeams = allCapabilities.some(acc => acc.contentAccess.teams.available);
    
    if (hasEmail && hasCalendar) {
      suggestions.push('📅 Create calendar events from email invitations');
      suggestions.push('📧 Send meeting summaries via email');
    }
    
    if (hasFiles && hasTeams) {
      suggestions.push('📁 Share files with team members');
      suggestions.push('💬 Discuss documents in team channels');
    }
    
    if (hasEmail && hasFiles) {
      suggestions.push('📎 Automatically save email attachments to cloud storage');
      suggestions.push('🔗 Share file links instead of attachments');
    }
    
    // Multi-platform suggestions
    const microsoftAccount = allCapabilities.find(acc => acc.provider === 'microsoft');
    const googleAccount = allCapabilities.find(acc => acc.provider === 'google');
    
    if (microsoftAccount && googleAccount) {
      suggestions.push('🔄 Sync calendars between Microsoft and Google');
      suggestions.push('📋 Cross-platform task management');
      suggestions.push('🌐 Unified search across both platforms');
    }
    
    if (suggestions.length > 0) {
      logger.info('Based on your available content, you can:');
      suggestions.forEach(suggestion => logger.info(`  • ${suggestion}`));
    } else {
      logger.info('Connect more accounts to see intelligent workflow suggestions');
    }
  }
}

/**
 * Run the authentication example
 */
export async function runAuthExample() {
  const example = new MCPAuthenticationExample();
  
  try {
    await example.demonstrateIntelligentAuth();
    await example.demonstrateWorkflowSuggestions();
  } catch (error) {
    logger.error(`Example failed: ${error}`);
  }
}

// Export for VS Code task usage
if (require.main === module) {
  runAuthExample().catch(console.error);
}