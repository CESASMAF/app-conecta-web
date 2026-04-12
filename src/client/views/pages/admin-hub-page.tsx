import type { FC } from "hono/jsx/dom";
import { useEffect, useReducer } from "hono/jsx/dom";
import { css } from "hono/css";
import { color } from "../../styles/tokens.ts";
import { adminReducer } from "../../viewmodels/admin-hub/reducer.ts";
import { initialState } from "../../viewmodels/admin-hub/types.ts";
import type {
  AdminAction,
  AdminTab,
} from "../../viewmodels/admin-hub/types.ts";
import { AdminHeader } from "../components/admin/admin-header.tsx";
import { AdminTabBar } from "../components/admin/admin-tab-bar.tsx";
import { DashboardTab } from "../components/admin/dashboard-tab.tsx";
import { PessoasTab } from "../components/admin/pessoas-tab.tsx";
import { LookupsTab } from "../components/admin/lookups-tab.tsx";
import { SolicitacoesTab } from "../components/admin/solicitacoes-tab.tsx";
import { AuditoriaTab } from "../components/admin/auditoria-tab.tsx";
import { ConfirmModal } from "../components/admin/confirm-modal.tsx";
import { Toast } from "../components/admin/toast.tsx";

interface AdminHubPageProps {
  readonly user: Readonly<{ name: string; role: string; initials: string }>;
  readonly loadDashboard: (dispatch: (a: AdminAction) => void) => void;
  readonly loadTabData: (
    tab: AdminTab,
    dispatch: (a: AdminAction) => void,
  ) => void;
  readonly onApproveRequest: (
    id: string,
    note: string | undefined,
    dispatch: (a: AdminAction) => void,
  ) => void;
  readonly onRejectRequest: (
    id: string,
    note: string,
    dispatch: (a: AdminAction) => void,
  ) => void;
  readonly onToggleEntry: (
    table: string,
    entryId: string,
    dispatch: (a: AdminAction) => void,
  ) => void;
  readonly onSelectLookupTable: (
    tableName: string,
    dispatch: (a: AdminAction) => void,
  ) => void;
}

const contentStyle = css`
  padding: 20px;
  background: ${color.background};
  min-height: calc(100vh - 140px);
  @media (min-width: 600px) {
    padding: 32px 48px;
  }
`;

export const AdminHubPage: FC<AdminHubPageProps> = ({
  user,
  loadDashboard,
  loadTabData,
  onApproveRequest,
  onRejectRequest,
  onToggleEntry,
  onSelectLookupTable,
}) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  useEffect(() => {
    loadDashboard(dispatch);
  }, []);

  useEffect(() => {
    if (state.tabStates[state.activeTab] === "idle") {
      loadTabData(state.activeTab, dispatch);
    }
  }, [state.activeTab]);

  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => dispatch({ type: "HIDE_TOAST" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.toast]);

  const openModal = (
    type: "approve" | "reject",
    id: string,
    label: string,
  ): void => {
    dispatch({
      type: "OPEN_MODAL",
      modalType: type,
      targetId: id,
      targetLabel: label,
    });
  };

  const handleConfirm = (note?: string): void => {
    if (!state.modal.targetId) return;
    if (state.modal.type === "approve") {
      onApproveRequest(state.modal.targetId, note, dispatch);
    } else if (state.modal.type === "reject" && note) {
      onRejectRequest(state.modal.targetId, note, dispatch);
    }
  };

  const pendingCount =
    state.requests.filter((r) => r.status === "pendente").length;

  return (
    <>
      <AdminHeader user={user} />
      <AdminTabBar
        activeTab={state.activeTab}
        pendingCount={pendingCount}
        onTabChange={(tab) => dispatch({ type: "SWITCH_TAB", tab })}
      />
      <main class={contentStyle}>
        {state.activeTab === "dashboard" && (
          <DashboardTab
            stats={state.stats}
            requests={state.requests}
            auditEntries={state.auditEntries}
            loadState={state.tabStates.dashboard}
            error={state.error}
            onApprove={(id, label) => openModal("approve", id, label)}
            onReject={(id, label) => openModal("reject", id, label)}
            onSeeAllRequests={() =>
              dispatch({ type: "SWITCH_TAB", tab: "solicitacoes" })}
            onSeeAllAudit={() =>
              dispatch({ type: "SWITCH_TAB", tab: "auditoria" })}
            onRetry={() => loadDashboard(dispatch)}
          />
        )}
        {state.activeTab === "pessoas" && (
          <PessoasTab
            people={state.people}
            searchQuery={state.peopleSearch}
            loadState={state.tabStates.pessoas}
            onSearch={(q) => dispatch({ type: "SET_PEOPLE_SEARCH", query: q })}
            onCreate={() => {/* TBD */}}
            onRetry={() => loadTabData("pessoas", dispatch)}
          />
        )}
        {state.activeTab === "lookups" && (
          <LookupsTab
            tables={state.lookupTables}
            selectedTable={state.selectedTable}
            entries={state.lookupEntries}
            loadState={state.tabStates.lookups}
            onSelectTable={(t) => onSelectLookupTable(t, dispatch)}
            onToggleEntry={(id) =>
              state.selectedTable &&
              onToggleEntry(state.selectedTable, id, dispatch)}
            onCreateEntry={() => {/* TBD */}}
            onRetry={() => loadTabData("lookups", dispatch)}
          />
        )}
        {state.activeTab === "solicitacoes" && (
          <SolicitacoesTab
            requests={state.requests}
            loadState={state.tabStates.solicitacoes}
            onApprove={(id, label) => openModal("approve", id, label)}
            onReject={(id, label) => openModal("reject", id, label)}
            onRetry={() => loadTabData("solicitacoes", dispatch)}
          />
        )}
        {state.activeTab === "auditoria" && (
          <AuditoriaTab
            entries={state.auditEntries}
            total={state.auditTotal}
            offset={state.auditOffset}
            loadState={state.tabStates.auditoria}
            onLoadMore={() => loadTabData("auditoria", dispatch)}
            onRetry={() => loadTabData("auditoria", dispatch)}
          />
        )}
      </main>
      {state.modal.type && state.modal.targetLabel && (
        <ConfirmModal
          type={state.modal.type}
          targetLabel={state.modal.targetLabel}
          onConfirm={handleConfirm}
          onCancel={() => dispatch({ type: "CLOSE_MODAL" })}
        />
      )}
      {state.toast && (
        <Toast
          type={state.toast.type}
          message={state.toast.message}
          onDismiss={() => dispatch({ type: "HIDE_TOAST" })}
        />
      )}
    </>
  );
};
