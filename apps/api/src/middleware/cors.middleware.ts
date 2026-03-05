/**
 * CORS Middleware
 *
 * Handle Cross-Origin Resource Sharing for frontend
 */

import { Elysia } from 'elysia';

const CORS_CONFIG = {
  origin: 'http://localhost:3000',
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
      // Set CORS headers for all responses
      set.headers['Access-Control-Allow-Origin'] = CORS_CONFIG.origin;
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
            'Access-Control-Allow-Origin': CORS_CONFIG.origin,
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders.join(', '),
            'Access-Control-Allow-Methods': CORS_CONFIG.methods.join(', '),
            'Access-Control-Max-Age': String(CORS_CONFIG.maxAge),
          },
        });
      }
    });
}
