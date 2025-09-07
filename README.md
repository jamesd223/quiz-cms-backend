# Quiz CMS Backend

Production-ready REST backend with Node 20, Express, TypeScript, MongoDB (Mongoose), Zod, OpenAPI 3.1, Swagger UI, and security middlewares.

## Requirements

- Node >= 20
- MongoDB

## Setup

```bash
pnpm install
cp .env.example .env
pnpm run dev
```

Or using Docker:

```bash
docker-compose up --build
```

## Scripts

- dev: start TS server with watch (pnpm run dev)
- build: compile to dist (pnpm run build)
- start: run compiled server (pnpm start)
- seed: seed minimal data (pnpm run seed)
- test: run unit/e2e tests (pnpm test)
- openapi: emit OpenAPI JSON (pnpm run openapi)

## Env

Example `.env` values:

```
MONGODB_URI=mongodb://localhost:27017/quizcms
JWT_SECRET=s3cr3t_dev_access
REFRESH_SECRET=s3cr3t_dev_refresh
CORS_ORIGINS=http://localhost:3001,http://localhost:3002
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
RATE_LIMIT_SUBMIT_WINDOW_MS=60000
RATE_LIMIT_SUBMIT_MAX=20
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

## Endpoints

- GET /health
- Swagger UI: /docs
- OpenAPI JSON: /openapi.json
- Public:
  - GET /v1/quizzes/:slug?version=A
  - GET /v1/versions/public/:quizId
  - POST /v1/submissions
- Auth:
  - POST /v1/auth/login
  - POST /v1/auth/refresh
  - POST /v1/auth/logout
