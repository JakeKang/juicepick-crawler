# **설정 기반 동적 크롤러 분석 및 구현 가이드**

## **1부: 신규 크롤링 타겟 분석 가이드**

### **🚀 Step 0: 가이드 개요**

본 문서는 신규 웹사이트를 크롤링 대상에 추가하기 위해 필요한 모든 정보를 수집하고 정의하는 과정을 안내합니다. 성공적인 크롤러 개발은 단순히 웹사이트 주소만으로 이루어지지 않으며, 각 사이트의 고유한 구조와 정책을 이해하고 이를 기계가 읽을 수 있는 \*\*'설정(Configuration)'\*\*으로 만드는 체계적인 분석이 필수적입니다.

---

### **🎯 Step 1: 타겟 식별 및 기본 메타데이터 정의**

> **목표**: 크롤링할 대상이 무엇인지 명확히 하고, 시스템에서 관리할 기본 정보를 정의합니다.

- **1.1. 사이트 이름 (Store Name)**

  - 시스템에서 사용할 고유한 이름입니다.
  - **예시**: `베이프레소 공식몰`

- **1.2. 기본 URL (Base URL)**

  - 사이트의 메인 도메인 주소입니다.
  - **예시**: `https://www.vaporesso.com`

- **1.3. 크롤링 시작점 URL (Entry Point URL)**

  - 크롤러가 상품 목록 탐색을 시작할 페이지의 전체 주소입니다. 카테고리가 여러 개일 경우 여러 개를 등록할 수 있습니다.
  - **예시**: `https://www.vaporesso.com/vape-kits`

---

### **🗺️ Step 2: 네비게이션 및 상품 탐색 전략 수립**

> **목표**: 사이트의 모든 상품 페이지에 도달하기 위한 경로 탐색 방법을 정의합니다.

#### **2.1. 상품 목록 식별**

- **상품 아이템 선택자 (List Item Selector)**

  - 상품 목록 페이지에서 각 상품 하나하나를 감싸고 있는 반복되는 HTML 요소의 CSS 선택자입니다.
  - **예시**: `div.product-item`

- **상품 상세 페이지 링크 선택자 (Detail Link Selector)**

  - 위에서 찾은 '상품 아이템' 요소 내에서, 실제 상세 페이지로 연결되는 `<a>` 태그의 선택자입니다.
  - **예시**: `a.product-item-link`

#### **2.2. 페이지네이션(Pagination) 전략 정의**

- **전략 유형 선택**:

  - **[ ✓ ] 버튼 기반 (Button-based)**
  - **[ ] URL 패턴 기반 (URL Pattern-based)**

- **상세 정보**:

  - **(버튼 기반 시)** '다음 페이지'로 이동하는 버튼의 CSS 선택자:
    - **예시**: `a.pagination-next`
  - **(URL 패턴 기반 시)** 페이지 번호가 포함된 URL의 규칙:
    - **예시**: `https://example.com/products?page={page_number}`

#### **2.3. 동적 로딩(Dynamic Loading) 처리**

- **전략 유형 선택**:

  - **[ ] '더보기' 버튼 클릭 ('Load More' Button)**
  - **[ ] 무한 스크롤 (Infinite Scroll)**
  - **[ ✓ ] 해당 없음 (N/A)**

- **상세 정보**:

  - **('더보기' 버튼 시)** 더보기 버튼의 CSS 선택자: `button#load-more-btn`
  - **(무한 스크롤 시)** 스크롤 횟수 또는 스크롤 종료를 감지할 요소의 선택자: `div#scroll-end-detector`

---

### **🛠️ Step 3: 상세 페이지 데이터 추출 규칙 정의**

> **목표**: 상품 상세 페이지에서 우리가 수집하고자 하는 각 데이터 필드의 정확한 위치(CSS 선택자)와 추출 방식을 정의합니다.

| 데이터 필드        | CSS 선택자                           | 추출 방식 (`text` 또는 `attribute:속성명`) | 비고 (옵션 선택 등 특이사항)             |
| :----------------- | :----------------------------------- | :----------------------------------------- | :--------------------------------------- |
| **상품명**         | `h1.product-title`                   | `text`                                     |                                          |
| **가격**           | `span.price`                         | `text`                                     | 숫자 외 통화 기호, 쉼표 제거 필요        |
| **이미지 URL**     | `div.product-gallery img.main-image` | `attribute:src`                            |                                          |
| **재고 상태**      | `div.stock-status`                   | `text`                                     | "재고 있음", "품절" 등의 텍스트          |
| **상품 코드(SKU)** | `span.sku-code`                      | `text`                                     |                                          |
| **상세 설명**      | `div#product-description`            | `html`                                     | HTML 태그 전체를 저장                    |
| **옵션 버튼**      | `button.option-select`               | N/A                                        | 가격/재고 변경을 위해 클릭이 필요한 버튼 |

---

### **⚙️ Step 4: 크롤러 동작 및 정책 설정**

> **목표**: 대상 서버에 부담을 주지 않고, 차단을 회피하기 위한 크롤러의 행동 규칙을 설정합니다.

- **4.1. 요청 간 딜레이 (Request Delay)**

  - 각 페이지 요청 사이의 최소 대기 시간 (밀리초 단위).
  - **값**: `1500` (1.5초)

- **4.2. User-Agent**

  - 서버에 전송할 브라우저 식별 정보.
  - **값**: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36`

- **4.3. 프록시 사용 여부 (Use Proxy)**

  - IP 기반 차단을 우회하기 위해 프록시 서버를 사용할지 여부.
  - **값**: `아니요 (No)`

---

## **2부: 설정 기반 동적 크롤러 구현 예시**

> **목표**: 1부에서 분석하고 정의한 \*\*설정(JSON)\*\*을 이용하여, 실제로 동작하는 동적 크롤러 코드를 작성합니다.

### **✨ Step 1: 프로젝트 구조 및 설정 파일**

아래와 같은 간단한 프로젝트 구조를 가정합니다.

```
/dynamic-crawler
├── config.json
├── src/
│   ├── crawler.ts
│   └── server.ts
└── package.json
```

#### **`config.json`**

1부의 최종 결과물인 설정 파일을 프로젝트 루트에 저장합니다. 크롤러는 이 파일을 읽어 동작합니다.

```json
{
  "store_id": "vaporesso_official",
  "store_name": "베이프레소 공식몰",
  "base_url": "https://www.vaporesso.com",
  "entry_point_url": "https://www.vaporesso.com/vape-kits",
  "strategy": {
    "list_item_selector": "div.product-item",
    "detail_link_selector": "a.product-item-link",
    "pagination": {
      "type": "button",
      "selector": "a.pagination-next"
    }
  },
  "selectors": {
    "product_name": { "selector": "h1.product-title", "type": "text" },
    "price": { "selector": "span.price", "type": "text" },
    "image_url": {
      "selector": "div.product-gallery img.main-image",
      "type": "attribute:src"
    }
  },
  "policy": {
    "request_delay_ms": 1500
  }
}
```

---

### **✨ Step 2: 동적 크롤러 로직 구현**

#### **`src/crawler.ts`**

이 파일은 `config.json` 파일을 인자로 받아 실제 Playwright 크롤링을 수행하는 핵심 로직을 담고 있습니다.

```typescript
import { chromium, Browser, Page } from 'playwright';

// config.json의 타입을 정의합니다.
// 실제 프로젝트에서는 더 상세하게 타입을 정의하는 것이 좋습니다.
type CrawlConfig = any;

// 하나의 상세 페이지에서 정보를 추출하는 함수
async function scrapeDetailPage(page: Page, config: CrawlConfig): Promise<any> {
  const results: { [key: string]: string | null } = {};

  for (const key in config.selectors) {
    const { selector, type } = config.selectors[key];
    const locator = page.locator(selector).first();

    try {
      if (type === 'text') {
        results[key] = await locator.textContent();
      } else if (type.startsWith('attribute:')) {
        const attributeName = type.split(':')[1];
        results[key] = await locator.getAttribute(attributeName);
      }
    } catch (error) {
      console.error(
        `Error extracting ${key} with selector ${selector}:`,
        error,
      );
      results[key] = null;
    }
  }
  return results;
}

export async function executeCrawl(config: CrawlConfig) {
  console.log(`[${config.store_name}] 크롤링을 시작합니다...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(config.entry_point_url);
  console.log(`- 시작 페이지로 이동: ${config.entry_point_url}`);

  let hasNextPage = true;
  let pageNum = 1;

  while (hasNextPage) {
    console.log(`\n- ${pageNum} 페이지 처리 중...`);

    const productItems = await page
      .locator(config.strategy.list_item_selector)
      .all();
    console.log(`  - ${productItems.length}개의 상품을 찾았습니다.`);

    for (const item of productItems) {
      const detailLink = await item
        .locator(config.strategy.detail_link_selector)
        .getAttribute('href');
      if (detailLink) {
        const detailPage = await context.newPage();
        await detailPage.goto(new URL(detailLink, config.base_url).href);

        const productData = await scrapeDetailPage(detailPage, config);
        console.log('    - 수집된 데이터:', productData);

        await detailPage.close();
      }
      // 정책에 따라 딜레이를 줍니다.
      await page.waitForTimeout(config.policy.request_delay_ms);
    }

    // 페이지네이션 처리
    if (config.strategy.pagination.type === 'button') {
      const nextButton = page.locator(config.strategy.pagination.selector);
      if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
        await nextButton.click();
        await page.waitForLoadState('domcontentloaded'); // 페이지 로딩 대기
        pageNum++;
      } else {
        hasNextPage = false;
        console.log('\n- 다음 페이지가 없어 크롤링을 종료합니다.');
      }
    } else {
      hasNextPage = false; // 다른 페이지네이션 타입은 예제에서 생략
    }
  }

  await browser.close();
  console.log(`[${config.store_name}] 크롤링 완료!`);
}
```

---

### **✨ Step 3: API 서버 트리거 구현**

#### **`src/server.ts`**

Fastify를 사용하여 크롤링을 시작시키는 간단한 API 엔드포인트를 만듭니다.

```typescript
import Fastify from 'fastify';
import { executeCrawl } from './crawler';
import * as fs from 'fs/promises';
import * as path from 'path';

const fastify = Fastify({ logger: true });

fastify.post('/crawl', async (request, reply) => {
  try {
    // config.json 파일을 읽어옵니다.
    const configPath = path.join(__dirname, '..', 'config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);

    // 크롤링 함수를 비동기적으로 호출합니다.
    // 실제 운영 시스템에서는 이 부분을 BullMQ와 같은 작업 큐에 작업을 등록하는 코드로 변경해야 합니다.
    executeCrawl(config);

    // 크롤링이 완료되는 것을 기다리지 않고 즉시 응답을 보냅니다.
    reply.send({
      status: 'success',
      message: 'Crawl started in the background.',
    });
  } catch (error) {
    fastify.log.error(error);
    reply
      .status(500)
      .send({ status: 'error', message: 'Failed to start crawl.' });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

---

### **✨ Step 4: 실행 및 테스트**

1.  **의존성 설치**

    ```bash
    npm install fastify playwright typescript ts-node @types/node
    npx playwright install
    ```

2.  **API 서버 실행**

    ```bash
    npx ts-node src/server.ts
    ```

3.  **크롤링 트리거** (새 터미널에서)

    ```bash
    curl -X POST http://localhost:3000/crawl
    ```

4.  **결과 확인**: API 서버를 실행한 터미널에 `crawler.ts`에서 작성한 로그가 출력되는 것을 확인합니다.
