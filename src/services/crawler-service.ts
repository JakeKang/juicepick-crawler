import { chromium, type Browser, type Page } from 'playwright';
import { type CrawledResult } from './data/datastore.interface';
import { loggingService } from './logging-service';
import { promises as fs } from 'fs';
import path from 'path';
import config from '../config';

class CrawlerService {
  private browser: Browser | null = null;

  async launch(): Promise<void> {
    console.log('[CrawlerService] 브라우저 실행 중...');
    loggingService.add('info', '[CrawlerService] 브라우저 실행 중...');
    this.browser = await chromium.launch();
    console.log('[CrawlerService] 브라우저 실행 완료.');
    loggingService.add('info', '[CrawlerService] 브라우저 실행 완료.');
  }

  async close(): Promise<void> {
    if (this.browser) {
      console.log('[CrawlerService] 브라우저 종료 중...');
      loggingService.add('info', '[CrawlerService] 브라우저 종료 중...');
      await this.browser.close();
      console.log('[CrawlerService] 브라우저 종료 완료.');
      loggingService.add('info', '[CrawlerService] 브라우저 종료 완료.');
    }
  }

  private sanitizeText(text: string | null): string {
    if (!text) {
      return '';
    }
    // 간단한 스크립트 태그 및 HTML 태그 제거 로직
    return text
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  private async _downloadImage(
    imageUrl: string,
    siteName: string,
    imageIndex: number,
    baseUrl: string,
  ): Promise<string> {
    if (!imageUrl) return '';

    let absoluteImageUrl: URL;
    try {
      absoluteImageUrl = new URL(imageUrl, baseUrl); // 상대 경로 처리
    } catch (e) {
      console.warn(
        `[CrawlerService] 유효하지 않은 이미지 URL: ${imageUrl} (기본 URL: ${baseUrl})`,
        e,
      );
      return '';
    }

    // 개발/테스트 모드에서는 이미지 다운로드 건너뛰기
    if (config.NODE_ENV !== 'production') {
      console.log(
        `[CrawlerService] 개발/테스트 모드: 이미지 다운로드 건너뛰고 URL 반환: ${absoluteImageUrl.href}`,
      );
      loggingService.add(
        'info',
        `[CrawlerService] 개발/테스트 모드: 이미지 다운로드 건너뛰고 URL 반환: ${absoluteImageUrl.href}`,
      );
      return absoluteImageUrl.href; // URL만 반환
    }

    const imageDir = path.join(process.cwd(), 'public', 'downloads', 'image');
    await fs.mkdir(imageDir, { recursive: true }); // 디렉토리가 없으면 생성

    const ext = path.extname(absoluteImageUrl.pathname) || '.jpg'; // 확장자 추출, 없으면 .jpg
    const fileName = `${siteName}_${imageIndex}${ext}`;
    const filePath = path.join(imageDir, fileName);
    const relativePath = path.join('downloads', 'image', fileName); // public 폴더 기준 상대 경로

    try {
      console.log(
        `[CrawlerService] 이미지 다운로드 시도: ${absoluteImageUrl.href}`,
      );
      const response = await fetch(absoluteImageUrl.href);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(arrayBuffer));
      console.log(
        `[CrawlerService] 이미지 다운로드 성공: ${absoluteImageUrl.href} -> ${filePath}`,
      );
      loggingService.add(
        'info',
        `[CrawlerService] 이미지 다운로드 성공: ${absoluteImageUrl.href} -> ${filePath}`,
      );
      return relativePath;
    } catch (error) {
      console.error(
        `[CrawlerService] 이미지 다운로드 실패: ${absoluteImageUrl.href}`,
        error,
      );
      loggingService.add(
        'error',
        `[CrawlerService] 이미지 다운로드 실패: ${absoluteImageUrl.href}`,
        error,
      );
      return ''; // 실패 시 빈 문자열 반환
    }
  }

  /**
   * 주어진 URL에서 상품 정보를 크롤링하고, 페이지네이션을 통해 여러 페이지를 탐색합니다.
   * @param url 시작 URL
   * @param itemContainerSelector 개별 상품 아이템을 감싸는 요소의 CSS 선택자 (선택 사항)
   * @param itemSelectors 각 상품 아이템 내에서 데이터를 추출할 CSS 선택자 맵
   * @param paginationSelector 다음 페이지 버튼의 CSS 선택자 (선택 사항)
   * @returns 크롤링된 모든 상품 정보의 배열
   */
  async crawlProduct(
    url: string,
    itemContainerSelector: string | undefined,
    itemSelectors: { [key: string]: string | string[] }, // 변경: string | string[]
    paginationSelector: string | undefined,
  ): Promise<CrawledResult[]> {
    if (!this.browser) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    const page: Page = await this.browser.newPage();
    const allResults: CrawledResult[] = [];
    let currentPageUrl = url;
    let pageCount = 0;
    let globalProductIndex = 0; // 전체 제품 인덱스

    try {
      while (true) {
        pageCount++;
        console.log(
          `[CrawlerService] 페이지 이동 중: ${currentPageUrl} (페이지 ${pageCount})`,
        );
        loggingService.add(
          'info',
          `[CrawlerService] 페이지 이동 중: ${currentPageUrl} (페이지 ${pageCount})`,
        );
        await page.goto(currentPageUrl, { waitUntil: 'domcontentloaded' });
        console.log(`[CrawlerService] 페이지 로드 완료: ${currentPageUrl}`);
        loggingService.add(
          'info',
          `[CrawlerService] 페이지 로드 완료: ${currentPageUrl}`,
        );

        // 페이지에서 카테고리 한 번만 추출 및 분류
        let categoryName = '미상'; // 기본값 '미상'
        const categorySelector = itemSelectors['category'];
        if (categorySelector && !Array.isArray(categorySelector)) {
          try {
            const categoryTextContent = await page
              .locator(categorySelector)
              .first()
              .textContent({ timeout: 2000 });
            const sanitizedText = this.sanitizeText(categoryTextContent);

            if (sanitizedText) {
              if (
                sanitizedText.includes('입호흡') ||
                sanitizedText.includes('폐호흡')
              ) {
                categoryName = sanitizedText;
              } else {
                categoryName = '자사액상';
              }
              console.log(
                `[CrawlerService] 페이지 카테고리 발견: ${sanitizedText}, 분류: ${categoryName}`,
              );
              loggingService.add(
                'info',
                `[CrawlerService] 페이지 카테고리 발견: ${sanitizedText}, 분류: ${categoryName}`,
              );
            } else {
              console.log(
                `[CrawlerService] 카테고리 텍스트가 비어있어 '미상'으로 처리합니다.`,
              );
              loggingService.add(
                'info',
                `[CrawlerService] 카테고리 텍스트가 비어있어 '미상'으로 처리합니다.`,
              );
            }
          } catch (e) {
            console.warn(
              `[CrawlerService] 페이지 카테고리를 찾을 수 없어 '미상'으로 처리합니다.`,
            );
            loggingService.add(
              'warn',
              `[CrawlerService] 페이지 카테고리를 찾을 수 없어 '미상'으로 처리합니다.`,
            );
          }
        } else {
          console.log(
            `[CrawlerService] 카테고리 선택자가 제공되지 않아 '미상'으로 처리합니다.`,
          );
          loggingService.add(
            'info',
            `[CrawlerService] 카테고리 선택자가 제공되지 않아 '미상'으로 처리합니다.`,
          );
        }

        // 개별 제품 컨테이너 크롤링
        if (itemContainerSelector) {
          const itemContainers = await page
            .locator(itemContainerSelector)
            .all();
          console.log(
            `[CrawlerService] 현재 페이지에서 ${itemContainers.length}개의 제품 컨테이너 발견.`,
          );
          loggingService.add(
            'info',
            `[CrawlerService] 현재 페이지에서 ${itemContainers.length}개의 제품 컨테이너 발견.`,
          );

          for (const container of itemContainers) {
            globalProductIndex++;
            console.log(
              `[CrawlerService] 요소 ${globalProductIndex} 크롤링 중...`,
            );
            const resultData: { [key: string]: string } = {};
            resultData['category'] = categoryName; // 추출 및 분류된 카테고리 이름 할당

            for (const [key, selectorOrSelectors] of Object.entries(
              itemSelectors,
            )) {
              if (key === 'category') continue; // 이미 처리했으므로 건너뜀

              let value: string | null = null;
              const selectorsToTry = Array.isArray(selectorOrSelectors)
                ? selectorOrSelectors
                : [selectorOrSelectors];

              for (const selector of selectorsToTry) {
                try {
                  // 짧은 타임아웃 적용
                  const locator = container.locator(selector).first();
                  if (
                    selector.includes('img') &&
                    key.toLowerCase().includes('image')
                  ) {
                    const imageUrl = await locator.getAttribute('src', {
                      timeout: 1000,
                    }); // 짧은 타임아웃
                    if (imageUrl) {
                      value = await this._downloadImage(
                        imageUrl,
                        new URL(url).hostname.replace(/\./g, '_'),
                        globalProductIndex,
                        currentPageUrl,
                      );
                    }
                    console.log(
                      `  - ${key} (이미지): ${
                        value ? '다운로드 성공' : '다운로드 실패'
                      }`,
                    );
                  } else {
                    const textContent = await locator.textContent({
                      timeout: 1000,
                    }); // 짧은 타임아웃
                    value = this.sanitizeText(textContent);
                    console.log(
                      `  - ${key}: ${value ? '추출 성공' : '추출 실패'}`,
                    );
                  }
                  if (value) break; // 값을 찾으면 다음 선택자로 넘어가지 않음
                } catch (e) {
                  // TimeoutError는 무시하고 다음 선택자 시도
                  if (e instanceof Error && e.name === 'TimeoutError') {
                    console.warn(
                      `[CrawlerService] 선택자 타임아웃 (${key}, ${selector}). 다음 선택자 시도...`,
                    );
                  } else {
                    console.warn(
                      `[CrawlerService] 선택자 시도 실패 (${key}, ${selector}):`,
                      e instanceof Error ? e.message : e,
                    );
                  }
                }
              }
              resultData[key] = value || ''; // 값을 찾지 못하면 빈 문자열
            }

            // 모든 필수 선택자가 추출되었는지 확인
            const requiredSelectors = Object.keys(itemSelectors).filter(
              (k) => k !== 'category',
            );
            const allSelectorsFound = requiredSelectors.every(
              (selKey) => resultData[selKey] && resultData[selKey] !== '',
            );

            if (allSelectorsFound) {
              console.log(
                `[CrawlerService] 요소 ${globalProductIndex} 크롤링 완료 (모든 선택자 추출 성공).`,
              );
              allResults.push({
                url: currentPageUrl, // 현재 페이지 URL을 기록
                crawledAt: new Date().toISOString(),
                data: resultData,
              });
            } else {
              console.warn(
                `[CrawlerService] 요소 ${globalProductIndex} 크롤링 완료 (일부 선택자 추출 실패 또는 누락). 이 요소는 제품 결과에 포함되지 않습니다.`,
              );
            }
          }
        } else {
          // itemContainerSelector가 없으면 페이지 전체에서 단일 제품으로 간주
          console.log(
            '[CrawlerService] itemContainerSelector 없음. 페이지 전체에서 단일 제품 크롤링.',
          );
          globalProductIndex++;
          const resultData: { [key: string]: string } = {};
          resultData['category'] = categoryName; // 추출 및 분류된 카테고리 이름 할당

          for (const [key, selectorOrSelectors] of Object.entries(
            itemSelectors,
          )) {
            if (key === 'category') continue;

            let value: string | null = null;
            const selectorsToTry = Array.isArray(selectorOrSelectors)
              ? selectorOrSelectors
              : [selectorOrSelectors];

            for (const selector of selectorsToTry) {
              try {
                // 짧은 타임아웃 적용
                const locator = page.locator(selector).first();
                if (
                  selector.includes('img') &&
                  key.toLowerCase().includes('image')
                ) {
                  const imageUrl = await locator.getAttribute('src', {
                    timeout: 1000,
                  }); // 짧은 타임아웃
                  if (imageUrl) {
                    value = await this._downloadImage(
                      imageUrl,
                      new URL(url).hostname.replace(/\./g, '_'),
                      globalProductIndex,
                      currentPageUrl,
                    );
                  }
                  console.log(
                    `  - ${key} (이미지): ${
                      value ? '다운로드 성공' : '다운로드 실패'
                    }`,
                  );
                } else {
                  const textContent = await locator.textContent({
                    timeout: 1000,
                  }); // 짧은 타임아웃
                  value = this.sanitizeText(textContent);
                  console.log(
                    `  - ${key}: ${value ? '추출 성공' : '추출 실패'}`,
                  );
                }
                if (value) break; // 값을 찾으면 다음 선택자로 넘어가지 않음
              } catch (e) {
                // TimeoutError는 무시하고 다음 선택자 시도
                if (e instanceof Error && e.name === 'TimeoutError') {
                  console.warn(
                    `[CrawlerService] 선택자 타임아웃 (${key}, ${selector}). 다음 선택자 시도...`,
                  );
                } else {
                  console.warn(
                    `[CrawlerService] 선택자 시도 실패 (${key}, ${selector}):`,
                    e instanceof Error ? e.message : e,
                  );
                }
              }
            }
            resultData[key] = value || ''; // 값을 찾지 못하면 빈 문자열
          }
          // 모든 필수 선택자가 추출되었는지 확인
          const requiredSelectors = Object.keys(itemSelectors).filter(
            (k) => k !== 'category',
          );
          const allSelectorsFound = requiredSelectors.every(
            (selKey) => resultData[selKey] && resultData[selKey] !== '',
          );

          if (allSelectorsFound) {
            console.log(
              `[CrawlerService] 요소 ${globalProductIndex} 크롤링 완료 (모든 선택자 추출 성공).`,
            );
            allResults.push({
              url: currentPageUrl,
              crawledAt: new Date().toISOString(),
              data: resultData,
            });
          } else {
            console.warn(
              `[CrawlerService] 요소 ${globalProductIndex} 크롤링 완료 (일부 선택자 추출 실패 또는 누락). 이 요소는 제품 결과에 포함되지 않습니다.`,
            );
          }
        }

        // 페이지네이션 처리
        if (paginationSelector) {
          console.log('[CrawlerService] 페이지네이션 버튼 확인 중...');
          const nextButton = page.locator(paginationSelector).first();
          const isVisible = await nextButton.isVisible();
          const isEnabled = await nextButton.isEnabled();

          if (isVisible && isEnabled) {
            console.log('[CrawlerService] 다음 페이지 버튼 발견. 클릭 시도...');
            loggingService.add(
              'info',
              '[CrawlerService] 다음 페이지 버튼 발견. 클릭 시도...',
            );
            await nextButton.click();
            await page.waitForLoadState('domcontentloaded');
            currentPageUrl = page.url(); // 다음 페이지 URL 업데이트
            console.log(
              `[CrawlerService] 다음 페이지로 이동: ${currentPageUrl}`,
            );
            loggingService.add(
              'info',
              `[CrawlerService] 다음 페이지로 이동: ${currentPageUrl}`,
            );
          } else {
            console.log(
              '[CrawlerService] 다음 페이지 버튼 없음 또는 비활성화. 페이지네이션 종료.',
            );
            loggingService.add(
              'info',
              '[CrawlerService] 다음 페이지 버튼 없음 또는 비활성화. 페이지네이션 종료.',
            );
            break;
          }
        } else {
          console.log(
            '[CrawlerService] 페이지네이션 선택자 없음. 단일 페이지 크롤링 종료.',
          );
          loggingService.add(
            'info',
            '[CrawlerService] 페이지네이션 선택자 없음. 단일 페이지 크롤링 종료.',
          );
          break;
        }
      }
    } finally {
      await page.close();
    }

    return allResults;
  }
}

export const crawlerService = new CrawlerService();
