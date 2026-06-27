/* web_02 · Analysis BI — interactive recreation.
   Composes the design-system primitives (never re-implements them). All data is
   synthetic aggregate fixtures (window.KitData). */
const DS = window.RAROSWeb02DesignSystem_9e80fa;
const {
  M3Button, M3TextField, M3DropdownField, M3ChoiceChip,
  M3Badge, SuppressionBanner, M3EmptyState,
  M3Card, M3KpiCard, M3KpiValue, M3SectionHeader, M3DataField, M3PeriodLabel,
  M3TopAppBar, M3NavRail,
  AgePyramidChart, TopNBarChart, M3SeriesLegendItem,
} = DS;
const D = window.KitData;

const GRANS = [
  { value: "monthly", label: "Mensal" },
  { value: "quarterly", label: "Trimestral" },
  { value: "yearly", label: "Anual" },
];

/* ----------------------------------------------------------------- Filter bar */
function DashboardFilterPanel({ filters, regions, onApply }) {
  const [f, setF] = React.useState(filters);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const invalidEnd = f.periodEnd < f.periodStart;
  return (
    <form
      className="kit-filterbar"
      role="search"
      aria-label="Filtros de indicadores"
      onSubmit={(e) => { e.preventDefault(); if (!invalidEnd) onApply(f); }}
    >
      <div className="kit-filterbar__inner">
        <M3TextField label="Período início" mono value={f.periodStart}
          onChange={(v) => set("periodStart", v)} />
        <M3TextField label="Fim" mono value={f.periodEnd}
          onChange={(v) => set("periodEnd", v)}
          errorMessage={invalidEnd ? "O fim deve ser ≥ o início" : undefined} />
        <div>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: 6 }}>Granularidade</div>
          <M3ChoiceChip ariaLabel="Granularidade" value={f.granularity}
            onChange={(v) => set("granularity", v)} options={GRANS} />
        </div>
        <div className="kit-filterbar__grow" style={{ minWidth: 180 }}>
          <M3DropdownField label="Mesorregião"
            value={f.mesoregion || ""} onChange={(v) => set("mesoregion", v || null)}
            options={[{ value: "", label: "Todas" }, ...regions.map((r) => ({ value: r.code, label: r.name }))]} />
        </div>
        <div className="kit-filterbar__actions">
          <M3Button type="submit" variant="tonal" icon="filter_alt">Aplicar</M3Button>
          <M3Button variant="text" onPress={() => { const r = filters; setF(r); onApply(r); }}>Limpar</M3Button>
        </div>
      </div>
    </form>
  );
}

/* --------------------------------------------------------------------- Shell */
const NAV = [
  { id: "social-care", label: "Prontuário", icon: "folder_shared" },
  { id: "people", label: "Pessoas", icon: "group" },
  { id: "indicators", label: "Indicadores", icon: "monitoring" },
];

function Shell({ navActive, onNav, title, onBack, statusSlot, actions, children }) {
  return (
    <div className="kit-shell">
      <M3NavRail
        items={NAV}
        activeId={navActive}
        onSelect={onNav}
        logo="../../assets/logo-raros-mark.webp"
        footer={
          <button className="m3-rail__item" type="button" aria-label="Conta" onClick={() => {}}>
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

/* --------------------------------------------------------- Indicators home */
function IndicatorsHome({ onOpen, onExport }) {
  return (
    <div className="kit-page">
      <div className="kit-pagehead">
        <h1>Indicadores</h1>
        <p>
          Dados agregados e anônimos da rede RAROS. Todos os recortes respeitam
          K-anonimato (K=5): grupos com menos de 5 pessoas são omitidos.
        </p>
      </div>
      <div className="kit-home-grid">
        {D.home.map((axis) => (
          <M3KpiCard
            key={axis.id}
            label={axis.label}
            value={axis.value}
            unitLabel={axis.unit}
            period="2025-12"
            granularity="monthly"
            icon={axis.icon}
            footnote={axis.note}
            onPress={() => onOpen(axis.id)}
          />
        ))}
        <M3Card onPress={onExport}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="material-symbols-rounded" aria-hidden="true"
              style={{ fontSize: 26, color: "var(--color-action-primary)" }}>download</span>
            <strong style={{ color: "var(--color-text-primary)" }}>Exportar dados</strong>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
              5 datasets · 8 formatos (CSV, FHIR, DataSUS…)
            </span>
          </div>
        </M3Card>
      </div>
    </div>
  );
}

/* --------------------------------------------------- Demographics dashboard */
function MesoregionBreakdown({ rows }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <table className="kit-breakdown">
      <caption style={{ textAlign: "left", fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", marginBottom: 8 }}>
        Distribuição por mesorregião
      </caption>
      <thead>
        <tr>
          <th scope="col">Mesorregião</th>
          <th scope="col" style={{ width: 180 }}>Proporção</th>
          <th scope="col" style={{ textAlign: "right" }}>Registros</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.mesoregionName}>
            <th scope="row" style={{ fontWeight: 500 }}>{r.mesoregionName}</th>
            <td>
              <div className="kit-bar-wrap"><div className="kit-bar" style={{ width: `${(r.value / max) * 100}%` }} /></div>
            </td>
            <td className="num">{r.value.toLocaleString("pt-BR")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DemographicsDashboard({ onBack, onExport }) {
  const data = D.demographics;
  const [filters, setFilters] = React.useState({
    periodStart: "2025-01", periodEnd: "2025-12", granularity: "monthly", mesoregion: null,
  });
  const [loading, setLoading] = React.useState(false);

  function apply(f) {
    setFilters(f); setLoading(true);
    setTimeout(() => setLoading(false), 600);
  }

  const bandsWithData = new Set(data.pyramid.map((p) => p.ageBand)).size;

  return (
    <React.Fragment>
      <DashboardFilterPanel filters={filters} regions={D.regions} onApply={apply} />
      <div className="kit-page">
        <div style={{ marginBottom: 16 }}>
          <SuppressionBanner suppressedGroups={data.meta.suppressedGroups} kThreshold={data.meta.kThreshold} onLearnMore={() => {}} />
        </div>

        <div className="kit-kpis">
          <M3KpiCard label="Registros agregados" value={loading ? null : data.meta.totalRecords}
            unitLabel="registros" period="2025-12" pending={loading} icon="groups" />
          <M3KpiCard label="Faixas com dados" value={loading ? null : bandsWithData}
            unitLabel="de 17" period="2025-12" pending={loading} icon="bar_chart" />
          <M3KpiCard label="Mesorregiões" value={loading ? null : data.breakdown.length}
            period="2025-12" pending={loading} icon="map" />
        </div>

        <div className="kit-charts">
          <div className="kit-chartcard kit-chartcard--wide">
            <M3SectionHeader title="Pirâmide etária"
              description="Faixa etária × sexo no período filtrado"
              action={<M3Badge variant="info">{data.meta.totalRecords.toLocaleString("pt-BR")} registros</M3Badge>} />
            <div className="kit-chartcard__body">
              <AgePyramidChart items={loading ? [] : data.pyramid}
                suppressedGroups={data.meta.suppressedGroups} pending={loading} />
            </div>
          </div>
          <div className="kit-chartcard kit-chartcard--wide">
            <M3SectionHeader title="Por mesorregião"
              action={<M3Button variant="text" icon="download" onPress={onExport}>Exportar este eixo</M3Button>} />
            <div className="kit-chartcard__body">
              {loading ? null : <MesoregionBreakdown rows={data.breakdown} />}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

/* -------------------------------------------------------------- Export center */
function ExportCenter({ preselect }) {
  const [dataset, setDataset] = React.useState(preselect || "demographics");
  const [fmt, setFmt] = React.useState("CSV");
  const [start, setStart] = React.useState("2025-01");
  const [end, setEnd] = React.useState("2025-12");
  const [downloading, setDownloading] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const fmtObj = D.exportFormats.find((x) => x.name === fmt) || D.exportFormats[0];
  const filename = `acdg-${dataset}-${start}-${end}${fmtObj.ext}`;

  function doExport() {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setToast(`Arquivo ${filename} pronto`);
      setTimeout(() => setToast(null), 2600);
    }, 900);
  }

  return (
    <div className="kit-page kit-page--narrow">
      <div className="kit-pagehead">
        <h1>Exportar dados</h1>
        <p>5 datasets × 8 formatos. O arquivo aplica o mesmo K-anonimato (K=5) e nunca contém dados pessoais.</p>
      </div>

      <div className="kit-stack">
        <M3Card padding="md">
          <M3SectionHeader title="Recorte" as="h2" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 14 }}>
            <M3DropdownField label="Dataset" value={dataset} onChange={setDataset} options={D.datasets} />
            <M3TextField label="Período início" mono value={start} onChange={setStart} />
            <M3TextField label="Fim" mono value={end} onChange={setEnd} />
          </div>
        </M3Card>

        <div>
          <M3SectionHeader title="Formato do arquivo" as="h2" />
          <div className="kit-formats" role="radiogroup" aria-label="Formato do arquivo" style={{ marginTop: 14 }}>
            {D.exportFormats.map((x) => (
              <button key={x.name} type="button" role="radio" aria-checked={x.name === fmt}
                className="kit-fmt" onClick={() => setFmt(x.name)}>
                <span className="kit-fmt__icon material-symbols-rounded" aria-hidden="true">{x.icon}</span>
                <span>
                  <span className="kit-fmt__name">{x.name}</span>
                  <span className="kit-fmt__hint">{x.hint}</span>
                  <span className="kit-fmt__ext">{x.ext} · {x.ct}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <SuppressionBanner suppressedGroups={3} kThreshold={5} />

        <div className="kit-exportfoot">
          <div className="kit-exportfoot__summary">
            {D.datasets.find((d) => d.value === dataset).label} · {start} a {end} · todas as regiões<br />
            <span className="kit-exportfoot__file">{filename}</span>
          </div>
          <M3Button variant="filled" icon="download" pending={downloading} onPress={doExport}>
            {downloading ? "Gerando…" : "Exportar"}
          </M3Button>
        </div>
      </div>

      {toast && (
        <div className="kit-toast" role="status">
          <span className="material-symbols-rounded" aria-hidden="true">check_circle</span>
          {toast}
        </div>
      )}
    </div>
  );
}

function ModulePlaceholder({ label }) {
  return (
    <div className="kit-page">
      <M3Card padding="none">
        <M3EmptyState variant="default" icon="construction"
          title={`Módulo "${label}" fora do escopo desta demonstração`}
          description="Este UI kit recria o módulo de Indicadores (analysis-bi). Os módulos de Prontuário e Pessoas compartilham o mesmo shell e design system." />
      </M3Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- App */
function App() {
  const [route, setRoute] = React.useState({ name: "home" });
  const [nav, setNav] = React.useState("indicators");

  function onNav(id) {
    setNav(id);
    if (id === "indicators") setRoute({ name: "home" });
    else setRoute({ name: "module", label: NAV.find((n) => n.id === id).label });
  }

  let title = "Indicadores";
  let onBack;
  let actions = null;
  let body;

  if (route.name === "home") {
    title = "Indicadores";
    body = <IndicatorsHome onOpen={(id) => setRoute({ name: id })} onExport={() => setRoute({ name: "export" })} />;
  } else if (route.name === "demographics") {
    title = "Dashboard demográfico";
    onBack = () => setRoute({ name: "home" });
    actions = <M3Button variant="filled" size="sm" icon="download" onPress={() => setRoute({ name: "export", preselect: "demographics" })}>Exportar este eixo</M3Button>;
    body = <DemographicsDashboard onExport={() => setRoute({ name: "export", preselect: "demographics" })} />;
  } else if (route.name === "export") {
    title = "Exportar dados";
    onBack = () => setRoute({ name: "home" });
    body = <ExportCenter preselect={route.preselect} />;
  } else if (route.name === "module") {
    title = route.label;
    body = <ModulePlaceholder label={route.label} />;
  } else {
    // other axes: honest placeholder (not implemented in this demo)
    title = "Indicadores";
    onBack = () => setRoute({ name: "home" });
    body = (
      <div className="kit-page">
        <M3Card padding="none">
          <M3EmptyState icon="bar_chart" title="Dashboard em construção nesta demonstração"
            description="O kit traz o eixo demográfico completo (pirâmide etária, supressão, breakdown). Os demais eixos reusam os mesmos componentes."
            action={{ label: "Voltar aos indicadores", onPress: () => setRoute({ name: "home" }), icon: "arrow_back" }} />
        </M3Card>
      </div>
    );
  }

  const statusSlot = <M3Badge variant="success" dot>web_02</M3Badge>;
  return (
    <Shell navActive={nav} onNav={onNav} title={title} onBack={onBack} statusSlot={statusSlot} actions={actions}>
      {body}
    </Shell>
  );
}

window.KitApp = { App };
