import { Elysia, ValidationError } from "elysia";

interface ErrorResponse {
    error: {
        code: string;
        message: string;
        details?: any;
    };
}

/**
 * Global error handling middleware
 * Catches unhandled exceptions and returns consistent error format
 * Never exposes stack traces to clients
 */
export const errorMiddleware = new Elysia({
    name: 'error-handler'
})
    .onError(({ code, error, set, request }) => {
        // Extract path for logging
        const path = new URL(request.url).pathname;

        // Log error with context (but never expose stack trace to client)
        console.error('[API Error]', {
            code,
            path,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: process.env.LOG_LEVEL === 'debug' && error instanceof Error ? error.stack : undefined
        });

        // Format response based on error type
        switch (code) {
            case 'VALIDATION':
                set.status = 400;
                return {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request body',
                        details: (error as ValidationError).all?.map((e: any) => ({
                            field: e.path,
                            message: e.message
                        }))
                    }
                } as ErrorResponse;

            case 'NOT_FOUND':
                set.status = 404;
                return {
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Resource not found'
                    }
                } as ErrorResponse;

            case 'INTERNAL_SERVER_ERROR':
                set.status = 500;
                return {
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'An unexpected error occurred'
                        // Never expose stack trace to client
                    }
                } as ErrorResponse;

            default:
                // Handle Error instances
                if (error instanceof Error) {
                    set.status = 500;
                    return {
                        error: {
                            code: 'UNKNOWN_ERROR',
                            message: error.message || 'An unexpected error occurred'
                        }
                    } as ErrorResponse;
                }

                // Fallback for unknown error types
                set.status = 500;
                return {
                    error: {
                        code: 'UNKNOWN_ERROR',
                        message: 'An unexpected error occurred'
                    }
                } as ErrorResponse;
        }
    });
