/* web_02 · People Context — interactive recreation of the /people routes.
   Composes DS primitives + organism panels (window.PeoplePanels). Synthetic
   fixtures only (window.PeopleData). (window.PeopleKit) */
const DS = window.RAROSWeb02DesignSystem_9e80fa;
const {
  M3Button, M3TextField, M3SectionHeader, M3DataField, M3EmptyState,
  M3ActiveBadge, M3LoginIndicator, M3RoleBadge, M3Badge, M3Card,
  M3TopAppBar, M3NavRail,
} = DS;
const { PersonForm, RolePanel, IdpAccessPanel, ErasureDialog } = window.PeoplePanels;
const P = window.PeopleData;

function initials(name) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0] || "")[0] || "") + ((parts[parts.length - 1] || "")[0] || "");
}

/* ------------------------------------------------------------------ Shell */
const NAV = [
  { id: "social-care", label: "Prontuário", icon: "folder_shared" },
  { id: "people", label: "Pessoas", icon: "group" },
  { id: "indicators", label: "Indicadores", icon: "monitoring" },
];

function Shell({ title, onBack, statusSlot, actions, children }) {
  return (
    <div className="kit-shell">
      <M3NavRail
        items={NAV}
        activeId="people"
        onSelect={() => {}}
        logo="../../assets/logo-raros-mark.webp"
        footer={
          <button className="m3-rail__item" type="button" aria-label="Conta">
            <span className="m3-rail__icon"><span className="material-symbols-rounded" aria-hidden="true">account_circle</span></span>
            <span className="m3-rail__label">Conta</span>
          </button>
        }
      />
      <div className="kit-main">
        <M3TopAppBar title={title} onBack={onBack} statusSlot={statusSlot} actions={actions} />
        <div className="kit-content">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- PersonRow */
function PersonRow({ person, onOpen, onEdit, onToggleActive, canEdit }) {
  const [open, setOpen] = React.useState(false);
  const extra = person.roles.length - 3;
  return (
    <div className={"pc-row" + (person.active ? "" : " pc-row--inactive")} role="row">
      <button type="button" className="pc-row__main" aria-label={"Abrir cadastro de " + person.fullName} onClick={onOpen}>
        <span className="pc-avatar" aria-hidden="true">{initials(person.fullName).toUpperCase()}</span>
        <span className="pc-row__id">
          <span className="pc-row__name">{person.fullName}</span>
          <span className="pc-row__cpf">{person.cpfMasked || "Sem CPF"}</span>
        </span>
      </button>
      <div className="pc-row__badges">
        <M3ActiveBadge active={person.active} size="sm" />
        <M3LoginIndicator state={person.loginState} />
      </div>
      <div className="pc-row__roles">
        {person.roles.slice(0, 3).map((r) => (
          <M3RoleBadge key={r.id} system={r.system} role={r.role} active={r.active} />
        ))}
        {extra > 0 && <span className="pc-row__more">+{extra}</span>}
        {person.roles.length === 0 && <span className="pc-row__norole">—</span>}
      </div>
      <div className="pc-menuwrap pc-row__menu">
        <button type="button" className="pc-iconbtn" aria-label={"Ações de " + person.fullName} aria-haspopup="menu"
          onClick={() => setOpen((o) => !o)} onBlur={() => setTimeout(() => setOpen(false), 150)}>
          <span className="material-symbols-rounded" aria-hidden="true">more_vert</span>
        </button>
        {open && (
          <div className="pc-menu" role="menu">
            <button type="button" role="menuitem" className="pc-menu__item" onMouseDown={onOpen}>
              <span className="material-symbols-rounded">open_in_new</span>Abrir</button>
            {canEdit && <button type="button" role="menuitem" className="pc-menu__item" onMouseDown={onEdit}>
              <span className="material-symbols-rounded">edit</span>Editar</button>}
            {canEdit && <button type="button" role="menuitem" className={"pc-menu__item" + (person.active ? " pc-menu__item--danger" : "")} onMouseDown={onToggleActive}>
              <span className="material-symbols-rounded">{person.active ? "pause_circle" : "play_circle"}</span>{person.active ? "Desativar" : "Reativar"}</button>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- ListScreen */
function ListScreen({ people, onOpen, onNew, onEdit, onToggleActive, canEdit }) {
  const [search, setSearch] = React.useState("");
  const [shown, setShown] = React.useState(P.pageSize);
  const q = search.trim().toLowerCase();
  const digits = q.replace(/\D/g, "");
  const filtered = !q ? people : people.filter((p) => {
    if (digits.length >= 2 && p.cpfMasked) return p.cpfMasked.replace(/\D/g, "").includes(digits);
    return p.fullName.toLowerCase().includes(q);
  });
  const page = filtered.slice(0, shown);
  const hasMore = !q && shown < people.length;

  return (
    <div className="kit-page">
      <div className="kit-pagehead">
        <h1>Pessoas</h1>
        <p>Cadastro central de pessoas da rede RAROS. Busque por nome ou CPF; abra um registro para gerir perfil, vínculos e acesso.</p>
      </div>

      <div className="pc-listbar">
        <div className="pc-search">
          <span className="material-symbols-rounded" aria-hidden="true">search</span>
          <input type="search" value={search} placeholder="Buscar por nome ou CPF"
            aria-label="Buscar por nome ou CPF" onChange={(e) => { setSearch(e.target.value); setShown(P.pageSize); }} />
          {search && <button type="button" className="pc-iconbtn" aria-label="Limpar" onClick={() => setSearch("")}>
            <span className="material-symbols-rounded" aria-hidden="true">close</span></button>}
        </div>
        {canEdit && <M3Button variant="filled" icon="add" onPress={onNew}>Nova pessoa</M3Button>}
      </div>

      <div className="pc-count pc-count--total" aria-live="polite">
        {q ? `${filtered.length} resultado${filtered.length === 1 ? "" : "s"}` : `${P.totalCount.toLocaleString("pt-BR")} pessoas`}
      </div>

      {filtered.length === 0 ? (
        <M3Card padding="none">
          <M3EmptyState icon="person_search" title="Nenhuma pessoa encontrada"
            description={`Nenhum cadastro corresponde a “${search}”. Verifique o termo ou limpe a busca.`}
            action={{ label: "Limpar busca", onPress: () => setSearch(""), icon: "close" }} />
        </M3Card>
      ) : (
        <div className="pc-table" role="table" aria-label="Pessoas">
          <div className="pc-table__head" role="row">
            <span>Pessoa</span><span>Situação</span><span>Vínculos</span><span aria-hidden="true"></span>
          </div>
          {page.map((p) => (
            <PersonRow key={p.id} person={p} canEdit={canEdit}
              onOpen={() => onOpen(p.id)} onEdit={() => onEdit(p.id)} onToggleActive={() => onToggleActive(p.id)} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="pc-loadmore">
          <span>{page.length} de {P.totalCount.toLocaleString("pt-BR")}</span>
          <M3Button variant="text" icon="expand_more" onPress={() => setShown((s) => s + P.pageSize)}>Carregar mais</M3Button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ DetailScreen */
const TABS = [
  { id: "profile", label: "Perfil", icon: "person" },
  { id: "roles", label: "Vínculos", icon: "link" },
  { id: "access", label: "Acesso", icon: "key" },
];

function ProfileTab({ person, onEdit, editing, onSave, onCancel }) {
  if (editing) {
    return (
      <PersonForm mode="edit"
        initial={{ fullName: person.fullName, cpf: person.cpfMasked || "", birthDate: P.fmtDate(person.birthDate), email: person.email || "" }}
        onSubmit={onSave} onCancel={onCancel} />
    );
  }
  return (
    <div className="pc-panel">
      {!person.active && (
        <div className="pc-inactivebanner" role="note">
          <span className="material-symbols-rounded" aria-hidden="true">info</span>
          Pessoa inativa. A edição segue disponível — desativação e dados são eixos independentes.
        </div>
      )}
      <M3SectionHeader title="Dados pessoais" as="h2"
        action={<M3Button variant="outlined" size="sm" icon="edit" onPress={onEdit}>Editar</M3Button>} />
      <dl className="pc-datagrid">
        <M3DataField label="Nome completo" value={person.fullName} />
        <M3DataField label="CPF" value={person.cpfMasked} mono />
        <M3DataField label="Data de nascimento" value={P.fmtDate(person.birthDate)} mono />
        <M3DataField label="E-mail" value={person.email} />
        <M3DataField label="ID no provedor" value={person.idpUserId ? person.idpUserId.slice(0, 18) + "…" : null} mono emptyFallback="Sem login" />
        <M3DataField label="Cadastrada em" value={P.fmtDate(person.createdAt)} mono />
      </dl>
    </div>
  );
}

function DetailScreen({ person, tab, onTab, profileEditing, onEditProfile, onSaveProfile, onCancelProfile,
  onAssignRole, onDeactivateRole, onReactivateRole, onAccess, pendingAction, erasing, onErase, onConfirmErase, onCancelErase }) {
  return (
    <React.Fragment>
      <div className="pc-detailhead">
        <span className="pc-avatar pc-avatar--lg" aria-hidden="true">{initials(person.fullName).toUpperCase()}</span>
        <div className="pc-detailhead__id">
          <div className="pc-detailhead__badges">
            <M3ActiveBadge active={person.active} />
            <M3LoginIndicator state={person.loginState} />
          </div>
        </div>
      </div>

      <div className="pc-tabs" role="tablist" aria-label="Seções do cadastro">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
            className={"pc-tab" + (tab === t.id ? " pc-tab--active" : "")} onClick={() => onTab(t.id)}>
            <span className="material-symbols-rounded" aria-hidden="true">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="kit-page">
        {tab === "profile" && (
          <ProfileTab person={person} editing={profileEditing} onEdit={onEditProfile} onSave={onSaveProfile} onCancel={onCancelProfile} />
        )}
        {tab === "roles" && (
          <RolePanel roles={person.roles} viewer={P.viewer}
            onAssign={onAssignRole} onDeactivate={onDeactivateRole} onReactivate={onReactivateRole} />
        )}
        {tab === "access" && (
          <IdpAccessPanel person={person} viewer={P.viewer}
            onProvision={() => onAccess("provision")} onReset={() => onAccess("reset")}
            onDeactivate={() => onAccess("deactivate")} onReactivate={() => onAccess("reactivate")}
            onErase={onErase} pendingAction={pendingAction} />
        )}
      </div>

      {erasing && <ErasureDialog person={person} isPending={false} onConfirm={onConfirmErase} onCancel={onCancelErase} />}
    </React.Fragment>
  );
}

/* -------------------------------------------------------------------- App */
function App() {
  const [people, setPeople] = React.useState(() => P.people.map((p) => ({ ...p, roles: p.roles.slice() })));
  const [route, setRoute] = React.useState({ name: "list" });
  const [profileEditing, setProfileEditing] = React.useState(false);
  const [erasing, setErasing] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState(null);
  const [idpFailure, setIdpFailure] = React.useState(false);
  const [retrying, setRetrying] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const canEdit = P.viewer.role === "admin" || P.viewer.role === "worker";
  const current = route.id ? people.find((p) => p.id === route.id) : null;

  function flash(msg) { setToast(msg); setTimeout(() => setToast(null), 2600); }
  function patch(id, fn) { setPeople((ps) => ps.map((p) => (p.id === id ? fn(p) : p))); }

  function openDetail(id, tab) { setProfileEditing(false); setRoute({ name: "detail", id, tab: tab || "profile" }); }

  function createPerson(data) {
    const id = "p-new-" + Math.random().toString(16).slice(2, 7);
    const fail = data.createLogin && /falha|207/i.test(data.fullName); // type "207" in name to simulate
    const np = {
      id, fullName: data.fullName, cpfMasked: data.cpf || null, birthDate: "1990-01-01",
      email: data.email || null, active: true,
      idpUserId: data.createLogin && !fail ? "new-" + id : null,
      loginState: data.createLogin ? (fail ? "failed" : "linked") : "none",
      createdAt: "2026-06-12", roles: [],
    };
    setPeople((ps) => [np, ...ps]);
    setIdpFailure(fail);
    openDetail(id, "profile");
    flash(fail ? "Pessoa criada — provisão de login falhou (207)" : "Pessoa cadastrada com sucesso");
  }

  function retryIdp() {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false); setIdpFailure(false);
      patch(current.id, (p) => ({ ...p, idpUserId: "retry-" + p.id, loginState: "linked" }));
      flash("Login provisionado com sucesso");
    }, 900);
  }

  function saveProfile(data) {
    patch(current.id, (p) => ({ ...p, fullName: data.fullName, cpfMasked: data.cpf || p.cpfMasked, email: data.email || null }));
    setProfileEditing(false);
    flash("Dados atualizados");
  }

  function assignRole(system, role) {
    patch(current.id, (p) => ({ ...p, roles: [...p.roles, { id: "r-" + Math.random().toString(16).slice(2, 8), system, role, active: true, assignedAt: "2026-06-12" }] }));
    flash("Vínculo atribuído");
  }
  function setRoleActive(roleId, active) {
    patch(current.id, (p) => ({ ...p, roles: p.roles.map((r) => (r.id === roleId ? { ...r, active } : r)) }));
    flash(active ? "Vínculo reativado" : "Vínculo desativado");
  }

  function doAccess(action) {
    setPendingAction(action);
    setTimeout(() => {
      setPendingAction(null);
      if (action === "provision") { patch(current.id, (p) => ({ ...p, idpUserId: "prov-" + p.id, loginState: "linked" })); flash("Login provisionado"); }
      else if (action === "reset") flash("Link de recuperação enviado por e-mail");
      else if (action === "deactivate") { patch(current.id, (p) => ({ ...p, active: false })); flash("Pessoa desativada"); }
      else if (action === "reactivate") { patch(current.id, (p) => ({ ...p, active: true })); flash("Pessoa reativada"); }
    }, 800);
  }

  function confirmErase() {
    const id = current.id;
    setPeople((ps) => ps.filter((p) => p.id !== id));
    setErasing(false); setRoute({ name: "list" });
    flash("Registro apagado definitivamente");
  }

  // ---- render
  if (route.name === "list") {
    return (
      <Shell title="Pessoas" statusSlot={<M3Badge variant="success" dot>web_02</M3Badge>}>
        <ListScreen people={people} canEdit={canEdit}
          onOpen={(id) => openDetail(id)} onNew={() => setRoute({ name: "new" })}
          onEdit={(id) => openDetail(id, "profile")}
          onToggleActive={(id) => { patch(id, (p) => ({ ...p, active: !p.active })); }} />
        {toast && <Toast msg={toast} />}
      </Shell>
    );
  }

  if (route.name === "new") {
    return (
      <Shell title="Nova pessoa" onBack={() => setRoute({ name: "list" })}>
        <div className="kit-page kit-page--narrow">
          <div className="kit-pagehead"><h1>Cadastrar pessoa</h1>
            <p>Preencha os dados. O CPF é opcional. Marque “Acesso ao sistema” para criar um login já no cadastro — dica: inclua “207” no nome para simular falha de provisão.</p></div>
          <M3Card padding="md">
            <PersonForm mode="create"
              initial={{ fullName: "", cpf: "", birthDate: "", email: "", initialPassword: "" }}
              onSubmit={createPerson} onCancel={() => setRoute({ name: "list" })} />
          </M3Card>
        </div>
        {toast && <Toast msg={toast} />}
      </Shell>
    );
  }

  if (route.name === "detail" && current) {
    const statusSlot = <React.Fragment><M3ActiveBadge active={current.active} /><M3LoginIndicator state={current.loginState} /></React.Fragment>;
    return (
      <Shell title={current.fullName} onBack={() => setRoute({ name: "list" })} statusSlot={statusSlot}>
        {idpFailure && (
          <div className="kit-page" style={{ paddingBottom: 0 }}>
            <IdpRetryBannerWrap onRetry={retryIdp} retrying={retrying} />
          </div>
        )}
        <DetailScreen person={current} tab={route.tab} onTab={(t) => setRoute({ ...route, tab: t })}
          profileEditing={profileEditing} onEditProfile={() => setProfileEditing(true)}
          onSaveProfile={saveProfile} onCancelProfile={() => setProfileEditing(false)}
          onAssignRole={assignRole} onDeactivateRole={(id) => setRoleActive(id, false)} onReactivateRole={(id) => setRoleActive(id, true)}
          onAccess={doAccess} pendingAction={pendingAction}
          erasing={erasing} onErase={() => setErasing(true)} onConfirmErase={confirmErase} onCancelErase={() => setErasing(false)} />
        {toast && <Toast msg={toast} />}
      </Shell>
    );
  }

  // person was erased / not found
  return (
    <Shell title="Pessoas" onBack={() => setRoute({ name: "list" })}>
      <div className="kit-page">
        <M3Card padding="none">
          <M3EmptyState icon="person_off" title="Registro não encontrado"
            description="Esta pessoa não existe mais (404). Volte à lista."
            action={{ label: "Voltar à lista", onPress: () => setRoute({ name: "list" }), icon: "arrow_back" }} />
        </M3Card>
      </div>
    </Shell>
  );
}

function IdpRetryBannerWrap({ onRetry, retrying }) {
  const { IdpRetryBanner } = DS;
  return <IdpRetryBanner onRetry={onRetry} isPending={retrying} error="IDP-001" />;
}

function Toast({ msg }) {
  return (
    <div className="kit-toast" role="status">
      <span className="material-symbols-rounded" aria-hidden="true">check_circle</span>{msg}
    </div>
  );
}

window.PeopleKit = { App };
