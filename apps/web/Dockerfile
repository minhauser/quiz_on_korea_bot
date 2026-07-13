# syntax=docker/dockerfile:1.7
# Multi-stage build for the Next.js web app (standalone output) in a
# pnpm + Turborepo monorepo. Build context is the repository root.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ── Prune the workspace down to @ksp/web ──
FROM base AS pruner
RUN pnpm add -g turbo@^2.3.3
COPY . .
RUN turbo prune @ksp/web --docker

# ── Install dependencies and build ──
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @ksp/web build

# ── Runtime ──
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
