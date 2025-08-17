import { createLogger } from './logger';
import { promises as fs } from 'fs';
import path from 'path';

const logger = createLogger('repository-bridge');

/**
 * Configuration for a repository bridge
 */
export interface RepositoryBridgeConfig {
  /** The main repository that serves as the orchestration hub */
  mainRepository: {
    owner: string;
    name: string;
    /** Optional custom organization override */
    organization?: string;
  };
  /** Connected repositories that this bridge manages */
  connectedRepositories: Array<{
    owner: string;
    name: string;
    /** Type of connection (e.g., 'dependency', 'service', 'module') */
    type: string;
    /** Branch patterns to monitor/manage */
    branchPatterns?: string[];
    /** Whether this repo is actively managed */
    enabled?: boolean;
  }>;
  /** Global configuration for the bridge */
  bridgeConfig: {
    /** Default branch patterns to manage across all repos */
    defaultBranchPatterns: string[];
    /** Default branches to exclude from management */
    excludeBranches: string[];
    /** Default minimum age for branch cleanup */
    defaultMinAgeDays: number;
    /** GitHub organization or user (fallback if not specified per repo) */
    defaultOrganization?: string;
  };
}

/**
 * Default bridge configuration
 */
export const DEFAULT_BRIDGE_CONFIG: RepositoryBridgeConfig = {
  mainRepository: {
    owner: '',
    name: '',
  },
  connectedRepositories: [],
  bridgeConfig: {
    defaultBranchPatterns: ['copilot/*', 'feature/*', 'hotfix/*'],
    excludeBranches: ['main', 'master', 'develop', 'production', 'staging'],
    defaultMinAgeDays: 7,
  },
};

/**
 * Repository Bridge Manager
 * Manages connections and routing between a main repository and its connected repositories
 */
export class RepositoryBridge {
  private config: RepositoryBridgeConfig;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), 'repository-bridge.json');
    this.config = { ...DEFAULT_BRIDGE_CONFIG };
  }

  /**
   * Initialize the repository bridge from configuration file
   */
  async initialize(): Promise<void> {
    try {
      await this.loadConfig();
      logger.info('Repository bridge initialized successfully');
      logger.info(`Main repository: ${this.config.mainRepository.owner}/${this.config.mainRepository.name}`);
      logger.info(`Connected repositories: ${this.config.connectedRepositories.length}`);
    } catch (error) {
      logger.warn(`Could not load bridge config from ${this.configPath}, using defaults`);
      await this.saveConfig(); // Create default config file
    }
  }

  /**
   * Load bridge configuration from file
   */
  async loadConfig(): Promise<void> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      const loadedConfig = JSON.parse(configData) as RepositoryBridgeConfig;
      
      // Merge with defaults to ensure all required fields exist
      this.config = {
        ...DEFAULT_BRIDGE_CONFIG,
        ...loadedConfig,
        bridgeConfig: {
          ...DEFAULT_BRIDGE_CONFIG.bridgeConfig,
          ...loadedConfig.bridgeConfig,
        },
      };

      logger.info(`Bridge configuration loaded from ${this.configPath}`);
    } catch (error) {
      throw new Error(`Failed to load bridge configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Save current bridge configuration to file
   */
  async saveConfig(): Promise<void> {
    try {
      const configData = JSON.stringify(this.config, null, 2);
      await fs.writeFile(this.configPath, configData, 'utf-8');
      logger.info(`Bridge configuration saved to ${this.configPath}`);
    } catch (error) {
      throw new Error(`Failed to save bridge configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set the main repository for this bridge
   */
  setMainRepository(owner: string, name: string, organization?: string): void {
    this.config.mainRepository = {
      owner,
      name,
      organization,
    };
    logger.info(`Main repository set to: ${owner}/${name}`);
  }

  /**
   * Add a connected repository to the bridge
   */
  addConnectedRepository(
    owner: string,
    name: string,
    type: string,
    options: {
      branchPatterns?: string[];
      enabled?: boolean;
    } = {}
  ): void {
    const repo = {
      owner,
      name,
      type,
      branchPatterns: options.branchPatterns || this.config.bridgeConfig.defaultBranchPatterns,
      enabled: options.enabled !== false, // Default to enabled
    };

    // Check if repository already exists
    const existingIndex = this.config.connectedRepositories.findIndex(
      r => r.owner === owner && r.name === name
    );

    if (existingIndex >= 0) {
      this.config.connectedRepositories[existingIndex] = repo;
      logger.info(`Updated connected repository: ${owner}/${name}`);
    } else {
      this.config.connectedRepositories.push(repo);
      logger.info(`Added connected repository: ${owner}/${name} (type: ${type})`);
    }
  }

  /**
   * Remove a connected repository from the bridge
   */
  removeConnectedRepository(owner: string, name: string): boolean {
    const initialLength = this.config.connectedRepositories.length;
    this.config.connectedRepositories = this.config.connectedRepositories.filter(
      r => !(r.owner === owner && r.name === name)
    );

    if (this.config.connectedRepositories.length < initialLength) {
      logger.info(`Removed connected repository: ${owner}/${name}`);
      return true;
    }
    
    logger.warn(`Repository not found: ${owner}/${name}`);
    return false;
  }

  /**
   * Get all repositories managed by this bridge (main + connected)
   */
  getAllRepositories(): Array<{ owner: string; name: string; type: string; enabled: boolean }> {
    const repositories = [
      {
        owner: this.config.mainRepository.owner,
        name: this.config.mainRepository.name,
        type: 'main',
        enabled: true,
      },
    ];

    // Add enabled connected repositories
    repositories.push(
      ...this.config.connectedRepositories
        .filter(repo => repo.enabled !== false)
        .map(repo => ({
          owner: repo.owner,
          name: repo.name,
          type: repo.type,
          enabled: repo.enabled !== false,
        }))
    );

    return repositories;
  }

  /**
   * Get repository names in the format expected by the universal branch manager
   */
  getRepositoryNames(): string[] {
    return this.getAllRepositories().map(repo => repo.name);
  }

  /**
   * Get the effective organization for a repository
   */
  getEffectiveOrganization(owner?: string): string {
    return (
      owner ||
      this.config.mainRepository.organization ||
      this.config.bridgeConfig.defaultOrganization ||
      this.config.mainRepository.owner ||
      'poisontr33s' // Ultimate fallback
    );
  }

  /**
   * Get bridge configuration
   */
  getConfig(): RepositoryBridgeConfig {
    return { ...this.config }; // Return a copy to prevent external mutation
  }

  /**
   * Update bridge configuration
   */
  updateBridgeConfig(updates: Partial<RepositoryBridgeConfig['bridgeConfig']>): void {
    this.config.bridgeConfig = {
      ...this.config.bridgeConfig,
      ...updates,
    };
    logger.info('Bridge configuration updated');
  }

  /**
   * Validate the current configuration
   */
  validateConfig(): Array<string> {
    const errors: string[] = [];

    if (!this.config.mainRepository.owner) {
      errors.push('Main repository owner is required');
    }

    if (!this.config.mainRepository.name) {
      errors.push('Main repository name is required');
    }

    // Validate connected repositories
    this.config.connectedRepositories.forEach((repo, index) => {
      if (!repo.owner) {
        errors.push(`Connected repository ${index + 1}: owner is required`);
      }
      if (!repo.name) {
        errors.push(`Connected repository ${index + 1}: name is required`);
      }
      if (!repo.type) {
        errors.push(`Connected repository ${index + 1}: type is required`);
      }
    });

    return errors;
  }

  /**
   * Auto-discover repositories for a given organization
   */
  async autoDiscoverRepositories(organization: string, options: {
    includePatterns?: string[];
    excludePatterns?: string[];
    maxRepositories?: number;
  } = {}): Promise<Array<{ owner: string; name: string; description?: string }>> {
    logger.info(`Auto-discovering repositories for organization: ${organization}`);
    
    // This would typically use GitHub API to discover repositories
    // For now, we'll return a placeholder that demonstrates the concept
    const discovered: Array<{ owner: string; name: string; description?: string }> = [];
    
    // In a real implementation, this would:
    // 1. Call GitHub API to list organization repositories
    // 2. Filter by include/exclude patterns
    // 3. Limit by maxRepositories
    // 4. Return repository metadata
    
    logger.info(`Auto-discovery would find repositories for ${organization} (placeholder implementation)`);
    return discovered;
  }
}

export default RepositoryBridge;