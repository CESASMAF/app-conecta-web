import type { FC } from "hono/jsx/dom";
import { useState } from "hono/jsx/dom";
import { css } from "hono/css";
import { color, font, radius, weight } from "../../../styles/tokens.ts";
import type { AuditEntry, TabLoadState } from "./types.ts";
import { SectionHeader } from "./section-header.tsx";
import { AdminSearchInput } from "./admin-search-input.tsx";
import { AuditEntryRow } from "./audit-entry.tsx";
import { TabSkeleton } from "./tab-skeleton.tsx";
import { ErrorState } from "./error-state.tsx";
import { EmptyState } from "../ui/empty-state.tsx";

interface AuditoriaTabProps {
  readonly entries: readonly AuditEntry[];
  readonly total: number;
  readonly offset: number;
  readonly loadState: TabLoadState;
  readonly onLoadMore: () => void;
  readonly onRetry: () => void;
}

const logStyle = css`
  margin-bottom: 24px;
`;

const loadMoreBtnStyle = css`
  display: block;
  margin: 0 auto;
  padding: 10px 24px;
  border: 1px solid ${color.inputLine};
  border-radius: ${radius.pill};
  background: none;
  color: ${color.textMuted};
  font-family: ${font.satoshi};
  font-weight: ${weight.semibold};
  font-size: 13px;
  cursor: pointer;
  transition: all 200ms ease;
  &:hover {
    border-color: ${color.textPrimary};
    color: ${color.textPrimary};
  }
  &:focus-visible {
    outline: 2px solid ${color.primary};
    outline-offset: 2px;
  }
`;

export const AuditoriaTab: FC<AuditoriaTabProps> = ({
  entries,
  total,
  offset,
  loadState,
  onLoadMore,
  onRetry,
}) => {
  const [filter, setFilter] = useState("");

  if (loadState === "loading") return <TabSkeleton variant="table" />;
  if (loadState === "error") {
    return (
      <ErrorState
        title="Erro ao carregar auditoria"
        message="Tente novamente em alguns instantes."
        onRetry={onRetry}
      />
    );
  }

  if (entries.length === 0) {
    return (
      <>
        <SectionHeader title="Auditoria" />
        <EmptyState message="Nenhum registro de auditoria" icon="---" />
      </>
    );
  }

  const filtered = filter.trim()
    ? entries.filter(
      (e) =>
        e.action.toLowerCase().includes(filter.toLowerCase()) ||
        e.actorName.toLowerCase().includes(filter.toLowerCase()),
    )
    : entries;

  return (
    <>
      <SectionHeader title="Auditoria" />
      <AdminSearchInput
        placeholder="Buscar por acao ou ator..."
        value={filter}
        onChange={setFilter}
        ariaLabel="Buscar auditoria"
      />
      <div class={logStyle} role="log" aria-label="Historico de auditoria">
        {filtered.map((e) => (
          <AuditEntryRow
            key={e.id}
            timestamp={e.timestamp}
            action={e.action}
            description={e.details ?? "-"}
            actorName={e.actorName}
          />
        ))}
      </div>
      {offset < total && (
        <button class={loadMoreBtnStyle} type="button" onClick={onLoadMore}>
          Carregar mais...
        </button>
      )}
    </>
  );
};
