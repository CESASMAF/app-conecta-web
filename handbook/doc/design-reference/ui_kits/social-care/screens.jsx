/* web_02 · Social Care — interactive recreation (prontuário).
   Composes the design-system primitives; synthetic fixtures (window.ScData). */
const DS = window.RAROSWeb02DesignSystem_9e80fa;
const {
  M3NavRail, M3TopAppBar, M3Button, M3Badge,
  M3SearchBar, M3ChoiceChip, M3TextField, M3MaskedField, M3DropdownField,
  M3StatusChip, M3RiskChip, M3Dialog, M3EmptyState, LgpdAnonymizedBanner,
  M3Avatar, M3StatCard, M3DataField, M3SectionHeader, M3TimelineItem,
} = DS;
const S = window.ScData;

/* Local PT-BR formatter (the DS namespace only exposes PascalCase components,
   not the lowercase mask helper — so we inline it here for display). */
function fmt(type, raw) {
  const d = (raw || "").replace(/\D/g, "");
  switch (type) {
    case "cpf":  return d.slice(0, 11).replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, "$1.$2.$3-$4");
    case "nis":  return d.slice(0, 11).replace(/^(\d{3})(\d{5})(\d{2})(\d{0,1}).*/, "$1.$2.$3-$4");
    case "cep":  return d.slice(0, 8).replace(/^(\d{5})(\d{0,3}).*/, "$1-$2");
    case "date": return d.slice(0, 8).replace(/^(\d{2})(\d{2})(\d{0,4}).*/, "$1/$2/$3");
    default:     return raw;
  }
}

const NAV = [
  { id: "social-care", label: "Prontuário", icon: "folder_shared" },
  { id: "people", label: "Pessoas", icon: "group" },
  { id: "indicators", label: "Indicadores", icon: "monitoring" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "waitlisted", label: "Fila de espera" },
  { value: "active", label: "Acolhidos" },
  { value: "discharged", label: "Altas" },
  { value: "withdrawn", label: "Desistentes" },
];

function Shell({ title, onBack, statusSlot, actions, children }) {
  return (
    <div className="kit-shell">
      <M3NavRail items={NAV} activeId="social-care" logo="../../assets/logo-raros-mark.webp"
        footer={
          <button className="m3-rail__item" type="button" aria-label="Conta">
            <span className="m3-rail__icon"><span className="material-symbols-rounded" aria-hidden="true">account_circle</span></span>
            <span className="m3-rail__label">Conta</span>
          </button>
        } />
      <div className="kit-main">
        <M3TopAppBar title={title} onBack={onBack} statusSlot={statusSlot} actions={actions} />
        <div className="kit-content">{children}</div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Patient list */
function PatientList({ onOpen }) {
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");

  const rows = S.patients.filter((p) => {
    const okStatus = status === "all" || p.status === status;
    const okQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
    return okStatus && okQ;
  });

  return (
    <div className="kit-page">
      <div className="kit-pagehead">
        <div>
          <h1>Pacientes</h1>
          <p>{S.patients.length} prontuários · busca e filtro por status</p>
        </div>
        <M3Button variant="filled" icon="person_add">Novo paciente</M3Button>
      </div>

      <div className="kit-listtools">
        <div className="kit-listtools__search">
          <M3SearchBar value={q} onChange={setQ} placeholder="Buscar paciente por nome" />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <M3ChoiceChip ariaLabel="Filtrar por status" value={status} onChange={setStatus} options={STATUS_FILTERS} />
      </div>

      {rows.length === 0 ? (
        <M3EmptyState title="Nenhum paciente encontrado"
          description="Ajuste a busca ou os filtros de status."
          action={{ label: "Limpar filtros", onPress: () => { setQ(""); setStatus("all"); }, icon: "filter_alt_off" }} />
      ) : (
        <React.Fragment>
          <table className="kit-table">
            <thead>
              <tr>
                <th>Paciente</th><th>CPF</th><th>Status</th><th>Riscos</th><th style={{ textAlign: "right" }}>Idade</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr className="kit-row" key={p.id} tabIndex={0}
                  onClick={() => onOpen(p.id)}
                  onKeyDown={(e) => { if (e.key === "Enter") onOpen(p.id); }}
                  aria-label={`Abrir prontuário de ${p.name}`}>
                  <td>
                    <div className="kit-cell-name">
                      <M3Avatar name={p.anonymized ? null : p.name} size="md" />
                      <b>{p.name}</b>
                    </div>
                  </td>
                  <td className="kit-cpf">{p.cpf ? "***." + fmt("cpf", p.cpf).slice(4, 11) + "-**" : "—"}</td>
                  <td><M3StatusChip status={p.status} /></td>
                  <td>
                    <div className="kit-risks">
                      {p.risks.map((r) => <M3RiskChip key={r} risk={r} />)}
                      {p.risks.length === 0 && <span style={{ color: "var(--color-text-disabled)" }}>—</span>}
                    </div>
                  </td>
                  <td className="kit-age">{p.age != null ? `${p.age} anos` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="kit-loadmore">
            <M3Button variant="text" icon="expand_more">Carregar mais</M3Button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

/* ------------------------------------------------------ Record sub-views */
function RegistryTab({ r }) {
  return (
    <div className="kit-cols">
      <div className="kit-card">
        <M3SectionHeader title="Dados pessoais" as="h2" />
        <dl>
          <M3DataField label="Nome social" value={r.socialName} />
          <M3DataField label="Sexo" value={r.sex} />
          <M3DataField label="Nascimento" value={fmt("date", r.birthDate)} mono />
          <M3DataField label="CPF" value={fmt("cpf", r.cpf)} mono />
          <M3DataField label="NIS" value={fmt("nis", r.nis)} mono />
          <M3DataField label="CNS" value={r.cns} mono />
          <M3DataField label="Endereço" value={r.address} />
          <M3DataField label="CEP" value={fmt("cep", r.cep)} mono />
        </dl>
      </div>
      <div className="kit-card">
        <M3SectionHeader title="Composição familiar" as="h2"
          action={<M3Button variant="text" size="sm" icon="person_add">Adicionar</M3Button>} />
        <table className="kit-family">
          <caption style={{ position: "absolute", left: -9999 }}>Composição familiar</caption>
          <thead>
            <tr><th>Membro</th><th>Parentesco</th><th>Idade</th><th></th></tr>
          </thead>
          <tbody>
            {r.family.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="kit-member">
                    <M3Avatar name={m.name} size="sm" />
                    <div>
                      <b>{m.name}</b>
                      {m.primary && <div className="kit-pref"><span className="material-symbols-rounded" aria-hidden="true">star</span>Pessoa de referência</div>}
                      {m.pending > 0 && <div className="kit-pending">{m.pending} documentos pendentes</div>}
                    </div>
                  </div>
                </td>
                <td>{m.relationship}</td>
                <td className="kit-cpf">{m.age} anos</td>
                <td style={{ textAlign: "right" }}>
                  <M3Button variant="text" size="sm" icon="more_vert" aria-label="Ações do membro"> </M3Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AssessmentTab({ onToast }) {
  const [saved, setSaved] = React.useState(false);
  const [rooms, setRooms] = React.useState("4");
  const [bedrooms, setBedrooms] = React.useState("2");
  const [type, setType] = React.useState("casa");
  const [water, setWater] = React.useState("sim");
  const [saving, setSaving] = React.useState(false);

  function save() {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); onToast("Seção salva"); }, 700);
  }

  return (
    <div className="kit-card" style={{ maxWidth: 760 }}>
      <M3SectionHeader title="Condição habitacional" as="h2"
        description="Seção 1 de 7 · salvável de forma independente" />
      <div className="kit-form">
        <M3DropdownField label="Tipo de moradia" value={type} onChange={(v) => { setType(v); setSaved(false); }}
          options={[{ value: "casa", label: "Casa" }, { value: "apartamento", label: "Apartamento" }, { value: "comodo", label: "Cômodo" }, { value: "abrigo", label: "Abrigo/Instituição" }]} />
        <M3DropdownField label="Material de construção" value="alvenaria" onChange={() => setSaved(false)}
          options={[{ value: "alvenaria", label: "Alvenaria" }, { value: "madeira", label: "Madeira" }, { value: "mista", label: "Mista" }]} />
        <M3TextField label="Nº de cômodos" mono value={rooms} onChange={(v) => { setRooms(v); setSaved(false); }} />
        <M3TextField label="Nº de dormitórios" mono value={bedrooms} onChange={(v) => { setBedrooms(v); setSaved(false); }} />
        <M3DropdownField label="Água encanada" value={water} onChange={(v) => { setWater(v); setSaved(false); }}
          options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
        <M3DropdownField label="Área de risco geográfico" value="nao" onChange={() => setSaved(false)}
          options={[{ value: "nao", label: "Não" }, { value: "sim", label: "Sim" }]} />
      </div>
      <div className="kit-formbar">
        {saved ? (
          <span className="kit-autosave"><span className="material-symbols-rounded" aria-hidden="true">check_circle</span>Salvo</span>
        ) : <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Alterações não salvas</span>}
        <M3Button variant="filled" icon="save" pending={saving} onPress={save}>Salvar seção</M3Button>
      </div>
    </div>
  );
}

function AuditTab({ r }) {
  return (
    <div className="kit-card" style={{ maxWidth: 760 }}>
      <M3SectionHeader title="Histórico do prontuário" as="h2"
        action={<M3Button variant="text" size="sm" icon="filter_list">Filtrar evento</M3Button>} />
      <ol className="m3-timeline" style={{ marginTop: 16 }}>
        {r.audit.map((e, i) => (
          <M3TimelineItem key={i} title={e.title} actor={e.actor} datetime={e.datetime} iso={e.iso}
            icon={e.icon} tone={e.tone} diff={e.diff} last={e.last} />
        ))}
      </ol>
    </div>
  );
}

/* ----------------------------------------------------------- Record page */
const TABS = [
  { id: "registry", label: "Cadastro", icon: "badge" },
  { id: "assessment", label: "Avaliação", icon: "assignment" },
  { id: "audit", label: "Histórico", icon: "history" },
];

function PatientRecord({ onToast, onDischarge }) {
  const r = S.record;
  const [tab, setTab] = React.useState("registry");

  return (
    <div className="kit-page">
      <div className="kit-recordhead">
        <M3Avatar name={r.name} size="lg" />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "var(--text-2xl)" }}>{r.name}</h1>
          <div className="kit-recordhead__id">#{r.id} · {fmt("cpf", r.cpf)}</div>
        </div>
        <M3StatusChip status={r.status} />
        <M3Button variant="outlined" icon="logout" onPress={onDischarge}>Desligar do serviço</M3Button>
      </div>

      <div className="kit-analytics">
        {r.analytics.map((a) => (
          <M3StatCard key={a.label} label={a.label} value={a.value} format={a.format}
            unit={a.unit} icon={a.icon} tone={a.tone} toneLabel={a.toneLabel} />
        ))}
      </div>

      <div className="kit-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} className="kit-tab" role="tab" aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}>
            <span className="material-symbols-rounded" aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "registry" && <RegistryTab r={r} />}
      {tab === "assessment" && <AssessmentTab onToast={onToast} />}
      {tab === "audit" && <AuditTab r={r} />}
    </div>
  );
}

/* ----------------------------------------------- Discharge dialog + App */
function DischargeDialog({ open, onClose, onConfirm }) {
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const needsNotes = reason === "other";
  const valid = reason && (!needsNotes || notes.trim().length > 0);

  return (
    <M3Dialog open={open} destructive icon="logout" title="Desligar do serviço"
      description="Registra a alta do paciente. A ação fica no histórico e pode ser revertida com readmissão."
      onClose={onClose}
      actions={
        <React.Fragment>
          <M3Button variant="text" onPress={onClose}>Cancelar</M3Button>
          <M3Button variant="destructive" disabled={!valid} onPress={onConfirm}>Confirmar alta</M3Button>
        </React.Fragment>
      }>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <M3DropdownField label="Motivo" placeholder="Selecione" value={reason} onChange={setReason}
          options={S.dischargeReasons} />
        <M3TextField label="Observações" value={notes} onChange={setNotes}
          hint={needsNotes ? "Obrigatório quando o motivo é Outro · máx. 1000" : "Opcional · máx. 1000"}
          errorMessage={needsNotes && !notes.trim() ? "Informe o motivo" : undefined} />
      </div>
    </M3Dialog>
  );
}

function App() {
  const [route, setRoute] = React.useState({ name: "list" });
  const [dialog, setDialog] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  let body, title, onBack, statusSlot, actions;
  if (route.name === "list") {
    title = "Atendimento socioassistencial";
    statusSlot = <M3Badge variant="success" dot>web_02</M3Badge>;
    body = <PatientList onOpen={() => setRoute({ name: "record" })} />;
  } else {
    title = "Prontuário";
    onBack = () => setRoute({ name: "list" });
    body = <PatientRecord onToast={showToast} onDischarge={() => setDialog(true)} />;
  }

  return (
    <React.Fragment>
      <Shell title={title} onBack={onBack} statusSlot={statusSlot} actions={actions}>
        {body}
      </Shell>
      <DischargeDialog open={dialog} onClose={() => setDialog(false)}
        onConfirm={() => { setDialog(false); showToast("Paciente desligado · alta registrada"); }} />
      {toast && (
        <div className="kit-toast" role="status">
          <span className="material-symbols-rounded" aria-hidden="true">check_circle</span>
          {toast}
        </div>
      )}
    </React.Fragment>
  );
}

window.ScApp = { App };
