# Quickstart: User Authentication

**Feature**: User Authentication with JWT  
**Date**: 2026-03-03  
**Status**: Ready for TDD Implementation

---

## Overview

This guide helps you get started with implementing user authentication using TDD-first approach.

---

## Prerequisites

- Bun 1.3.6+ installed
- PostgreSQL 15 running
- Backend (apps/api) and Frontend (apps/web) set up

---

## TDD Implementation Order

### Step 1: Domain Layer (Backend)

```bash
cd apps/api

# 1. Email Value Object
# Write test first
touch src/domain/user/value-objects/email.vo.test.ts
# Write test cases for email validation
# Run: bun test src/domain/user/value-objects/email.vo.test.ts
# THEN implement
touch src/domain/user/value-objects/email.vo.ts

# 2. Password Value Object
# Write test first
touch src/domain/user/value-objects/password.vo.test.ts
# Write test cases for password strength, hashing
# Run: bun test src/domain/user/value-objects/password.vo.test.ts
# THEN implement
touch src/domain/user/value-objects/password.vo.ts

# 3. User Entity
# Write test first
touch src/domain/user/entities/user.entity.test.ts
# Write test cases for user creation, validation
# Run: bun test src/domain/user/entities/user.entity.test.ts
# THEN implement
touch src/domain/user/entities/user.entity.ts
```

### Step 2: Application Layer (Backend)

```bash
# 4. Register Use Case
# Write test first
touch src/application/user/use-cases/register-user.use-case.test.ts
# Write test cases for registration flow
# Run: bun test .../register-user.use-case.test.ts
# THEN implement
touch src/application/user/use-cases/register-user.use-case.ts

# 5. Login Use Case
# Write test first
touch src/application/user/use-cases/login-user.use-case.test.ts
# Write test cases for login flow, JWT generation
# Run: bun test .../login-user.use-case.test.ts
# THEN implement
touch src/application/user/use-cases/login-user.use-case.ts
```

### Step 3: Infrastructure (Backend)

```bash
# 6. User Repository
# Write test first
touch src/infrastructure/database/adapters/user-repository.adapter.test.ts
# Write test cases for CRUD operations
# Run: bun test .../user-repository.adapter.test.ts
# THEN implement
touch src/infrastructure/database/adapters/user-repository.adapter.ts

# 7. Auth Controller
# Write test first
touch src/infrastructure/http/adapters/auth.controller.test.ts
# Write test cases for HTTP endpoints
# Run: bun test .../auth.controller.test.ts
# THEN implement
touch src/infrastructure/http/adapters/auth.controller.ts
```

### Step 4: E2E Tests (Backend) - MANDATORY

```bash
# 8. E2E Authentication Flow
# Write test first (Constitution requirement)
touch tests/e2e/auth.e2e.test.ts
# Write full user journey tests
# Run: bun test tests/e2e/auth.e2e.test.ts
# THEN ensure implementation passes
```

### Step 5: Frontend

```bash
cd apps/web

# 9. Auth Hook
# Write test first
touch src/hooks/use-auth.test.ts
# Write test cases for hook behavior
# Run: bun test src/hooks/use-auth.test.ts
# THEN implement
touch src/hooks/use-auth.ts

# 10. Login Form
# Write test first
touch src/components/auth/login-form.test.tsx
# Write test cases for form validation, submission
# Run: bun test src/components/auth/login-form.test.tsx
# THEN implement
touch src/components/auth/login-form.tsx

# 11. Register Form
# Write test first
touch src/components/auth/register-form.test.tsx
# Write test cases for form validation, submission
# Run: bun test src/components/auth/register-form.test.tsx
# THEN implement
touch src/components/auth/register-form.tsx

# 12. Login Page
# Write test first
touch src/app/login/page.test.tsx
# Write test cases for page rendering
# Run: bun test src/app/login/page.test.tsx
# THEN implement
touch src/app/login/page.tsx

# 13. Register Page
# Write test first
touch src/app/register/page.test.tsx
# Write test cases for page rendering
# Run: bun test src/app/register/page.test.tsx
# THEN implement
touch src/app/register/page.tsx
```

---

## Database Migration

After backend implementation, create migration:

```bash
cd apps/api
bunx drizzle-kit generate
bunx drizzle-kit push
```

---

## Testing Checklist

### Backend Tests (Must Pass)

- [ ] Email VO tests (100% pass)
- [ ] Password VO tests (100% pass)
- [ ] User Entity tests (100% pass)
- [ ] Register Use Case tests (100% pass)
- [ ] Login Use Case tests (100% pass)
- [ ] Repository tests (100% pass)
- [ ] Controller tests (100% pass)
- [ ] E2E tests (100% pass) - **MANDATORY**

### Frontend Tests (Must Pass)

- [ ] use-auth hook tests (100% pass)
- [ ] Login form tests (100% pass)
- [ ] Register form tests (100% pass)
- [ ] Login page tests (100% pass)
- [ ] Register page tests (100% pass)

---

## Success Criteria

Before marking feature complete:

1. **All tests passing**: `bun test` (backend) + `bun test` (frontend)
2. **E2E tests passing**: Full auth flow works end-to-end
3. **Coverage >95%**: Run `bun test --coverage`
4. **No TypeScript errors**: `bun run tsc --noEmit`
5. **API documented**: OpenAPI spec updated
6. **Security checks**: Password hashing, rate limiting, JWT rotation

---

## Common Issues

### Issue: Tests running slow

**Solution**: Mock bcrypt in unit tests

```typescript
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('mocked-hash'),
  compare: vi.fn().mockResolvedValue(true),
}))
```

### Issue: JWT tests failing

**Solution**: Use fixed secret in tests

```typescript
// In test setup
process.env.JWT_SECRET = 'test-secret-for-testing-only'
```

### Issue: Database tests failing

**Solution**: Use test database or transactions

```typescript
// In test setup
beforeEach(async () => {
  await db.delete(users) // Clean state
})
```

---

## Next Steps

After completing all steps:

1. Run full test suite: `bun test`
2. Run coverage: `bun test --coverage`
3. Update tasks: `/speckit.tasks`
4. Create PR with all changes

---

**Ready to start TDD implementation!** 🧪
