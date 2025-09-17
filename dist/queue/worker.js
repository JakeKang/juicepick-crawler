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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWorker = void 0;
var bullmq_1 = require("bullmq");
var config_1 = __importDefault(require("../config"));
var crawler_service_1 = require("../services/crawler-service");
var logging_service_1 = require("../services/logging-service");
var index_1 = __importDefault(require("../services/data/index"));
var redisConnection = {
    host: config_1.default.REDIS_HOST,
    port: config_1.default.REDIS_PORT,
};
// 워커가 동시에 처리할 수 있는 작업의 수
var WORKER_CONCURRENCY = 5;
var startWorker = function () { return __awaiter(void 0, void 0, void 0, function () {
    var message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                message = '크롤러 워커를 시작합니다.';
                console.log(message);
                logging_service_1.loggingService.add('info', message);
                return [4 /*yield*/, crawler_service_1.crawlerService.launch()];
            case 1:
                _a.sent();
                new bullmq_1.Worker('crawling-tasks', function (job) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, url, itemContainerSelector, selectors, paginationSelector, errorMsg, startMsg, crawledResults, completeMsg, crawledResults_1, crawledResults_1_1, result, e_1_1, error_1, errorMsg;
                    var e_1, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _a = job.data, url = _a.url, itemContainerSelector = _a.itemContainerSelector, selectors = _a.selectors, paginationSelector = _a.paginationSelector;
                                if (!url || !selectors) {
                                    errorMsg = "\uC791\uC5C5 \uB370\uC774\uD130\uC5D0 URL \uB610\uB294 selectors\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. (Job ID: ".concat(job.id, ")");
                                    console.error(errorMsg);
                                    logging_service_1.loggingService.add('error', errorMsg);
                                    return [2 /*return*/];
                                }
                                _c.label = 1;
                            case 1:
                                _c.trys.push([1, 11, , 12]);
                                startMsg = "\uD06C\uB864\uB9C1 \uC791\uC5C5 \uC2DC\uC791: ".concat(url, " (Job ID: ").concat(job.id, ")");
                                console.log(startMsg);
                                logging_service_1.loggingService.add('info', startMsg);
                                return [4 /*yield*/, crawler_service_1.crawlerService.crawlProduct(url, itemContainerSelector, selectors, paginationSelector)];
                            case 2:
                                crawledResults = _c.sent();
                                completeMsg = "\uD06C\uB864\uB9C1 \uC791\uC5C5 \uC644\uB8CC: ".concat(url, " (").concat(crawledResults.length, "\uAC1C \uC544\uC774\uD15C)");
                                console.log(completeMsg, crawledResults);
                                logging_service_1.loggingService.add('info', completeMsg, {
                                    count: crawledResults.length,
                                    results: crawledResults,
                                });
                                _c.label = 3;
                            case 3:
                                _c.trys.push([3, 8, 9, 10]);
                                crawledResults_1 = __values(crawledResults), crawledResults_1_1 = crawledResults_1.next();
                                _c.label = 4;
                            case 4:
                                if (!!crawledResults_1_1.done) return [3 /*break*/, 7];
                                result = crawledResults_1_1.value;
                                return [4 /*yield*/, index_1.default.save(result)];
                            case 5:
                                _c.sent();
                                _c.label = 6;
                            case 6:
                                crawledResults_1_1 = crawledResults_1.next();
                                return [3 /*break*/, 4];
                            case 7: return [3 /*break*/, 10];
                            case 8:
                                e_1_1 = _c.sent();
                                e_1 = { error: e_1_1 };
                                return [3 /*break*/, 10];
                            case 9:
                                try {
                                    if (crawledResults_1_1 && !crawledResults_1_1.done && (_b = crawledResults_1.return)) _b.call(crawledResults_1);
                                }
                                finally { if (e_1) throw e_1.error; }
                                return [7 /*endfinally*/];
                            case 10: return [3 /*break*/, 12];
                            case 11:
                                error_1 = _c.sent();
                                errorMsg = "\uD06C\uB864\uB9C1 \uC791\uC5C5 \uC2E4\uD328: ".concat(url, " (Job ID: ").concat(job.id, ")");
                                console.error(errorMsg, error_1);
                                logging_service_1.loggingService.add('error', errorMsg, error_1);
                                throw error_1;
                            case 12: return [2 /*return*/];
                        }
                    });
                }); }, {
                    connection: redisConnection,
                    concurrency: WORKER_CONCURRENCY,
                });
                process.on('SIGINT', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var message;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                message = '크롤러 워커를 종료합니다.';
                                console.log(message);
                                logging_service_1.loggingService.add('info', message);
                                return [4 /*yield*/, crawler_service_1.crawlerService.close()];
                            case 1:
                                _a.sent();
                                process.exit(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); };
exports.startWorker = startWorker;
//# sourceMappingURL=worker.js.map