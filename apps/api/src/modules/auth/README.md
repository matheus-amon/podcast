# Authentication Module

Módulo de autenticação do Podcast SaaS com JWT e arquitetura hexagonal.

## 📋 Visão Geral

Este módulo implementa autenticação completa de usuários com:
- Registro de nova conta
- Login com credenciais
- Logout seguro
- Refresh automático de tokens
- Rotas protegidas
- Rate limiting para segurança

## 🏗️ Arquitetura

```
auth/
├── domain/
│   ├── user/
│   │   ├── entities/
│   │   │   ├── user.entity.ts       # Entidade User
│   │   │   └── user.entity.test.ts
│   │   ├── value-objects/
│   │   │   ├── email.vo.ts          # Value Object Email
│   │   │   ├── email.vo.test.ts
│   │   │   ├── password.vo.ts       # Value Object Password
│   │   │   └── password.vo.test.ts
│   │   └── ports/
│   │       ├── user-repository.port.ts
│   │       └── refresh-token-repository.port.ts
├── application/
│   └── user/
│       └── use-cases/
│           ├── register-user.use-case.ts
│           ├── login-user.use-case.ts
│           ├── logout-user.use-case.ts
│           └── refresh-token.use-case.ts
├── infrastructure/
│   ├── database/
│   │   └── adapters/
│   │       ├── user-repository.adapter.ts
│   │       └── refresh-token-repository.adapter.ts
│   └── http/
│       └── adapters/
│           ├── auth.controller.ts
│           ├── login.controller.ts
│           └── logout.controller.ts
└── auth.module.ts                   # Composition Root
```

## 🔐 Endpoints

### POST /api/auth/register
Cria nova conta de usuário.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "name": "John Doe"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "isActive": true,
    "createdAt": "2026-03-05T00:00:00Z",
    "updatedAt": "2026-03-05T00:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Rate Limit:** 3 requisições por minuto

---

### POST /api/auth/login
Autentica usuário e retorna tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200):**
```json
{
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Rate Limit:** 5 requisições por minuto

---

### POST /api/auth/logout
Invalida tokens e faz logout.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### POST /api/auth/refresh
Renova tokens de acesso.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Security:** Token rotation - o refresh token antigo é revogado

---

### GET /api/auth/me
Recupera informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "userId": "uuid",
    "email": "user@example.com"
  }
}
```

---

## 🔒 Security Features

### Password Hashing
- bcrypt com salt rounds = 10
- Hash armazenado no banco de dados
- Password nunca trafega em claro

### JWT Tokens
- **Access Token:** 15 minutos de validade
- **Refresh Token:** 7 dias de validade
- **Token Rotation:** Refresh tokens são rotacionados a cada uso
- **Revogação:** Tokens revogados são invalidados no logout

### Rate Limiting
- **Login:** 5 tentativas por minuto por IP
- **Register:** 3 tentativas por minuto por IP
- **Resposta 429:** Inclui header `Retry-After` com segundos restantes

### Validações
- Email: formato válido e único no banco
- Password: mínimo 8 caracteres, uppercase, lowercase, número e caractere especial
- Name: 2-100 caracteres

---

## 🧪 Testes

### Unit Tests
```bash
cd apps/api
bun test src/application/user/use-cases/
bun test src/domain/
bun test tests/unit/middleware/
```

### E2E Tests
```bash
cd apps/api
bun test tests/e2e/auth.e2e.test.ts
```

### Coverage
```bash
cd apps/api
bun test --coverage
```

**Target:** >95% coverage

---

## 🚀 Uso no Frontend

### Hook useAuth
```typescript
import { useAuth } from '@/hooks/use-auth';

function Dashboard() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Redirect to="/login" />;

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes
```typescript
import { withAuth } from '@/lib/auth/with-auth';

function DashboardPage() {
  return <div>Protected content</div>;
}

export default withAuth(DashboardPage);
```

### Automatic Token Refresh
```typescript
import { fetchWithAuth } from '@/lib/auth/interceptors';

async function loadData() {
  try {
    const response = await fetchWithAuth('/api/protected-endpoint');
    const data = await response.json();
    return data;
  } catch (error) {
    // Session expired
    console.error('Authentication failed');
  }
}
```

---

## 📦 Dependências

### Backend
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT sign/verify
- `@elysiajs/swagger` - OpenAPI documentation

### Frontend
- `react-hook-form` - Form management
- `zod` - Schema validation
- `@hookform/resolvers` - Zod resolver for RHF

---

## 🔧 Configuração

### Environment Variables (Backend)
```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/podcast_saas
JWT_SECRET=your-secret-key-change-in-production
```

### Environment Variables (Frontend)
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📝 Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid input (validation error) |
| 401 | Unauthorized (invalid credentials/token) |
| 403 | Forbidden (account deactivated) |
| 409 | Conflict (email already registered) |
| 429 | Too many requests (rate limit exceeded) |

---

## 🛡️ Security Best Practices

1. **Nunca commitar JWT_SECRET** - Usar variáveis de ambiente
2. **Usar HTTPS em produção** - Tokens não trafegam em claro
3. **Rotacionar JWT_SECRET** - Periodicamente em produção
4. **Monitorar rate limits** - Alertas para ataques de força bruta
5. **Log de eventos de segurança** - Failed logins, registrations
6. **Password strength** - Validar força da senha no frontend e backend

---

## 📚 Referências

- [JSON Web Tokens](https://jwt.io)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

**Version:** 1.0.0  
**Last Updated:** 2026-03-05
