# syntax=docker/dockerfile:1.7
# Kesari website + Kesari Studio (CMS): Next.js 16, built as a standalone server.

ARG NODE_VERSION=22-alpine

# ---- deps ----
FROM node:${NODE_VERSION} AS deps
# sharp (image optimisation) and some native modules expect glibc shims on Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# ---- build ----
FROM node:${NODE_VERSION} AS build
RUN apk add --no-cache libc6-compat
WORKDIR /app

# The public API URL is inlined into the browser bundle, so it is a build argument,
# e.g. https://kesari.example.com/api. Rebuild the image when it changes.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN test -n "$NEXT_PUBLIC_API_URL" || (echo "Set the NEXT_PUBLIC_API_URL build arg" && exit 1)
RUN npm run build

# ---- runtime: only the standalone server, static assets and public/ ----
FROM node:${NODE_VERSION} AS runtime
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Cached pages and optimised images; mount a volume here to keep them across restarts.
RUN mkdir -p .next/cache && chown -R node:node .next/cache

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/favicon.ico').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# API_INTERNAL_URL (runtime) lets server rendering reach the API privately, e.g. http://backend:4000/api.
CMD ["node", "server.js"]
