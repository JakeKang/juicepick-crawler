import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import config from './config';
import { loggingService } from './services/logging-service';

const API_BASE_URL = `http://localhost:${config.PORT}`;
const INTERNAL_API_KEY = config.INTERNAL_API_KEY;

// 설정 파일 경로
const CONFIG_PATH = path.join(process.cwd(), 'crawler-config.json');

interface SiteConfig {
  name: string;
  url: string;
  itemContainerSelector?: string; // 추가
  selectors: { [key: string]: string };
  paginationSelector?: string; // 추가
}

async function triggerBulkCrawl() {
  const message = '스케줄러 실행: 벌크 크롤링 API를 호출합니다.';
  console.log(message);
  loggingService.add('info', message);

  if (!INTERNAL_API_KEY) {
    const errorMsg =
      'X_INTERNAL_API_KEY가 설정되지 않아 스케줄러를 실행할 수 없습니다.';
    console.error(errorMsg);
    loggingService.add('error', errorMsg);
    return;
  }

  try {
    // 설정 파일 읽기 및 타입 명시와 함께 구조 분해 할당
    const configFile = await fs.readFile(CONFIG_PATH, 'utf-8');
    const { sites } = JSON.parse(configFile) as { sites: SiteConfig[] };

    if (!sites || sites.length === 0) {
      const warnMsg = '크롤링할 사이트가 설정 파일에 없습니다.';
      console.log(warnMsg);
      loggingService.add('warn', warnMsg);
      return;
    }

    // API 요청 본문 생성
    const jobs = sites.map((site) => ({
      url: site.url,
      itemContainerSelector: site.itemContainerSelector,
      selectors: site.selectors,
      paginationSelector: site.paginationSelector,
    }));

    const response = await fetch(`${API_BASE_URL}/api/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': INTERNAL_API_KEY,
      },
      body: JSON.stringify({ jobs }),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      const errMsg =
        data && typeof data === 'object' && 'error' in data
          ? data.error
          : `HTTP error! ${response.status}`;
      throw new Error(String(errMsg));
    }

    console.log('API 호출 성공:', data && data.message);
    loggingService.add('info', 'API 호출 성공', {
      message: data && data.message,
    });
  } catch (error) {
    const errorMsg = '스케줄러에서 API 호출 중 오류 발생';
    console.error(errorMsg, error);
    loggingService.add('error', errorMsg, error);
  }
}

// 매일 자정에 실행 (테스트를 위해 '*/1 * * * *' 로 변경하여 1분마다 실행 가능)
// cron.schedule('0 0 * * *', triggerBulkCrawl);
cron.schedule('*/1 * * * *', triggerBulkCrawl);

const startMsg = '크롤링 스케줄러가 설정되었습니다. 1분마다 실행됩니다.';
console.log(startMsg);
loggingService.add('info', startMsg);
