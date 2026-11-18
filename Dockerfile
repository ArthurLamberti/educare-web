# Next.js standalone server. ROOT_DOMAIN is needed at build time too: prerendered pages show it.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ARG ROOT_DOMAIN
ENV ROOT_DOMAIN=$ROOT_DOMAIN NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules node_modules
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 educare && adduser -S -u 1001 -G educare educare
COPY --from=build --chown=educare:educare /app/.next/standalone ./
COPY --from=build --chown=educare:educare /app/.next/static .next/static
COPY --from=build --chown=educare:educare /app/public public
USER educare
EXPOSE 3000
CMD ["node", "server.js"]
