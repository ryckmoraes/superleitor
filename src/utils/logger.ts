
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
const MAX_LOGS = 100; // Reduced from 500

class Logger {
  private logs: LogEntry[] = [];
  private initialized = false;

  constructor() {
    // Defer initialization to avoid blocking startup
    setTimeout(() => this.init(), 100);
  }

  private init() {
    try {
      const stored = localStorage.getItem(LOG_KEY);
      if (stored) {
        this.logs = JSON.parse(stored).slice(-MAX_LOGS);
      }
    } catch (e) {
      console.warn("Failed to load stored logs:", e);
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
    
    // Always log to console immediately
    const consoleMessage = `[Superleitor][${level.toUpperCase()}] ${message}`;
    
    if (level === "error") {
      console.error(consoleMessage, details);
    } else if (level === "warn") {
      console.warn(consoleMessage, details);
    } else if (level === "debug") {
      console.debug(consoleMessage, details);
    } else {
      console.log(consoleMessage, details);
    }

    // Store in memory
    this.logs.push(entry);
    
    // Keep only recent logs
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS);
    }
    
    // Persist to localStorage asynchronously to avoid blocking
    if (this.initialized) {
      setTimeout(() => {
        try {
          localStorage.setItem(LOG_KEY, JSON.stringify(this.logs));
        } catch (e) {
          console.warn("Failed to persist logs:", e);
        }
      }, 0);
    }
  }

  info(m: string, d?: any) { this.log("info", m, d); }
  warn(m: string, d?: any) { this.log("warn", m, d); }
  error(m: string, d?: any) { this.log("error", m, d); }
  debug(m: string, d?: any) { this.log("debug", m, d); }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Add public getter for logs
  getAllLogs(): LogEntry[] {
    return this.logs;
  }

  clear() {
    this.logs = [];
    try {
      localStorage.removeItem(LOG_KEY);
    } catch (e) {
      console.warn("Failed to clear logs:", e);
    }
  }

  getCriticalErrors(): LogEntry[] {
    return this.logs.filter(log => log.level === "error");
  }
}

export const logger = new Logger();
