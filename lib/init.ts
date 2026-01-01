/**
 * Application Initialization
 * 
 * Validates environment variables at startup.
 * Call this early in the application lifecycle.
 */

import { getEnv } from './env';
import { logger } from './logger';

/**
 * Initialize application (validate environment)
 * Call this at application startup
 */
export function initializeApp(): void {
  try {
    const env = getEnv();
    logger.info('Application initialized', {
      nodeEnv: env.NODE_ENV,
      databaseConfigured: !!env.DATABASE_URL,
    });
  } catch (error) {
    logger.error(
      'Application initialization failed',
      error instanceof Error ? error : new Error(String(error))
    );
    // In production, we want to fail fast
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
}

// Auto-initialize when module is imported
if (typeof window === 'undefined') {
  // Only run on server
  initializeApp();
}

