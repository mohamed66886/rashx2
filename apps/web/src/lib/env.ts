/**
 * RASHX Environment Variable Validation
 *
 * All environment variables must be declared and typed here.
 * Never access process.env directly in components.
 * Add Zod validation in Phase 3 when forms are introduced.
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Check .env.example for required variables.`,
    );
  }
  return value;
}

function getPublicEnvVar(key: string, defaultValue?: string): string {
  return getEnvVar(key, defaultValue);
}

export const env = {
  nodeEnv: (process.env['NODE_ENV'] ?? 'development') as
    | 'development'
    | 'test'
    | 'production',
  siteUrl: getPublicEnvVar('NEXT_PUBLIC_SITE_URL', 'https://rashx.org'),
  appUrl: getPublicEnvVar('NEXT_PUBLIC_APP_URL', 'https://app.rashx.org'),
  isDevelopment: process.env['NODE_ENV'] === 'development',
  isProduction: process.env['NODE_ENV'] === 'production',
  isTest: process.env['NODE_ENV'] === 'test',
} as const;

export type Env = typeof env;
