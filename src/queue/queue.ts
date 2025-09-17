import { Queue } from 'bullmq';
import config from '../config';

const redisConnection = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
};

export const crawlingQueue = new Queue('crawling-tasks', {
  connection: redisConnection,
});
