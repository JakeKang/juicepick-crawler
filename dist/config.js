"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
var path_1 = __importDefault(require("path"));
// NODE_ENV에 따라 다른 .env 파일 로드
// 예: NODE_ENV=production 이면 .env.production 파일을 로드
dotenv_1.default.config({
    path: path_1.default.resolve(process.cwd(), ".env.".concat(process.env.NODE_ENV || 'development'))
});
var config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    INTERNAL_API_KEY: process.env.X_INTERNAL_API_KEY || '',
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_KEY: process.env.SUPABASE_KEY || '',
};
// INTERNAL_API_KEY는 필수 값이므로 없는 경우 오류 발생
if (!config.INTERNAL_API_KEY) {
    throw new Error('X_INTERNAL_API_KEY is not defined in the environment variables.');
}
// 설정 객체를 외부에서 변경할 수 없도록 동결
exports.default = Object.freeze(config);
//# sourceMappingURL=config.js.map