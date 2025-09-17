# Juicepick 고급 웹 크롤러

---

## ✨ 주요 기능

- **📄 설정 기반 크롤링**: 외부 JSON 파일(`crawler-config.json`)을 통해 크롤링 대상과 데이터 선택자를 쉽게 추가하거나 수정할 수 있습니다.
- **🔄 견고한 작업 큐**: **BullMQ**와 Redis를 기반으로 하여 안정적인 작업 처리를 보장합니다.
- **📈 지수적 백오프**: 실패한 작업을 자동으로 재시도하며, 재시도 간격을 점차 늘려 일시적인 네트워크 문제를 효과적으로 처리합니다.
- **🖥️ 실시간 대시보드**: **Fastify**와 **Tailwind CSS**로 구축된 깔끔한 실시간 웹 UI를 통해 큐 상태와 로그를 모니터링할 수 있습니다.
- **🕹️ 양방향 제어**: 대시보드에서 직접 실패한 작업을 재시도하고, 오래된 작업을 정리하며, 새로운 크롤링을 수동으로 실행할 수 있습니다.
- **🔀 환경별 데이터 저장소**: 유연한 데이터 리포지토리 패턴을 사용합니다.
  - **개발 모드**: 크롤링된 데이터를 로컬 `crawled-data.json` 파일에 저장합니다.
  - **프로덕션 모드**: **Supabase** (또는 다른 데이터베이스)에 데이터를 저장하도록 설계되었습니다.
- **📦 Docker 지원**: `Dockerfile`들과 `docker-compose.yml`이 포함되어 있어 쉬운 설치와 배포가 가능합니다.
- ** moderno TypeScript**: 최신 **ESM** 설정을 사용하여 일반적인 오류를 방지하고 타입 안정성을 높였습니다.

## 🛠️ 기술 스택

- **백엔드**: Node.js, Fastify, TypeScript
- **작업 큐**: BullMQ, Redis
- **크롤링 엔진**: Playwright
- **패키지 매니저**: pnpm
- **컨테이너**: Docker

## 📂 프로젝트 구조

```
.
├── public/                 # 대시보드 UI (index.html)
├── src/
│   ├── services/
│   │   ├── data/           # 데이터 저장소 리포지토리 (JSON, Supabase)
│   │   ├── crawler-service.ts  # 핵심 Playwright 크롤링 로직
│   │   └── logging-service.ts  # 대시보드용 인메모리 로거
│   ├── queue/              # BullMQ 큐 및 워커 설정
│   ├── config.ts           # 중앙 설정 관리자
│   ├── scheduler.ts        # 주기적으로 크롤링을 실행하는 Cron 작업
│   └── server.ts           # Fastify 서버 (API, 대시보드)
├── crawler-config.json     # 크롤링 대상을 여기에 정의합니다
├── docker-compose.yml      # 모든 서비스를 위한 Docker 설정
├── api.Dockerfile          # API 서버용 Dockerfile
├── worker.Dockerfile       # 크롤러 워커용 Dockerfile
└── package.json
```

## 🚀 시작하기

### 사전 준비물

- Node.js (v18+)
- pnpm
- Docker 및 Docker Compose (Redis 및 프로덕션 배포용)

### 1. 설치

```bash
# 레포지토리 클론
git clone <repository-url>
cd juicepick-crawler

# 의존성 설치
pnpm install
```

### 2. 환경 설정

예제 파일을 복사하여 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

이제 `.env` 파일을 열고 필요한 값들을 채워주세요:

- `X_INTERNAL_API_KEY`: 강력한 비밀 키. `openssl rand -base64 32` 명령어로 생성할 수 있습니다.
- `SUPABASE_URL` & `SUPABASE_KEY`: 프로덕션 모드(`NODE_ENV=production`)에서만 필요합니다.

### 3. 애플리케이션 실행

#### 개발 모드

이 모드는 `ts-node`를 사용하여 실시간으로 코드를 반영하며, 데이터는 `crawled-data.json`에 저장됩니다.

```
# 사전 설치 필요
pnpm install -g ts-node
```

1.  **Redis 서버 시작**: Redis 서버가 실행 중인지 확인하세요.

    ```bash
    # If using Docker
    docker-compose up -d redis
    ```

2.  **애플리케이션 시작**:

    ```bash
    # API 서버, 워커, 스케줄러를 동시에 시작합니다
    pnpm run dev
    ```

3.  **대시보드 열기**: 브라우저에서 **http://localhost:3000** 주소로 접속하세요.

#### 프로덕션 모드 (Docker 사용)

이 모드는 최적화된 Docker 컨테이너를 빌드하며, Supabase를 사용하도록 설정됩니다.

1.  `.env` 파일에 프로덕션용 Supabase 정보를 모두 기입했는지 확인하세요.

2.  **Build and run with Docker Compose**:
    ```bash
    docker-compose up --build
    ```

## ⚙️ 설정 방법

크롤링 대상을 추가하거나 변경하려면 `crawler-config.json` 파일을 수정하기만 하면 됩니다. 스케줄러가 다음 실행 주기에 맞춰 변경 사항을 자동으로 반영합니다.

```json
{
  "sites": [
    {
      "name": "Apple Macbook Pro",
      "url": "https://www.apple.com/kr/macbook-pro/",
      "selectors": {
        "title": "h1.as-productname",
        "price": ".as-price-currentprice"
      }
    }
  ]
}
```

## 📜 주요 명령어

- `pnpm run dev`: 개발 모드로 모든 서비스를 시작합니다.
- `pnpm run build`: TypeScript 프로젝트를 JavaScript로 컴파일합니다.
- `pnpm start`: 컴파일된 JavaScript 파일로 모든 서비스를 시작합니다 (프로덕션용).
- `pnpm run test:crawler`: 크롤러 서비스를 위한 간단한 테스트 스크립트를 실행합니다.
