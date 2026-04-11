// Auth Hub — UX Copy (PT-BR)

export const AUTH_HUB_STRINGS = {
  // -- Landing --
  landingTitle: "ACDG",
  landingTagline:
    "Plataforma integrada de assist\u00eancia e cuidado social para gest\u00e3o de fam\u00edlias e acompanhamento comunit\u00e1rio",
  landingButton: "Entrar na plataforma",
  landingFooter:
    "ACDG \u2014 Assist\u00eancia e Cuidado em Desenvolvimento e Gest\u00e3o",

  // -- Landing Alerts --
  authErrorTitle: "Falha na autentica\u00e7\u00e3o",
  authErrorDesc:
    "N\u00e3o foi poss\u00edvel concluir o login. Verifique suas credenciais ou entre em contato com o suporte.",
  sessionExpiredTitle: "Sess\u00e3o expirada",
  sessionExpiredDesc:
    "Sua sess\u00e3o expirou por inatividade. Fa\u00e7a login novamente para continuar.",

  // -- Hub --
  greeting: (firstName: string): string => {
    const h = new Date().getHours();
    const period = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    return `${period}, ${firstName}`;
  },
  hubSubtitle: "Selecione um m\u00f3dulo para continuar",
  lastUsedLabel: "\u00daLTIMO ACESSADO",
  allModulesLabel: (count: number): string =>
    count > 1 ? `TODOS OS M\u00d3DULOS (${count})` : "SEU M\u00d3DULO",
  logoutButton: "Sair",

  // -- Empty State --
  emptyTitle: "Nenhum m\u00f3dulo dispon\u00edvel",
  emptyDesc:
    "Sua conta ainda n\u00e3o tem acesso a nenhum m\u00f3dulo da plataforma. Entre em contato com o administrador do sistema para solicitar as permiss\u00f5es necess\u00e1rias.",
  emptyContactAdmin: "Falar com o administrador",
  emptyContactEmail: "admin@acdg.gov.br",
  emptyContactSubject: "Solicita\u00e7\u00e3o de acesso - ACDG",
  emptyBackToStart: "Voltar ao in\u00edcio",

  // -- Network Error --
  networkErrorTitle: "Erro ao carregar m\u00f3dulos",
  networkErrorDesc:
    "N\u00e3o foi poss\u00edvel carregar suas permiss\u00f5es. Verifique sua conex\u00e3o com a internet e tente novamente.",
  networkErrorRetry: "Tentar novamente",

  // -- Auto-Redirect --
  redirectTitle: (appName: string): string => `Entrando em ${appName}...`,
  redirectSubtitle:
    "Voc\u00ea tem acesso a um m\u00f3dulo. Redirecionando automaticamente.",
  redirectCancel: "N\u00e3o \u00e9 o que esperava? Voltar",

  // -- Loading --
  loadingAuth: "Autenticando...",
  loadingPermissions: "Carregando m\u00f3dulos...",
  loadingApp: (appName: string): string => `Entrando em ${appName}...`,
} as const;
