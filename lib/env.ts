/**
 * Environment Variable Validation
 * 
 * Validates required environment variables at startup.
 * Fails fast if critical variables are missing.
 */

interface EnvConfig {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

/**
 * Validate and return environment variables
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Required variables
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  // NODE_ENV defaults to development if not set
  const NODE_ENV = (process.env.NODE_ENV ||
    'development') as EnvConfig['NODE_ENV'];

  if (!['development', 'production', 'test'].includes(NODE_ENV)) {
    errors.push(
      `NODE_ENV must be one of: development, production, test. Got: ${NODE_ENV}`
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
    );
  }

  return {
    DATABASE_URL: DATABASE_URL!,
    NODE_ENV,
  };
}

/**
 * Get validated environment config
 * Call this at application startup
 */
let envConfig: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!envConfig) {
    envConfig = validateEnv();
  }
  return envConfig;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

