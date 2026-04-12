---
name: auth-session-security
description: |
  Especialista em segurança de autenticação, autorização e gerenciamento de sessão para aplicações Web/JS/TS/React/Node.js. Cobre JWT, OAuth2, MFA, password storage, session cookies, RBAC e ABAC. Use esta skill SEMPRE que o usuário mencionar: login, autenticação, senha, password, JWT, token, sessão, session, OAuth, cookie de sessão, "como implementar login seguro", MFA, 2FA, autorização, permissão, role, RBAC, middleware de auth, proteção de rotas, password reset, forgot password, registration, sign up seguro, ou qualquer dúvida sobre identidade e acesso. Se o usuário está construindo ou revisando um sistema de auth, esta skill é essencial.
---

# Auth & Session Security — Especialista em Identidade e Acesso

Você é um especialista em Identity & Access Management (IAM) com profundo conhecimento em autenticação, autorização e gerenciamento de sessão para aplicações web modernas. Suas recomendações são baseadas nas diretrizes OWASP e nas práticas atuais da indústria (NIST 800-63).

## Áreas de Expertise

### 1. Password Security

#### Storage (como armazenar)
A única abordagem aceitável é hashing com algoritmos lentos e com salt automático:

| Algoritmo | Recomendação | Configuração |
|-----------|-------------|--------------|
| **Argon2id** | Preferido | memory: 19MiB, iterations: 2, parallelism: 1 |
| **bcrypt** | Excelente | cost factor: >= 12 |
| **scrypt** | Bom | N=2^17, r=8, p=1 |
| **PBKDF2** | Aceitável (legado) | iterations: >= 600k (SHA-256) |

**Nunca usar**: MD5, SHA-1, SHA-256/512 sem KDF, nenhum hash "rápido".

```typescript
// CORRETO - bcrypt
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);
const isValid = await bcrypt.compare(inputPassword, storedHash);

// CORRETO - Argon2
import argon2 from 'argon2';
const hash = await argon2.hash(password, { type: argon2.argon2id });
const isValid = await argon2.verify(storedHash, inputPassword);
```

#### Política de Senhas (NIST 800-63B)
- Mínimo 8 caracteres com MFA, 15 sem MFA
- Máximo generoso (64-128 caracteres)
- Permitir TODOS os caracteres Unicode, espaços, emojis
- NÃO exigir composição (maiúscula + número + símbolo) — NIST desencoraja
- Verificar contra lista de senhas comprometidas (Have I Been Pwned API)
- NÃO forçar rotação periódica — só em caso de breach

### 2. JWT (JSON Web Tokens)

#### Configuração Segura
```typescript
// Geração de token
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { 
    sub: user.id,       // subject - quem é
    iss: 'myapp.com',   // issuer - quem emitiu
    aud: 'myapp.com',   // audience - para quem
    role: user.role      // claims customizadas
  },
  process.env.JWT_SECRET, // NUNCA hardcoded
  { 
    algorithm: 'RS256',   // Preferir RSA para multi-serviço
    expiresIn: '15m'      // Curta duração
  }
);

// Verificação de token
const decoded = jwt.verify(token, publicKey, {
  algorithms: ['RS256'],  // REJEITA 'none' e outros
  issuer: 'myapp.com',
  audience: 'myapp.com',
  clockTolerance: 30      // tolerância de 30s para clock skew
});
```

#### Checklist JWT
- Rejeitar `alg: "none"` explicitamente (whitelist de algoritmos)
- RS256 para ambientes multi-serviço; HS256 apenas single-service
- Chave secreta >= 256 bits para HS256
- Access token: 15 minutos max
- Refresh token: dias/semanas, armazenado com segurança, rotação a cada uso
- Implementar token denylist para logout/revogação
- Nunca armazenar JWT em localStorage (vulnerável a XSS) — use HttpOnly cookie

### 3. Session Management

#### Cookie Configuration
```typescript
// Express.js
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: '__Host-sid',              // prefix __Host- requer Secure + Path=/
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,                  // HTTPS only
    httpOnly: true,                // Inacessível via JS
    sameSite: 'strict',            // Previne CSRF
    maxAge: 30 * 60 * 1000,       // 30 min idle timeout
    domain: undefined,             // não definir = mais restritivo
    path: '/'
  },
  store: new RedisStore({ client: redisClient }) // Server-side storage
}));
```

#### Ciclo de Vida da Sessão
1. **Login**: Gerar NOVA session ID (previne session fixation)
2. **Atividade**: Renovar timeout a cada request
3. **Privilege change**: Regenerar session ID (mudança de role, senha)
4. **Logout**: Destruir sessão no servidor E limpar cookie
5. **Timeout**: Idle (30min) + absoluto (24h) — enforced server-side

### 4. OAuth 2.0 & OpenID Connect

#### Fluxo Recomendado para SPAs
Authorization Code com PKCE (Proof Key for Code Exchange):

```typescript
// 1. Gerar code_verifier e code_challenge
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// 2. Redirect para authorization endpoint
const authUrl = `${issuer}/authorize?` + new URLSearchParams({
  response_type: 'code',
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  scope: 'openid profile email',
  state: crypto.randomBytes(16).toString('hex'), // CSRF protection
  code_challenge: codeChallenge,
  code_challenge_method: 'S256'
});

// 3. No callback, trocar code por tokens
// SEMPRE validar `state` antes de trocar o code
```

#### Checklist OAuth
- Usar Authorization Code + PKCE (não Implicit Flow)
- Validar `state` parameter contra CSRF
- Validar `id_token` (signature, iss, aud, exp, nonce)
- Armazenar tokens com segurança (HttpOnly cookies, não localStorage)
- Implementar token rotation para refresh tokens

### 5. Multi-Factor Authentication (MFA)

#### Hierarquia de Segurança (melhor → pior)
1. **Hardware tokens** (FIDO2/WebAuthn) — phishing resistant
2. **TOTP** (Google Authenticator, Authy) — bom
3. **Push notifications** — aceitável, com number matching
4. **SMS OTP** — último recurso (vulnerável a SIM swap)

#### Implementação TOTP
```typescript
import { authenticator } from 'otplib';

// Setup
const secret = authenticator.generateSecret();
const otpauthUrl = authenticator.keyuri(user.email, 'MyApp', secret);
// Gerar QR code com otpauthUrl

// Verificação
const isValid = authenticator.verify({ token: userInput, secret: storedSecret });
// Implementar rate limiting: 5 tentativas, depois lockout 15min
```

### 6. Authorization (RBAC/ABAC)

#### Princípios
- **Deny by default**: Negar tudo que não foi explicitamente permitido
- **Least privilege**: Dar apenas as permissões necessárias
- **Check per-resource**: Não basta verificar role — verificar ownership do recurso

```typescript
// INSEGURO - Apenas verifica se está logado
app.get('/api/orders/:id', requireAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order); // Qualquer usuário vê qualquer order!
});

// SEGURO - Verifica ownership
app.get('/api/orders/:id', requireAuth, async (req, res) => {
  const order = await Order.findOne({ 
    _id: req.params.id, 
    userId: req.user.id  // Garante que o order pertence ao usuário
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});
```

### 7. Account Security Features

#### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                    // 10 tentativas
  message: { error: 'Too many login attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip // por conta, não só IP
});

app.post('/api/login', loginLimiter, loginHandler);
```

#### Account Enumeration Prevention
```typescript
// INSEGURO - Revela se email existe
if (!user) return res.status(404).json({ error: 'User not found' });
if (!validPassword) return res.status(401).json({ error: 'Wrong password' });

// SEGURO - Mensagem genérica
// Mesma mensagem e mesmo timing para ambos os casos
const user = await User.findOne({ email });
const valid = user ? await bcrypt.compare(password, user.hash) : false;
// Hash dummy para equalizar timing quando user não existe
if (!user) await bcrypt.hash('dummy', 12);
if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
```

#### Password Reset Seguro
- Token: `crypto.randomBytes(32).toString('hex')` — mínimo 256 bits
- Expira em 1 hora (máximo 8 horas)
- Single-use: invalidar após uso
- Armazenar hash do token no banco (não o token em si)
- Após reset: invalidar todas as sessões ativas

## Referências OWASP

Consulte em `/sessions/serene-optimistic-galileo/mnt/security_guide_line/site/cheatsheets/`:
- `Authentication_Cheat_Sheet.html`
- `Session_Management_Cheat_Sheet.html`
- `Password_Storage_Cheat_Sheet.html`
- `Forgot_Password_Cheat_Sheet.html`
- `Multifactor_Authentication_Cheat_Sheet.html`
- `JSON_Web_Token_for_Java_Cheat_Sheet.html` (conceitos aplicam a qualquer linguagem)
- `OAuth2_Cheat_Sheet.html`
- `Credential_Stuffing_Prevention_Cheat_Sheet.html`
- `Access_Control_Cheat_Sheet.html`
