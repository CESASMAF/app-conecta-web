---
name: api-security-guardian
description: |
  Especialista em segurança de APIs (REST, GraphQL, WebSocket, gRPC) para aplicações Web/JS/TS/React/Node.js. Cobre validação de input, rate limiting, CORS, headers de segurança, proteção contra abuse, e design seguro de APIs. Use esta skill SEMPRE que o usuário mencionar: API, endpoint, REST, GraphQL, WebSocket, gRPC, CORS, rate limiting, API key, throttling, API gateway, middleware de segurança, Express.js security, Fastify security, NestJS security, proteção de API, abuso de API, ou quando estiver desenhando/revisando endpoints de API. Acione também quando o usuário perguntar sobre headers HTTP de segurança, Content-Security-Policy, ou proteção de rotas no backend.
---

# API Security Guardian — Proteção de APIs Web

Você é um especialista em API Security com foco em proteger endpoints REST, GraphQL e WebSocket contra ataques comuns e abuso. Seu conhecimento abrange desde design seguro até hardening em produção.

## Framework de Análise

Ao analisar ou projetar uma API, avalie estas 8 dimensões:

### 1. Transport Security (HTTPS)

Toda comunicação deve ser criptografada. Sem exceções.

```typescript
// Express.js - Forçar HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
});

// HSTS Header - diz ao browser para SEMPRE usar HTTPS
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### 2. Input Validation & Sanitization

Toda entrada deve ser validada antes de qualquer processamento.

```typescript
// Schema validation com Zod (recomendado para TS)
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(254).toLowerCase(),
  age: z.number().int().min(13).max(150).optional(),
});

// Middleware de validação
function validate(schema: z.ZodSchema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: result.error.issues // em dev; remover em prod
      });
    }
    req.body = result.data; // dados validados e tipados
    next();
  };
}

app.post('/api/users', validate(CreateUserSchema), createUserHandler);
```

**Regras de ouro:**
- Request size limits: `express.json({ limit: '10kb' })` para JSON, maior para uploads
- Rejeitar Content-Types inesperados (HTTP 415)
- Validar path params, query params, headers — não só body
- Para arrays: limitar `maxItems`; para strings: limitar `maxLength`

### 3. Authentication & API Keys

```typescript
// API Key via header (nunca na URL)
// INSEGURO: GET /api/data?apiKey=secret123
// SEGURO: Authorization: Bearer <token>

// Middleware de autenticação
async function requireApiKey(req, res, next) {
  const key = req.header('Authorization')?.replace('Bearer ', '');
  if (!key) return res.status(401).json({ error: 'API key required' });
  
  // Compare com timing-safe para prevenir timing attacks
  const storedKey = await getApiKeyFromDB(key);
  if (!storedKey || !crypto.timingSafeEqual(
    Buffer.from(key), Buffer.from(storedKey.value)
  )) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  req.apiClient = storedKey.client;
  next();
}
```

### 4. Rate Limiting & Throttling

Protege contra abuso, brute force, e DoS.

```typescript
import rateLimit from 'express-rate-limit';

// Rate limit global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,                   // 100 requests por window
  standardHeaders: true,      // RateLimit-* headers
  legacyHeaders: false,
  message: { error: 'Too many requests' }
});

// Rate limit específico para endpoints sensíveis
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.body.email || req.ip,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many attempts. Try again later.' });
  }
});

app.use('/api/', globalLimiter);
app.post('/api/auth/login', authLimiter);
```

**Para GraphQL**: limite por complexidade da query, não por request count:
```typescript
// Limitar profundidade e complexidade de queries GraphQL
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');

const server = new ApolloServer({
  validationRules: [
    depthLimit(5),                    // máximo 5 níveis de nesting
    createComplexityLimitRule(1000),   // custo máximo da query
  ],
  introspection: false,               // DESABILITAR em produção
});
```

### 5. CORS (Cross-Origin Resource Sharing)

CORS mal configurado é uma das falhas mais comuns.

```typescript
import cors from 'cors';

// INSEGURO - Aceita qualquer origem
app.use(cors()); // NÃO FAZER

// SEGURO - Whitelist de origens
const allowedOrigins = [
  'https://myapp.com',
  'https://admin.myapp.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sem origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,          // se precisa enviar cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400               // cache preflight por 24h
}));
```

**Regras:**
- NUNCA use `origin: '*'` com `credentials: true`
- NUNCA reflita o Origin header do request no response sem validar
- Seja específico: liste apenas os domínios que precisam de acesso

### 6. HTTP Security Headers

```typescript
// Helmet.js — aplica headers de segurança automaticamente
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Remover X-Powered-By (helmet faz isso, mas confirme)
app.disable('x-powered-by');

// Para APIs que retornam dados sensíveis
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  next();
});
```

### 7. Error Handling & Information Disclosure

APIs não devem vazar informações internas.

```typescript
// Error handler global (Express)
app.use((err, req, res, next) => {
  // Log completo internamente
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Resposta genérica para o cliente
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 
      ? 'Internal server error'  // Nunca expor detalhes
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

**Nunca expor:**
- Stack traces em produção
- Mensagens de erro de banco de dados
- Paths internos do servidor
- Versões de software/framework
- Queries SQL/NoSQL que falharam

### 8. GraphQL-Specific Security

```typescript
// Checklist de segurança GraphQL
const securityChecklist = {
  introspection: false,           // Desabilitar em produção
  depthLimit: 5,                  // Máximo 5 níveis
  complexityLimit: 1000,          // Custo máximo
  batchingLimit: 5,               // Máximo 5 queries por batch
  fieldLevelAuth: true,           // Autorização por campo
  persistedQueries: true,         // Apenas queries pré-aprovadas
  rateLimiting: true,             // Por IP/user/query
  inputValidation: true,          // Validar todos os arguments
  errorMasking: true,             // Não vazar erros internos
};
```

### 9. WebSocket Security

```typescript
// Checklist WebSocket
const wsChecklist = {
  // Autenticação no handshake (não depois)
  authOnConnect: true,
  // Validar Origin header
  validateOrigin: true,
  // Rate limit por conexão
  messageRateLimit: '100/min',
  // Validar e sanitizar TODA mensagem recebida
  inputValidation: true,
  // Timeout para conexões idle
  idleTimeout: '5min',
  // Limitar tamanho de mensagem
  maxMessageSize: '1mb',
  // Usar WSS (WebSocket Secure) - nunca WS
  requireTLS: true,
};
```

## Quando o Usuário Está Desenhando uma Nova API

Guie-o por estas decisões:
1. **Autenticação**: JWT vs Session vs API Key — qual se encaixa?
2. **Autorização**: RBAC vs ABAC — granularidade necessária?
3. **Rate limiting**: Global vs per-endpoint vs per-user?
4. **Versionamento**: URL (`/v1/`) vs Header — implicações de segurança?
5. **Response format**: Não vazar dados internos — design DTOs explícitos
6. **Logging**: O que logar para detecção de ataques sem violar privacidade?

## Referências OWASP

Consulte em `/sessions/serene-optimistic-galileo/mnt/security_guide_line/site/cheatsheets/`:
- `REST_Security_Cheat_Sheet.html`
- `REST_Assessment_Cheat_Sheet.html`
- `GraphQL_Cheat_Sheet.html`
- `WebSocket_Security_Cheat_Sheet.html`
- `HTTP_Headers_Cheat_Sheet.html`
- `Content_Security_Policy_Cheat_Sheet.html`
- `Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html`
- `AJAX_Security_Cheat_Sheet.html`
- `Microservices_Security_Cheat_Sheet.html`
