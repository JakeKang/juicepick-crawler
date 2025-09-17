interface LogEntry {
    timestamp: string;
    level: 'info' | 'error' | 'warn';
    message: string;
    details?: any;
}

class LoggingService {
    private logs: LogEntry[] = [];
    private readonly MAX_LOGS = 100;

    add(level: LogEntry['level'], message: string, details?: any) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            details: details ? JSON.stringify(details, null, 2) : undefined,
        };

        this.logs.unshift(entry); // 새 로그를 맨 앞에 추가

        if (this.logs.length > this.MAX_LOGS) {
            this.logs.pop(); // 가장 오래된 로그 제거
        }
    }

    getLogs(): LogEntry[] {
        return this.logs;
    }
}

export const loggingService = new LoggingService();
