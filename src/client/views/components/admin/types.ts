// Display types for admin components.
// These mirror the viewmodel types structurally but live in the view layer
// to respect import boundaries (components cannot import from viewmodels).

export type AdminTab =
  | "dashboard"
  | "pessoas"
  | "lookups"
  | "solicitacoes"
  | "auditoria";

export type TabLoadState = "idle" | "loading" | "loaded" | "error";

export type PersonSummary = Readonly<{
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  roles: readonly string[];
  active: boolean;
}>;

export type LookupTableSummary = Readonly<{
  tableName: string;
  entryCount: number;
}>;

export type LookupEntry = Readonly<{
  id: string;
  label: string;
  active: boolean;
}>;

export type LookupRequest = Readonly<{
  id: string;
  tableName: string;
  label: string;
  status: "pendente" | "aprovado" | "rejeitado";
  requestedBy: string;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type AuditEntry = Readonly<{
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  targetId: string | null;
  details: string | null;
  outcome: "SUCCESS" | "FAILURE";
}>;

export type DashboardStats = Readonly<{
  people: Readonly<{ total: number }>;
  roles: Readonly<{ active: number }>;
  audit: Readonly<{ total: number }>;
  pendingRequests: number;
}>;
