import { Logger } from './Logger';
import { ConfigManager } from './ConfigManager';

export class RetryUtil {
  private static instance: RetryUtil;
  private logger: Logger;
  private config: ConfigManager;

  private constructor() {
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
  }

  public static getInstance(): RetryUtil {
    if (!RetryUtil.instance) {
      RetryUtil.instance = new RetryUtil();
    }
    return RetryUtil.instance;
  }

  public async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const { attempts, delay } = this.config.getRetryConfig();
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Attempt ${attempt}/${attempts} failed for ${operationName}`, {
          error: lastError.message,
          attempt,
          totalAttempts: attempts
        });

        if (attempt < attempts) {
          await this.sleep(delay * attempt); // Exponential backoff
        }
      }
    }

    this.logger.error(`All ${attempts} attempts failed for ${operationName}`, lastError);
    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 