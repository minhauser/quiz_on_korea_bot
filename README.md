# Korean Study Platform

한국어 학습 플랫폼 모노레포. NestJS API + Next.js 웹 프론트엔드로 구성되어 있습니다.

## 구조

```
apps/
  api/            NestJS 백엔드 (Prisma, PostgreSQL, Redis, BullMQ)
  web/            Next.js 15 프론트엔드 (React 19, TanStack Query, Zustand)
packages/
  contracts/      API-웹 공용 타입/스키마 (@ksp/contracts)
  eslint-config/  공용 ESLint 설정
  tsconfig/       공용 TypeScript 설정
infra/
  docker/         Postgres / Redis / Nginx 설정
docs/
  adr/ api/ diagrams/ erd/  아키텍처 및 API 문서
```

패키지 매니저로 **pnpm workspaces**를 사용합니다 (`workspace:*` 프로토콜 의존).

## 사전 준비물

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker Desktop (PostgreSQL, Redis 실행용)

## 설치

```bash
pnpm install
```

최초 설치 시 네이티브 바이너리 패키지(prisma, argon2, sharp, esbuild, swc 등)의 postinstall 스크립트 실행 여부를 pnpm이 물어볼 수 있습니다. 루트 `pnpm-workspace.yaml`의 `allowBuilds` 항목에서 이미 승인되어 있습니다.

## 로컬 인프라 (PostgreSQL / Redis)

리포에 `docker-compose.yml`이 없어 컨테이너를 직접 띄웁니다. `apps/api/.env`의 값과 일치시켜야 합니다.

```bash
docker run -d --name ksp-postgres \
  -e POSTGRES_USER=ksp -e POSTGRES_PASSWORD=ksp_password -e POSTGRES_DB=ksp_dev \
  -p 5432:5432 -v "$(pwd)/infra/docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql" \
  postgres:16

MSYS_NO_PATHCONV=1 docker run -d --name ksp-redis \
  -p 6379:6379 -v "$(pwd)/infra/docker/redis/redis.conf:/usr/local/etc/redis/redis.conf" \
  redis:7 redis-server /usr/local/etc/redis/redis.conf
```

> Windows Git Bash에서는 컨테이너 내부 경로 인자가 Windows 경로로 잘못 변환될 수 있어 `MSYS_NO_PATHCONV=1`이 필요합니다.

## 환경변수

- `apps/api/.env.example` → `apps/api/.env`
- `apps/web/.env.example` → `apps/web/.env.local`

주요 값:

| 변수 | 위치 | 기본값 |
|---|---|---|
| `API_PORT` | api | 4000 |
| `DATABASE_URL` | api | `postgresql://ksp:ksp_password@localhost:5432/ksp_dev` |
| `REDIS_URL` | api | `redis://localhost:6379` |
| `CORS_ORIGIN` | api | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | web | `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_APP_URL` | web | `http://localhost:3000` |

## DB 마이그레이션 & Prisma Client

```bash
cd apps/api
npx prisma migrate deploy
npx prisma generate
```

## 실행

```bash
# API (http://localhost:4000/api/v1, Swagger: http://localhost:4000/api/docs)
cd apps/api
pnpm run dev          # nest start --watch

# Web (http://localhost:3000)
cd apps/web
pnpm run dev          # next dev --turbo -p 3000
```

### 알려진 이슈

- **`nest start --watch` / `nest build`가 조용히 빌드 산출물을 생성하지 않는 경우**: 공용 `packages/tsconfig/base.json`에 `incremental: true`가 설정되어 있어, 오래된 `.tsbuildinfo` 캐시가 남아있으면 tsc가 "0 errors"를 보고하면서도 실제로는 아무것도 emit하지 않습니다. 증상이 나타나면 `apps/api`의 `*.tsbuildinfo` 파일을 삭제하고 다시 빌드하세요.
- **Swagger UI 경로**: `apps/api/src/main.ts`에서 API 실제 프리픽스는 `api/v1`이지만 Swagger는 `api/docs`에 마운트됩니다 (버전 세그먼트 누락). 의도된 동작이 아니라면 `main.ts`의 `SwaggerModule.setup` 호출을 확인하세요.

## 외부 공유 (임시)

인증 없이 로컬 서버를 외부에 잠깐 공유하려면 Cloudflare Quick Tunnel을 사용할 수 있습니다.

```bash
cloudflared tunnel --url http://localhost:3000   # web
cloudflared tunnel --url http://localhost:4000   # api
```

발급된 `*.trycloudflare.com` URL을 `apps/web/.env.local`(`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`)과 `apps/api/.env`(`CORS_ORIGIN`)에 반영한 뒤 두 서버를 재시작해야 반영됩니다. 계정 없는 Quick Tunnel은 가동 중에만 유효하며 업타임 보장이 없습니다.

## 스크립트 요약

| 명령 | 위치 | 설명 |
|---|---|---|
| `pnpm run dev` | apps/api | NestJS watch 모드 |
| `pnpm run build` | apps/api | NestJS 빌드 (`dist/`) |
| `pnpm run start` | apps/api | 빌드된 서버 실행 |
| `pnpm run db:migrate` | apps/api | Prisma 마이그레이션 (dev) |
| `pnpm run db:studio` | apps/api | Prisma Studio |
| `pnpm run dev` | apps/web | Next.js dev 서버 |
| `pnpm run build` | apps/web | Next.js 프로덕션 빌드 |
| `pnpm run test:e2e` | apps/web | Playwright E2E |
