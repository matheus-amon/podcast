import { Elysia } from "elysia";

interface LogContext {
    requestId: string;
    method: string;
    path: string;
    status?: number;
    duration?: number;
    error?: string;
}

/**
 * Generate a unique request ID for correlation
 */
function generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get log level from environment
 */
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_LEVELS: Record<string, number> = { error: 0, warn: 1, info: 2, debug: 3 };

function shouldLog(level: string): boolean {
    const currentLevel = LOG_LEVELS[LOG_LEVEL] ?? LOG_LEVELS['info'];
    const checkLevel = LOG_LEVELS[level] ?? LOG_LEVELS['info'];
    return checkLevel <= currentLevel;
}

/**
 * Structured JSON logging middleware with levels and request ID correlation
 */
export const loggerMiddleware = new Elysia({
    name: 'logger'
})
    .onRequest(({ set, request }) => {
        const requestId = generateRequestId();
        set.headers['X-Request-ID'] = requestId;

        // Store start time for duration calculation
        const startTime = performance.now();

        // Log request start (only in debug mode)
        if (shouldLog('debug')) {
            console.log(JSON.stringify({
                level: 'debug',
                timestamp: new Date().toISOString(),
                event: 'request_started',
                requestId,
                method: request.method,
                path: new URL(request.url).pathname
            }));
        }

        // Store metadata in request for later use (don't return anything)
        (request as any).startTime = startTime;
        (request as any).requestId = requestId;
    })
    .onAfterHandle(({ set, request }) => {
        if (!shouldLog('info')) return;

        const context: LogContext = {
            requestId: set.headers['X-Request-ID'] as string || 'unknown',
            method: request.method,
            path: new URL(request.url).pathname,
            status: typeof set.status === 'number' ? set.status : 200,
            duration: performance.now() - ((request as any).startTime || 0)
        };

        console.log(JSON.stringify({
            level: 'info',
            timestamp: new Date().toISOString(),
            event: 'request_completed',
            ...context
        }));
    })
    .onError(({ set, request, error }) => {
        if (!shouldLog('error')) return;

        const context: LogContext = {
            requestId: set.headers['X-Request-ID'] as string || 'unknown',
            method: request.method,
            path: new URL(request.url).pathname,
            status: typeof set.status === 'number' ? set.status : 500,
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        console.error(JSON.stringify({
            level: 'error',
            timestamp: new Date().toISOString(),
            event: 'request_error',
            ...context
        }));
    });
