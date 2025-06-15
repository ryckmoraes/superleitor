
/**
 * Simple logger utility: logs to console and persists in localStorage.
 */
type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
}

const LOG_KEY = "superleitor_debug_log";

class Logger {
  logs: LogEntry[] = [];

  constructor() {
    // Load existing logs from localStorage (persist across reloads)
    try {
      const stored = localStorage.getItem(LOG_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch {}
  }

  log(level: LogLevel, message: string, details?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    };
    this.logs.push(entry);
    // Save last 300 lines to avoid overgrowth
    if (this.logs.length > 300) this.logs = this.logs.slice(-300);
    try {
      localStorage.setItem(LOG_KEY, JSON.stringify(this.logs));
    } catch {}
    // Always log on console as well
    // eslint-disable-next-line no-console
    if (level === "error") {
      console.error("[Superleitor]", message, details);
    } else if (level === "warn") {
      console.warn("[Superleitor]", message, details);
    } else {
      console.log("[Superleitor]", level, message, details);
    }
  }

  info(m: string, d?: any) { this.log("info", m, d); }
  warn(m: string, d?: any) { this.log("warn", m, d); }
  error(m: string, d?: any) { this.log("error", m, d); }
  debug(m: string, d?: any) { this.log("debug", m, d); }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clear() {
    this.logs = [];
    localStorage.removeItem(LOG_KEY);
  }
}

export const logger = new Logger();
