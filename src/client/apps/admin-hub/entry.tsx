import { render } from "hono/jsx/dom";
import { AdminHubPage } from "../../views/pages/admin-hub-page.tsx";
import type {
  AdminAction,
  AdminTab,
} from "../../viewmodels/admin-hub/types.ts";
import { ADMIN_HUB_STRINGS } from "../../viewmodels/admin-hub/strings.ts";
import * as adminService from "../../services/admin-service.ts";
import * as lookupService from "../../services/lookup-admin-service.ts";

// ---------------------------------------------------------------------------
// Mount point + user info from SSR-injected data attribute
// ---------------------------------------------------------------------------

type UserInfo = Readonly<{ name: string; role: string; initials: string }>;

const fallbackUser: UserInfo = { name: "Admin", role: "admin", initials: "A" };

const parseUser = (raw: string | undefined): UserInfo => {
  if (!raw) return fallbackUser;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" && parsed !== null &&
      "name" in parsed &&
      typeof (parsed as Record<string, unknown>).name === "string" &&
      "role" in parsed &&
      typeof (parsed as Record<string, unknown>).role === "string" &&
      "initials" in parsed &&
      typeof (parsed as Record<string, unknown>).initials === "string"
    ) {
      // Safe after narrowing — shape verified above
      return parsed as UserInfo;
    }
    return fallbackUser;
  } catch {
    return fallbackUser;
  }
};

const mount = (): void => {
  const root = document.getElementById("admin-hub-app");
  if (!root) return;

  const user = parseUser(root.dataset.user);

  // ---------------------------------------------------------------------------
  // Service callbacks wired to dispatch
  // ---------------------------------------------------------------------------

  const loadDashboard = async (
    dispatch: (a: AdminAction) => void,
  ): Promise<void> => {
    dispatch({ type: "LOAD_DASHBOARD_START" });

    const [statsResult, requestsResult, auditResult] = await Promise.all([
      adminService.getStats(),
      lookupService.listRequests(),
      adminService.listAudit(5, 0),
    ]);

    if (!statsResult.ok || !requestsResult.ok || !auditResult.ok) {
      dispatch({
        type: "LOAD_DASHBOARD_FAILURE",
        title: ADMIN_HUB_STRINGS.errorDashboardTitle,
        message: ADMIN_HUB_STRINGS.errorDashboardDesc,
      });
      return;
    }

    const pendingCount = requestsResult.value.filter(
      (r) => r.status === "pendente",
    ).length;

    dispatch({
      type: "LOAD_DASHBOARD_SUCCESS",
      stats: {
        people: statsResult.value.people,
        roles: statsResult.value.roles,
        audit: statsResult.value.audit,
        pendingRequests: pendingCount,
      },
      pendingRequests: requestsResult.value,
      recentAudit: auditResult.value.entries,
    });
  };

  const loadTabData = async (
    tab: AdminTab,
    dispatch: (a: AdminAction) => void,
  ): Promise<void> => {
    switch (tab) {
      case "dashboard":
        await loadDashboard(dispatch);
        break;
      case "pessoas": {
        dispatch({ type: "LOAD_PEOPLE_START" });
        const result = await adminService.listPeople();
        if (result.ok) {
          dispatch({ type: "LOAD_PEOPLE_SUCCESS", people: result.value });
        } else dispatch({ type: "LOAD_PEOPLE_FAILURE" });
        break;
      }
      case "lookups": {
        dispatch({ type: "LOAD_LOOKUPS_START" });
        const tables = [
          "dominio_tipo_identidade",
          "dominio_tipo_deficiencia",
          "dominio_parentesco",
          "dominio_programa_social",
          "dominio_condicao_ocupacao",
          "dominio_tipo_ingresso",
          "dominio_escolaridade",
          "dominio_tipo_beneficio",
          "dominio_efeito_condicionalidade",
          "dominio_tipo_violacao",
          "dominio_servico_vinculo",
          "dominio_tipo_medida",
          "dominio_unidade_realizacao",
        ];
        const results = await Promise.all(
          tables.map(async (t) => {
            const r = await lookupService.listEntries(t);
            return { tableName: t, entryCount: r.ok ? r.value.length : 0 };
          }),
        );
        dispatch({ type: "LOAD_LOOKUPS_SUCCESS", tables: results });
        break;
      }
      case "solicitacoes": {
        dispatch({ type: "LOAD_REQUESTS_START" });
        const result = await lookupService.listRequests();
        if (result.ok) {
          dispatch({ type: "LOAD_REQUESTS_SUCCESS", requests: result.value });
        } else dispatch({ type: "LOAD_REQUESTS_FAILURE" });
        break;
      }
      case "auditoria": {
        dispatch({ type: "LOAD_AUDIT_START" });
        const result = await adminService.listAudit(20, 0);
        if (result.ok) {
          dispatch({
            type: "LOAD_AUDIT_SUCCESS",
            entries: result.value.entries,
            total: result.value.total,
          });
        } else {
          dispatch({ type: "LOAD_AUDIT_FAILURE" });
        }
        break;
      }
    }
  };

  const onApproveRequest = async (
    id: string,
    _note: string | undefined,
    dispatch: (a: AdminAction) => void,
  ): Promise<void> => {
    const result = await lookupService.approveRequest(id);
    if (result.ok) {
      dispatch({ type: "APPROVE_SUCCESS", requestId: id });
      dispatch({
        type: "SHOW_TOAST",
        toast: { type: "success", message: ADMIN_HUB_STRINGS.toastApproved },
      });
    } else {
      dispatch({ type: "CLOSE_MODAL" });
      dispatch({
        type: "SHOW_TOAST",
        toast: { type: "error", message: ADMIN_HUB_STRINGS.toastError },
      });
    }
  };

  const onRejectRequest = async (
    id: string,
    note: string,
    dispatch: (a: AdminAction) => void,
  ): Promise<void> => {
    const result = await lookupService.rejectRequest(id, note);
    if (result.ok) {
      dispatch({ type: "REJECT_SUCCESS", requestId: id });
      dispatch({
        type: "SHOW_TOAST",
        toast: { type: "success", message: ADMIN_HUB_STRINGS.toastRejected },
      });
    } else {
      dispatch({ type: "CLOSE_MODAL" });
      dispatch({
        type: "SHOW_TOAST",
        toast: { type: "error", message: ADMIN_HUB_STRINGS.toastError },
      });
    }
  };

  const onToggleEntry = async (
    table: string,
    entryId: string,
    dispatch: (a: AdminAction) => void,
  ): Promise<void> => {
    const result = await lookupService.toggleEntry(table, entryId);
    if (result.ok) {
      dispatch({
        type: "TOGGLE_ENTRY_SUCCESS",
        entryId,
        active: result.value.active,
      });
      dispatch({
        type: "SHOW_TOAST",
        toast: {
          type: "success",
          message: ADMIN_HUB_STRINGS.toastToggled(
            result.value.label,
            result.value.active,
          ),
        },
      });
    } else {
      dispatch({
        type: "SHOW_TOAST",
        toast: { type: "error", message: ADMIN_HUB_STRINGS.toastError },
      });
    }
  };

  const onSelectLookupTable = async (
    tableName: string,
    dispatch: (a: AdminAction) => void,
  ): Promise<void> => {
    dispatch({ type: "SELECT_LOOKUP_TABLE", tableName });
    const result = await lookupService.listEntries(tableName);
    if (result.ok) {
      dispatch({ type: "LOAD_ENTRIES_SUCCESS", entries: result.value });
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  render(
    <AdminHubPage
      user={user}
      loadDashboard={loadDashboard}
      loadTabData={loadTabData}
      onApproveRequest={onApproveRequest}
      onRejectRequest={onRejectRequest}
      onToggleEntry={onToggleEntry}
      onSelectLookupTable={onSelectLookupTable}
    />,
    root,
  );
};

mount();
