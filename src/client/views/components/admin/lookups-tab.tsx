import type { FC } from "hono/jsx/dom";
import { useState } from "hono/jsx/dom";
import { css } from "hono/css";
import type { LookupEntry, LookupTableSummary, TabLoadState } from "./types.ts";
import { SectionHeader } from "./section-header.tsx";
import { AdminSearchInput } from "./admin-search-input.tsx";
import { LookupCard } from "./lookup-card.tsx";
import { LookupDetailPanel } from "./lookup-detail-panel.tsx";
import { TabSkeleton } from "./tab-skeleton.tsx";
import { ErrorState } from "./error-state.tsx";
import { EmptyState } from "../ui/empty-state.tsx";

interface LookupsTabProps {
  readonly tables: readonly LookupTableSummary[];
  readonly selectedTable: string | null;
  readonly entries: readonly LookupEntry[];
  readonly loadState: TabLoadState;
  readonly onSelectTable: (tableName: string) => void;
  readonly onToggleEntry: (entryId: string) => void;
  readonly onCreateEntry: () => void;
  readonly onRetry: () => void;
}

const gridStyle = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  @media (min-width: 600px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

export const LookupsTab: FC<LookupsTabProps> = ({
  tables,
  selectedTable,
  entries,
  loadState,
  onSelectTable,
  onToggleEntry,
  onCreateEntry,
  onRetry,
}) => {
  const [filter, setFilter] = useState("");

  if (loadState === "loading") return <TabSkeleton variant="grid" />;
  if (loadState === "error") {
    return (
      <ErrorState
        title="Erro ao carregar tabelas"
        message="O servico social-care nao respondeu."
        onRetry={onRetry}
      />
    );
  }

  if (tables.length === 0) {
    return (
      <>
        <SectionHeader title="Lookup Tables" />
        <EmptyState message="Nenhuma tabela encontrada" icon="---" />
      </>
    );
  }

  const filtered = filter.trim()
    ? tables.filter((t) =>
      t.tableName.toLowerCase().includes(filter.toLowerCase())
    )
    : tables;

  return (
    <>
      <SectionHeader title="Lookup Tables" />
      <AdminSearchInput
        placeholder="Buscar tabela..."
        value={filter}
        onChange={setFilter}
        ariaLabel="Buscar lookup tables"
      />
      <div class={gridStyle}>
        {filtered.map((t) => (
          <LookupCard
            key={t.tableName}
            tableName={t.tableName}
            entryCount={t.entryCount}
            isSelected={selectedTable === t.tableName}
            onClick={() => onSelectTable(t.tableName)}
          />
        ))}
      </div>
      {selectedTable && (
        <LookupDetailPanel
          tableName={selectedTable}
          entries={entries}
          onToggle={onToggleEntry}
          onCreateEntry={onCreateEntry}
        />
      )}
    </>
  );
};
