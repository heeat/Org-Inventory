import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './Logger';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: any;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
    this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): void {
    try {
      const configPath = path.join(__dirname, '../config/default.json');
      const configContent = fs.readFileSync(configPath, 'utf8');
      this.config = JSON.parse(configContent);
      this.logger.info('Configuration loaded successfully');
    } catch (error) {
      this.logger.error('Error loading configuration:', error);
      throw new Error('Failed to load configuration');
    }
  }

  public getConfig(): any {
    return this.config;
  }

  public getCloudProductMappings(): { [key: string]: string } {
    return this.config.detectionRules.cloudProducts.packageBased.mappings;
  }

  public getObjectBasedRules(): { [key: string]: any } {
    return this.config.detectionRules.cloudProducts.objectBased;
  }

  public getIntegrationTypes(): string[] {
    return this.config.detectionRules.integrations.types;
  }

  public getBatchSize(): number {
    return this.config.performance.batchSize;
  }

  public getRetryConfig(): { attempts: number; delay: number } {
    return {
      attempts: this.config.performance.retryAttempts,
      delay: this.config.performance.retryDelay
    };
  }

  public getRateLimit(): { requests: number; window: number } {
    return this.config.security.rateLimit;
  }
} 