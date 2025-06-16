/**
 * Enhanced logger utility for Android debugging
 */
type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
  context?: {
    url?: string;
    userAgent?: string;
    platform?: string;
  };
}

const LOG_KEY = "superleitor_debug_log";

class Logger {
  logs: LogEntry[] = [];

  constructor() {
    // Load existing logs from localStorage
    try {
      const stored = localStorage.getItem(LOG_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to load stored logs:", e);
    }
    
    // Log initialization
    this.log("info", "Logger initialized", {
      timestamp: new Date().toISOString(),
      logsCount: this.logs.length
    });
  }

  log(level: LogLevel, message: string, details?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 100),
        platform: this.detectPlatform()
      }
    };
    
    this.logs.push(entry);
    
    // Keep only last 500 entries to prevent memory issues
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(-500);
    }
    
    // Persist to localStorage
    try {
      localStorage.setItem(LOG_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.warn("Failed to persist logs:", e);
    }
    
    // Console output with enhanced formatting
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
  }

  private detectPlatform(): string {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) return "Android";
    if (/iPhone|iPad/i.test(ua)) return "iOS";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Mac/i.test(ua)) return "Mac";
    if (/Linux/i.test(ua)) return "Linux";
    return "Unknown";
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

  clear() {
    this.logs = [];
    localStorage.removeItem(LOG_KEY);
    this.log("info", "Logs cleared");
  }

  // Method to get critical errors for debugging
  getCriticalErrors(): LogEntry[] {
    return this.logs.filter(log => log.level === "error");
  }
}

export const logger = new Logger();
