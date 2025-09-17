import fastify, {
  type FastifyInstance,
  type FastifyRequest,
  type FastifyReply,
} from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import staticPlugin from '@fastify/static';
import path from 'path';
import config from './config';
import { crawlingQueue } from './queue/queue';
import { loggingService } from './services/logging-service';

const server: FastifyInstance = fastify({
  logger: {
    level: 'info',
  },
});

// 1. 정적 파일 서빙 플러그인 등록
server.register(staticPlugin, {
  root: path.join(process.cwd(), 'public'),
});

// 보안 헤더 플러그인 등록
server.register(helmet, {
  // CSP(Content Security Policy)는 대시보드의 Tailwind CDN 스크립트 로드를 허용해야 하므로
  // 기본 설정 대신 일부를 비활성화하거나 직접 정책을 설정해야 합니다.
  // 여기서는 간단하게 기본 CSP를 비활성화하지만, 프로덕션에서는 더 엄격한 정책을 권장합니다.
  contentSecurityPolicy: false,
});

// 2. 대시보드 페이지 라우트
server.get('/', (req, reply) => {
  reply.sendFile('index.html');
});

// 3. 요청 횟수 제한 플러그인 등록
server.register(rateLimit, {
  max: 100, // 15분 동안 100개의 요청
  timeWindow: '15 minutes',
});

// 4. API 인증을 위한 Hook (미들웨어)
server.addHook(
  'preHandler',
  (request: FastifyRequest, reply: FastifyReply, done) => {
    const path = request.raw.url ?? '';
    if (path.startsWith('/api/crawl')) {
      const apiKey = request.headers['x-internal-api-key'];
      if (apiKey !== config.INTERNAL_API_KEY) {
        reply
          .code(401)
          .send({ error: 'Unauthorized: 유효하지 않은 API 키입니다.' });
        return;
      }
    }
    done();
  },
);

// 5. 대시보드 조회용 API 엔드포인트
server.get(
  '/api/status',
  async (request: FastifyRequest, reply: FastifyReply) => {
    const counts = await crawlingQueue.getJobCounts(
      'wait',
      'active',
      'completed',
      'failed',
      'delayed',
    );
    reply.send(counts);
  },
);

server.get(
  '/api/logs',
  async (request: FastifyRequest, reply: FastifyReply) => {
    const logs = loggingService.getLogs();
    reply.send(logs);
  },
);

// 6. 대시보드 제어용 API 엔드포인트
server.post(
  '/api/jobs/retry/all',
  async (request: FastifyRequest, reply: FastifyReply) => {
    const failedJobs = await crawlingQueue.getFailed();
    await Promise.all(failedJobs.map((job) => job.retry()));
    reply.send({
      success: true,
      message: `${failedJobs.length}개의 실패한 작업이 재시도 큐에 추가되었습니다.`,
    });
  },
);

server.delete(
  '/api/queue/clean',
  async (request: FastifyRequest, reply: FastifyReply) => {
    // 1시간 이상 지난 완료/실패 작업 정리 (최대 1000개)
    const gracePeriod = 1000 * 60 * 60;
    const limit = 1000; // 한 번에 정리할 최대 작업 수
    await crawlingQueue.clean(gracePeriod, limit, 'completed');
    await crawlingQueue.clean(gracePeriod, limit, 'failed');
    reply.send({ success: true, message: '오래된 작업들이 정리되었습니다.' });
  },
);

interface CrawlJob {
  url: string;
  itemContainerSelector?: string; // 추가
  selectors: { [key: string]: string };
  paginationSelector?: string; // 추가
}

const JOB_OPTIONS = {
  attempts: 5, // 최대 5번 재시도
  backoff: {
    // 지수적 백오프 전략
    type: 'exponential',
    delay: 1000, // 1초에서 시작
  },
};

server.post(
  '/api/jobs/trigger',
  async (request: FastifyRequest<{ Body: CrawlJob }>, reply: FastifyReply) => {
    const { url, itemContainerSelector, selectors, paginationSelector } =
      request.body;
    if (!url || !selectors) {
      return reply.code(400).send({ error: 'URL과 selectors가 필요합니다.' });
    }
    await crawlingQueue.add(
      'manual-crawl-job',
      { url, itemContainerSelector, selectors, paginationSelector },
      JOB_OPTIONS,
    );
    reply.send({
      success: true,
      message: `수동 작업이 큐에 추가되었습니다: ${url}`,
    });
  },
);

// 7. 크롤링 작업을 큐에 추가하는 엔드포인트 (스케줄러용)
interface CrawlRequestBody {
  jobs: CrawlJob[];
}

server.post(
  '/api/crawl',
  async (
    request: FastifyRequest<{ Body: CrawlRequestBody }>,
    reply: FastifyReply,
  ) => {
    const { jobs } = request.body;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return reply
        .code(400)
        .send({ error: '요청 본문에 jobs 배열이 필요합니다.' });
    }

    try {
      const bullJobs = jobs.map((job) => ({
        name: 'crawl-job',
        data: job,
        opts: JOB_OPTIONS,
      }));
      await crawlingQueue.addBulk(bullJobs);
      reply.send({
        success: true,
        message: `${jobs.length}개의 크롤링 작업이 큐에 추가되었습니다.`,
      });
    } catch (error) {
      server.log.error(error, '큐에 작업을 추가하는 중 오류 발생');
      reply.code(500).send({ error: '내부 서버 오류' });
    }
  },
);

// 서버 시작
const startServer = async () => {
  try {
    await server.listen({ port: config.PORT, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

startServer();
