/**
 * Auth Controller
 *
 * HTTP controller for authentication endpoints
 */

import { Elysia, t } from 'elysia';
import { authGuardMiddleware } from '../../../middleware/auth-guard';
import type { RegisterUserUseCase } from '../../application/user/use-cases/register-user.use-case';
import type { RefreshTokenUseCase } from '../../application/user/use-cases/refresh-token.use-case';

export class AuthController {
  public routes: Elysia;

  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {
    this.routes = this.createRoutes();
  }

  /**
   * Create authentication routes
   */
  private createRoutes(): Elysia {
    return new Elysia({ prefix: '/auth' })
      // POST /auth/register
      .post(
        '/register',
        async ({ body }) => {
          const result = await this.registerUseCase.execute({
            email: body.email,
            password: body.password,
            name: body.name,
          });

          return {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          };
        },
        {
          body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String({ minLength: 8 }),
            name: t.String({ minLength: 2, maxLength: 100 }),
          }),
          detail: {
            summary: 'Register new user',
            description: 'Create a new user account with email and password',
            tags: ['Authentication'],
            responses: {
              200: {
                description: 'User registered successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            email: { type: 'string', format: 'email' },
                            name: { type: 'string' },
                            isActive: { type: 'boolean' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                          },
                        },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
              400: {
                description: 'Invalid input (validation error)',
              },
              409: {
                description: 'Email already registered',
              },
            },
          },
        }
      )
      // POST /auth/refresh
      .post(
        '/refresh',
        async ({ body, set }) => {
          try {
            const result = await this.refreshTokenUseCase.execute({
              refreshToken: body.refreshToken,
            });

            return {
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
            };
          } catch (error) {
            set.status = 401;
            return {
              error: {
                code: 'UNAUTHORIZED',
                message: error instanceof Error ? error.message : 'Invalid refresh token',
              },
            };
          }
        },
        {
          body: t.Object({
            refreshToken: t.String({ minLength: 1 }),
          }),
          detail: {
            summary: 'Refresh access token',
            description: 'Exchange a valid refresh token for a new access token and refresh token pair',
            tags: ['Authentication'],
            responses: {
              200: {
                description: 'Tokens refreshed successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string', description: 'New access token (JWT)' },
                        refreshToken: { type: 'string', description: 'New refresh token (JWT)' },
                      },
                      required: ['accessToken', 'refreshToken'],
                    },
                  },
                },
              },
              400: {
                description: 'Missing or invalid refresh token in request body',
              },
              401: {
                description: 'Unauthorized - Invalid, expired, or revoked refresh token',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'object',
                          properties: {
                            code: { type: 'string', enum: ['UNAUTHORIZED'] },
                            message: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }
      )
      // GET /auth/me - Protected route
      .use(authGuardMiddleware())
      .get(
        '/me',
        async ({ user, set }) => {
          if (!user) {
            set.status = 401;
            return {
              error: {
                code: 'UNAUTHORIZED',
                message: 'User not authenticated',
              },
            };
          }

          return {
            user: {
              userId: user.userId,
              email: user.email,
            },
          };
        },
        {
          detail: {
            summary: 'Get current user',
            description: 'Retrieve authenticated user information',
            tags: ['Authentication'],
            security: [{ bearerAuth: [] }],
            responses: {
              200: {
                description: 'User information retrieved successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            userId: { type: 'string', format: 'uuid' },
                            email: { type: 'string', format: 'email' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              401: {
                description: 'Unauthorized - Invalid or missing token',
              },
            },
          },
        }
      );
  }
}
