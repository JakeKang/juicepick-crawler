"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlingQueue = void 0;
var bullmq_1 = require("bullmq");
var config_1 = __importDefault(require("../config"));
var redisConnection = {
    host: config_1.default.REDIS_HOST,
    port: config_1.default.REDIS_PORT,
};
exports.crawlingQueue = new bullmq_1.Queue('crawling-tasks', {
    connection: redisConnection,
});
//# sourceMappingURL=queue.js.map