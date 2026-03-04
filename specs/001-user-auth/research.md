# Phase 0: Research & TDD Strategy

**Feature**: User Authentication with JWT  
**Date**: 2026-03-03  
**Focus**: TDD-First Implementation Strategy

---

## TDD Research & Best Practices

### Decision 1: Test-First Approach for Authentication

**What was chosen**: Strict TDD approach - tests written BEFORE implementation code

**Rationale**: 
- Authentication is security-critical, tests ensure correctness
- Forces clear API design before implementation
- Prevents security oversights by defining expected behavior first
- Aligns with constitution requirement for E2E tests

**Alternatives considered**:
- Test-after: Faster initially but risks security gaps
- Test-during: Less disciplined, easy to skip edge cases

---

### Decision 2: Testing Pyramid for Auth

**What was chosen**: Multi-layer testing strategy

```
        E2E Tests (20%)
       /               \
      /  Integration    \
     /    Tests (30%)    \
    /_____________________\
   /   Unit Tests (50%)    \
  /_________________________\
```

**Unit Tests** (First to write):
- User entity validation
- Email VO format validation
- Password VO strength validation
- Use case logic (register, login, logout)
- JWT token generation/validation

**Integration Tests** (Second):
- Repository database operations
- Controller HTTP endpoints
- JWT middleware authentication

**E2E Tests** (Last, but mandatory):
- Full registration flow (UI → DB)
- Full login flow (UI → JWT → Dashboard)
- Protected route access
- Session persistence

**Rationale**: 
- Unit tests: Fast, isolated, catch logic errors
- Integration tests: Catch API/DB issues
- E2E tests: Validate user experience (constitution requirement)

---

### Decision 3: Test File Structure

**What was chosen**: Co-located tests with clear naming

```
src/domain/user/entities/user.entity.ts
src/domain/user/entities/user.entity.test.ts

src/application/user/use-cases/register-user.use-case.ts
src/application/user/use-cases/register-user.use-case.test.ts
```

**Rationale**: 
- Easy to find tests for each file
- Encourages 1:1 test-to-code ratio
- Follows existing project conventions

---

## Technology Best Practices

### JWT Implementation

**Best practices researched**:

1. **Token Structure**:
   - Access token: Short-lived (15 minutes)
   - Refresh token: Long-lived (7 days), stored in HTTP-only cookie
   - Token rotation: New refresh token issued on each use

2. **Security**:
   - Store refresh tokens in DB for revocation capability
   - Use strong secrets (256-bit minimum)
   - Include user ID, email, roles in payload
   - Sign with HS256 or RS256

3. **Testing approach**:
   - Mock JWT generation in unit tests
   - Real JWT in integration/E2E tests
   - Test token expiration scenarios
   - Test invalid token handling

**Libraries**:
- Backend: `jsonwebtoken` (bun compatible)
- Frontend: No JWT library needed (just store/use tokens)

---

### Password Hashing

**Best practices researched**:

1. **Algorithm**: bcrypt (industry standard, battle-tested)
2. **Rounds**: 10 (balance security/performance)
3. **Testing**:
   - Test password validation logic
   - Mock bcrypt in unit tests (slow)
   - Real bcrypt in integration tests

**Library**: `bcryptjs` (pure JS, works with Bun)

---

### Rate Limiting

**Best practices researched**:

1. **Strategy**: Sliding window counter
2. **Limits**: 
   - Login: 5 attempts per minute per IP
   - Register: 3 attempts per minute per IP
3. **Testing**:
   - Unit test rate limiter logic
   - Integration test with real requests
   - E2E test to verify user experience

**Library**: Custom implementation (simple for Bun/Elysia)

---

## Test-First Implementation Order

### Phase 1: Domain Layer (Tests First)

```bash
# 1. Email Value Object
1. Write: email.vo.test.ts
   - Test valid emails
   - Test invalid formats
   - Test normalization
2. Implement: email.vo.ts
3. Run: bun test (must pass)

# 2. Password Value Object
1. Write: password.vo.test.ts
   - Test strength validation
   - Test hashing
   - Test comparison
2. Implement: password.vo.ts
3. Run: bun test (must pass)

# 3. User Entity
1. Write: user.entity.test.ts
   - Test user creation
   - Test validation
   - Test business logic
2. Implement: user.entity.ts
3. Run: bun test (must pass)
```

### Phase 2: Application Layer (Tests First)

```bash
# 4. Register Use Case
1. Write: register-user.use-case.test.ts
   - Test successful registration
   - Test duplicate email
   - Test weak password
2. Implement: register-user.use-case.ts
3. Run: bun test (must pass)

# 5. Login Use Case
1. Write: login-user.use-case.test.ts
   - Test successful login
   - Test invalid credentials
   - Test JWT generation
2. Implement: login-user.use-case.ts
3. Run: bun test (must pass)
```

### Phase 3: Infrastructure (Tests First)

```bash
# 6. Repository
1. Write: user-repository.adapter.test.ts
   - Test CRUD operations
   - Test find by email
   - Test soft delete
2. Implement: user-repository.adapter.ts
3. Run: bun test (must pass)

# 7. Controller
1. Write: auth.controller.test.ts
   - Test POST /register
   - Test POST /login
   - Test POST /logout
   - Test error responses
2. Implement: auth.controller.ts
3. Run: bun test (must pass)
```

### Phase 4: E2E Tests (Mandatory - Constitution)

```bash
# 8. E2E Authentication Flow
1. Write: auth.e2e.test.ts
   - Full registration flow
   - Full login flow
   - Protected route access
   - Session persistence
2. Run: bun test auth.e2e.test.ts (must pass)
```

### Phase 5: Frontend (Tests First)

```bash
# 9. Login Form
1. Write: login-form.test.tsx
   - Test form validation
   - Test successful login
   - Test error handling
2. Implement: login-form.tsx
3. Run: bun test (must pass)

# 10. Register Form
1. Write: register-form.test.tsx
   - Test form validation
   - Test successful registration
   - Test error handling
2. Implement: register-form.tsx
3. Run: bun test (must pass)
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| JWT secret exposure | High | Use environment variables, never commit |
| Password breaches | Critical | bcrypt hashing, never store plain text |
| Token theft | High | Short-lived access tokens, refresh rotation |
| Rate limiting bypass | Medium | IP-based + user-based limiting |
| Test suite slowness | Low | Mock slow operations (bcrypt) in unit tests |

---

## Success Metrics

- **Test Coverage**: >95% on auth module
- **E2E Tests**: 100% of critical flows covered
- **Security**: All OWASP auth checks pass
- **Performance**: Login < 3s (95th percentile)

---

**Phase 0 Complete**: Ready for Phase 1 (Design & Contracts)
