# 部署手册

## Docker 部署

### 构建镜像

```bash
docker build -t spms-admin:latest .
```

### 直接运行

```bash
docker run -d -p 80:80 --name spms-admin spms-admin:latest
```

### Docker Compose

```yaml
version: '3.8'

services:
  admin:
    build: .
    ports:
      - '80:80'
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: spms-backend:latest
    ports:
      - '8080:8080'
    environment:
      - DB_HOST=db
      - DB_PORT=5432
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=spms
      - POSTGRES_USER=spms
      - POSTGRES_PASSWORD=changeme
    restart: unless-stopped

volumes:
  pgdata:
```

启动：

```bash
docker compose up -d
```

## Nginx 配置说明

配置文件位于 `nginx/default.conf`，核心特性：

| 特性 | 说明 |
|------|------|
| gzip 压缩 | 对 JS/CSS/JSON/SVG 等启用 gzip，压缩级别 6 |
| 静态资源缓存 | `/assets/` 下文件缓存 1 年（Vite 打包带 content hash） |
| API 反向代理 | `/api/` 路径代理到后端 `backend:8080` |
| SPA fallback | 所有未匹配路径 fallback 到 `index.html`，支持前端路由 |

如需修改后端地址，编辑 `proxy_pass` 行指向实际后端地址。

## 环境变量配置

构建时变量通过 `.env.*` 文件注入：

| 文件 | 用途 | MSW | API 地址 |
|------|------|-----|----------|
| `.env.development` | 本地开发 | 启用 | `/api` |
| `.env.staging` | 测试环境 | 关闭 | `/api` |
| `.env.production` | 生产环境 | 关闭 | `/api` |

构建指定环境：

```bash
# 测试环境构建
npm run build -- --mode staging

# 生产环境构建（默认）
npm run build
```

## CI/CD 流水线（GitHub Actions）

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  docker:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}/admin:latest
```

## 部署检查清单

- [ ] 后端 API 地址正确配置
- [ ] Nginx proxy_pass 指向正确的后端服务
- [ ] HTTPS 证书配置（生产环境）
- [ ] Docker 容器健康检查
- [ ] 日志收集配置
- [ ] 监控告警配置
