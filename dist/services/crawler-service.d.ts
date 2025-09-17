import { type CrawledResult } from './data/datastore.interface.js';
declare class CrawlerService {
    private browser;
    launch(): Promise<void>;
    close(): Promise<void>;
    private sanitizeText;
    /**
     * 주어진 URL에서 상품 정보를 크롤링하고, 페이지네이션을 통해 여러 페이지를 탐색합니다.
     * @param url 시작 URL
     * @param itemContainerSelector 개별 상품 아이템을 감싸는 요소의 CSS 선택자 (선택 사항)
     * @param itemSelectors 각 상품 아이템 내에서 데이터를 추출할 CSS 선택자 맵
     * @param paginationSelector 다음 페이지 버튼의 CSS 선택자 (선택 사항)
     * @returns 크롤링된 모든 상품 정보의 배열
     */
    crawlProduct(url: string, itemContainerSelector: string | undefined, itemSelectors: {
        [key: string]: string;
    }, paginationSelector: string | undefined): Promise<CrawledResult[]>;
}
export declare const crawlerService: CrawlerService;
export {};
//# sourceMappingURL=crawler-service.d.ts.map