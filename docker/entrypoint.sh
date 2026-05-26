#!/bin/sh
set -e

# 1) 首次启动若没有数据库，则从镜像内的种子拷贝过来
mkdir -p /app/data
if [ ! -f /app/data/app.db ]; then
  echo "[entrypoint] /app/data/app.db not found, seeding from image..."
  cp /app/seed/app.db /app/data/app.db
fi

# 2) 上传目录：单一持久化 volume，同时连接到
#    - /app/public/uploads  （upload.post.ts 写入用，基于 process.cwd）
#    - /app/.output/public/uploads （Nitro 生产环境对外提供静态文件的位置）
mkdir -p /app/uploads
mkdir -p /app/public
mkdir -p /app/.output/public
[ -e /app/public/uploads ] || ln -sfn /app/uploads /app/public/uploads
[ -e /app/.output/public/uploads ] || ln -sfn /app/uploads /app/.output/public/uploads

echo "[entrypoint] starting Nuxt server on ${HOST}:${PORT}"
exec "$@"
