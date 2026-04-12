import type { FC } from "hono/jsx/dom";
import type { LookupRequest, TabLoadState } from "./types.ts";
import { SectionHeader } from "./section-header.tsx";
import { RequestsTable } from "./requests-table.tsx";
import { TabSkeleton } from "./tab-skeleton.tsx";
import { ErrorState } from "./error-state.tsx";
import { EmptyState } from "../ui/empty-state.tsx";

interface SolicitacoesTabProps {
  readonly requests: readonly LookupRequest[];
  readonly loadState: TabLoadState;
  readonly onApprove: (id: string, label: string) => void;
  readonly onReject: (id: string, label: string) => void;
  readonly onRetry: () => void;
}

export const SolicitacoesTab: FC<SolicitacoesTabProps> = ({
  requests,
  loadState,
  onApprove,
  onReject,
  onRetry,
}) => {
  if (loadState === "loading") return <TabSkeleton variant="table" />;
  if (loadState === "error") {
    return (
      <ErrorState
        title="Erro ao carregar solicitacoes"
        message="Tente novamente em alguns instantes."
        onRetry={onRetry}
      />
    );
  }

  if (requests.length === 0) {
    return (
      <>
        <SectionHeader title="Solicitacoes" />
        <EmptyState message="Nenhuma solicitacao pendente" icon="---" />
      </>
    );
  }

  return (
    <>
      <SectionHeader title="Solicitacoes" />
      <RequestsTable
        requests={requests}
        onApprove={onApprove}
        onReject={onReject}
      />
    </>
  );
};
