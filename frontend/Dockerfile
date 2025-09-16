# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Enable corepack to use pnpm
RUN corepack enable

FROM base AS deps
COPY frontend/package.json frontend/pnpm-lock.yaml ./
# Lockfile in repo is not in sync; allow resolution during build
RUN pnpm install --no-frozen-lockfile

FROM base AS build
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY frontend .
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 3000
CMD ["pnpm", "start"]
