interface LogEntry {
    timestamp: string;
    level: 'info' | 'error' | 'warn';
    message: string;
    details?: any;
}
declare class LoggingService {
    private logs;
    private readonly MAX_LOGS;
    add(level: LogEntry['level'], message: string, details?: any): void;
    getLogs(): LogEntry[];
}
export declare const loggingService: LoggingService;
export {};
//# sourceMappingURL=logging-service.d.ts.map