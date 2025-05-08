import { ConfigManager } from './ConfigManager';

export class Logger {
  private static instance: Logger;
  private config: ConfigManager;

  private constructor() {
    this.config = ConfigManager.getInstance();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(meta && { meta })
    };

    return JSON.stringify(logEntry);
  }

  public info(message: string, meta?: any): void {
    console.log(this.formatMessage('INFO', message, meta));
  }

  public error(message: string, error?: any): void {
    console.error(this.formatMessage('ERROR', message, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    }));
  }

  public warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('WARN', message, meta));
  }

  public debug(message: string, meta?: any): void {
    if (this.config.getConfig().logging.level === 'debug') {
      console.debug(this.formatMessage('DEBUG', message, meta));
    }
  }

  public trace(message: string, meta?: any): void {
    if (this.config.getConfig().logging.level === 'trace') {
      console.trace(this.formatMessage('TRACE', message, meta));
    }
  }
} 