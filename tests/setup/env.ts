// Preload de testes: envs dummy ANTES de qualquer módulo carregar (senão env.ts/oidc quebram sem IdP).
process.env.NODE_ENV ??= 'test'
process.env.OIDC_ISSUER ??= 'https://auth.test.local'
// As duas faces do Kratos com valores DIFERENTES de propósito: em produção a interna é um nome de
// serviço Docker e a pública é o gateway. Igualar as duas aqui esconderia trocas entre elas (infra#14).
process.env.KRATOS_PUBLIC_URL ??= 'http://kratos.internal.test:4433'
process.env.KRATOS_BROWSER_URL ??= 'https://id.test.local'
process.env.KRATOS_ADMIN_URL ??= 'http://kratos-admin.test.local'
process.env.OIDC_CLIENT_ID ??= 'acdg-web'
process.env.OIDC_CLIENT_SECRET ??= 'test-secret'
process.env.SESSION_SECRET ??= 'test-session-secret'
process.env.PUBLIC_BASE_URL ??= 'http://localhost:3000'
process.env.SOCIAL_CARE_URL ??= 'http://social-care.test.local'
process.env.PEOPLE_CONTEXT_URL ??= 'http://people-context.test.local'
process.env.ANALYSIS_BI_URL ??= 'http://analysis-bi.test.local'
