import { chromium } from 'playwright';

async function testPlaywrightLaunch() {
    console.log('[Test Playwright Launch] 브라우저 실행을 시도합니다...');
    let browser = null;
    try {
        browser = await chromium.launch();
        console.log('[Test Playwright Launch] 브라우저 실행 성공!');
    } catch (error) {
        console.error('[Test Playwright Launch] 브라우저 실행 실패:', error);
        if (error instanceof Error) {
            console.error('  오류 이름:', error.name);
            console.error('  오류 메시지:', error.message);
            console.error('  스택 트레이스:', error.stack);
        } else {
            console.error('  알 수 없는 오류 객체:', error);
        }
        process.exit(1); // 오류 발생 시 프로세스 종료
    } finally {
        if (browser) {
            console.log('[Test Playwright Launch] 브라우저를 종료합니다...');
            await browser.close();
            console.log('[Test Playwright Launch] 브라우저 종료 완료.');
        }
    }
    console.log('[Test Playwright Launch] 테스트 종료.');
}

testPlaywrightLaunch();
