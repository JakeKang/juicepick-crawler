"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_1 = __importDefault(require("fastify"));
var helmet_1 = __importDefault(require("@fastify/helmet"));
var rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
var static_1 = __importDefault(require("@fastify/static"));
var path_1 = __importDefault(require("path"));
var config_1 = __importDefault(require("./config"));
var queue_1 = require("./queue/queue");
var logging_service_1 = require("./services/logging-service");
var server = (0, fastify_1.default)({
    logger: {
        level: 'info',
    },
});
// 1. 정적 파일 서빙 플러그인 등록
server.register(static_1.default, {
    root: path_1.default.join(process.cwd(), 'public'),
});
// 보안 헤더 플러그인 등록
server.register(helmet_1.default, {
    // CSP(Content Security Policy)는 대시보드의 Tailwind CDN 스크립트 로드를 허용해야 하므로
    // 기본 설정 대신 일부를 비활성화하거나 직접 정책을 설정해야 합니다.
    // 여기서는 간단하게 기본 CSP를 비활성화하지만, 프로덕션에서는 더 엄격한 정책을 권장합니다.
    contentSecurityPolicy: false,
});
// 2. 대시보드 페이지 라우트
server.get('/', function (req, reply) {
    reply.sendFile('index.html');
});
// 3. 요청 횟수 제한 플러그인 등록
server.register(rate_limit_1.default, {
    max: 100, // 15분 동안 100개의 요청
    timeWindow: '15 minutes',
});
// 4. API 인증을 위한 Hook (미들웨어)
server.addHook('preHandler', function (request, reply, done) {
    var _a;
    var path = (_a = request.raw.url) !== null && _a !== void 0 ? _a : '';
    if (path.startsWith('/api/crawl')) {
        var apiKey = request.headers['x-internal-api-key'];
        if (apiKey !== config_1.default.INTERNAL_API_KEY) {
            reply
                .code(401)
                .send({ error: 'Unauthorized: 유효하지 않은 API 키입니다.' });
            return;
        }
    }
    done();
});
// 5. 대시보드 조회용 API 엔드포인트
server.get('/api/status', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var counts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, queue_1.crawlingQueue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed')];
            case 1:
                counts = _a.sent();
                reply.send(counts);
                return [2 /*return*/];
        }
    });
}); });
server.get('/api/logs', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var logs;
    return __generator(this, function (_a) {
        logs = logging_service_1.loggingService.getLogs();
        reply.send(logs);
        return [2 /*return*/];
    });
}); });
// 6. 대시보드 제어용 API 엔드포인트
server.post('/api/jobs/retry/all', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var failedJobs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, queue_1.crawlingQueue.getFailed()];
            case 1:
                failedJobs = _a.sent();
                return [4 /*yield*/, Promise.all(failedJobs.map(function (job) { return job.retry(); }))];
            case 2:
                _a.sent();
                reply.send({
                    success: true,
                    message: "".concat(failedJobs.length, "\uAC1C\uC758 \uC2E4\uD328\uD55C \uC791\uC5C5\uC774 \uC7AC\uC2DC\uB3C4 \uD050\uC5D0 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4."),
                });
                return [2 /*return*/];
        }
    });
}); });
server.delete('/api/queue/clean', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var gracePeriod, limit;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                gracePeriod = 1000 * 60 * 60;
                limit = 1000;
                return [4 /*yield*/, queue_1.crawlingQueue.clean(gracePeriod, limit, 'completed')];
            case 1:
                _a.sent();
                return [4 /*yield*/, queue_1.crawlingQueue.clean(gracePeriod, limit, 'failed')];
            case 2:
                _a.sent();
                reply.send({ success: true, message: '오래된 작업들이 정리되었습니다.' });
                return [2 /*return*/];
        }
    });
}); });
var JOB_OPTIONS = {
    attempts: 5, // 최대 5번 재시도
    backoff: {
        // 지수적 백오프 전략
        type: 'exponential',
        delay: 1000, // 1초에서 시작
    },
};
server.post('/api/jobs/trigger', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, url, itemContainerSelector, selectors, paginationSelector;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = request.body, url = _a.url, itemContainerSelector = _a.itemContainerSelector, selectors = _a.selectors, paginationSelector = _a.paginationSelector;
                if (!url || !selectors) {
                    return [2 /*return*/, reply.code(400).send({ error: 'URL과 selectors가 필요합니다.' })];
                }
                return [4 /*yield*/, queue_1.crawlingQueue.add('manual-crawl-job', { url: url, itemContainerSelector: itemContainerSelector, selectors: selectors, paginationSelector: paginationSelector }, JOB_OPTIONS)];
            case 1:
                _b.sent();
                reply.send({
                    success: true,
                    message: "\uC218\uB3D9 \uC791\uC5C5\uC774 \uD050\uC5D0 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4: ".concat(url),
                });
                return [2 /*return*/];
        }
    });
}); });
server.post('/api/crawl', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var jobs, bullJobs, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                jobs = request.body.jobs;
                if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
                    return [2 /*return*/, reply
                            .code(400)
                            .send({ error: '요청 본문에 jobs 배열이 필요합니다.' })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                bullJobs = jobs.map(function (job) { return ({
                    name: 'crawl-job',
                    data: job,
                    opts: JOB_OPTIONS,
                }); });
                return [4 /*yield*/, queue_1.crawlingQueue.addBulk(bullJobs)];
            case 2:
                _a.sent();
                reply.send({
                    success: true,
                    message: "".concat(jobs.length, "\uAC1C\uC758 \uD06C\uB864\uB9C1 \uC791\uC5C5\uC774 \uD050\uC5D0 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4."),
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                server.log.error(error_1, '큐에 작업을 추가하는 중 오류 발생');
                reply.code(500).send({ error: '내부 서버 오류' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// 서버 시작
var startServer = function () { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, server.listen({ port: config_1.default.PORT, host: '0.0.0.0' })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                server.log.error(err_1);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
startServer();
//# sourceMappingURL=server.js.map