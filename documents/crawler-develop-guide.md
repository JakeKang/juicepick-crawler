# **Supabase 기반 크롤러 Vibe Coding & 작업 가이드 프롬프트**

## **⚙️ Step 1: 프로젝트 초기 설정 및 보안 기반 구축**

> **목표**: 개발 환경을 구축하고, 초기부터 보안을 고려한 설정을 적용합니다.

### **프롬프트 1.1: Node.js 프로젝트 초기화 및 `.gitignore` 설정**

"TypeScript를 사용하는 Node.js 프로젝트를 초기화하고, `package.json`, `tsconfig.json`, `src` 폴더를 만들어줘. 그리고 가장 먼저, 민감 정보가 Git에 올라가지 않도록 `.gitignore` 파일을 생성하고 `/.env`, `/node_modules` 를 추가해줘."

### **프롬프트 1.2: 핵심 의존성 설치**

"프로젝트에 필요한 npm 라이브러리들을 설치해줘. 보안 관련 라이브러리도 함께 추가해줘.

- **API 서버**: `fastify`, `@fastify/rate-limit`
- **작업 큐**: `bullmq`
- **크롤링 엔진**: `playwright`
- **Supabase 클라이언트**: `@supabase/supabase-js`
- **기타**: `node-cron`, `dotenv`
- **개발용**: `typescript`, `ts-node`, `@types/node`"

### **프롬프트 1.3: Supabase 프로젝트 및 환경 변수 설정**

"Supabase 프로젝트 생성 후, `.env` 파일에 Supabase URL과 `service_role_key`를 저장해줘. 이 파일은 로컬 개발용이라는 사실을 명심해줘."

### **프롬프트 1.4: Playwright 브라우저 설치**

"`npx playwright install --with-deps` 명령어로 Playwright가 사용할 브라우저를 설치해줘."

---

## **🏗️ Step 2: 데이터베이스 보안 설계 및 구축**

> **목표**: 데이터를 저장할 테이블을 만들고, 가장 중요한 **행 수준 보안(RLS)** 정책을 설정합니다.

### **프롬프트 2.1: Supabase 테이블 생성**

"Supabase SQL Editor를 사용하여 `stores`, `products`, `prices` 테이블을 생성하는 SQL 쿼리를 작성하고 실행해줘."

### **프롬프트 2.2: Supabase Storage 버킷 생성**

"이미지를 저장할 Public 버킷 `product-images`를 생성해줘."

### **프롬프트 2.3 (중요): 행 수준 보안(RLS) 정책 설정**

"모든 테이블에 RLS를 활성화(Enable)해줘. 그리고 아래 정책을 SQL로 작성하여 추가해줘.

1.  `products` 테이블: **누구나 읽을 수 있도록(SELECT)** 허용하는 정책.
2.  `prices` 테이블: **누구나 읽을 수 있도록(SELECT)** 허용하는 정책.
3.  **모든 테이블**: 익명 사용자(anon)나 인증된 사용자(authenticated)의 **쓰기 작업(INSERT, UPDATE, DELETE)은 모두 차단**하는 기본 정책. (백엔드 서비스 키는 이 정책을 우회함)"

---

## **🤖 Step 3: 안전한 크롤러 로직 구현 (Worker)**

> **목표**: 외부 데이터를 안전하게 처리하는 핵심 크롤링 모듈을 완성합니다.

### **프롬프트 3.1: Supabase 서비스 모듈 생성**

"`src/services/supabase-service.ts` 파일에서 `supabase-js` 클라이언트를 초기화하고, DB 저장 및 이미지 업로드 함수를 구현해줘."

### **프롬프트 3.2: 안전한 크롤러 모듈 생성**

"`src/services/crawler-service.ts` 파일에서 Playwright를 사용해 상품 정보를 추출하는 로직을 구현해줘. 특히, 텍스트 데이터를 반환하기 전에 **간단한 스크립트 태그 제거 로직을 추가**하여 데이터 살균(Sanitization)의 기초를 마련해줘."

### **프롬프트 3.3: 로컬 테스트 스크립트 작성**

"임시 실행 파일(`src/test-crawler.ts`)을 만들어, 위 모듈들이 정상적으로 Supabase와 연동하여 데이터를 저장하는지 테스트해줘."

---

## **🚀 Step 4: 보안이 강화된 API 서버 및 큐 구현**

> **목표**: 외부 공격으로부터 안전한 API 서버를 구축하고 큐와 연동합니다.

### **프롬프트 4.1: BullMQ 큐 및 워커 설정**

"`src/queue` 폴더에 `queue.ts`와 `worker.ts` 파일을 생성하여 BullMQ의 큐와 워커를 설정해줘."

### **프롬프트 4.2: Fastify API 서버 및 보안 플러그인 적용**

"`src/server.ts` 파일에서 Fastify 서버를 생성해줘. 그리고 아래 보안 기능을 필수로 추가해줘.

1.  `@fastify/rate-limit` 플러그인을 등록하여 모든 요청에 대해 IP 기반 호출 횟수를 제한해줘.
2.  `POST /api/crawl/bulk` 엔드포인트는 요청 헤더에 미리 정의된 `X-INTERNAL-API-KEY`가 없으면 401 Unauthorized 오류를 반환하도록 로직을 추가해줘."

### **프롬프트 4.3: 스케줄러 구현**

"`src/scheduler.ts` 파일에서 `node-cron`을 사용하여 벌크 크롤링 API를 호출할 때, `.env`에 저장된 내부 API 키를 헤더에 포함하여 요청하도록 구현해줘."

---

## **🔗 Step 5: 시스템 통합 및 보안 테스트**

> **목표**: 전체 시스템을 실행하고, 구현된 보안 기능이 정상적으로 동작하는지 확인합니다.

### **프롬프트 5.1: 전체 시스템 실행 스크립트 작성**

"`package.json`에 API 서버와 워커를 동시에 실행하는 `dev` 스크립트를 작성해줘."

### **프롬프트 5.2: 보안 기능 테스트 시나리오**

"시스템을 실행한 상태에서 아래 시나리오를 테스트해줘.

1.  **Rate Limit 테스트**: 단시간에 `POST /api/crawl/product/{productId}`를 여러 번 호출하여 `429 Too Many Requests` 오류가 발생하는지 확인.
2.  **API 인증 테스트**: `X-INTERNAL-API-KEY` 헤더 없이 `POST /api/crawl/bulk`를 호출하여 `401 Unauthorized` 오류가 발생하는지 확인."

---

## **📦 Step 6: 프로덕션 배포 및 운영**

> **목표**: 애플리케이션을 Docker 이미지로 만들고, 프로덕션 환경에서의 보안 운영 방안을 정의합니다.

### **프롬프트 6.1: Dockerfile 작성**

"API 서버용 `api.Dockerfile`과 Playwright 공식 이미지를 기반으로 하는 워커용 `worker.Dockerfile`을 작성해줘."

### **프롬프트 6.2: Docker Compose 설정**

"로컬 개발 환경용 `docker-compose.yml` 파일을 작성해줘. (`api-server`, `crawler-worker`, `redis` 서비스 포함)"

### **프롬프트 6.3: 프로덕션 운영 가이드라인**

"프로덕션 배포 시 아래 사항을 반드시 준수하도록 가이드 문서를 작성해줘.

1.  **Secrets Management**: Supabase 키와 같은 모든 민감 정보는 **AWS Secrets Manager**와 같은 전문 도구를 통해 컨테이너에 환경 변수로 주입한다. `.env` 파일을 프로덕션에서 사용하지 않는다.
2.  **네트워크 정책**: 워커 컨테이너는 **격리된 VPC 서브넷**에서 실행하고, 필요한 외부 사이트와 Supabase 엔드포인트로만 나갈 수 있도록 **Egress Rule**을 설정한다.
3.  **지속적인 보안 감사**: **GitHub Dependabot**을 활성화하고, `npm audit`을 CI/CD 파이프라인에 통합하여 의존성 취약점을 지속적으로 관리한다."
