export const API_CONSTANTS = {
  BASE_URL: 'http://localhost:8001',
  ENDPOINTS: {
    ASK: '/ask',
    DOCS: '/docs',
    ROOT: '/'
  },
  DEFAULT_TIMEOUT_MS: 300000,
  RETRY_ATTEMPTS: 1
} as const;
