# ==========================================
# JEEVAN AI - Frontend Web Dockerfile
# Optimized for Next.js in a Turborepo Workspace
# ==========================================

# 1. Base Image
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 2. Prune Workspace
FROM base AS builder
# Set working directory
WORKDIR /app
# Install turbo globally for pruning
RUN npm install -g turbo
COPY . .
# Generate a pruned workspace containing only the web app and its dependencies
RUN turbo prune --scope=@jeevan-ai/web --docker

# 3. Install & Build
FROM base AS installer
WORKDIR /app
# Copy pruned lockfile and package.json's
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy pruned source code
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Build the project
# Note: Next.js standalone output must be enabled in next.config.ts for this to work optimally.
RUN pnpm turbo run build --filter=@jeevan-ai/web

# 4. Runner (Production Image)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/web/next.config.ts .
COPY --from=installer /app/apps/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
