/**
 * Structured Logging Utility
 * 
 * Basic structured logging for production hardening.
 * Environment-aware (dev vs prod).
 * Easily replaceable with a real logger (Winston, Pino, etc.) later.
 * 
 * Logs are structured as JSON for easy parsing and aggregation.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: LogContext;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Sanitize sensitive data from logs
 */
function sanitize(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveKeys = [
    'password',
    'passwordHash',
    'token',
    'sessionToken',
    'secret',
    'apiKey',
    'authorization',
  ];

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitize(value);
    }
  }

  return sanitized;
}

/**
 * Format log entry
 */
function formatLog(entry: LogEntry): string {
  const logData = {
    ...entry,
    context: entry.context ? sanitize(entry.context) : undefined,
  };

  if (isDevelopment) {
    // Pretty print in development
    return JSON.stringify(logData, null, 2);
  }

  // Compact JSON in production
  return JSON.stringify(logData);
}

/**
 * Write log to console (replace with real logger in production)
 */
function writeLog(level: LogLevel, entry: LogEntry): void {
  const formatted = formatLog(entry);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'debug':
      if (isDevelopment) {
        console.debug(formatted);
      }
      break;
    default:
      console.log(formatted);
  }
}

/**
 * Generate request ID for correlation
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Logger instance
 */
export const logger = {
  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    writeLog('info', {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
    });
  },

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    writeLog('warn', {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
    });
  },

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    writeLog('error', {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: isDevelopment ? error.stack : undefined,
          }
        : undefined,
      context,
    });
  },

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (isDevelopment) {
      writeLog('debug', {
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        context,
      });
    }
  },

  /**
   * Log HTTP request
   */
  request(
    requestId: string,
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): void {
    writeLog('info', {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'HTTP request',
      requestId,
      method,
      path,
      statusCode,
      duration,
      userId,
    });
  },

  /**
   * Log authentication failure
   */
  authFailure(requestId: string, path: string, reason: string, ip?: string): void {
    writeLog('warn', {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: 'Authentication failure',
      requestId,
      path,
      context: {
        reason,
        ip,
      },
    });
  },

  /**
   * Log admin action
   */
  adminAction(
    requestId: string,
    action: string,
    adminId: string,
    targetId?: string,
    details?: LogContext
  ): void {
    writeLog('info', {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Admin action',
      requestId,
      userId: adminId,
      context: {
        action,
        targetId,
        ...details,
      },
    });
  },
};

