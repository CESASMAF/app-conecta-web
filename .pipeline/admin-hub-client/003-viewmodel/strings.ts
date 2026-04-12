// Admin Hub — UX Copy (PT-BR)

export const ADMIN_HUB_STRINGS = {
  // -- Header ---------------------------------------------------------------
  brandTitle: "ACDG",
  brandSubtitle: "Administracao",

  // -- Tabs -----------------------------------------------------------------
  tabDashboard: "Dashboard",
  tabPessoas: "Pessoas",
  tabLookups: "Lookup Tables",
  tabSolicitacoes: "Solicitacoes",
  tabSolicitacoesAria: (count: number): string =>
    `Solicitacoes, ${count} pendentes`,
  tabAuditoria: "Auditoria",

  // -- Dashboard Stats ------------------------------------------------------
  statPeople: "Pessoas",
  statRoles: "Roles Ativos",
  statPending: "Solicitacoes Pendentes",
  statAudit: "Acoes no Audit",
  statPeopleDetail: (count: number): string =>
    `${count} cadastradas este mes`,
  statRolesDetail: (count: number): string =>
    `${count} assistentes sociais`,
  statPendingDetail: "Aguardando aprovacao",
  statAuditDetail: "Ultimos 30 dias",

  // -- Dashboard Sections ---------------------------------------------------
  pendingSectionTitle: "Solicitacoes pendentes",
  pendingSeeAll: "Ver todas",
  recentSectionTitle: "Atividade recente",
  recentSeeAll: "Ver audit completo",

  // -- Pessoas ---------------------------------------------------------------
  pessoasTitle: "Pessoas",
  pessoasCreate: "+ Nova Pessoa",
  pessoasSearch: "Buscar por nome ou CPF...",
  pessoasEmpty: "Nenhuma pessoa cadastrada",
  pessoasEmptyDesc:
    "Cadastre a primeira pessoa para comecar a gerenciar o sistema.",
  pessoasSearchEmpty: (query: string): string =>
    `Nenhum resultado para "${query}"`,

  // -- Lookups ---------------------------------------------------------------
  lookupsTitle: "Lookup Tables",
  lookupsSearch: "Buscar tabela...",
  lookupsEmpty: "Nenhuma tabela encontrada",
  lookupsEmptyDesc:
    "As lookup tables serao carregadas do backend social-care.",
  lookupDetailTitle: (tableName: string): string =>
    `Detalhes: ${tableName}`,
  lookupCreateEntry: "+ Novo Valor",
  lookupCardAria: (tableName: string, count: number): string =>
    `Ver ${tableName}, ${count} valores ativos`,
  toggleOnAria: (label: string): string =>
    `Desativar valor ${label}`,
  toggleOffAria: (label: string): string =>
    `Ativar valor ${label}`,

  // -- Solicitacoes ----------------------------------------------------------
  solicitacoesTitle: "Solicitacoes",
  solicitacoesEmpty: "Nenhuma solicitacao pendente",
  solicitacoesEmptyDesc:
    "Todas as solicitacoes foram processadas. Novas solicitacoes aparecerao aqui.",
  btnApprove: "Aprovar",
  btnReject: "Rejeitar",
  approvedAt: (date: string): string => `Aprovado em ${date}`,
  rejectedReason: (note: string): string => `Motivo: ${note}`,

  // -- Auditoria -------------------------------------------------------------
  auditoriaTitle: "Auditoria",
  auditoriaSearch: "Buscar por acao ou ator...",
  auditoriaEmpty: "Nenhum registro de auditoria",
  auditoriaEmptyDesc:
    "Acoes administrativas serao registradas aqui automaticamente.",
  auditoriaLoadMore: "Carregar mais...",

  // -- Modals ----------------------------------------------------------------
  approveModalTitle: "Aprovar solicitacao",
  approveModalDesc: (label: string): string =>
    `Deseja aprovar a inclusao do valor "${label}"? Esta acao ira adicionar o valor imediatamente.`,
  approveModalConfirm: "Aprovar",

  rejectModalTitle: "Rejeitar solicitacao",
  rejectModalDesc:
    "Informe o motivo da rejeicao. Esta informacao sera enviada ao solicitante.",
  rejectModalPlaceholder: "Motivo da rejeicao (obrigatorio)...",
  rejectModalConfirm: "Rejeitar",
  rejectModalConfirmAria: "Confirmar rejeicao da solicitacao",

  modalCancel: "Cancelar",

  // -- Toasts ----------------------------------------------------------------
  toastApproved: "Solicitacao aprovada com sucesso",
  toastRejected: "Solicitacao rejeitada com sucesso",
  toastToggled: (label: string, active: boolean): string =>
    `"${label}" ${active ? "ativado" : "desativado"} com sucesso`,
  toastError: "Erro ao processar solicitacao. Tente novamente.",
  toastPersonCreated: "Pessoa cadastrada com sucesso",
  toastRoleAssigned: "Role atribuido com sucesso",

  // -- Errors ----------------------------------------------------------------
  errorDashboardTitle: "Erro ao carregar dados",
  errorDashboardDesc:
    "Nao foi possivel conectar aos servicos. Verifique se os backends estao acessiveis.",
  errorPeopleTitle: "Erro ao carregar pessoas",
  errorPeopleDesc:
    "O servico people-context nao respondeu. Tente novamente em alguns instantes.",
  errorLookupsTitle: "Erro ao carregar tabelas",
  errorLookupsDesc: "O servico social-care nao respondeu.",
  errorRequestsTitle: "Erro ao carregar solicitacoes",
  errorAuditTitle: "Erro ao carregar auditoria",
  errorRetry: "Tentar novamente",
  errorPermission:
    "Voce nao tem mais permissao para acessar esta area",

  // -- Empty Dashboard -------------------------------------------------------
  dashboardEmpty: "Nenhuma atividade ainda",
  dashboardEmptyDesc:
    "Comece cadastrando pessoas ou configurando lookup tables para ver atividade aqui.",
} as const;
