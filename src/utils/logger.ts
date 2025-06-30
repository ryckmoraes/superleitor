
/**
 * Disabled logger utility - no-op implementation
 */
type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
}

class Logger {
  // All methods are now no-ops to prevent any potential issues
  log(level: LogLevel, message: string, details?: any) {
    // Disabled - no logging
  }

  info(m: string, d?: any) { /* disabled */ }
  warn(m: string, d?: any) { /* disabled */ }
  error(m: string, d?: any) { /* disabled */ }
  debug(m: string, d?: any) { /* disabled */ }

  navigation(from: string, to: string, reason?: string) { /* disabled */ }
  onboarding(step: string, data?: any) { /* disabled */ }

  exportLogs(): string {
    return "[]";
  }

  getRecentLogs(count: number = 20): LogEntry[] {
    return [];
  }

  getAllLogs(): LogEntry[] {
    return [];
  }

  clear() { /* disabled */ }

  getCriticalErrors(): LogEntry[] {
    return [];
  }
}

export const logger = new Logger();
