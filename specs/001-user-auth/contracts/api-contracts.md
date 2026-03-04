# API Contracts: Authentication

**Feature**: User Authentication with JWT  
**Date**: 2026-03-03  
**Version**: 1.0.0

---

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: Podcast SaaS - Authentication API
  description: User authentication endpoints (register, login, logout)
  version: 1.0.0

servers:
  - url: http://localhost:3001/api
    description: Development server

components:
  schemas:
    # Request/Response Schemas
    RegisterRequest:
      type: object
      required:
        - email
        - password
        - name
      properties:
        email:
          type: string
          format: email
          example: user@example.com
        password:
          type: string
          format: password
          minLength: 8
          example: SecureP@ss123
        name:
          type: string
          minLength: 2
          maxLength: 100
          example: John Doe
    
    LoginRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password
    
    AuthResponse:
      type: object
      properties:
        user:
          $ref: '#/components/schemas/User'
        accessToken:
          type: string
          description: JWT access token (15 minutes)
        refreshToken:
          type: string
          description: Refresh token (7 days, HTTP-only cookie)
    
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        avatarUrl:
          type: string
          nullable: true
        isActive:
          type: boolean
        createdAt:
          type: string
          format: date-time
    
    Error:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          properties:
            code:
              type: string
              enum: [INVALID_INPUT, DUPLICATE_EMAIL, INVALID_CREDENTIALS, TOKEN_EXPIRED, TOKEN_INVALID, INTERNAL_ERROR]
            message:
              type: string
            details:
              type: object
              nullable: true

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT access token obtained from /auth/login

paths:
  # Registration
  /auth/register:
    post:
      tags:
        - Authentication
      summary: Register new user account
      description: Create a new user account with email and password
      operationId: registerUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '201':
          description: User registered successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          description: Invalid input (validation error)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                weak-password:
                  summary: Password too weak
                  value:
                    error:
                      code: INVALID_INPUT
                      message: Password does not meet requirements
                      details:
                        requirements:
                          - Minimum 8 characters
                          - At least 1 uppercase letter
                          - At least 1 lowercase letter
                          - At least 1 number
                          - At least 1 special character
                invalid-email:
                  summary: Invalid email format
                  value:
                    error:
                      code: INVALID_INPUT
                      message: Invalid email format
        '409':
          description: Email already registered
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                error:
                  code: DUPLICATE_EMAIL
                  message: Email already registered

  # Login
  /auth/login:
    post:
      tags:
        - Authentication
      summary: Login user
      description: Authenticate user with email and password
      operationId: loginUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          description: Invalid input
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                error:
                  code: INVALID_CREDENTIALS
                  message: Invalid email or password
        '429':
          description: Too many login attempts (rate limit)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                error:
                  code: RATE_LIMIT_EXCEEDED
                  message: Too many login attempts. Try again in 1 minute.

  # Logout
  /auth/logout:
    post:
      tags:
        - Authentication
      summary: Logout user
      description: Invalidate current session and refresh token
      operationId: logoutUser
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Logout successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
        '401':
          description: Unauthorized (invalid/missing token)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # Get Current User
  /auth/me:
    get:
      tags:
        - Authentication
      summary: Get current user
      description: Retrieve authenticated user information
      operationId: getCurrentUser
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User information
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # Refresh Token
  /auth/refresh:
    post:
      tags:
        - Authentication
      summary: Refresh access token
      description: Get new access token using refresh token
      operationId: refreshAccessToken
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - refreshToken
              properties:
                refreshToken:
                  type: string
                  description: Valid refresh token
      responses:
        '200':
          description: Token refreshed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken:
                    type: string
                    description: New JWT access token
                  refreshToken:
                    type: string
                    description: New refresh token (rotation)
        '401':
          description: Invalid/expired refresh token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

---

## Test Contracts (TDD-First)

### Unit Test Contracts

```typescript
// auth.controller.test.ts

// POST /auth/register
describe('POST /auth/register', () => {
  it('should return 201 with valid data', async () => {})
  it('should return 400 with invalid email', async () => {})
  it('should return 400 with weak password', async () => {})
  it('should return 409 with duplicate email', async () => {})
})

// POST /auth/login
describe('POST /auth/login', () => {
  it('should return 200 with valid credentials', async () => {})
  it('should return 401 with invalid credentials', async () => {})
  it('should return 429 after too many attempts', async () => {})
})

// POST /auth/logout
describe('POST /auth/logout', () => {
  it('should return 200 with valid token', async () => {})
  it('should return 401 with invalid token', async () => {})
})

// GET /auth/me
describe('GET /auth/me', () => {
  it('should return 200 with user data', async () => {})
  it('should return 401 without token', async () => {})
})
```

### E2E Test Contracts

```typescript
// auth.e2e.test.ts

describe('Authentication E2E', () => {
  it('should complete full registration flow', async () => {
    // POST /auth/register → 201
    // Verify user in database
    // Verify JWT in response
  })
  
  it('should complete full login flow', async () => {
    // POST /auth/register → 201
    // POST /auth/login → 200
    // GET /auth/me → 200 (with JWT)
    // POST /auth/logout → 200
  })
  
  it('should protect routes without JWT', async () => {
    // GET /auth/me → 401 (no token)
  })
  
  it('should allow access with valid JWT', async () => {
    // Login → get JWT
    // GET /auth/me → 200 (with JWT)
  })
})
```

---

**Contracts Complete**: Ready for implementation with TDD
