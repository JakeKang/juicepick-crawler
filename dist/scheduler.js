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
var node_cron_1 = __importDefault(require("node-cron"));
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var config_1 = __importDefault(require("./config"));
var logging_service_1 = require("./services/logging-service");
var API_BASE_URL = "http://localhost:".concat(config_1.default.PORT);
var INTERNAL_API_KEY = config_1.default.INTERNAL_API_KEY;
// 설정 파일 경로
var CONFIG_PATH = path_1.default.join(process.cwd(), 'crawler-config.json');
function triggerBulkCrawl() {
    return __awaiter(this, void 0, void 0, function () {
        var message, errorMsg, configFile, sites, warnMsg, jobs, response, data, errMsg, error_1, errorMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = '스케줄러 실행: 벌크 크롤링 API를 호출합니다.';
                    console.log(message);
                    logging_service_1.loggingService.add('info', message);
                    if (!INTERNAL_API_KEY) {
                        errorMsg = 'X_INTERNAL_API_KEY가 설정되지 않아 스케줄러를 실행할 수 없습니다.';
                        console.error(errorMsg);
                        logging_service_1.loggingService.add('error', errorMsg);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, promises_1.default.readFile(CONFIG_PATH, 'utf-8')];
                case 2:
                    configFile = _a.sent();
                    sites = JSON.parse(configFile).sites;
                    if (!sites || sites.length === 0) {
                        warnMsg = '크롤링할 사이트가 설정 파일에 없습니다.';
                        console.log(warnMsg);
                        logging_service_1.loggingService.add('warn', warnMsg);
                        return [2 /*return*/];
                    }
                    jobs = sites.map(function (site) { return ({
                        url: site.url,
                        itemContainerSelector: site.itemContainerSelector,
                        selectors: site.selectors,
                        paginationSelector: site.paginationSelector,
                    }); });
                    return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/api/crawl"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-internal-api-key': INTERNAL_API_KEY,
                            },
                            body: JSON.stringify({ jobs: jobs }),
                        })];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = (_a.sent());
                    if (!response.ok) {
                        errMsg = data && typeof data === 'object' && 'error' in data
                            ? data.error
                            : "HTTP error! ".concat(response.status);
                        throw new Error(String(errMsg));
                    }
                    console.log('API 호출 성공:', data && data.message);
                    logging_service_1.loggingService.add('info', 'API 호출 성공', {
                        message: data && data.message,
                    });
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    errorMsg = '스케줄러에서 API 호출 중 오류 발생';
                    console.error(errorMsg, error_1);
                    logging_service_1.loggingService.add('error', errorMsg, error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// 매일 자정에 실행 (테스트를 위해 '*/1 * * * *' 로 변경하여 1분마다 실행 가능)
// cron.schedule('0 0 * * *', triggerBulkCrawl);
node_cron_1.default.schedule('*/1 * * * *', triggerBulkCrawl);
var startMsg = '크롤링 스케줄러가 설정되었습니다. 1분마다 실행됩니다.';
console.log(startMsg);
logging_service_1.loggingService.add('info', startMsg);
//# sourceMappingURL=scheduler.js.map