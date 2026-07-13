# syntax=docker/dockerfile:1.7
# Multi-stage build for the NestJS API in a pnpm + Turborepo monorepo.
# Build context is the repository root.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ── Prune the workspace down to @ksp/api ──
FROM base AS pruner
RUN pnpm add -g turbo@^2.3.3
COPY . .
RUN turbo prune @ksp/api --docker

# ── Install dependencies and build ──
FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @ksp/api db:generate
RUN pnpm --filter @ksp/api build
RUN pnpm --filter @ksp/api --prod deploy /app/pruned

# ── Runtime ──
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs
WORKDIR /app
COPY --from=builder --chown=nestjs:nodejs /app/pruned/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma
USER nestjs
EXPOSE 4000
CMD ["node", "dist/main.js"]
