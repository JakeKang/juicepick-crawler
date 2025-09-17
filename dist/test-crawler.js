import { crawlerService } from './services/crawler-service.js';
// 테스트할 상품 페이지 URL
// 실제 크롤링할 사이트의 URL로 변경해주세요.
const TARGET_URL = 'https://www.apple.com/kr/macbook-pro/';
async function testCrawl() {
    console.log(`[Test] 크롤러 서비스를 시작합니다. 대상: ${TARGET_URL}`);
    try {
        // 브라우저 실행
        await crawlerService.launch();
        // 상품 정보 크롤링 (새로운 시그니처에 맞춰 인자 전달)
        const productInfo = await crawlerService.crawlProduct(TARGET_URL, undefined, // itemContainerSelector (테스트에서는 단일 페이지/아이템 가정)
        { title: 'h1.as-productname', price: '.as-price-currentprice' }, // selectors
        undefined // paginationSelector
        );
        console.log('[Test] 크롤링 결과:');
        if (productInfo.length > 0) {
            // 테스트에서는 첫 번째 아이템의 데이터를 출력
            console.log('  - 제목:', productInfo[0]?.data.title);
            console.log('  - 가격:', productInfo[0]?.data.price || '가격을 찾을 수 없거나 선택자가 올바르지 않습니다.');
        }
        else {
            console.log('  크롤링된 데이터가 없습니다.');
        }
    }
    catch (error) {
        console.error('[Test] 크롤링 중 오류가 발생했습니다:', error);
    }
    finally {
        // 브라우저 종료
        await crawlerService.close();
        console.log('[Test] 크롤러 서비스를 종료합니다.');
    }
}
testCrawl();
//# sourceMappingURL=test-crawler.js.map