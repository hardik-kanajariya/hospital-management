/**
 * Frontend Configuration
 * Manages environment variables and feature flags
 */

export const config = {
    api: {
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
    },

    app: {
        name: import.meta.env.VITE_APP_NAME || 'MedCare Hospital Management',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0'
    },

    features: {
        showDemoAccounts: import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === 'true',
    },

    // Development flags
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    mode: import.meta.env.MODE
} as const;

export default config;
