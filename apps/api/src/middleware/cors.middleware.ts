/**
 * CORS Middleware
 *
 * Handle Cross-Origin Resource Sharing for frontend
 */

import { Elysia } from 'elysia';

const defaultOrigin = 'http://localhost:3000';

const CORS_CONFIG = {
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  maxAge: 86400, // 24 hours
};

export function corsMiddleware() {
  return new Elysia({
    name: 'cors-middleware',
  })
    .onRequest(({ request, set }) => {
      // Re-evaluate on every request for dynamic behavior and testing
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : [defaultOrigin];

      // Determine allowed origin based on request Origin header
      const requestOrigin = request.headers.get('origin');

      let allowedOrigin = defaultOrigin;
      if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
        allowedOrigin = requestOrigin;
      } else if (allowedOrigins.length === 1 && allowedOrigins[0] !== defaultOrigin) {
        // If there's only one allowed origin configured and it's not the default, use it
        allowedOrigin = allowedOrigins[0];
      }

      // Set CORS headers for all responses
      set.headers['Access-Control-Allow-Origin'] = allowedOrigin;
      set.headers['Access-Control-Allow-Credentials'] = 'true';
      set.headers['Access-Control-Allow-Headers'] = CORS_CONFIG.allowedHeaders.join(', ');
      set.headers['Access-Control-Allow-Methods'] = CORS_CONFIG.methods.join(', ');
      set.headers['Access-Control-Max-Age'] = String(CORS_CONFIG.maxAge);

      // Handle preflight OPTIONS requests
      if (request.method === 'OPTIONS') {
        set.status = 204;
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders.join(', '),
            'Access-Control-Allow-Methods': CORS_CONFIG.methods.join(', '),
            'Access-Control-Max-Age': String(CORS_CONFIG.maxAge),
          },
        });
      }
    });
}
