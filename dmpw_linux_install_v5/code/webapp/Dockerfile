FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@10.7.0 && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm@10.7.0 && pnpm run build

FROM base AS runner

ENV NODE_ENV=production
RUN addgroup -g 1001 -S vnarmyapp && \
    adduser -S -u 1001 -G vnarmyapp vnarmyapp

# Install sharp for Next.js Image Optimization in production
RUN npm install -g pnpm@10.7.0 && \
    pnpm add sharp

COPY --from=builder /app/public ./public
COPY --from=builder --chown=vnarmyapp:vnarmyapp /app/.next/standalone ./
COPY --from=builder --chown=vnarmyapp:vnarmyapp /app/.next/static ./.next/static

USER vnarmyapp

EXPOSE 3000

ENV PORT=3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
