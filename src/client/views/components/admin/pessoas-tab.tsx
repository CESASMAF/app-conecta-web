import type { FC } from "hono/jsx/dom";
import { css } from "hono/css";
import type { PersonSummary, TabLoadState } from "./types.ts";
import { SectionHeader } from "./section-header.tsx";
import { AdminSearchInput } from "./admin-search-input.tsx";
import { PeopleTable } from "./people-table.tsx";
import { TabSkeleton } from "./tab-skeleton.tsx";
import { ErrorState } from "./error-state.tsx";
import { EmptyState } from "../ui/empty-state.tsx";

interface PessoasTabProps {
  readonly people: readonly PersonSummary[];
  readonly searchQuery: string;
  readonly loadState: TabLoadState;
  readonly onSearch: (query: string) => void;
  readonly onCreate: () => void;
  readonly onRetry: () => void;
}

const contentStyle = css`
  display: flex;
  flex-direction: column;
`;

const filterPeople = (
  people: readonly PersonSummary[],
  query: string,
): readonly PersonSummary[] => {
  if (!query.trim()) return people;
  const q = query.toLowerCase().replace(/[.\-/]/g, "");
  return people.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.cpf.replace(/[.\-/]/g, "").includes(q),
  );
};

export const PessoasTab: FC<PessoasTabProps> = ({
  people,
  searchQuery,
  loadState,
  onSearch,
  onCreate,
  onRetry,
}) => {
  if (loadState === "loading") return <TabSkeleton variant="table" />;
  if (loadState === "error") {
    return (
      <ErrorState
        title="Erro ao carregar pessoas"
        message="O servico people-context nao respondeu. Tente novamente em alguns instantes."
        onRetry={onRetry}
      />
    );
  }

  if (people.length === 0) {
    return (
      <div class={contentStyle}>
        <SectionHeader title="Pessoas" />
        <EmptyState message="Nenhuma pessoa cadastrada" icon="---" />
      </div>
    );
  }

  const filtered = filterPeople(people, searchQuery);

  return (
    <div class={contentStyle}>
      <SectionHeader
        title="Pessoas"
        actionLabel="+ Nova Pessoa"
        onAction={onCreate}
      />
      <AdminSearchInput
        placeholder="Buscar por nome ou CPF..."
        value={searchQuery}
        onChange={onSearch}
        ariaLabel="Buscar pessoas"
      />
      {filtered.length > 0
        ? <PeopleTable people={filtered} searchQuery="" />
        : (
          <EmptyState
            message={`Nenhum resultado para "${searchQuery}"`}
            icon="---"
          />
        )}
    </div>
  );
};
