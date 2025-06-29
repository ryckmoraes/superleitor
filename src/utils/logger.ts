
/**
 * Simplified logger utility for Android debugging
 */
type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
}

const LOG_KEY = "superleitor_debug_log";
const MAX_LOGS = 50;

class Logger {
  private logs: LogEntry[] = [];
  private initialized = false;

  constructor() {
    this.initAsync();
  }

  private async initAsync() {
    try {
      const stored = localStorage.getItem(LOG_KEY);
      if (stored) {
        this.logs = JSON.parse(stored).slice(-MAX_LOGS);
      }
    } catch (e) {
      // Silent fail - don't block initialization
    }
    this.initialized = true;
  }

  log(level: LogLevel, message: string, details?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details
    };
    
    // Always log to console immediately with more detail
    const consoleMessage = `[Superleitor][${level.toUpperCase()}][${new Date().toLocaleTimeString()}] ${message}`;
    
    if (level === "error") {
      console.error(consoleMessage, details || '');
    } else if (level === "warn") {
      console.warn(consoleMessage, details || '');
    } else if (level === "debug") {
      console.debug(consoleMessage, details || '');
    } else {
      console.log(consoleMessage, details || '');
    }

    // Store in memory
    this.logs.push(entry);
    
    // Keep only recent logs
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS);
    }
    
    // Persist asynchronously without blocking
    if (this.initialized) {
      requestIdleCallback(() => {
        try {
          localStorage.setItem(LOG_KEY, JSON.stringify(this.logs));
        } catch (e) {
          // Silent fail
        }
      });
    }
  }

  info(m: string, d?: any) { this.log("info", m, d); }
  warn(m: string, d?: any) { this.log("warn", m, d); }
  error(m: string, d?: any) { this.log("error", m, d); }
  debug(m: string, d?: any) { this.log("debug", m, d); }

  // Método específico para rastrear navegação
  navigation(from: string, to: string, reason?: string) {
    this.info(`NAVEGAÇÃO: ${from} -> ${to}${reason ? ` (${reason})` : ''}`);
  }

  // Método específico para rastrear onboarding
  onboarding(step: string, data?: any) {
    this.info(`ONBOARDING: ${step}`, data);
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  getRecentLogs(count: number = 20): LogEntry[] {
    return this.logs.slice(-count);
  }

  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
    try {
      localStorage.removeItem(LOG_KEY);
    } catch (e) {
      // Silent fail
    }
  }

  getCriticalErrors(): LogEntry[] {
    return this.logs.filter(log => log.level === "error");
  }
}

export const logger = new Logger();
