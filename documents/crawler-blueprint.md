# **Supabase 기반 확장형 상품 크롤러 서비스 설계**

## **1. 개요 (Overview)**

본 문서는 여러 전자담배 액상 판매 사이트의 상품 정보를 수집, 비교, 추천하는 서비스를 위한 크롤러 시스템을 설계하는 것을 목표로 한다. 본 시스템은 Supabase를 데이터 백엔드로 활용하여 개발 및 운영 효율성을 극대화하고, **안정적인 자동 데이터 수집**, **사용자 요청에 따른 실시간 업데이트**, **보안성**, 그리고 **미래의 서비스 확장을 고려한 유연한 구조**를 갖추는 것을 핵심 가치로 삼는다.

- **주요 기능**:
  - 초기 데이터 대량 수집 (Bulk Crawling)
  - 주기적인 데이터 변경 감지 및 업데이트 (Scheduled Update)
  - 사용자 요청 기반 실시간 데이터 업데이트 (On-Demand & Realtime Update)
- **핵심 설계 목표**:
  - **개발 속도 (Velocity)**: Supabase의 BaaS(Backend-as-a-Service) 기능을 활용하여 백엔드 개발 리소스 최소화
  - **확장성 (Scalability)**: 크롤링 처리량과 사용자 트래픽 증가에 유연하게 대응
  - **안정성 (Reliability)**: 일부 크롤러의 장애가 전체 시스템에 영향을 주지 않도록 격리
  - **보안성 (Security)**: API, 데이터베이스, 인프라 전반의 잠재적 위협으로부터 시스템 보호
  - **실시간 성 (Real-time)**: Supabase의 Realtime 기능을 통해 사용자에게 즉각적인 데이터 변경 알림 제공

---

## **2. 기술 스택 (Technology Stack)**

- **언어/플랫폼**: TypeScript, Node.js
- **API 서버**: Fastify
- **크롤링 엔진**: Playwright
- **작업 큐 (Message Queue)**: BullMQ (Redis 기반)
- **백엔드 플랫폼 (BaaS)**: **Supabase**
  - Managed PostgreSQL Database
  - Realtime Subscriptions
  - Storage for images
  - Row Level Security (RLS)
- **배포/운영**: Docker, Docker Compose (개발), Kubernetes/Cloud Run (운영)
- **보안**: `fastify/rate-limit`, `npm audit`, 클라우드 Secrets Manager

---

## **3. 아키텍처 설계 (Architectural Design)**

### **3.1. 시스템 구성도**

```
+----------------+      +---------------------+      +-----------------+
|   Scheduler    |----->| (Authenticated)     |      |      User       |
| (node-cron)    |      | API Server (Fastify)|<-----| (Web/App Client)|
+----------------+      | + Rate Limiting     |      +-----------------+
                        |                     |             ^  |
                        +----------+----------+             |  | Realtime
                                   |                        |  | Subscription
                          (Add Job) V                       |  V
                        +-----------------------------------+--+
                        |           Supabase Platform          |
                        | +--------------+  +---------------+  |
                        | |   Realtime   |  |    Storage    |  |
                        | +--------------+  +---------------+  |
                        | +----------------------------------+ |
                        | |   PostgreSQL DB (with RLS)       | |
                        +------------------+-------------------+
                                           ^
                                (Save Data)|
+------------------------------------------|---------------------------------------------+
| Restricted Network Environment (e.g., VPC Subnet)                                     |
|                                                                                         |
|         +--------------------------------|------------+                                 |
|         |         Crawler Workers (Playwright)        |                                 |
|         |  (Job Consumers, Horizontally Scalable)     |                                 |
|         |                                             |                                 |
|         |  +---------+   +---------+   +---------+    |                                 |
|         |  | Worker 1|   | Worker 2|...| Worker N|    |                                 |
|         |  +---------+   +---------+   +---------+    |                                 |
|         +---------------------------------------------+                                 |
|                              ^                                                          |
|                              | (Process Job)                                            |
|                       +------|------------+                                             |
|                       |  Job Queue (BullMQ) |                                             |
|                       |    on Redis       |                                             |
|                       +-------------------+                                             |
+-----------------------------------------------------------------------------------------+
```

### **3.2. 컴포넌트별 역할 및 설계**

#### **① API 서버 (Fastify)**

- **역할**: 크롤링 작업을 생성하고 작업 큐에 전달하는 '지시자'.
- **세부 설계**:
  - **엔드포인트**:
    - `POST /api/crawl/bulk`: 내부 API 키로 인증된 요청만 허용.
    - `POST /api/crawl/product/{productId}`: 사용자 인증 및 IP 기반 Rate Limiting 적용.
  - **보안 강화**:
    - **요청 제한(Rate Limiting)**: `@fastify/rate-limit` 플러그인을 사용하여 비정상적인 트래픽으로부터 서버를 보호하고 DoS 공격을 방지.
    - **인증/인가**: 벌크 크롤링과 같이 리소스를 많이 사용하는 API는 내부용 비밀 키를 헤더에 포함한 경우에만 호출되도록 하여 외부에서의 무단 실행을 차단.

#### **② 크롤러 워커 (Playwright)**

- **역할**: 작업 큐에서 실제 작업을 받아 크롤링을 수행하고, 그 결과를 **Supabase**에 저장하는 '일꾼'.
- **세부 설계**:
  - `supabase-js` 클라이언트를 사용하여 Supabase와 안전하게 통신.
  - 크롤링한 이미지는 Supabase Storage에 업로드.
  - **보안 강화**:
    - **네트워크 격리**: 워커 컨테이너는 외부 인터넷(크롤링 대상)으로의 Outbound는 허용하되, 내부망의 다른 서비스(API 서버 등)로는 접근할 수 없도록 네트워크 정책(Egress Rule)을 설정하여 SSRF(Server-Side Request Forgery) 공격 가능성을 차단.
    - **데이터 살균(Sanitization)**: 외부 사이트에서 수집한 모든 데이터(특히 텍스트)는 잠재적으로 위험하다고 간주. 데이터베이스에 저장하기 전, XSS 공격을 유발할 수 있는 스크립트 태그 등을 제거하는 라이브러리(예: `DOMPurify` 로직)를 적용.

#### **③ 백엔드 플랫폼 (Supabase)**

- **역할**: 데이터베이스, 실시간 통신, 파일 저장, 인증 등 백엔드의 핵심 기능을 제공하는 **관리형 플랫폼**.
- **보안 강화**:
  - **행 수준 보안 (Row Level Security, RLS)**: **가장 중요한 보안 설정.** 기본적으로 모든 테이블에 대해 "Deny All" 정책을 설정하고, 필요한 경우에만 특정 조건(예: 인증된 사용자)에 따라 `SELECT`, `INSERT` 등의 권한을 명시적으로 부여.
    - 예시: `products` 테이블은 누구나 읽을 수 있지만(`SELECT`), `prices` 테이블의 생성(`INSERT`)은 백엔드 서비스 키를 통해서만 가능하도록 정책 설정.
  - **키 관리**:
    - **`service_role_key`**: RLS를 우회하는 강력한 키이므로, 크롤러 워커와 같이 신뢰할 수 있는 백엔드 서버에서만 **Secrets Manager**를 통해 사용. 절대 클라이언트 코드에 노출 금지.
    - **`anon_key`**: 웹/앱 클라이언트에서 사용하는 공개용 키. RLS 정책의 적용을 받음.

---

## **4. 보안 강화 방안 종합 (Security Hardening Summary)**

1.  **API 엔드포인트 보호**: 모든 API에 **Rate Limiting**을 적용하고, 민감한 API는 **API 키 인증**을 통해 보호합니다.
2.  **데이터베이스 접근 제어**: Supabase의 \*\*RLS(행 수준 보안)\*\*를 적극적으로 활용하여 데이터에 대한 최소 권한 원칙을 적용합니다.
3.  **비밀키 관리**: `.env` 파일은 로컬 개발용으로만 사용합니다. 프로덕션 환경에서는 **AWS Secrets Manager, Google Secret Manager, GitHub Secrets** 등 전문적인 비밀키 관리 도구를 사용하여 Supabase 서비스 키와 같은 민감 정보를 안전하게 주입합니다.
4.  **네트워크 격리**: 크롤러 워커를 \*\*격리된 네트워크 환경(VPC)\*\*에서 실행하여 잠재적인 SSRF 공격으로부터 내부 시스템을 보호합니다.
5.  **신뢰할 수 없는 데이터 처리**: 외부에서 수집한 모든 데이터는 저장 및 사용 전에 **반드시 살균(Sanitize)** 처리하여 XSS 등의 공격을 방지합니다.
6.  **의존성 관리**: `npm audit`, GitHub Dependabot 등을 사용하여 주기적으로 **라이브러리의 보안 취약점을 점검**하고 패치합니다.

---

## **5. 데이터 모델링 (PostgreSQL)**

#### **`stores` (크롤링 대상 사이트)**

| Column     | Type         | Description                    |
| :--------- | :----------- | :----------------------------- |
| `id`       | SERIAL       | PRIMARY KEY                    |
| `name`     | VARCHAR(255) | 사이트 이름 (예: "베이프레소") |
| `base_url` | VARCHAR(255) | 사이트 기본 URL                |

#### **`products` (상품 정보)**

| Column            | Type         | Description              |
| :---------------- | :----------- | :----------------------- |
| `id`              | SERIAL       | PRIMARY KEY              |
| `store_id`        | INTEGER      | `stores.id` FK           |
| `name`            | VARCHAR(255) | 상품명                   |
| `product_code`    | VARCHAR(100) | 사이트 내 상품 고유 코드 |
| `page_url`        | TEXT         | 상품 상세 페이지 URL     |
| `image_url`       | TEXT         | 상품 이미지 URL          |
| `last_crawled_at` | TIMESTAMP    | 마지막 크롤링 시간       |

#### **`prices` (가격 정보 이력)**

| Column         | Type        | Description                                |
| :------------- | :---------- | :----------------------------------------- |
| `id`           | SERIAL      | PRIMARY KEY                                |
| `product_id`   | INTEGER     | `products.id` FK                           |
| `price`        | INTEGER     | 상품 가격                                  |
| `stock_status` | VARCHAR(50) | 재고 상태 (예: "IN_STOCK", "OUT_OF_STOCK") |
| `crawled_at`   | TIMESTAMP   | 이 가격 정보가 수집된 시간                 |

---

## **6. 핵심 동작 시나리오**

### **6.1. 시나리오 1: 주기적인 전체 데이터 업데이트**

1.  **[Scheduler]** `node-cron`이 설정된 시간(예: 매일 새벽 3시)에 `POST /api/crawl/bulk` API를 내부 인증 키와 함께 호출.
2.  **[API Server]** 인증 키 검증 후, 등록된 모든 `stores`를 조회하여 각 사이트의 목록 페이지 크롤링 작업을 생성.
3.  **[API Server]** 생성된 작업들을 `low-priority-queue`에 등록.
4.  **[Crawler Worker]** 큐에서 작업을 받아 목록 페이지를 크롤링하며 각 상품의 URL을 수집.
5.  **[Crawler Worker]** 수집된 상품 URL을 기반으로 상세 정보 크롤링 작업을 다시 `low-priority-queue`에 등록.
6.  **[Crawler Worker]** 다른 워커들이 상세 정보 크롤링 작업을 병렬로 처리하여 `products` 및 `prices` 테이블을 업데이트.

### **6.2. 시나리오 2: 사용자 요청에 의한 실시간 단일 상품 업데이트**

1.  **[User]** 특정 상품 페이지에 진입.
2.  **[Client]** Supabase의 **Realtime 기능**을 사용하여 `prices` 테이블에서 해당 `product_id`를 가진 데이터의 변경 사항을 **구독(subscribe)** 시작.
3.  **[User]** '최신 정보 새로고침' 버튼 클릭.
4.  **[Client]** 서비스의 `POST /api/crawl/product/123` API를 호출.
5.  **[API Server & Job Queue]** Rate Limit 통과 후, `high-priority-queue`에 작업을 등록.
6.  **[Crawler Worker]** 큐에서 작업을 받아 해당 상품 페이지만 빠르게 크롤링.
7.  **[Crawler Worker]** 변경된 가격, 재고 정보를 `supabase-js`를 통해 **Supabase DB**의 `prices` 테이블에 새로 **추가(INSERT)**.
8.  **[Supabase Realtime]** `prices` 테이블에 새로운 데이터가 INSERT된 것을 감지하고, 이 변경 사항을 **구독 중인 모든 클라이언트(2번 단계)에게 실시간으로 푸시**.
9.  **[Client]** 별도의 API 요청 없이, 푸시받은 최신 데이터를 화면에 즉시 렌더링.
