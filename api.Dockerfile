# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 설치
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch
RUN pnpm install --prod --ignore-scripts

# 소스 코드 복사 및 빌드
COPY . .
RUN pnpm run build

# Stage 2: Create the final production image
FROM node:20-slim

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 빌드된 파일 및 의존성 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# API 서버와 스케줄러를 함께 실행
# devDependency에 있는 concurrently를 프로덕션에서 사용하기 위해 설치
RUN pnpm add concurrently --prod

EXPOSE 3002

# 서버와 스케줄러를 동시에 실행
CMD ["pnpm", "start"]
