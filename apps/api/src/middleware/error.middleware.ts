import { Elysia, ValidationError } from "elysia";

interface ErrorResponse {
    error: {
        code: string;
        message: string;
        details?: any;
    };
}

/**
 * Anything shaped like a domain error: a real `status` and a machine-readable
 * `code`.
 *
 * Structural on purpose rather than `instanceof AgendaError`, so each module
 * can define its own error class without this file importing — and therefore
 * depending on — every domain. It is also what lets the check survive the fact
 * that a thrown error can cross a module boundary where a duplicate copy of a
 * class would break `instanceof`.
 */
interface DomainErrorLike extends Error {
    status: number;
    code: string;
}

function isDomainError(error: unknown): error is DomainErrorLike {
    return (
        error instanceof Error &&
        typeof (error as DomainErrorLike).status === 'number' &&
        typeof (error as DomainErrorLike).code === 'string'
    );
}

/**
 * Global error handling middleware
 * Catches unhandled exceptions and returns consistent error format
 * Never exposes stack traces to clients
 */
export const errorMiddleware = new Elysia({
    name: 'error-handler'
})
    // `as: 'global'` is required. With the default 'local' the hook belongs to
    // this plugin's own (empty) route set, so it never runs for the consuming
    // app's routes: every failure escaped as Elysia's default 500 with the raw
    // error message as the body, and the 400 this middleware documents for
    // validation failures never happened.
    .onError({ as: 'global' }, ({ code, error, set, request }) => {
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
                // Domain errors carry their own status. Without this branch
                // every one of them fell through to the generic 500 below, so
                // "attendee is already on the list" and "the database is down"
                // were indistinguishable to a client.
                if (isDomainError(error)) {
                    set.status = error.status;
                    return {
                        error: {
                            code: error.code,
                            message: error.message
                        }
                    } as ErrorResponse;
                }

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
