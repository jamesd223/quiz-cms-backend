// Express 5 types are already included via @types/express@^5
declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI?: string;
    JWT_SECRET?: string;
    REFRESH_SECRET?: string;
    CORS_ORIGINS?: string;
    RATE_LIMIT_WINDOW_MS?: string;
    RATE_LIMIT_MAX?: string;
    RATE_LIMIT_SUBMIT_WINDOW_MS?: string;
    RATE_LIMIT_SUBMIT_MAX?: string;
    PORT?: string;
    NODE_ENV?: "development" | "test" | "production";
    LOG_LEVEL?: string;
  }
}
