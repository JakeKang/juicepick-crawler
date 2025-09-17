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
var crawler_service_1 = require("../services/crawler-service");
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
// 설정 파일 경로
var CONFIG_PATH = path_1.default.join(process.cwd(), 'crawler-config.json');
function testCrawl() {
    return __awaiter(this, void 0, void 0, function () {
        var configFile, sites, testSite, productInfo, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("[Test] \uD06C\uB864\uB7EC \uC11C\uBE44\uC2A4\uB97C \uC2DC\uC791\uD569\uB2C8\uB2E4.");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 8]);
                    // 1. 설정 파일 읽기
                    console.log('[Test] crawler-config.json 파일을 읽는 중...');
                    return [4 /*yield*/, fs_1.promises.readFile(CONFIG_PATH, 'utf-8')];
                case 2:
                    configFile = _a.sent();
                    sites = JSON.parse(configFile).sites;
                    if (!sites || sites.length === 0) {
                        console.error('[Test] 오류: crawler-config.json에 테스트할 사이트 설정이 없습니다.');
                        return [2 /*return*/];
                    }
                    testSite = sites[0];
                    console.log("[Test] \uB300\uC0C1 \uC0AC\uC774\uD2B8 \uC124\uC815 \uB85C\uB4DC \uC644\uB8CC: ".concat(testSite.name, " (").concat(testSite.url, ")"));
                    // 중요: 여기에 실제 접근 가능한 유효한 URL을 입력했는지 다시 한번 확인해주세요!
                    if (testSite.url.includes('여기에_크롤링할_페이지_URL을_입력하세요')) {
                        console.error('[Test] 오류: crawler-config.json의 URL이 플레이스홀더입니다. 유효한 URL로 변경해주세요.');
                        return [2 /*return*/];
                    }
                    // 3. 브라우저 실행
                    console.log('[Test] Playwright 브라우저를 실행하는 중...');
                    return [4 /*yield*/, crawler_service_1.crawlerService.launch()];
                case 3:
                    _a.sent();
                    console.log('[Test] 브라우저 실행 완료.');
                    // 4. 상품 정보 크롤링 시작
                    console.log("[Test] \uD06C\uB864\uB9C1 \uC2DC\uC791: ".concat(testSite.url));
                    return [4 /*yield*/, crawler_service_1.crawlerService.crawlProduct(testSite.url, testSite.itemContainerSelector, testSite.selectors, testSite.paginationSelector)];
                case 4:
                    productInfo = _a.sent();
                    console.log('[Test] 크롤링 완료.');
                    // 5. 크롤링 결과 출력
                    console.log('[Test] 크롤링 결과:');
                    if (productInfo.length > 0) {
                        productInfo.forEach(function (item, index) {
                            console.log("  --- \uC544\uC774\uD15C ".concat(index + 1, " ---"));
                            for (var key in item.data) {
                                console.log("    - ".concat(key, ":"), item.data[key]);
                            }
                        });
                    }
                    else {
                        console.log('  크롤링된 데이터가 없습니다.');
                    }
                    return [3 /*break*/, 8];
                case 5:
                    error_1 = _a.sent();
                    console.error('[Test] 크롤링 중 치명적인 오류가 발생했습니다:', error_1);
                    // 오류 객체의 상세 정보를 출력하여 디버깅에 도움
                    if (error_1 instanceof Error) {
                        console.error('  오류 이름:', error_1.name);
                        console.error('  오류 메시지:', error_1.message);
                        console.error('  스택 트레이스:', error_1.stack);
                    }
                    else {
                        console.error('  알 수 없는 오류 객체:', error_1);
                    }
                    return [3 /*break*/, 8];
                case 6:
                    // 6. 브라우저 종료
                    console.log('[Test] 브라우저를 종료하는 중...');
                    return [4 /*yield*/, crawler_service_1.crawlerService.close()];
                case 7:
                    _a.sent();
                    console.log('[Test] 브라우저 종료 완료.');
                    console.log('[Test] 크롤러 테스트 종료.');
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
testCrawl();
//# sourceMappingURL=test-crawler.js.map