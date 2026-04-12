import type { FC } from "hono/jsx/dom";
import { css, keyframes } from "hono/css";
import { space } from "../../../styles/tokens.ts";
import type {
  AuditEntry as AuditEntryType,
  DashboardStats,
  LookupRequest,
} from "./types.ts";
import { StatCard } from "./stat-card.tsx";
import { SectionHeader } from "./section-header.tsx";
import { PendingItem } from "./pending-item.tsx";
import { AuditEntryRow } from "./audit-entry.tsx";
import { TabSkeleton } from "./tab-skeleton.tsx";
import { ErrorState } from "./error-state.tsx";
import { EmptyState } from "../ui/empty-state.tsx";

interface DashboardTabProps {
  readonly stats: DashboardStats | null;
  readonly requests: readonly LookupRequest[];
  readonly auditEntries: readonly AuditEntryType[];
  readonly loadState: "idle" | "loading" | "loaded" | "error";
  readonly error: Readonly<{ title: string; message: string }> | null;
  readonly onApprove: (id: string, label: string) => void;
  readonly onReject: (id: string, label: string) => void;
  readonly onSeeAllRequests: () => void;
  readonly onSeeAllAudit: () => void;
  readonly onRetry: () => void;
}

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const statsGridStyle = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
  animation: ${fadeInUp} 500ms ease;
  @media (min-width: 600px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const sectionStyle = css`
  margin-bottom: ${space[5]};
  animation: ${fadeInUp} 600ms ease;
  animation-delay: 100ms;
  animation-fill-mode: both;
`;

const pendingListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DashboardTab: FC<DashboardTabProps> = ({
  stats,
  requests,
  auditEntries,
  loadState,
  error,
  onApprove,
  onReject,
  onSeeAllRequests,
  onSeeAllAudit,
  onRetry,
}) => {
  if (loadState === "loading") return <TabSkeleton variant="dashboard" />;
  if (loadState === "error" && error) {
    return (
      <ErrorState
        title={error.title}
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  if (!stats) {
    return <EmptyState message="Nenhuma atividade ainda" icon="---" />;
  }

  const pendingReqs = requests.filter((r) => r.status === "pendente");

  return (
    <>
      <div class={statsGridStyle}>
        <StatCard label="Pessoas" value={stats.people.total} />
        <StatCard label="Roles Ativos" value={stats.roles.active} />
        <StatCard
          label="Solicitacoes Pendentes"
          value={stats.pendingRequests}
          highlight
        />
        <StatCard
          label="Acoes no Audit"
          value={stats.audit.total}
          detail="Ultimos 30 dias"
        />
      </div>

      <div class={sectionStyle}>
        <SectionHeader
          title="Solicitacoes pendentes"
          linkLabel="Ver todas"
          onLink={onSeeAllRequests}
        />
        {pendingReqs.length > 0
          ? (
            <div class={pendingListStyle}>
              {pendingReqs.map((r) => (
                <PendingItem
                  key={r.id}
                  title={r.label}
                  meta={`${r.tableName} - ${r.requestedBy}`}
                  onApprove={() => onApprove(r.id, r.label)}
                  onReject={() => onReject(r.id, r.label)}
                />
              ))}
            </div>
          )
          : <EmptyState message="Nenhuma solicitacao pendente" icon="---" />}
      </div>

      <div class={sectionStyle}>
        <SectionHeader
          title="Atividade recente"
          linkLabel="Ver audit completo"
          onLink={onSeeAllAudit}
        />
        {auditEntries.length > 0
          ? (
            auditEntries.slice(0, 5).map((e) => (
              <AuditEntryRow
                key={e.id}
                timestamp={e.timestamp}
                action={e.action}
                description={e.details ?? "-"}
                actorName={e.actorName}
              />
            ))
          )
          : <EmptyState message="Nenhuma atividade registrada" icon="---" />}
      </div>
    </>
  );
};
