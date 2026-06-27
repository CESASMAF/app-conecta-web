/* web_02 · People Context — organism panels.
   Composes DS primitives; never re-implements them. Views are dumb: they take
   data + handlers, no server calls. (window.PeoplePanels) */
const _DS = window.RAROSWeb02DesignSystem_9e80fa;
const {
  M3Button, M3TextField, M3DropdownField, M3ChoiceChip, M3Switch, M3PasswordField,
  M3SectionHeader, M3DataField, M3EmptyState, M3Card,
  M3ActiveBadge, M3LoginIndicator, M3RoleBadge, IdpRetryBanner, M3Badge,
} = _DS;
const PD = window.PeopleData;

/* ----------------------------------------------------------------- Modal */
function Modal({ title, icon, danger, onClose, children, footer, labelledById }) {
  React.useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="pc-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={"pc-modal" + (danger ? " pc-modal--danger" : "")} role="dialog" aria-modal="true" aria-labelledby={labelledById}>
        <div className="pc-modal__head">
          {icon && <span className="material-symbols-rounded pc-modal__headicon" aria-hidden="true">{icon}</span>}
          <h2 id={labelledById} className="pc-modal__title">{title}</h2>
          <button type="button" className="pc-iconbtn" aria-label="Fechar" onClick={onClose}>
            <span className="material-symbols-rounded" aria-hidden="true">close</span>
          </button>
        </div>
        <div className="pc-modal__body">{children}</div>
        {footer && <div className="pc-modal__foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- PersonForm */
function PersonForm({ mode, initial, onSubmit, onCancel, idpFailure, onRetryIdp, retrying }) {
  const [f, setF] = React.useState(initial);
  const [createLogin, setCreateLogin] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const nameErr = touched && !f.fullName.trim() ? "Informe o nome completo" : undefined;
  const emailErr = touched && createLogin && !f.email ? "E-mail é obrigatório para criar login" : undefined;
  const pwErr = touched && createLogin && f.initialPassword && f.initialPassword.length < 8
    ? "Mínimo 8 caracteres" : undefined;

  function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (!f.fullName.trim()) return;
    if (createLogin && !f.email) return;
    if (createLogin && f.initialPassword && f.initialPassword.length < 8) return;
    onSubmit({ ...f, createLogin });
  }

  return (
    <form className="pc-form" onSubmit={submit}>
      {idpFailure && (
        <div style={{ marginBottom: 20 }}>
          <IdpRetryBanner onRetry={onRetryIdp} isPending={retrying} error="IDP-001" />
        </div>
      )}

      <fieldset className="pc-fieldset">
        <M3SectionHeader title="Dados da pessoa" description="O CPF é opcional; duplicatas são deduplicadas pelo sistema." as="h2" />
        <div className="pc-form__grid">
          <div className="pc-form__full">
            <M3TextField label="Nome completo" required value={f.fullName} maxLength={200}
              onChange={(v) => set("fullName", v)} errorMessage={nameErr} placeholder="Ex.: Ana Beatriz Carvalho" />
          </div>
          <M3TextField label="CPF" mono value={f.cpf} onChange={(v) => set("cpf", v)}
            placeholder="000.000.000-00" hint="Opcional" leadingIcon="badge" />
          <M3TextField label="Data de nascimento" mono value={f.birthDate} onChange={(v) => set("birthDate", v)}
            placeholder="dd/mm/aaaa" leadingIcon="event" />
          <div className="pc-form__full">
            <M3TextField label="E-mail" type="email" value={f.email} onChange={(v) => set("email", v)}
              errorMessage={emailErr} placeholder="nome@exemplo.org" leadingIcon="mail"
              hint={createLogin ? undefined : "Opcional — necessário se for criar login"} />
          </div>
        </div>
      </fieldset>

      {mode === "create" && (
        <fieldset className="pc-fieldset pc-fieldset--accent">
          <div className="pc-form__toggle">
            <div>
              <strong>Acesso ao sistema</strong>
              <p>Cria um login no provedor de identidade já no cadastro. Você também pode provisionar depois.</p>
            </div>
            <M3Switch checked={createLogin} onChange={setCreateLogin} aria-expanded={createLogin} />
          </div>
          {createLogin && (
            <div className="pc-form__grid" style={{ marginTop: 16 }}>
              <div className="pc-form__full">
                <M3PasswordField value={f.initialPassword || ""} onChange={(v) => set("initialPassword", v)}
                  errorMessage={pwErr} hint="Opcional — em branco, a senha é definida por link de recuperação." />
              </div>
            </div>
          )}
        </fieldset>
      )}

      <div className="pc-form__actions">
        <M3Button variant="text" type="button" onPress={onCancel}>Cancelar</M3Button>
        <M3Button variant="filled" type="submit" icon="check">{mode === "create" ? "Cadastrar pessoa" : "Salvar alterações"}</M3Button>
      </div>
    </form>
  );
}

/* --------------------------------------------------- RoleChipWithActions */
function RoleChipWithActions({ role, canManage, onDeactivate, onReactivate }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="pc-rolerow">
      <M3RoleBadge system={role.system} role={role.role} active={role.active} />
      <span className="pc-rolerow__date">desde {PD.fmtDate(role.assignedAt)}</span>
      <M3ActiveBadge active={role.active} size="sm" labels={{ on: "Ativo", off: "Inativo" }} />
      <div className="pc-rolerow__spacer" />
      {canManage ? (
        <div className="pc-menuwrap">
          <button type="button" className="pc-iconbtn" aria-label="Ações do vínculo" aria-haspopup="menu"
            onClick={() => setOpen((o) => !o)} onBlur={() => setTimeout(() => setOpen(false), 150)}>
            <span className="material-symbols-rounded" aria-hidden="true">more_vert</span>
          </button>
          {open && (
            <div className="pc-menu" role="menu">
              {role.active ? (
                <button type="button" role="menuitem" className="pc-menu__item pc-menu__item--danger"
                  onMouseDown={onDeactivate}><span className="material-symbols-rounded">pause_circle</span>Desativar vínculo</button>
              ) : (
                <button type="button" role="menuitem" className="pc-menu__item"
                  onMouseDown={onReactivate}><span className="material-symbols-rounded">play_circle</span>Reativar vínculo</button>
              )}
            </div>
          )}
        </div>
      ) : (
        <span className="pc-rolerow__ro" title="Somente leitura">lock</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- RolePanel */
function RolePanel({ roles, viewer, onAssign, onDeactivate, onReactivate }) {
  const [filter, setFilter] = React.useState("all");
  const [assigning, setAssigning] = React.useState(false);
  const [sys, setSys] = React.useState(viewer.adminSystems[0] || "social-care");
  const [rol, setRol] = React.useState("patient");

  const canManageSystem = (system) => viewer.isSuperadmin || viewer.adminSystems.includes(system);
  const shown = roles.filter((r) => filter === "all" ? true : filter === "active" ? r.active : !r.active);
  const assignableSystems = viewer.isSuperadmin ? PD.systems : PD.systems.filter((s) => viewer.adminSystems.includes(s.value));

  return (
    <div className="pc-panel">
      <M3SectionHeader title="Vínculos de sistema" description="Papéis da pessoa em cada sistema da rede."
        action={<M3Button variant="tonal" size="sm" icon="add" onPress={() => setAssigning(true)}>Atribuir vínculo</M3Button>} />

      <div className="pc-panel__toolbar">
        <M3ChoiceChip ariaLabel="Filtrar vínculos" value={filter} onChange={setFilter}
          options={[{ value: "all", label: "Todos" }, { value: "active", label: "Ativos" }, { value: "inactive", label: "Inativos" }]} />
        <span className="pc-count">{shown.length} de {roles.length}</span>
      </div>

      {shown.length === 0 ? (
        <M3Card padding="none">
          <M3EmptyState icon="link_off" title="Nenhum vínculo de sistema"
            description={filter === "all" ? "Esta pessoa ainda não tem papéis atribuídos em nenhum sistema." : "Nenhum vínculo neste filtro."}
            action={filter === "all" ? { label: "Atribuir vínculo", onPress: () => setAssigning(true), icon: "add" } : undefined} />
        </M3Card>
      ) : (
        <div className="pc-rolelist">
          {shown.map((r) => (
            <RoleChipWithActions key={r.id} role={r} canManage={canManageSystem(r.system)}
              onDeactivate={() => onDeactivate(r.id)} onReactivate={() => onReactivate(r.id)} />
          ))}
        </div>
      )}

      {assigning && (
        <Modal title="Atribuir vínculo de sistema" icon="add_link" labelledById="assign-title"
          onClose={() => setAssigning(false)}
          footer={<React.Fragment>
            <M3Button variant="text" onPress={() => setAssigning(false)}>Cancelar</M3Button>
            <M3Button variant="filled" icon="check" onPress={() => { onAssign(sys, rol); setAssigning(false); }}>Atribuir</M3Button>
          </React.Fragment>}>
          <p className="pc-modal__lead">Você gerencia apenas os sistemas do seu escopo de administração.</p>
          <div className="pc-form__grid">
            <M3DropdownField label="Sistema" value={sys} onChange={setSys} options={assignableSystems} />
            <M3DropdownField label="Papel" value={rol} onChange={setRol} options={PD.roles} />
          </div>
          <div className="pc-preview"><span>Pré-visualização:</span> <M3RoleBadge system={sys} role={rol} active /></div>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------------------- IdpAccessPanel */
function AccessBlock({ icon, title, desc, children, tone }) {
  return (
    <section className={"pc-accblock" + (tone ? " pc-accblock--" + tone : "")}>
      <span className="material-symbols-rounded pc-accblock__icon" aria-hidden="true">{icon}</span>
      <div className="pc-accblock__body">
        <h3>{title}</h3>
        <p>{desc}</p>
        {children && <div className="pc-accblock__action">{children}</div>}
      </div>
    </section>
  );
}

function IdpAccessPanel({ person, viewer, onProvision, onReset, onDeactivate, onReactivate, onErase, pendingAction }) {
  const hasLogin = person.idpUserId != null;
  return (
    <div className="pc-panel">
      <M3SectionHeader title="Acesso e login" description="Vínculo da pessoa com o provedor de identidade (Authentik)." as="h2" />

      <div className="pc-acclist">
        <div className="pc-acclogin">
          <M3LoginIndicator state={person.loginState} />
          {hasLogin && <M3DataField label="ID no provedor" value={person.idpUserId.slice(0, 18) + "…"} mono />}
        </div>

        {!hasLogin ? (
          <AccessBlock icon="key" title="Provisionar login" desc="Cria o usuário no provedor de identidade. O e-mail é obrigatório.">
            <M3Button variant="tonal" icon="key" pending={pendingAction === "provision"} onPress={onProvision}>Provisionar login</M3Button>
          </AccessBlock>
        ) : (
          <AccessBlock icon="lock_reset" title="Recuperação de senha" desc="Envia um link de redefinição por e-mail. O link nunca é exibido aqui.">
            <M3Button variant="tonal" icon="mail" pending={pendingAction === "reset"} onPress={onReset}>Enviar link por e-mail</M3Button>
          </AccessBlock>
        )}

        <AccessBlock icon={person.active ? "pause_circle" : "play_circle"}
          title={person.active ? "Desativar pessoa" : "Reativar pessoa"}
          desc={person.active
            ? "Desativação temporária. O provedor é atualizado primeiro; se ele estiver fora, nada muda no banco."
            : "Reativa o acesso. Não altera os vínculos de sistema (eixos independentes)."}>
          {person.active ? (
            <M3Button variant="outlined" icon="pause" pending={pendingAction === "deactivate"} onPress={onDeactivate}>Desativar</M3Button>
          ) : (
            <M3Button variant="outlined" icon="play_arrow" pending={pendingAction === "reactivate"} onPress={onReactivate}>Reativar</M3Button>
          )}
        </AccessBlock>

        {viewer.isSuperadmin && (
          <AccessBlock tone="danger" icon="delete_forever" title="Apagamento total (LGPD)"
            desc="Remove o usuário no provedor, todos os vínculos e o registro da pessoa. Irreversível — LGPD Art. 18 V.">
            <M3Button variant="destructive" icon="delete_forever" onPress={onErase}>Apagar definitivamente</M3Button>
          </AccessBlock>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------- ErasureDialog */
function ErasureDialog({ person, onConfirm, onCancel, isPending }) {
  const [ack, setAck] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const norm = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();
  const nameOk = norm(typed) === norm(person.fullName);
  const ready = ack && nameOk;
  return (
    <Modal title="Apagar registro definitivamente" icon="delete_forever" danger labelledById="erase-title"
      onClose={onCancel}
      footer={<React.Fragment>
        <M3Button variant="text" onPress={onCancel}>Cancelar</M3Button>
        <M3Button variant="destructive" icon="delete_forever" disabled={!ready} pending={isPending}
          onPress={() => ready && onConfirm()}>Apagar definitivamente</M3Button>
      </React.Fragment>}>
      <p className="pc-modal__lead">Esta ação é <strong>irreversível</strong>. Serão removidos:</p>
      <ul className="pc-erase__list">
        <li><span className="material-symbols-rounded">person_remove</span>O usuário no provedor de identidade</li>
        <li><span className="material-symbols-rounded">link_off</span>Todos os vínculos de sistema</li>
        <li><span className="material-symbols-rounded">database</span>O registro da pessoa no banco</li>
      </ul>
      <div className="pc-erase__review">
        <M3DataField label="Pessoa" value={person.fullName} />
        <M3DataField label="CPF" value={person.cpfMasked} mono />
      </div>
      <label className="pc-check">
        <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
        <span>Entendo que esta ação é irreversível</span>
      </label>
      <M3TextField label={'Digite o nome completo para confirmar'} value={typed} onChange={setTyped}
        placeholder={person.fullName}
        errorMessage={typed && !nameOk ? "O nome não confere" : undefined} />
    </Modal>
  );
}

window.PeoplePanels = { Modal, PersonForm, RolePanel, RoleChipWithActions, IdpAccessPanel, ErasureDialog };
