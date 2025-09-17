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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlerService = void 0;
var playwright_1 = require("playwright");
var CrawlerService = /** @class */ (function () {
    function CrawlerService() {
        this.browser = null;
    }
    CrawlerService.prototype.launch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, playwright_1.chromium.launch()];
                    case 1:
                        _a.browser = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CrawlerService.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.browser) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.browser.close()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    CrawlerService.prototype.sanitizeText = function (text) {
        if (!text) {
            return '';
        }
        // 간단한 스크립트 태그 및 HTML 태그 제거 로직
        return text
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim();
    };
    /**
     * 주어진 URL에서 상품 정보를 크롤링하고, 페이지네이션을 통해 여러 페이지를 탐색합니다.
     * @param url 시작 URL
     * @param itemContainerSelector 개별 상품 아이템을 감싸는 요소의 CSS 선택자 (선택 사항)
     * @param itemSelectors 각 상품 아이템 내에서 데이터를 추출할 CSS 선택자 맵
     * @param paginationSelector 다음 페이지 버튼의 CSS 선택자 (선택 사항)
     * @returns 크롤링된 모든 상품 정보의 배열
     */
    CrawlerService.prototype.crawlProduct = function (url, itemContainerSelector, itemSelectors, paginationSelector) {
        return __awaiter(this, void 0, void 0, function () {
            var page, allResults, currentPageUrl, itemContainers, itemContainers_1, itemContainers_1_1, container, resultData, _a, _b, _c, key, selector, imgElement, src, textContent, e_1_1, e_2_1, resultData, _d, _e, _f, key, selector, imgElement, src, textContent, e_3_1, nextButton, isVisible, isEnabled;
            var e_2, _g, e_1, _h, e_3, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        if (!this.browser) {
                            throw new Error('Browser not launched. Call launch() first.');
                        }
                        return [4 /*yield*/, this.browser.newPage()];
                    case 1:
                        page = _k.sent();
                        allResults = [];
                        currentPageUrl = url;
                        _k.label = 2;
                    case 2:
                        _k.trys.push([2, , 44, 46]);
                        _k.label = 3;
                    case 3:
                        if (!true) return [3 /*break*/, 43];
                        return [4 /*yield*/, page.goto(currentPageUrl, { waitUntil: 'domcontentloaded' })];
                    case 4:
                        _k.sent();
                        if (!itemContainerSelector) return [3 /*break*/, 23];
                        return [4 /*yield*/, page
                                .locator(itemContainerSelector)
                                .all()];
                    case 5:
                        itemContainers = _k.sent();
                        _k.label = 6;
                    case 6:
                        _k.trys.push([6, 20, 21, 22]);
                        itemContainers_1 = (e_2 = void 0, __values(itemContainers)), itemContainers_1_1 = itemContainers_1.next();
                        _k.label = 7;
                    case 7:
                        if (!!itemContainers_1_1.done) return [3 /*break*/, 19];
                        container = itemContainers_1_1.value;
                        resultData = {};
                        _k.label = 8;
                    case 8:
                        _k.trys.push([8, 15, 16, 17]);
                        _a = (e_1 = void 0, __values(Object.entries(itemSelectors))), _b = _a.next();
                        _k.label = 9;
                    case 9:
                        if (!!_b.done) return [3 /*break*/, 14];
                        _c = __read(_b.value, 2), key = _c[0], selector = _c[1];
                        if (!(selector.includes('img') &&
                            key.toLowerCase().includes('image'))) return [3 /*break*/, 11];
                        imgElement = container.locator(selector).first();
                        return [4 /*yield*/, imgElement.getAttribute('src')];
                    case 10:
                        src = _k.sent();
                        resultData[key] = this.sanitizeText(src);
                        return [3 /*break*/, 13];
                    case 11: return [4 /*yield*/, container
                            .locator(selector)
                            .first()
                            .textContent()];
                    case 12:
                        textContent = _k.sent();
                        resultData[key] = this.sanitizeText(textContent);
                        _k.label = 13;
                    case 13:
                        _b = _a.next();
                        return [3 /*break*/, 9];
                    case 14: return [3 /*break*/, 17];
                    case 15:
                        e_1_1 = _k.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 17];
                    case 16:
                        try {
                            if (_b && !_b.done && (_h = _a.return)) _h.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 17:
                        allResults.push({
                            url: currentPageUrl, // 현재 페이지 URL을 기록
                            crawledAt: new Date().toISOString(),
                            data: resultData,
                        });
                        _k.label = 18;
                    case 18:
                        itemContainers_1_1 = itemContainers_1.next();
                        return [3 /*break*/, 7];
                    case 19: return [3 /*break*/, 22];
                    case 20:
                        e_2_1 = _k.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 22];
                    case 21:
                        try {
                            if (itemContainers_1_1 && !itemContainers_1_1.done && (_g = itemContainers_1.return)) _g.call(itemContainers_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 22: return [3 /*break*/, 34];
                    case 23:
                        resultData = {};
                        _k.label = 24;
                    case 24:
                        _k.trys.push([24, 31, 32, 33]);
                        _d = (e_3 = void 0, __values(Object.entries(itemSelectors))), _e = _d.next();
                        _k.label = 25;
                    case 25:
                        if (!!_e.done) return [3 /*break*/, 30];
                        _f = __read(_e.value, 2), key = _f[0], selector = _f[1];
                        if (!(selector.includes('img') &&
                            key.toLowerCase().includes('image'))) return [3 /*break*/, 27];
                        imgElement = page.locator(selector).first();
                        return [4 /*yield*/, imgElement.getAttribute('src')];
                    case 26:
                        src = _k.sent();
                        resultData[key] = this.sanitizeText(src);
                        return [3 /*break*/, 29];
                    case 27: return [4 /*yield*/, page
                            .locator(selector)
                            .first()
                            .textContent()];
                    case 28:
                        textContent = _k.sent();
                        resultData[key] = this.sanitizeText(textContent);
                        _k.label = 29;
                    case 29:
                        _e = _d.next();
                        return [3 /*break*/, 25];
                    case 30: return [3 /*break*/, 33];
                    case 31:
                        e_3_1 = _k.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 33];
                    case 32:
                        try {
                            if (_e && !_e.done && (_j = _d.return)) _j.call(_d);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 33:
                        allResults.push({
                            url: currentPageUrl,
                            crawledAt: new Date().toISOString(),
                            data: resultData,
                        });
                        _k.label = 34;
                    case 34:
                        if (!paginationSelector) return [3 /*break*/, 41];
                        nextButton = page.locator(paginationSelector).first();
                        return [4 /*yield*/, nextButton.isVisible()];
                    case 35:
                        isVisible = _k.sent();
                        return [4 /*yield*/, nextButton.isEnabled()];
                    case 36:
                        isEnabled = _k.sent();
                        if (!(isVisible && isEnabled)) return [3 /*break*/, 39];
                        // 다음 페이지 버튼 클릭 및 로드 대기
                        return [4 /*yield*/, nextButton.click()];
                    case 37:
                        // 다음 페이지 버튼 클릭 및 로드 대기
                        _k.sent();
                        return [4 /*yield*/, page.waitForLoadState('domcontentloaded')];
                    case 38:
                        _k.sent();
                        currentPageUrl = page.url(); // 다음 페이지 URL 업데이트
                        return [3 /*break*/, 40];
                    case 39: 
                    // 다음 페이지 버튼이 없거나 비활성화되면 종료
                    return [3 /*break*/, 43];
                    case 40: return [3 /*break*/, 42];
                    case 41: 
                    // 페이지네이션 선택자가 없으면 현재 페이지에서 종료
                    return [3 /*break*/, 43];
                    case 42: return [3 /*break*/, 3];
                    case 43: return [3 /*break*/, 46];
                    case 44: return [4 /*yield*/, page.close()];
                    case 45:
                        _k.sent();
                        return [7 /*endfinally*/];
                    case 46: return [2 /*return*/, allResults];
                }
            });
        });
    };
    return CrawlerService;
}());
exports.crawlerService = new CrawlerService();
//# sourceMappingURL=crawler-service.js.map