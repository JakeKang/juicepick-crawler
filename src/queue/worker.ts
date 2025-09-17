import { Worker } from 'bullmq';
import config from '../config';
import { crawlerService } from '../services/crawler-service';
import { loggingService } from '../services/logging-service';
import dataStore from '../services/data/index';

const redisConnection = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
};

// 워커가 동시에 처리할 수 있는 작업의 수
const WORKER_CONCURRENCY = 5;

export const startWorker = async () => {
  const message = '크롤러 워커를 시작합니다.';
  console.log(message);
  loggingService.add('info', message);

  await crawlerService.launch();

  new Worker(
    'crawling-tasks',
    async (job) => {
      const { url, itemContainerSelector, selectors, paginationSelector } =
        job.data;
      if (!url || !selectors) {
        const errorMsg = `작업 데이터에 URL 또는 selectors가 없습니다. (Job ID: ${job.id})`;
        console.error(errorMsg);
        loggingService.add('error', errorMsg);
        return;
      }

      try {
        const startMsg = `크롤링 작업 시작: ${url} (Job ID: ${job.id})`;
        console.log(startMsg);
        loggingService.add('info', startMsg);

        // crawlerService의 새로운 시그니처에 맞춰 인자 전달
        const crawledResults = await crawlerService.crawlProduct(
          url,
          itemContainerSelector,
          selectors,
          paginationSelector,
        );

        const completeMsg = `크롤링 작업 완료: ${url} (${crawledResults.length}개 아이템)`;
        console.log(completeMsg, crawledResults);
        loggingService.add('info', completeMsg, {
          count: crawledResults.length,
          results: crawledResults,
        });

        // 크롤링된 각 아이템을 데이터 저장소에 저장
        for (const result of crawledResults) {
          await dataStore.save(result);
        }
      } catch (error) {
        const errorMsg = `크롤링 작업 실패: ${url} (Job ID: ${job.id})`;
        console.error(errorMsg, error);
        loggingService.add('error', errorMsg, error);
        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: WORKER_CONCURRENCY,
    },
  );

  process.on('SIGINT', async () => {
    const message = '크롤러 워커를 종료합니다.';
    console.log(message);
    loggingService.add('info', message);
    await crawlerService.close();
    process.exit(0);
  });
};
