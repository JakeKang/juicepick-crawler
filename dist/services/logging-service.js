"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingService = void 0;
var LoggingService = /** @class */ (function () {
    function LoggingService() {
        this.logs = [];
        this.MAX_LOGS = 100;
    }
    LoggingService.prototype.add = function (level, message, details) {
        var entry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            details: details ? JSON.stringify(details, null, 2) : undefined,
        };
        this.logs.unshift(entry); // 새 로그를 맨 앞에 추가
        if (this.logs.length > this.MAX_LOGS) {
            this.logs.pop(); // 가장 오래된 로그 제거
        }
    };
    LoggingService.prototype.getLogs = function () {
        return this.logs;
    };
    return LoggingService;
}());
exports.loggingService = new LoggingService();
//# sourceMappingURL=logging-service.js.map