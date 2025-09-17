# Stage 1: Build the application
# Playwright 공식 이미지를 사용하여 빌드 환경 구성
FROM mcr.microsoft.com/playwright:v1.44.0-jammy AS builder

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
# 최종 이미지도 동일한 Playwright 이미지를 사용
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# 빌드된 파일 및 의존성 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# 워커 실행
CMD ["node", "dist/queue/worker-runner.js"]
