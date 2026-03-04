# Data Model: User Authentication

**Feature**: User Authentication with JWT  
**Date**: 2026-03-03  
**Version**: 1.0.0

---

## Entities

### User

Represents a registered user account in the system.

```typescript
interface User {
  // Identity
  id: string                    // UUID v4, primary key
  email: string                 // Unique, validated format
  passwordHash: string          // bcrypt hash, never exposed
  
  // Profile
  name: string                  // Display name
  avatarUrl?: string | null     // Optional profile picture
  
  // Timestamps
  createdAt: Date               // Account creation date
  updatedAt: Date               // Last update date
  deletedAt?: Date | null       // Soft delete timestamp
  lastLoginAt?: Date | null     // Last successful login
  
  // Status
  isActive: boolean             // Account active status
  emailVerifiedAt?: Date | null // Email verification timestamp
}
```

**Validation Rules**:
- Email: RFC 5322 compliant format, unique across all users
- Password: Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Name: 2-100 characters, trimmed
- Avatar URL: Valid HTTPS URL or null

**Business Logic**:
- User is created with `isActive = true`
- `lastLoginAt` updated on each successful login
- Soft delete sets `deletedAt`, doesn't remove record
- Email verification optional (can be enabled later)

---

### RefreshToken

Represents a JWT refresh token for session management.

```typescript
interface RefreshToken {
  // Identity
  id: string                    // UUID v4, primary key
  token: string                 // Hashed refresh token (unique)
  userId: string                // Foreign key → User.id
  
  // Metadata
  createdAt: Date               // Token creation date
  expiresAt: Date               // Token expiration (7 days)
  usedAt?: Date | null          // When token was used (for rotation)
  revokedAt?: Date | null       // When token was revoked
  
  // Security
  ipAddress?: string | null     // IP where token was issued
  userAgent?: string | null     // User agent where issued
}
```

**Validation Rules**:
- Token: Unique, hashed before storage
- ExpiresAt: Must be in future
- UserId: Must reference valid, active user

**Business Logic**:
- One-time use (rotated on each access)
- Can be revoked by user (logout from all devices)
- Automatically expired after 7 days
- Old tokens revoked when password changes

---

## Relationships

```
┌─────────────┐
│    User     │
│             │
│  id (PK)    │
│  email      │
│  password   │
└──────┬──────┘
       │
       │ 1:N
       │
       ▼
┌─────────────┐
│ RefreshToken│
│             │
│  id (PK)    │
│  user_id    │──┐
│  token      │  │
│  expiresAt  │  │
└─────────────┘  │
                 │
                 └──→ References User.id
```

---

## Database Schema (Drizzle ORM)

```typescript
// users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  emailVerifiedAt: timestamp('email_verified_at'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  idxUsersEmail: index('idx_users_email').on(table.email),
  idxUsersActive: index('idx_users_active').on(table.isActive),
  idxUsersDeleted: index('idx_users_deleted').on(table.deletedAt),
}));

// refresh_tokens table
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  revokedAt: timestamp('revoked_at'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  idxRefreshTokensUser: index('idx_refresh_tokens_user_id').on(table.userId),
  idxRefreshTokensToken: index('idx_refresh_tokens_token').on(table.token),
  idxRefreshTokensExpires: index('idx_refresh_tokens_expires').on(table.expiresAt),
}));
```

---

## State Transitions

### User Lifecycle

```
[Registration] → Active User → [Login] → Logged In
                      ↓                        ↓
               [Soft Delete]           [Logout/Expire]
                      ↓                        ↓
               Deleted User             Active User
```

### Refresh Token Lifecycle

```
[Issue] → Valid → [Use] → Used → [Rotate] → New Valid Token
                    ↓
             [Expire] → Expired
                    ↓
             [Revoke] → Revoked
```

---

## Test Strategy (TDD-First)

### Unit Tests (Entities/VOs)

```typescript
// user.entity.test.ts
describe('User', () => {
  it('should create valid user', () => {})
  it('should reject invalid email', () => {})
  it('should hash password on creation', () => {})
  it('should update lastLoginAt on login', () => {})
})

// email.vo.test.ts
describe('Email', () => {
  it('should accept valid email', () => {})
  it('should reject invalid format', () => {})
  it('should normalize email', () => {})
})

// password.vo.test.ts
describe('Password', () => {
  it('should accept strong password', () => {})
  it('should reject weak password', () => {})
  it('should hash password', () => {})
  it('should compare password', () => {})
})
```

### Integration Tests (Repository)

```typescript
// user-repository.adapter.test.ts
describe('UserRepository', () => {
  it('should create user', async () => {})
  it('should find by email', async () => {})
  it('should reject duplicate email', async () => {})
  it('should soft delete user', async () => {})
})
```

### E2E Tests (Full Flow)

```typescript
// auth.e2e.test.ts
describe('Authentication E2E', () => {
  it('should complete registration flow', async () => {})
  it('should complete login flow', async () => {})
  it('should access protected route with JWT', async () => {})
  it('should handle token refresh', async () => {})
})
```

---

**Phase 1 Complete**: Data model ready for contracts and implementation
