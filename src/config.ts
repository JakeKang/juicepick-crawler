import dotenv from 'dotenv';
import path from 'path';

// NODE_ENV에 따라 다른 .env 파일 로드
// 예: NODE_ENV=production 이면 .env.production 파일을 로드
dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || 'development'}`,
  ),
});

interface Config {
  NODE_ENV: string;
  PORT: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  INTERNAL_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
}

const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  INTERNAL_API_KEY: process.env.X_INTERNAL_API_KEY || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || '',
};

// INTERNAL_API_KEY는 필수 값이므로 없는 경우 오류 발생
if (!config.INTERNAL_API_KEY && config.NODE_ENV !== 'development') {
  throw new Error(
    'X_INTERNAL_API_KEY is not defined in the environment variables.',
  );
}

// 설정 객체를 외부에서 변경할 수 없도록 동결
export default Object.freeze(config);
