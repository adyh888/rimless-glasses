# ===== Stage 1: builder =====
FROM node:20-slim AS builder

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /build

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

# 构建 Nuxt 生产产物 + 预生成示例数据库
RUN pnpm build && pnpm seed

# ===== Stage 2: runtime =====
FROM node:20-slim AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

WORKDIR /app

# Nuxt 生产产物（Nitro 已内联依赖）
COPY --from=builder /build/.output ./.output
# 预生成的种子数据库，首次启动时被复制到 volume
COPY --from=builder /build/data/app.db ./seed/app.db

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]
