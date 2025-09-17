import { crawlerService } from '../services/crawler-service';
import { promises as fs } from 'fs';
import path from 'path';

// 설정 파일 경로
const CONFIG_PATH = path.join(process.cwd(), 'crawler-config.json');

interface SiteConfig {
  name: string;
  url: string;
  itemContainerSelector?: string;
  selectors: { [key: string]: string | string[] };
  paginationSelector?: string;
}

async function testCrawl() {
  console.log(`[Test] 크롤러 서비스를 시작합니다.`);

  try {
    // 1. 설정 파일 읽기
    console.log('[Test] crawler-config.json 파일을 읽는 중...');
    const configFile = await fs.readFile(CONFIG_PATH, 'utf-8');
    const { sites } = JSON.parse(configFile) as { sites: SiteConfig[] };

    if (!sites || sites.length === 0) {
      console.error(
        '[Test] 오류: crawler-config.json에 테스트할 사이트 설정이 없습니다.',
      );
      return;
    }

    // 2. 테스트할 사이트 설정 선택
    // crawler-config.json의 첫 번째 사이트 설정을 사용
    const testSite = sites[0];
    console.log(
      `[Test] 대상 사이트 설정 로드 완료: ${testSite.name} (${testSite.url})`,
    );

    // 중요: 여기에 실제 접근 가능한 유효한 URL을 입력했는지 다시 한번 확인해주세요!
    if (testSite.url.includes('여기에_크롤링할_페이지_URL을_입력하세요')) {
      console.error(
        '[Test] 오류: crawler-config.json의 URL이 플레이스홀더입니다. 유효한 URL로 변경해주세요.',
      );
      return;
    }

    // 3. 브라우저 실행
    console.log('[Test] Playwright 브라우저를 실행하는 중...');
    await crawlerService.launch();
    console.log('[Test] 브라우저 실행 완료.');

    // 4. 상품 정보 크롤링 시작
    console.log(`[Test] 크롤링 시작: ${testSite.url}`);
    const productInfo = await crawlerService.crawlProduct(
      testSite.url,
      testSite.itemContainerSelector,
      testSite.selectors,
      testSite.paginationSelector,
    );
    console.log('[Test] 크롤링 완료.');

    // 5. 크롤링 결과 출력 (최대 10개 아이템)
    console.log('[Test] 크롤링 결과 (최대 10개 제품):');
    if (productInfo.length > 0) {
      const itemsToLog = productInfo.slice(0, 10); // 처음 10개 아이템만 선택
      itemsToLog.forEach((item, index) => {
        console.log(`  --- 제품 ${index + 1} ---`);
        for (const key in item.data) {
          console.log(`    - ${key}:`, item.data[key]);
        }
      });
      if (productInfo.length > 10) {
        console.log(`  ... ${productInfo.length - 10}개 제품이 생략됨.`);
      }
    } else {
      console.log('  크롤링된 데이터가 없습니다.');
    }
  } catch (error) {
    console.error('[Test] 크롤링 중 치명적인 오류가 발생했습니다:', error);
    if (error instanceof Error) {
      console.error('  오류 이름:', error.name);
      console.error('  오류 메시지:', error.message);
      console.error('  스택 트레이스:', error.stack);
    } else {
      console.error('  알 수 없는 오류 객체:', error);
    }
  } finally {
    // 6. 브라우저 종료
    console.log('[Test] 브라우저를 종료하는 중...');
    await crawlerService.close();
    console.log('[Test] 브라우저 종료 완료.');
    console.log('[Test] 크롤러 테스트 종료.');
  }
}

testCrawl();
