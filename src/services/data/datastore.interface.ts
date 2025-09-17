/**
 * 크롤링된 결과 데이터의 구조
 */
export interface CrawledResult {
  url: string;
  crawledAt: string;
  data: { [key: string]: string };
}

/**
 * 데이터 저장소의 표준 인터페이스
 */
export interface IDataStore {
  /**
   * 크롤링된 데이터를 저장소에 저장합니다.
   * @param result - 저장할 크롤링 결과 데이터
   */
  save(result: CrawledResult): Promise<void>;
}
