/* @ds-bundle: {"format":3,"namespace":"RAROSWeb02DesignSystem_9e80fa","components":[{"name":"M3Avatar","sourcePath":"components/data-display/M3Avatar.jsx"},{"name":"M3Card","sourcePath":"components/data-display/M3Card.jsx"},{"name":"M3DataField","sourcePath":"components/data-display/M3DataField.jsx"},{"name":"M3KpiCard","sourcePath":"components/data-display/M3KpiCard.jsx"},{"name":"M3KpiValue","sourcePath":"components/data-display/M3KpiValue.jsx"},{"name":"M3PeriodLabel","sourcePath":"components/data-display/M3PeriodLabel.jsx"},{"name":"M3SectionHeader","sourcePath":"components/data-display/M3SectionHeader.jsx"},{"name":"M3StatCard","sourcePath":"components/data-display/M3StatCard.jsx"},{"name":"M3TimelineItem","sourcePath":"components/data-display/M3TimelineItem.jsx"},{"name":"AgePyramidChart","sourcePath":"components/dataviz/AgePyramidChart.jsx"},{"name":"M3SeriesLegendItem","sourcePath":"components/dataviz/M3SeriesLegendItem.jsx"},{"name":"TopNBarChart","sourcePath":"components/dataviz/TopNBarChart.jsx"},{"name":"IdpRetryBanner","sourcePath":"components/feedback/IdpRetryBanner.jsx"},{"name":"LgpdAnonymizedBanner","sourcePath":"components/feedback/LgpdAnonymizedBanner.jsx"},{"name":"M3ActiveBadge","sourcePath":"components/feedback/M3ActiveBadge.jsx"},{"name":"M3Badge","sourcePath":"components/feedback/M3Badge.jsx"},{"name":"M3Dialog","sourcePath":"components/feedback/M3Dialog.jsx"},{"name":"M3EmptyState","sourcePath":"components/feedback/M3EmptyState.jsx"},{"name":"M3LoginIndicator","sourcePath":"components/feedback/M3LoginIndicator.jsx"},{"name":"M3RiskChip","sourcePath":"components/feedback/M3RiskChip.jsx"},{"name":"M3RoleBadge","sourcePath":"components/feedback/M3RoleBadge.jsx"},{"name":"M3StatusChip","sourcePath":"components/feedback/M3StatusChip.jsx"},{"name":"SuppressionBanner","sourcePath":"components/feedback/SuppressionBanner.jsx"},{"name":"M3Button","sourcePath":"components/forms/M3Button.jsx"},{"name":"M3ChoiceChip","sourcePath":"components/forms/M3ChoiceChip.jsx"},{"name":"M3DropdownField","sourcePath":"components/forms/M3DropdownField.jsx"},{"name":"M3MaskedField","sourcePath":"components/forms/M3MaskedField.jsx"},{"name":"M3PasswordField","sourcePath":"components/forms/M3PasswordField.jsx"},{"name":"M3SearchBar","sourcePath":"components/forms/M3SearchBar.jsx"},{"name":"M3Switch","sourcePath":"components/forms/M3Switch.jsx"},{"name":"M3TextField","sourcePath":"components/forms/M3TextField.jsx"},{"name":"M3NavRail","sourcePath":"components/navigation/M3NavRail.jsx"},{"name":"M3TopAppBar","sourcePath":"components/navigation/M3TopAppBar.jsx"}],"sourceHashes":{"components/data-display/M3Avatar.jsx":"5dd730526dd2","components/data-display/M3Card.jsx":"ec3ba61c6738","components/data-display/M3DataField.jsx":"19709034c335","components/data-display/M3KpiCard.jsx":"58584d17f106","components/data-display/M3KpiValue.jsx":"c6e111abdc19","components/data-display/M3PeriodLabel.jsx":"ed65e011ac51","components/data-display/M3SectionHeader.jsx":"8c18d989aa33","components/data-display/M3StatCard.jsx":"bd25943ff858","components/data-display/M3TimelineItem.jsx":"ec6a57b5d22a","components/dataviz/AgePyramidChart.jsx":"d459e5c98820","components/dataviz/M3SeriesLegendItem.jsx":"d2f3875a26e9","components/dataviz/TopNBarChart.jsx":"aaeb1cdaea29","components/feedback/IdpRetryBanner.jsx":"9dbe2987083e","components/feedback/LgpdAnonymizedBanner.jsx":"438a67997849","components/feedback/M3ActiveBadge.jsx":"eca0fa10c987","components/feedback/M3Badge.jsx":"ea7b50ade138","components/feedback/M3Dialog.jsx":"ea7e10a18167","components/feedback/M3EmptyState.jsx":"a2f38670d819","components/feedback/M3LoginIndicator.jsx":"e61cfec2a5c0","components/feedback/M3RiskChip.jsx":"42bb1f4698be","components/feedback/M3RoleBadge.jsx":"a53036ffe24c","components/feedback/M3StatusChip.jsx":"88c85d8fc31b","components/feedback/SuppressionBanner.jsx":"059d47df2e62","components/forms/M3Button.jsx":"c591d46875ae","components/forms/M3ChoiceChip.jsx":"c9431f4cdb27","components/forms/M3DropdownField.jsx":"94571ef0652f","components/forms/M3MaskedField.jsx":"67722728887c","components/forms/M3PasswordField.jsx":"a5761a046162","components/forms/M3SearchBar.jsx":"ad6799db85d2","components/forms/M3Switch.jsx":"bc85dd5e0363","components/forms/M3TextField.jsx":"2dec298e3bc6","components/navigation/M3NavRail.jsx":"688bff160164","components/navigation/M3TopAppBar.jsx":"13d7e86bb6f5","ui_kits/analysis-bi/fixtures.js":"f86769f92bbd","ui_kits/analysis-bi/screens.jsx":"93f7e3384314","ui_kits/people-context/fixtures.js":"cca966f4d2d1","ui_kits/people-context/people-panels.jsx":"561d9bca0d18","ui_kits/people-context/people-screens.jsx":"3161c91e3913","ui_kits/social-care/fixtures.js":"22ec6e93e979","ui_kits/social-care/screens.jsx":"04878cdf728c"},"inlinedExternals":[],"unexposedExports":[{"name":"formatMask","sourcePath":"components/forms/M3MaskedField.jsx"},{"name":"formatValue","sourcePath":"components/data-display/M3KpiValue.jsx"},{"name":"onlyDigits","sourcePath":"components/forms/M3MaskedField.jsx"},{"name":"parsePeriod","sourcePath":"components/data-display/M3PeriodLabel.jsx"}]} */

(() => {

const __ds_ns = (window.RAROSWeb02DesignSystem_9e80fa = window.RAROSWeb02DesignSystem_9e80fa || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/data-display/M3Avatar.jsx
try { (() => {
const CSS = `
.m3-avatar{ display:inline-flex; align-items:center; justify-content:center; flex:none;
  border-radius:50%; background:var(--color-action-primary-tint); color:var(--color-action-primary-tint-fg);
  font-family:var(--font-sans); font-weight:var(--weight-semibold); overflow:hidden;
  text-transform:uppercase; line-height:1; }
.m3-avatar img{ width:100%; height:100%; object-fit:cover; }
.m3-avatar--sm{ width:28px; height:28px; font-size:11px; }
.m3-avatar--md{ width:40px; height:40px; font-size:var(--text-sm); }
.m3-avatar--lg{ width:56px; height:56px; font-size:var(--text-lg); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-avatar-css")) {
  const s = document.createElement("style");
  s.id = "m3-avatar-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function initials(name) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[parts.length - 1][0];
}
function M3Avatar({
  name,
  src,
  size = "md",
  alt
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `m3-avatar m3-avatar--${size}`,
    "aria-hidden": src ? undefined : "true"
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt || name || ""
  }) : initials(name));
}
Object.assign(__ds_scope, { M3Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/M3Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/M3Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.m3-card{ background:var(--color-bg-elevated); border:1px solid var(--color-border-default);
  border-radius:var(--radius-lg); box-shadow:var(--shadow-sm); }
.m3-card--flat{ box-shadow:none; }
.m3-card--pad{ padding:var(--space-6); }
.m3-card--pad-sm{ padding:var(--space-4); }
a.m3-card, button.m3-card{ display:block; text-align:left; width:100%; font:inherit;
  color:inherit; cursor:pointer; text-decoration:none; position:relative; isolation:isolate;
  transition:box-shadow var(--duration-fast) var(--ease-standard),
             border-color var(--duration-fast) var(--ease-standard); }
a.m3-card::after, button.m3-card::after{ content:""; position:absolute; inset:0;
  border-radius:inherit; background:var(--color-action-primary); opacity:0; z-index:-1;
  transition:opacity var(--duration-fast); }
a.m3-card:hover, button.m3-card:hover{ box-shadow:var(--shadow-md); border-color:var(--color-border-strong); }
a.m3-card:hover::after, button.m3-card:hover::after{ opacity:0.04; }
a.m3-card:focus-visible, button.m3-card:focus-visible{ outline:var(--focus-ring-width) solid var(--color-focus-ring);
  outline-offset:2px; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-card-css")) {
  const s = document.createElement("style");
  s.id = "m3-card-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3Card({
  children,
  padding = "md",
  flat = false,
  href,
  onPress,
  className = "",
  style,
  ...rest
}) {
  const cls = ["m3-card", flat ? "m3-card--flat" : "", padding === "md" ? "m3-card--pad" : padding === "sm" ? "m3-card--pad-sm" : "", className].filter(Boolean).join(" ");
  if (href) {
    return /*#__PURE__*/React.createElement("a", _extends({
      className: cls,
      href: href,
      style: style
    }, rest), children);
  }
  if (onPress) {
    return /*#__PURE__*/React.createElement("button", _extends({
      type: "button",
      className: cls,
      onClick: onPress,
      style: style
    }, rest), children);
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    style: style
  }, rest), children);
}
Object.assign(__ds_scope, { M3Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/M3Card.jsx", error: String((e && e.message) || e) }); }

// components/data-display/M3DataField.jsx
try { (() => {
const CSS = `
.m3-dfield{ display:flex; flex-direction:column; gap:3px; font-family:var(--font-sans);
  padding:0; margin:0; }
.m3-dfield__label{ font-size:var(--text-xs); color:var(--color-text-secondary);
  letter-spacing:var(--tracking-wide); }
.m3-dfield__value{ font-size:var(--text-sm); color:var(--color-text-primary);
  font-weight:var(--weight-medium); margin:0; }
.m3-dfield--mono .m3-dfield__value{ font-family:var(--font-mono);
  font-variant-numeric:tabular-nums; }
.m3-dfield--empty .m3-dfield__value{ color:var(--color-text-disabled);
  font-weight:var(--weight-regular); }
.m3-dfield--inline{ flex-direction:row; align-items:baseline; gap:8px; justify-content:space-between; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-dfield-css")) {
  const s = document.createElement("style");
  s.id = "m3-dfield-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3DataField({
  label,
  value,
  mono = false,
  inline = false,
  emptyFallback = "—"
}) {
  const isEmpty = value == null || value === "";
  return /*#__PURE__*/React.createElement("div", {
    className: ["m3-dfield", mono ? "m3-dfield--mono" : "", inline ? "m3-dfield--inline" : "", isEmpty ? "m3-dfield--empty" : ""].filter(Boolean).join(" ")
  }, /*#__PURE__*/React.createElement("dt", {
    className: "m3-dfield__label"
  }, label), /*#__PURE__*/React.createElement("dd", {
    className: "m3-dfield__value"
  }, isEmpty ? emptyFallback : value));
}
Object.assign(__ds_scope, { M3DataField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/M3DataField.jsx", error: String((e && e.message) || e) }); }

// components/data-display/M3KpiValue.jsx
try { (() => {
const CSS = `
.m3-kpi{ font-family:var(--font-mono); font-variant-numeric:tabular-nums;
  font-weight:var(--weight-bold); color:var(--color-text-primary);
  line-height:1; letter-spacing:-0.01em; }
.m3-kpi--lg{ font-size:var(--text-4xl); }
.m3-kpi--md{ font-size:var(--text-3xl); }
.m3-kpi--sm{ font-size:var(--text-2xl); }
.m3-kpi__unit{ font-family:var(--font-sans); font-size:0.42em; font-weight:var(--weight-medium);
  color:var(--color-text-secondary); margin-left:6px; letter-spacing:0; }
.m3-kpi--empty{ color:var(--color-text-disabled); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-kpi-css")) {
  const s = document.createElement("style");
  s.id = "m3-kpi-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
const PTBR = "pt-BR";
function formatValue(value, format) {
  if (value == null || Number.isNaN(value)) return null;
  switch (format) {
    case "currency":
      // value arrives in cents per the contract
      return new Intl.NumberFormat(PTBR, {
        style: "currency",
        currency: "BRL"
      }).format(value / 100);
    case "percent":
      // value is a 0–1 ratio
      return new Intl.NumberFormat(PTBR, {
        style: "percent",
        maximumFractionDigits: 0
      }).format(value);
    case "decimal":
      return new Intl.NumberFormat(PTBR, {
        maximumFractionDigits: 1
      }).format(value);
    case "integer":
    default:
      return new Intl.NumberFormat(PTBR, {
        maximumFractionDigits: 0
      }).format(value);
  }
}
function M3KpiValue({
  value,
  format = "integer",
  unitLabel,
  size = "md",
  ariaLabel
}) {
  const formatted = formatValue(value, format);
  const empty = formatted == null;
  return /*#__PURE__*/React.createElement("span", {
    className: ["m3-kpi", `m3-kpi--${size}`, empty ? "m3-kpi--empty" : ""].filter(Boolean).join(" "),
    "aria-label": ariaLabel || (empty ? "Sem valor" : `${formatted}${unitLabel ? " " + unitLabel : ""}`)
  }, empty ? "—" : formatted, !empty && unitLabel && /*#__PURE__*/React.createElement("span", {
    className: "m3-kpi__unit"
  }, unitLabel));
}
Object.assign(__ds_scope, { M3KpiValue, formatValue });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/M3KpiValue.jsx", error: String((e && e.message) || e) }); }

// components/data-display/M3PeriodLabel.jsx
try { (() => {
const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTHS_LONG = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** Parse the contract's 3 period formats into display + machine forms. */
function parsePeriod(period, granularity) {
  if (!period) return {
    short: "—",
    long: "—",
    iso: undefined
  };
  if (granularity === "yearly" || /^\d{4}$/.test(period)) {
    return {
      short: period,
      long: period,
      iso: period
    };
  }
  if (granularity === "quarterly" || /^\d{4}-Q[1-4]$/i.test(period)) {
    const [y, q] = period.split("-");
    const qn = q.replace(/Q/i, "");
    return {
      short: `T${qn} ${y}`,
      long: `${qn}º trimestre de ${y}`,
      iso: period
    };
  }
  // monthly "YYYY-MM"
  const [y, m] = period.split("-");
  const mi = Math.max(0, Math.min(11, parseInt(m, 10) - 1));
  return {
    short: `${MONTHS_SHORT[mi]}/${y}`,
    long: `${MONTHS_LONG[mi]} de ${y}`,
    iso: `${y}-${m}`
  };
}
const CSS = `
.m3-period{ font-family:var(--font-sans); }
.m3-period--axis{ font-size:var(--text-xs); color:var(--color-text-secondary); }
.m3-period--inline{ font-size:var(--text-sm); color:var(--color-text-primary); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-period-css")) {
  const s = document.createElement("style");
  s.id = "m3-period-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3PeriodLabel({
  period,
  granularity = "monthly",
  variant = "inline"
}) {
  const p = parsePeriod(period, granularity);
  return /*#__PURE__*/React.createElement("time", {
    className: `m3-period m3-period--${variant}`,
    dateTime: p.iso,
    "aria-label": p.long
  }, variant === "axis" ? p.short : p.long);
}
Object.assign(__ds_scope, { parsePeriod, M3PeriodLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/M3PeriodLabel.jsx", error: String((e && e.message) || e) }); }

// components/data-display/M3KpiCard.jsx
try { (() => {
const CSS = `
.m3-kpicard{ display:flex; flex-direction:column; gap:8px; }
.m3-kpicard__top{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.m3-kpicard__label{ font-size:var(--text-sm); font-weight:var(--weight-semibold);
  color:var(--color-text-primary); }
.m3-kpicard__icon{ font-family:'Material Symbols Rounded'; font-size:22px;
  color:var(--color-action-primary); }
.m3-kpicard__value{ margin-top:2px; }
.m3-kpicard__meta{ display:flex; align-items:center; gap:8px; flex-wrap:wrap;
  font-size:var(--text-xs); color:var(--color-text-secondary); }
.m3-kpicard__foot{ font-size:var(--text-xs); color:var(--color-text-secondary); }
.m3-kpicard__chev{ font-family:'Material Symbols Rounded'; font-size:20px;
  color:var(--color-text-secondary); margin-left:auto; }
.m3-kpicard__skel{ height:34px; width:60%; border-radius:var(--radius-sm);
  background:var(--color-bg-secondary); }
@keyframes m3-pulse{ 0%,100%{ opacity:1; } 50%{ opacity:.5; } }
.m3-kpicard__skel{ animation:m3-pulse 1.4s ease-in-out infinite; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-kpicard-css")) {
  const s = document.createElement("style");
  s.id = "m3-kpicard-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3KpiCard({
  label,
  value,
  format = "integer",
  unitLabel,
  period,
  granularity = "monthly",
  footnote,
  icon,
  href,
  onPress,
  pending = false
}) {
  const clickable = Boolean(href || onPress);
  return /*#__PURE__*/React.createElement(__ds_scope.M3Card, {
    padding: "md",
    href: href,
    onPress: onPress
  }, /*#__PURE__*/React.createElement("div", {
    className: "m3-kpicard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m3-kpicard__top"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "m3-kpicard__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, icon), /*#__PURE__*/React.createElement("span", {
    className: "m3-kpicard__label"
  }, label), clickable && /*#__PURE__*/React.createElement("span", {
    className: "m3-kpicard__chev material-symbols-rounded",
    "aria-hidden": "true"
  }, "chevron_right")), /*#__PURE__*/React.createElement("div", {
    className: "m3-kpicard__value"
  }, pending ? /*#__PURE__*/React.createElement("div", {
    className: "m3-kpicard__skel",
    "aria-hidden": "true"
  }) : /*#__PURE__*/React.createElement(__ds_scope.M3KpiValue, {
    value: value,
    format: format,
    unitLabel: unitLabel,
    size: "md"
  })), /*#__PURE__*/React.createElement("div", {
    className: "m3-kpicard__meta"
  }, period && /*#__PURE__*/React.createElement(__ds_scope.M3PeriodLabel, {
    period: period,
    granularity: granularity,
    variant: "inline"
  })), footnote && /*#__PURE__*/React.createElement("div", {
    className: "m3-kpicard__foot"
  }, footnote)));
}
Object.assign(__ds_scope, { M3KpiCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/M3KpiCard.jsx", error: String((e && e.message) || e) }); }

// components/data-display/M3SectionHeader.jsx
try { (() => {
const CSS = `
.m3-secthead{ display:flex; align-items:flex-end; justify-content:space-between; gap:16px;
  font-family:var(--font-sans); }
.m3-secthead__titles{ min-width:0; flex:1; }
.m3-secthead__title{ font-size:var(--text-xl); font-weight:var(--weight-semibold);
  color:var(--color-text-primary); letter-spacing:var(--tracking-tight);
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.m3-secthead__desc{ font-size:var(--text-sm); color:var(--color-text-secondary);
  margin-top:2px; }
.m3-secthead__action{ flex:none; display:flex; gap:8px; align-items:center; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-secthead-css")) {
  const s = document.createElement("style");
  s.id = "m3-secthead-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3SectionHeader({
  title,
  description,
  action,
  as = "h2"
}) {
  const Title = as;
  return /*#__PURE__*/React.createElement("div", {
    className: "m3-secthead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m3-secthead__titles"
  }, /*#__PURE__*/React.createElement(Title, {
    className: "m3-secthead__title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "m3-secthead__desc"
  }, description)), action && /*#__PURE__*/React.createElement("div", {
    className: "m3-secthead__action"
  }, action));
}
Object.assign(__ds_scope, { M3SectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/M3SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/data-display/M3StatCard.jsx
try { (() => {
const CSS = `
.m3-stat{ display:flex; flex-direction:column; gap:6px; }
.m3-stat__top{ display:flex; align-items:center; gap:8px; }
.m3-stat__icon{ font-family:'Material Symbols Rounded'; font-size:20px; color:var(--color-text-secondary); }
.m3-stat__label{ font-size:var(--text-sm); color:var(--color-text-secondary); font-weight:var(--weight-medium); }
.m3-stat__value{ display:flex; align-items:baseline; gap:6px; }
.m3-stat__tone{ display:inline-flex; align-items:center; gap:5px; align-self:flex-start;
  height:22px; padding:0 9px; border-radius:var(--radius-full); font-size:var(--text-xs);
  font-weight:var(--weight-semibold); margin-top:2px; }
.m3-stat__tone .material-symbols-rounded{ font-size:14px; }
.m3-stat__tone--success{ color:var(--color-success); background:var(--color-success-bg); }
.m3-stat__tone--warning{ color:var(--color-warning); background:var(--color-warning-bg); }
.m3-stat__tone--danger{ color:var(--color-danger); background:var(--color-danger-bg); }
.m3-stat__tone--neutral{ color:var(--color-text-secondary); background:var(--color-bg-secondary); }
.m3-stat__foot{ font-size:var(--text-xs); color:var(--color-text-secondary); }
.m3-stat__skel{ height:30px; width:55%; border-radius:var(--radius-sm); background:var(--color-bg-secondary);
  animation:m3-pulse 1.4s ease-in-out infinite; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-stat-css")) {
  const s = document.createElement("style");
  s.id = "m3-stat-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
const TONE_ICON = {
  success: "check_circle",
  warning: "warning",
  danger: "error",
  neutral: "info"
};
function M3StatCard({
  label,
  value,
  format,
  unit,
  icon,
  tone,
  toneLabel,
  footnote,
  pending = false
}) {
  const numeric = typeof value === "number" || value == null;
  return /*#__PURE__*/React.createElement(__ds_scope.M3Card, {
    padding: "md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m3-stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m3-stat__top"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "m3-stat__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, icon), /*#__PURE__*/React.createElement("span", {
    className: "m3-stat__label"
  }, label)), pending ? /*#__PURE__*/React.createElement("div", {
    className: "m3-stat__skel",
    "aria-hidden": "true"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "m3-stat__value"
  }, numeric ? /*#__PURE__*/React.createElement(__ds_scope.M3KpiValue, {
    value: value,
    format: format || "integer",
    unitLabel: unit,
    size: "sm"
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xl)",
      fontWeight: 700,
      color: "var(--color-text-primary)"
    }
  }, value)), !pending && tone && /*#__PURE__*/React.createElement("span", {
    className: `m3-stat__tone m3-stat__tone--${tone}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, TONE_ICON[tone]), toneLabel), footnote && /*#__PURE__*/React.createElement("div", {
    className: "m3-stat__foot"
  }, footnote)));
}
Object.assign(__ds_scope, { M3StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/M3StatCard.jsx", error: String((e && e.message) || e) }); }

// components/data-display/M3TimelineItem.jsx
try { (() => {
const CSS = `
.m3-timeline{ list-style:none; margin:0; padding:0; }
.m3-tl{ display:grid; grid-template-columns:auto 1fr; gap:14px; }
.m3-tl__rail{ display:flex; flex-direction:column; align-items:center; }
.m3-tl__dot{ width:14px; height:14px; border-radius:50%; flex:none; margin-top:3px;
  background:var(--color-action-primary); display:flex; align-items:center; justify-content:center; }
.m3-tl__dot .material-symbols-rounded{ font-size:10px; color:var(--white); }
.m3-tl__dot--success{ background:var(--color-success); }
.m3-tl__dot--danger{ background:var(--color-danger); }
.m3-tl__dot--info{ background:var(--color-info); }
.m3-tl__dot--neutral{ background:var(--color-border-strong); }
.m3-tl__line{ flex:1; width:2px; background:var(--color-border-default); margin:4px 0; min-height:8px; }
.m3-tl__body{ padding-bottom:18px; min-width:0; }
.m3-tl__title{ font-size:var(--text-sm); font-weight:var(--weight-semibold); color:var(--color-text-primary); }
.m3-tl__meta{ font-size:var(--text-xs); color:var(--color-text-secondary); margin-top:2px;
  display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.m3-tl__actor{ font-family:var(--font-mono); }
.m3-tl__diff{ margin-top:8px; display:flex; flex-direction:column; gap:4px; }
.m3-tl__diffrow{ font-size:var(--text-xs); display:flex; gap:8px; align-items:baseline; }
.m3-tl__field{ color:var(--color-text-secondary); min-width:120px; }
.m3-tl__before{ font-family:var(--font-mono); color:var(--color-text-secondary); text-decoration:line-through; }
.m3-tl__arrow{ font-family:'Material Symbols Rounded'; font-size:14px; color:var(--color-text-disabled); }
.m3-tl__after{ font-family:var(--font-mono); color:var(--color-text-primary); font-weight:var(--weight-medium); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-tl-css")) {
  const s = document.createElement("style");
  s.id = "m3-tl-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3TimelineItem({
  title,
  actor,
  datetime,
  iso,
  icon,
  tone = "default",
  diff,
  last = false
}) {
  const dotTone = tone === "default" ? "" : `m3-tl__dot--${tone}`;
  return /*#__PURE__*/React.createElement("li", {
    className: "m3-tl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m3-tl__rail"
  }, /*#__PURE__*/React.createElement("span", {
    className: `m3-tl__dot ${dotTone}`,
    "aria-hidden": "true"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, icon)), !last && /*#__PURE__*/React.createElement("span", {
    className: "m3-tl__line"
  })), /*#__PURE__*/React.createElement("div", {
    className: "m3-tl__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m3-tl__title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "m3-tl__meta"
  }, actor && /*#__PURE__*/React.createElement("span", {
    className: "m3-tl__actor"
  }, actor), datetime && /*#__PURE__*/React.createElement("time", {
    dateTime: iso
  }, datetime)), diff && diff.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "m3-tl__diff"
  }, diff.map((d, i) => /*#__PURE__*/React.createElement("div", {
    className: "m3-tl__diffrow",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-tl__field"
  }, d.field), /*#__PURE__*/React.createElement("span", {
    className: "m3-tl__before"
  }, d.before), /*#__PURE__*/React.createElement("span", {
    className: "m3-tl__arrow material-symbols-rounded",
    "aria-hidden": "true"
  }, "arrow_forward"), /*#__PURE__*/React.createElement("span", {
    className: "m3-tl__after"
  }, d.after))))));
}
Object.assign(__ds_scope, { M3TimelineItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/M3TimelineItem.jsx", error: String((e && e.message) || e) }); }

// components/dataviz/M3SeriesLegendItem.jsx
try { (() => {
const CSS = `
.m3-legend{ display:inline-flex; align-items:center; gap:7px; font-family:var(--font-sans);
  font-size:var(--text-xs); color:var(--color-text-secondary); border:none; background:none;
  padding:2px 4px; border-radius:var(--radius-xs); }
button.m3-legend{ cursor:pointer; }
button.m3-legend:focus-visible{ outline:var(--focus-ring-width) solid var(--color-focus-ring);
  outline-offset:1px; }
.m3-legend__swatch{ width:12px; height:12px; border-radius:3px; flex:none; }
.m3-legend__swatch--line{ height:3px; border-radius:var(--radius-full); }
.m3-legend--muted{ opacity:.45; }
.m3-legend--muted .m3-legend__swatch{ background:var(--color-text-disabled) !important; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-legend-css")) {
  const s = document.createElement("style");
  s.id = "m3-legend-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3SeriesLegendItem({
  label,
  colorToken,
  shape = "square",
  muted = false,
  onPress
}) {
  const cls = ["m3-legend", muted ? "m3-legend--muted" : ""].filter(Boolean).join(" ");
  const swatch = /*#__PURE__*/React.createElement("span", {
    className: `m3-legend__swatch ${shape === "line" ? "m3-legend__swatch--line" : ""}`,
    style: {
      background: `var(${colorToken})`
    },
    "aria-hidden": "true"
  });
  if (onPress) {
    return /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: cls,
      onClick: onPress,
      "aria-pressed": !muted
    }, swatch, label);
  }
  return /*#__PURE__*/React.createElement("span", {
    className: cls
  }, swatch, label);
}
Object.assign(__ds_scope, { M3SeriesLegendItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/dataviz/M3SeriesLegendItem.jsx", error: String((e && e.message) || e) }); }

// components/feedback/IdpRetryBanner.jsx
try { (() => {
const CSS = `
.idp-retry{ display:flex; align-items:flex-start; gap:12px; padding:14px 16px;
  background:var(--color-idp-failed-bg); border:1px solid var(--color-idp-failed-border);
  border-radius:var(--radius-md); font-family:var(--font-sans); color:var(--color-text-primary); }
.idp-retry__icon{ font-family:'Material Symbols Rounded'; font-size:22px; color:var(--color-idp-failed); flex:none; }
.idp-retry__body{ flex:1; font-size:var(--text-sm); line-height:var(--leading-snug); }
.idp-retry__body strong{ font-weight:var(--weight-semibold); }
.idp-retry__code{ font-family:var(--font-mono); font-size:var(--text-xs); color:var(--color-text-secondary); }
.idp-retry__btn{ flex:none; align-self:center; display:inline-flex; align-items:center; gap:6px;
  height:38px; padding:0 16px; border-radius:var(--radius-full); border:none; cursor:pointer;
  font-family:var(--font-sans); font-size:var(--text-sm); font-weight:var(--weight-semibold);
  background:var(--color-action-primary-tint); color:var(--color-action-primary-tint-fg);
  transition:filter var(--duration-fast) var(--ease-standard); }
.idp-retry__btn:hover{ filter:brightness(.97); }
.idp-retry__btn:disabled{ opacity:.6; cursor:default; }
.idp-retry__btn .material-symbols-rounded{ font-size:18px; }
`;
if (typeof document !== "undefined" && !document.getElementById("idp-retry-css")) {
  const s = document.createElement("style");
  s.id = "idp-retry-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * 207 Multi-Status retry banner. Appears when POST /people created the person
 * but IdP provisioning failed, or when a retry (POST /people/:id/login) returns
 * 502 IDP-001. role="alert"; the button delegates the retry to the ViewModel.
 */
function IdpRetryBanner({
  onRetry,
  isPending = false,
  error
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "idp-retry",
    role: "alert"
  }, /*#__PURE__*/React.createElement("span", {
    className: "idp-retry__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, "sync_problem"), /*#__PURE__*/React.createElement("div", {
    className: "idp-retry__body"
  }, /*#__PURE__*/React.createElement("strong", null, "Pessoa criada, mas o login n\xE3o foi provisionado."), " ", "O provedor de identidade n\xE3o respondeu. Os dados da pessoa est\xE3o salvos \u2014 voc\xEA pode tentar provisionar o login de novo.", error && /*#__PURE__*/React.createElement("div", {
    className: "idp-retry__code"
  }, error)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "idp-retry__btn",
    onClick: onRetry,
    disabled: isPending
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, isPending ? "progress_activity" : "key"), isPending ? "Provisionando…" : "Provisionar login agora"));
}
Object.assign(__ds_scope, { IdpRetryBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/IdpRetryBanner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/LgpdAnonymizedBanner.jsx
try { (() => {
const CSS = `
.m3-lgpd{ display:flex; align-items:flex-start; gap:12px; padding:14px 16px;
  background:var(--color-banner-lgpd-bg); border:1px solid var(--color-banner-lgpd-border);
  border-radius:var(--radius-md); font-family:var(--font-sans); color:var(--color-banner-lgpd-fg); }
.m3-lgpd__icon{ font-family:'Material Symbols Rounded'; font-size:22px; color:var(--color-info); flex:none; }
.m3-lgpd__body{ font-size:var(--text-sm); line-height:var(--leading-snug); }
.m3-lgpd__body strong{ font-weight:var(--weight-semibold); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-lgpd-css")) {
  const s = document.createElement("style");
  s.id = "m3-lgpd-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Permanent banner shown on an LGPD-anonymized record. Not dismissible — PII is
 * hidden and edits are blocked while this is present. role="note".
 */
function LgpdAnonymizedBanner({
  message
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "m3-lgpd",
    role: "note"
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-lgpd__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, "privacy_tip"), /*#__PURE__*/React.createElement("p", {
    className: "m3-lgpd__body"
  }, message || /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "Dados pessoais removidos por solicita\xE7\xE3o LGPD."), " O hist\xF3rico cl\xEDnico e social \xE9 preservado; a edi\xE7\xE3o da avalia\xE7\xE3o est\xE1 bloqueada.")));
}
Object.assign(__ds_scope, { LgpdAnonymizedBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/LgpdAnonymizedBanner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/M3ActiveBadge.jsx
try { (() => {
const CSS = `
.m3-active{ display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 9px 0 7px;
  border-radius:var(--radius-full); font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-semibold); line-height:1; white-space:nowrap; border:1px solid transparent; }
.m3-active--sm{ height:19px; font-size:11px; padding:0 7px 0 6px; }
.m3-active__icon{ font-family:'Material Symbols Rounded'; font-size:15px; line-height:1; }
.m3-active--sm .m3-active__icon{ font-size:13px; }
.m3-active--on{ background:var(--color-person-active-bg); color:var(--color-person-active);
  border-color:var(--color-person-active-border); }
.m3-active--off{ background:var(--color-person-inactive-bg); color:var(--color-person-inactive);
  border-color:var(--color-person-inactive-border); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-active-css")) {
  const s = document.createElement("style");
  s.id = "m3-active-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Active / inactive state badge — a 1:1 image of the domain `active` boolean
 * (Person and SystemRole). No third state. Always colour + icon + label so it
 * stays legible without colour (daltonism / AA).
 */
function M3ActiveBadge({
  active,
  size = "md",
  labels
}) {
  const l = labels || {
    on: "Ativa",
    off: "Inativa"
  };
  return /*#__PURE__*/React.createElement("span", {
    className: ["m3-active", active ? "m3-active--on" : "m3-active--off", size === "sm" ? "m3-active--sm" : ""].filter(Boolean).join(" ")
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-active__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, active ? "check_circle" : "pause_circle"), active ? l.on : l.off);
}
Object.assign(__ds_scope, { M3ActiveBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/M3ActiveBadge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/M3Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.m3-badge{ display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 9px;
  border-radius:var(--radius-full); font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-semibold); line-height:1; white-space:nowrap;
  border:1px solid transparent; }
.m3-badge__dot{ width:7px; height:7px; border-radius:50%; background:currentColor; }
.m3-badge__icon{ font-family:'Material Symbols Rounded'; font-size:14px; }
.m3-badge--neutral{ background:var(--color-bg-secondary); color:var(--color-text-secondary);
  border-color:var(--color-border-default); }
.m3-badge--primary{ background:var(--color-action-primary-tint); color:var(--color-action-primary-tint-fg); }
.m3-badge--success{ background:var(--color-success-bg); color:var(--color-success);
  border-color:var(--color-success-border); }
.m3-badge--warning{ background:var(--color-warning-bg); color:var(--color-warning);
  border-color:var(--color-warning-border); }
.m3-badge--danger{ background:var(--color-danger-bg); color:var(--color-danger);
  border-color:var(--color-danger-border); }
.m3-badge--info{ background:var(--color-info-bg); color:var(--color-info);
  border-color:var(--color-info-border); }
.m3-badge--solid{ border-color:transparent; color:var(--white); }
.m3-badge--solid.m3-badge--primary{ background:var(--color-action-primary); }
.m3-badge--solid.m3-badge--danger{ background:var(--color-danger); }
.m3-badge--solid.m3-badge--success{ background:var(--color-success); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-badge-css")) {
  const s = document.createElement("style");
  s.id = "m3-badge-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3Badge({
  variant = "neutral",
  solid = false,
  dot = false,
  icon,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ["m3-badge", `m3-badge--${variant}`, solid ? "m3-badge--solid" : ""].filter(Boolean).join(" ")
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "m3-badge__dot",
    "aria-hidden": "true"
  }), icon && /*#__PURE__*/React.createElement("span", {
    className: "m3-badge__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, icon), children);
}
Object.assign(__ds_scope, { M3Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/M3Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/M3Dialog.jsx
try { (() => {
const CSS = `
.m3-dialog__scrim{ position:fixed; inset:0; background:var(--color-overlay);
  display:flex; align-items:center; justify-content:center; padding:24px; z-index:var(--z-modal);
  animation:m3-dialog-fade var(--duration-normal) var(--ease-standard); }
.m3-dialog{ background:var(--color-bg-elevated); border-radius:var(--radius-xl);
  box-shadow:var(--shadow-lg); width:100%; max-width:440px; max-height:90vh; overflow:auto;
  font-family:var(--font-sans); animation:m3-dialog-pop var(--duration-normal) var(--ease-standard); }
.m3-dialog__head{ padding:24px 24px 8px; display:flex; gap:12px; align-items:flex-start; }
.m3-dialog__icon{ font-family:'Material Symbols Rounded'; font-size:24px; flex:none;
  color:var(--color-action-primary); }
.m3-dialog--destructive .m3-dialog__icon{ color:var(--color-danger); }
.m3-dialog__title{ font-size:var(--text-xl); font-weight:var(--weight-bold);
  color:var(--color-text-primary); letter-spacing:var(--tracking-tight); }
.m3-dialog__body{ padding:0 24px 8px; font-size:var(--text-sm); color:var(--color-text-secondary);
  line-height:var(--leading-snug); }
.m3-dialog__content{ padding:12px 24px 4px; }
.m3-dialog__actions{ padding:16px 24px 24px; display:flex; gap:8px; justify-content:flex-end; }
@keyframes m3-dialog-fade{ from{ opacity:0; } }
@keyframes m3-dialog-pop{ from{ opacity:0; transform:translateY(8px) scale(.98); } }
@media (prefers-reduced-motion: reduce){ .m3-dialog,.m3-dialog__scrim{ animation:none; } }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-dialog-css")) {
  const s = document.createElement("style");
  s.id = "m3-dialog-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3Dialog({
  open,
  title,
  description,
  icon,
  destructive = false,
  children,
  actions,
  onClose
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", onKey);
    if (ref.current) ref.current.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "m3-dialog__scrim",
    onMouseDown: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: ["m3-dialog", destructive ? "m3-dialog--destructive" : ""].filter(Boolean).join(" "),
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    tabIndex: -1,
    ref: ref
  }, /*#__PURE__*/React.createElement("div", {
    className: "m3-dialog__head"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "m3-dialog__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, icon), /*#__PURE__*/React.createElement("h2", {
    className: "m3-dialog__title"
  }, title)), description && /*#__PURE__*/React.createElement("p", {
    className: "m3-dialog__body"
  }, description), children && /*#__PURE__*/React.createElement("div", {
    className: "m3-dialog__content"
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    className: "m3-dialog__actions"
  }, actions)));
}
Object.assign(__ds_scope, { M3Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/M3Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/M3LoginIndicator.jsx
try { (() => {
const CSS = `
.m3-login{ display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 9px 0 7px;
  border-radius:var(--radius-full); font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-semibold); line-height:1; white-space:nowrap; border:1px solid transparent; }
.m3-login__icon{ font-family:'Material Symbols Rounded'; font-size:15px; line-height:1; }
.m3-login--linked{ background:var(--color-idp-linked-bg); color:var(--color-idp-linked); }
.m3-login--none{ background:var(--color-idp-none-bg); color:var(--color-idp-none); }
.m3-login--failed{ background:var(--color-idp-failed-bg); color:var(--color-idp-failed);
  border-color:var(--color-idp-failed-border); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-login-css")) {
  const s = document.createElement("style");
  s.id = "m3-login-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
const MAP = {
  linked: {
    icon: "key",
    label: "Tem login"
  },
  none: {
    icon: "key_off",
    label: "Sem login"
  },
  failed: {
    icon: "warning",
    label: "Provisão falhou"
  }
};

/**
 * "Tem login" indicator — derived in the ViewModel from idpUserId:
 * present → "linked", null → "none", null + a 207 creation flag in the current
 * session → "failed". Not an alert itself (the IdpRetryBanner owns the alert).
 */
function M3LoginIndicator({
  state = "none"
}) {
  const m = MAP[state] || MAP.none;
  return /*#__PURE__*/React.createElement("span", {
    className: `m3-login m3-login--${state}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-login__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, m.icon), m.label);
}
Object.assign(__ds_scope, { M3LoginIndicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/M3LoginIndicator.jsx", error: String((e && e.message) || e) }); }

// components/feedback/M3RiskChip.jsx
try { (() => {
const CSS = `
.m3-riskchip{ display:inline-flex; align-items:center; gap:5px; height:24px; padding:0 9px;
  border-radius:var(--radius-full); font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-semibold); line-height:1; white-space:nowrap; }
.m3-riskchip__icon{ font-family:'Material Symbols Rounded'; font-size:15px; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-riskchip-css")) {
  const s = document.createElement("style");
  s.id = "m3-riskchip-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
const MAP = {
  violation: {
    label: "Violação de direitos",
    icon: "gavel",
    fg: "--color-risk-violation",
    bg: "--color-risk-violation-bg"
  },
  overcrowding: {
    label: "Sobrelotação",
    icon: "home",
    fg: "--color-risk-overcrowding",
    bg: "--color-risk-overcrowding-bg"
  },
  dropout: {
    label: "Evasão escolar",
    icon: "school",
    fg: "--color-risk-delay",
    bg: "--color-risk-delay-bg"
  },
  prenatal: {
    label: "Pré-natal pendente",
    icon: "pregnant_woman",
    fg: "--color-risk-prenatal",
    bg: "--color-risk-prenatal-bg"
  },
  default: {
    label: "Atenção",
    icon: "flag",
    fg: "--color-risk-default",
    bg: "--color-risk-default-bg"
  }
};
function M3RiskChip({
  risk = "default",
  label,
  icon
}) {
  const m = MAP[risk] || MAP.default;
  return /*#__PURE__*/React.createElement("span", {
    className: "m3-riskchip",
    style: {
      color: `var(${m.fg})`,
      background: `var(${m.bg})`
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-riskchip__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, icon || m.icon), label || m.label);
}
Object.assign(__ds_scope, { M3RiskChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/M3RiskChip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/M3RoleBadge.jsx
try { (() => {
const CSS = `
.m3-role{ display:inline-flex; align-items:center; gap:6px; height:24px; padding:0 10px;
  border-radius:var(--radius-full); font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-medium); line-height:1; white-space:nowrap;
  background:var(--color-bg-elevated); border:1px solid var(--color-border-default);
  color:var(--color-text-primary); }
.m3-role__dot{ width:7px; height:7px; border-radius:50%; background:var(--color-person-active); flex:none; }
.m3-role--inactive{ color:var(--color-text-disabled); border-style:dashed; }
.m3-role--inactive .m3-role__dot{ background:var(--color-person-inactive); }
.m3-role--raw{ font-family:var(--font-mono); font-variant-numeric:tabular-nums; }
.m3-role__sys{ color:var(--color-text-secondary); font-weight:var(--weight-regular); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-role-css")) {
  const s = document.createElement("style");
  s.id = "m3-role-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
const SYSTEMS = {
  "social-care": "Social Care",
  "queue-manager": "Fila",
  therapies: "Terapias",
  timesheet: "Ponto"
};
const ROLES = {
  patient: "Paciente",
  professional: "Profissional",
  "family-member": "Membro da família",
  employee: "Funcionário",
  therapist: "Terapeuta"
};

/**
 * `system:role` vínculo badge. Known systems/roles render a PT-BR label
 * ("Paciente · Social Care"); an unknown pair (the backend lists are not
 * exhaustive) falls back to the raw `system:role` identifier in mono, never
 * breaking. Inactive vínculos render dashed + muted.
 */
function M3RoleBadge({
  system,
  role,
  active = true
}) {
  const sysLabel = SYSTEMS[system];
  const roleLabel = ROLES[role];
  const known = sysLabel && roleLabel;
  const raw = `${system}:${role}`;
  return /*#__PURE__*/React.createElement("span", {
    className: ["m3-role", !active ? "m3-role--inactive" : "", !known ? "m3-role--raw" : ""].filter(Boolean).join(" "),
    title: raw,
    "aria-label": `Vínculo ${roleLabel || role} em ${sysLabel || system}, ${active ? "ativo" : "inativo"}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-role__dot",
    "aria-hidden": "true"
  }), known ? /*#__PURE__*/React.createElement(React.Fragment, null, roleLabel, /*#__PURE__*/React.createElement("span", {
    className: "m3-role__sys"
  }, "\xB7 ", sysLabel)) : raw);
}
Object.assign(__ds_scope, { M3RoleBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/M3RoleBadge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/M3StatusChip.jsx
try { (() => {
const CSS = `
.m3-statuschip{ display:inline-flex; align-items:center; gap:6px; height:26px; padding:0 11px;
  border-radius:var(--radius-full); font-family:var(--font-sans); font-size:var(--text-xs);
  font-weight:var(--weight-semibold); line-height:1; white-space:nowrap; }
.m3-statuschip__icon{ font-family:'Material Symbols Rounded'; font-size:16px; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-statuschip-css")) {
  const s = document.createElement("style");
  s.id = "m3-statuschip-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
const MAP = {
  waitlisted: {
    label: "Fila de espera",
    icon: "schedule",
    fg: "--color-status-fila",
    bg: "--color-status-fila-bg"
  },
  active: {
    label: "Acolhido",
    icon: "check_circle",
    fg: "--color-status-acolhido",
    bg: "--color-status-acolhido-bg"
  },
  discharged: {
    label: "Alta",
    icon: "arrow_upward",
    fg: "--color-status-alta",
    bg: "--color-status-alta-bg"
  },
  withdrawn: {
    label: "Desistente",
    icon: "cancel",
    fg: "--color-status-desistente",
    bg: "--color-status-desistente-bg"
  }
};
function M3StatusChip({
  status,
  label
}) {
  const m = MAP[status] || MAP.withdrawn;
  return /*#__PURE__*/React.createElement("span", {
    className: "m3-statuschip",
    style: {
      color: `var(${m.fg})`,
      background: `var(${m.bg})`
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-statuschip__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, m.icon), label || m.label);
}
Object.assign(__ds_scope, { M3StatusChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/M3StatusChip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/SuppressionBanner.jsx
try { (() => {
const CSS = `
.m3-supp{ display:flex; align-items:flex-start; gap:12px; padding:14px 16px;
  background:var(--color-banner-suppression-bg); border:1px solid var(--color-banner-suppression-border);
  border-radius:var(--radius-md); font-family:var(--font-sans);
  color:var(--color-banner-suppression-fg); }
.m3-supp--compact{ padding:9px 12px; gap:9px; border-radius:var(--radius-sm); }
.m3-supp__icon{ font-family:'Material Symbols Rounded'; font-size:22px; color:var(--color-info);
  flex:none; }
.m3-supp--compact .m3-supp__icon{ font-size:18px; }
.m3-supp__body{ flex:1; font-size:var(--text-sm); line-height:var(--leading-snug); }
.m3-supp--compact .m3-supp__body{ font-size:var(--text-xs); }
.m3-supp__body strong{ font-weight:var(--weight-semibold); }
.m3-supp__link{ margin-left:6px; color:var(--color-info); font-weight:var(--weight-semibold);
  text-decoration:underline; text-underline-offset:2px; cursor:pointer; background:none;
  border:none; font:inherit; padding:0; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-supp-css")) {
  const s = document.createElement("style");
  s.id = "m3-supp-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Privacy suppression banner. Renders ONLY when suppressedGroups > 0. This is a
 * compliance invariant (LGPD Art. 12) — there is intentionally no prop to hide
 * it. role="note" + aria-live="polite" (informative, not an alert).
 */
function SuppressionBanner({
  suppressedGroups,
  kThreshold = 5,
  compact = false,
  onLearnMore
}) {
  if (!suppressedGroups || suppressedGroups <= 0) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: ["m3-supp", compact ? "m3-supp--compact" : ""].filter(Boolean).join(" "),
    role: "note",
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-supp__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, "shield_lock"), /*#__PURE__*/React.createElement("p", {
    className: "m3-supp__body"
  }, /*#__PURE__*/React.createElement("strong", null, suppressedGroups, " grupo", suppressedGroups === 1 ? "" : "s"), " ", "com menos de ", kThreshold, " pessoas", " ", suppressedGroups === 1 ? "foi omitido" : "foram omitidos", " para proteger a privacidade ", /*#__PURE__*/React.createElement("strong", null, "(K-anonimato, K=", kThreshold, ")"), ".", onLearnMore && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "m3-supp__link",
    onClick: onLearnMore
  }, "Entenda")));
}
Object.assign(__ds_scope, { SuppressionBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/SuppressionBanner.jsx", error: String((e && e.message) || e) }); }

// components/forms/M3Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Inject component CSS once (self-contained, React-only, tokens via CSS vars). */
const CSS = `
.m3-btn{
  --_h:40px; --_px:24px; --_fs:var(--text-sm);
  position:relative; isolation:isolate; display:inline-flex; align-items:center;
  justify-content:center; gap:8px; height:var(--_h); padding:0 var(--_px);
  border-radius:var(--radius-full); border:none; cursor:pointer;
  font-family:var(--font-sans); font-size:var(--_fs); font-weight:var(--weight-semibold);
  letter-spacing:.01em; line-height:1; white-space:nowrap; text-decoration:none;
  transition:background var(--duration-fast) var(--ease-standard),
             box-shadow var(--duration-fast) var(--ease-standard),
             color var(--duration-fast) var(--ease-standard);
}
.m3-btn::after{ content:""; position:absolute; inset:0; border-radius:inherit;
  background:currentColor; opacity:0; transition:opacity var(--duration-fast); z-index:-1; }
.m3-btn:hover::after{ opacity:var(--state-hover); }
.m3-btn:active::after{ opacity:var(--state-pressed); }
.m3-btn:focus-visible{ outline:var(--focus-ring-width) solid var(--color-focus-ring);
  outline-offset:2px; }
.m3-btn--sm{ --_h:32px; --_px:16px; --_fs:var(--text-xs); }

.m3-btn--filled{ background:var(--color-action-primary); color:var(--color-action-primary-fg); }
.m3-btn--filled:hover{ background:var(--color-action-primary-hover); }
.m3-btn--filled:active{ background:var(--color-action-primary-active); }
.m3-btn--filled::after{ background:var(--white); }

.m3-btn--tonal{ background:var(--color-action-primary-tint); color:var(--color-action-primary-tint-fg); }
.m3-btn--tonal::after{ background:var(--color-action-primary); }

.m3-btn--outlined{ background:transparent; color:var(--color-text-primary);
  border:1.5px solid var(--color-border-strong); }
.m3-btn--outlined::after{ background:var(--color-text-primary); }

.m3-btn--text{ background:transparent; color:var(--color-action-primary); padding:0 12px; }
.m3-btn--text::after{ background:var(--color-action-primary); }

.m3-btn--destructive{ background:var(--color-danger); color:var(--white); }
.m3-btn--destructive::after{ background:var(--white); }

.m3-btn[disabled]{ cursor:not-allowed; background:var(--color-bg-secondary);
  color:var(--color-text-disabled); border-color:transparent; box-shadow:none; }
.m3-btn[disabled]::after{ opacity:0; }
.m3-btn--text[disabled],.m3-btn--outlined[disabled]{ background:transparent; }

.m3-btn .m3-btn__icon{ font-family:'Material Symbols Rounded'; font-size:18px;
  line-height:1; font-weight:normal; }
.m3-btn .m3-btn__spin{ width:16px; height:16px; border-radius:50%;
  border:2px solid currentColor; border-top-color:transparent; opacity:.7;
  animation:m3-spin .7s linear infinite; }
@keyframes m3-spin{ to{ transform:rotate(360deg); } }
@media (prefers-reduced-motion: reduce){ .m3-btn .m3-btn__spin{ animation-duration:1.4s; } }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-btn-css")) {
  const s = document.createElement("style");
  s.id = "m3-btn-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3Button({
  variant = "filled",
  size = "md",
  type = "button",
  disabled = false,
  pending = false,
  icon,
  iconTrailing,
  onPress,
  children,
  ...rest
}) {
  const cls = ["m3-btn", `m3-btn--${variant}`, size === "sm" ? "m3-btn--sm" : ""].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    disabled: disabled || pending,
    "aria-disabled": disabled || pending || undefined,
    "aria-busy": pending || undefined,
    onClick: onPress
  }, rest), pending && /*#__PURE__*/React.createElement("span", {
    className: "m3-btn__spin",
    "aria-hidden": "true"
  }), !pending && icon && /*#__PURE__*/React.createElement("span", {
    className: "m3-btn__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, icon), children, !pending && iconTrailing && /*#__PURE__*/React.createElement("span", {
    className: "m3-btn__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, iconTrailing));
}
Object.assign(__ds_scope, { M3Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/M3Button.jsx", error: String((e && e.message) || e) }); }

// components/feedback/M3EmptyState.jsx
try { (() => {
const CSS = `
.m3-empty{ display:flex; flex-direction:column; align-items:center; text-align:center;
  gap:10px; padding:48px 24px; font-family:var(--font-sans); }
.m3-empty__icon{ font-family:'Material Symbols Rounded'; font-size:40px;
  color:var(--color-text-disabled); }
.m3-empty--privacy .m3-empty__icon{ color:var(--color-info); }
.m3-empty--unavailable .m3-empty__icon{ color:var(--color-danger); }
.m3-empty__title{ font-size:var(--text-lg); font-weight:var(--weight-semibold);
  color:var(--color-text-primary); }
.m3-empty__desc{ font-size:var(--text-sm); color:var(--color-text-secondary);
  max-width:42ch; line-height:var(--leading-snug); }
.m3-empty__action{ margin-top:6px; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-empty-css")) {
  const s = document.createElement("style");
  s.id = "m3-empty-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
const ICONS = {
  default: "inbox",
  privacy: "shield_lock",
  unavailable: "cloud_off"
};
function M3EmptyState({
  variant = "default",
  icon,
  title,
  description,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `m3-empty m3-empty--${variant}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-empty__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, icon || ICONS[variant] || ICONS.default), /*#__PURE__*/React.createElement("h3", {
    className: "m3-empty__title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "m3-empty__desc"
  }, description), action && /*#__PURE__*/React.createElement("div", {
    className: "m3-empty__action"
  }, /*#__PURE__*/React.createElement(__ds_scope.M3Button, {
    variant: variant === "unavailable" ? "tonal" : "text",
    icon: action.icon,
    onPress: action.onPress
  }, action.label)));
}
Object.assign(__ds_scope, { M3EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/M3EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/dataviz/AgePyramidChart.jsx
try { (() => {
const BANDS = ["0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80+"];
const SEX_LABEL = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  UNKNOWN: "Sem registro"
};
const CSS = `
.m3-pyr{ font-family:var(--font-sans); }
.m3-pyr__legend{ display:flex; gap:16px; justify-content:center; margin-bottom:12px; flex-wrap:wrap; }
.m3-pyr__svg{ width:100%; display:block; }
.m3-pyr__band{ font-family:var(--font-mono); font-size:11px; fill:var(--color-text-secondary); }
.m3-pyr__val{ font-family:var(--font-mono); font-size:10px; fill:var(--color-text-primary); }
.m3-pyr__axis{ stroke:var(--chart-grid); stroke-width:1; }
.m3-pyr__bar{ transition:opacity var(--duration-fast); outline:none; }
.m3-pyr__bar:hover, .m3-pyr__bar:focus-visible{ opacity:.78; }
.m3-pyr__bar:focus-visible{ stroke:var(--color-focus-ring); stroke-width:2; }
.m3-pyr__unknown{ text-align:center; font-size:var(--text-xs); color:var(--color-text-secondary);
  margin-top:8px; }
.m3-pyr__table{ width:100%; border-collapse:collapse; font-size:var(--text-sm); margin-top:8px; }
.m3-pyr__table caption{ text-align:left; font-size:var(--text-xs); color:var(--color-text-secondary);
  margin-bottom:6px; }
.m3-pyr__table th, .m3-pyr__table td{ text-align:left; padding:5px 10px;
  border-bottom:1px solid var(--color-border-default); }
.m3-pyr__table td.num{ font-family:var(--font-mono); text-align:right; font-variant-numeric:tabular-nums; }
.m3-pyr__toolbar{ display:flex; justify-content:center; margin-top:10px; }
.m3-pyr__skel{ height:var(--chart-h-pyramid); border-radius:var(--radius-md);
  background:var(--color-bg-secondary); animation:m3-pulse 1.4s ease-in-out infinite; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-pyr-css")) {
  const s = document.createElement("style");
  s.id = "m3-pyr-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function AgePyramidChart({
  items = [],
  suppressedGroups = 0,
  pending = false,
  error,
  onRetry
}) {
  const [asTable, setAsTable] = React.useState(false);
  if (pending) return /*#__PURE__*/React.createElement("div", {
    className: "m3-pyr__skel",
    "aria-hidden": "true"
  });
  if (error) {
    return /*#__PURE__*/React.createElement(__ds_scope.M3EmptyState, {
      variant: "unavailable",
      title: "N\xE3o foi poss\xEDvel carregar a pir\xE2mide et\xE1ria",
      description: error,
      action: onRetry ? {
        label: "Tentar de novo",
        onPress: onRetry,
        icon: "refresh"
      } : undefined
    });
  }
  if (!items.length) {
    return /*#__PURE__*/React.createElement(__ds_scope.M3EmptyState, {
      variant: suppressedGroups > 0 ? "privacy" : "default",
      title: suppressedGroups > 0 ? "Dados omitidos por privacidade" : "Sem dados no período",
      description: suppressedGroups > 0 ? `Todos os grupos do recorte têm menos de 5 pessoas (K=5).` : "Amplie o período para ver resultados."
    });
  }

  // Aggregate by band + sex
  const byBand = {};
  let max = 0;
  let unknownTotal = 0;
  for (const it of items) {
    const b = byBand[it.ageBand] = byBand[it.ageBand] || {
      MALE: 0,
      FEMALE: 0,
      UNKNOWN: 0
    };
    b[it.sex] = (b[it.sex] || 0) + it.value;
    if (it.sex === "UNKNOWN") unknownTotal += it.value;
  }
  for (const band of BANDS) {
    const b = byBand[band];
    if (b) max = Math.max(max, b.MALE, b.FEMALE);
  }
  max = max || 1;

  // Geometry (viewBox units)
  const rowH = 22;
  const gap = 4;
  const labelW = 56;
  const halfW = 230;
  const pad = 8;
  const rows = [...BANDS].reverse(); // oldest at top
  const cx = pad + halfW;
  const h = rows.length * (rowH + gap) + pad;
  const vbW = pad * 2 + halfW * 2 + labelW;
  function bar(value, side, y) {
    const w = value / max * (halfW - 4);
    const x = side === "MALE" ? cx - labelW / 2 - w : cx + labelW / 2;
    const token = side === "MALE" ? "--chart-sex-male" : "--chart-sex-female";
    if (!value) return null;
    return /*#__PURE__*/React.createElement("g", {
      key: side
    }, /*#__PURE__*/React.createElement("rect", {
      className: "m3-pyr__bar",
      x: x,
      y: y,
      width: w,
      height: rowH,
      rx: "3",
      fill: `var(${token})`,
      tabIndex: 0,
      role: "img",
      "aria-label": `${SEX_LABEL[side]}, faixa ${rows[Math.round((y - pad) / (rowH + gap))]}, ${value} pessoas`
    }, /*#__PURE__*/React.createElement("title", null, `${SEX_LABEL[side]} · ${value}`)), /*#__PURE__*/React.createElement("text", {
      className: "m3-pyr__val",
      x: side === "MALE" ? x - 4 : x + w + 4,
      y: y + rowH / 2 + 3,
      textAnchor: side === "MALE" ? "end" : "start"
    }, value));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "m3-pyr"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m3-pyr__legend"
  }, /*#__PURE__*/React.createElement(__ds_scope.M3SeriesLegendItem, {
    label: "Masculino",
    colorToken: "--chart-sex-male"
  }), /*#__PURE__*/React.createElement(__ds_scope.M3SeriesLegendItem, {
    label: "Feminino",
    colorToken: "--chart-sex-female"
  }), unknownTotal > 0 && /*#__PURE__*/React.createElement(__ds_scope.M3SeriesLegendItem, {
    label: "Sem registro",
    colorToken: "--chart-sex-unknown"
  })), asTable ? /*#__PURE__*/React.createElement("table", {
    className: "m3-pyr__table"
  }, /*#__PURE__*/React.createElement("caption", null, "Pir\xE2mide et\xE1ria \u2014 dados por faixa e sexo"), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Faixa"), /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Masculino"), /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Feminino"), unknownTotal > 0 && /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Sem registro"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(band => {
    const b = byBand[band] || {};
    return /*#__PURE__*/React.createElement("tr", {
      key: band
    }, /*#__PURE__*/React.createElement("th", {
      scope: "row",
      style: {
        fontWeight: 500
      }
    }, band), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, b.MALE || 0), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, b.FEMALE || 0), unknownTotal > 0 && /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, b.UNKNOWN || 0));
  }))) : /*#__PURE__*/React.createElement("svg", {
    className: "m3-pyr__svg",
    viewBox: `0 0 ${vbW} ${h}`,
    role: "img",
    "aria-label": "Pir\xE2mide et\xE1ria por faixa e sexo. Use a tabela para os valores exatos."
  }, /*#__PURE__*/React.createElement("line", {
    className: "m3-pyr__axis",
    x1: cx,
    y1: pad,
    x2: cx,
    y2: h - pad
  }), rows.map((band, i) => {
    const y = pad + i * (rowH + gap);
    const b = byBand[band] || {};
    return /*#__PURE__*/React.createElement("g", {
      key: band
    }, bar(b.MALE, "MALE", y), bar(b.FEMALE, "FEMALE", y), /*#__PURE__*/React.createElement("text", {
      className: "m3-pyr__band",
      x: cx,
      y: y + rowH / 2 + 4,
      textAnchor: "middle"
    }, band));
  })), unknownTotal > 0 && !asTable && /*#__PURE__*/React.createElement("p", {
    className: "m3-pyr__unknown"
  }, unknownTotal, " ", unknownTotal === 1 ? "registro" : "registros", " sem sexo informado"), /*#__PURE__*/React.createElement("div", {
    className: "m3-pyr__toolbar"
  }, /*#__PURE__*/React.createElement(__ds_scope.M3Button, {
    variant: "text",
    icon: asTable ? "bar_chart" : "table",
    onPress: () => setAsTable(v => !v)
  }, asTable ? "Ver como gráfico" : "Ver como tabela")));
}
Object.assign(__ds_scope, { AgePyramidChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/dataviz/AgePyramidChart.jsx", error: String((e && e.message) || e) }); }

// components/dataviz/TopNBarChart.jsx
try { (() => {
const CSS = `
.m3-bars{ font-family:var(--font-sans); }
.m3-bars__list{ display:flex; flex-direction:column; gap:12px; }
.m3-bars__row{ display:grid; grid-template-columns:1fr; gap:4px; }
.m3-bars__head{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; }
.m3-bars__label{ font-size:var(--text-sm); color:var(--color-text-primary);
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.m3-bars__code{ font-family:var(--font-mono); color:var(--color-text-secondary); margin-right:6px; }
.m3-bars__value{ font-family:var(--font-mono); font-variant-numeric:tabular-nums;
  font-weight:var(--weight-semibold); color:var(--color-text-primary); flex:none; }
.m3-bars__track{ height:14px; border-radius:var(--radius-full); background:var(--color-bg-secondary);
  overflow:hidden; }
.m3-bars__fill{ height:100%; border-radius:var(--radius-full); min-width:3px;
  outline:none; transition:opacity var(--duration-fast); }
.m3-bars__fill:hover, .m3-bars__fill:focus-visible{ opacity:.8; }
.m3-bars__fill:focus-visible{ box-shadow:0 0 0 2px var(--color-focus-ring); }
.m3-bars__table{ width:100%; border-collapse:collapse; font-size:var(--text-sm); }
.m3-bars__table caption{ text-align:left; font-size:var(--text-xs); color:var(--color-text-secondary);
  margin-bottom:6px; }
.m3-bars__table th, .m3-bars__table td{ text-align:left; padding:5px 10px;
  border-bottom:1px solid var(--color-border-default); }
.m3-bars__table td.num{ font-family:var(--font-mono); text-align:right; font-variant-numeric:tabular-nums; }
.m3-bars__table td.code{ font-family:var(--font-mono); color:var(--color-text-secondary); }
.m3-bars__toolbar{ display:flex; justify-content:center; margin-top:14px; }
.m3-bars__skel{ height:var(--chart-h-bars); border-radius:var(--radius-md);
  background:var(--color-bg-secondary); animation:m3-pulse 1.4s ease-in-out infinite; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-bars-css")) {
  const s = document.createElement("style");
  s.id = "m3-bars-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function TopNBarChart({
  items = [],
  fixedOrder = false,
  suppressedGroups = 0,
  unitLabel,
  pending = false,
  error,
  onRetry,
  caption = "Ranking — dados por categoria"
}) {
  const [asTable, setAsTable] = React.useState(false);
  if (pending) return /*#__PURE__*/React.createElement("div", {
    className: "m3-bars__skel",
    "aria-hidden": "true"
  });
  if (error) {
    return /*#__PURE__*/React.createElement(__ds_scope.M3EmptyState, {
      variant: "unavailable",
      title: "N\xE3o foi poss\xEDvel carregar o gr\xE1fico",
      description: error,
      action: onRetry ? {
        label: "Tentar de novo",
        onPress: onRetry,
        icon: "refresh"
      } : undefined
    });
  }
  if (!items.length) {
    return /*#__PURE__*/React.createElement(__ds_scope.M3EmptyState, {
      variant: suppressedGroups > 0 ? "privacy" : "default",
      title: suppressedGroups > 0 ? "Dados omitidos por privacidade" : "Sem dados no período",
      description: suppressedGroups > 0 ? "As categorias com menos de 5 pessoas (K=5) ficam fora do ranking." : "Amplie o período para ver resultados."
    });
  }
  const ordered = fixedOrder ? items : [...items].sort((a, b) => b.value - a.value);
  const max = Math.max(...ordered.map(d => d.value), 1);
  const colorFor = i => `var(--chart-cat-${i % 8 + 1})`;
  return /*#__PURE__*/React.createElement("div", {
    className: "m3-bars"
  }, asTable ? /*#__PURE__*/React.createElement("table", {
    className: "m3-bars__table"
  }, /*#__PURE__*/React.createElement("caption", null, caption), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "#"), /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "C\xF3digo"), /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Categoria"), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    style: {
      textAlign: "right"
    }
  }, "Valor"))), /*#__PURE__*/React.createElement("tbody", null, ordered.map((d, i) => /*#__PURE__*/React.createElement("tr", {
    key: d.code || d.label
  }, /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, i + 1), /*#__PURE__*/React.createElement("td", {
    className: "code"
  }, d.code || "—"), /*#__PURE__*/React.createElement("th", {
    scope: "row",
    style: {
      fontWeight: 500
    }
  }, d.label), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, d.value.toLocaleString("pt-BR")))))) : /*#__PURE__*/React.createElement("ol", {
    className: "m3-bars__list",
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, ordered.map((d, i) => /*#__PURE__*/React.createElement("li", {
    className: "m3-bars__row",
    key: d.code || d.label
  }, /*#__PURE__*/React.createElement("div", {
    className: "m3-bars__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-bars__label"
  }, d.code && /*#__PURE__*/React.createElement("span", {
    className: "m3-bars__code"
  }, d.code), d.label), /*#__PURE__*/React.createElement("span", {
    className: "m3-bars__value"
  }, d.value.toLocaleString("pt-BR"), unitLabel ? ` ${unitLabel}` : "")), /*#__PURE__*/React.createElement("div", {
    className: "m3-bars__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m3-bars__fill",
    style: {
      width: `${d.value / max * 100}%`,
      background: colorFor(i)
    },
    tabIndex: 0,
    role: "img",
    "aria-label": `${i + 1}º: ${d.code ? d.code + " — " : ""}${d.label}, ${d.value} ${unitLabel || ""}`
  }, /*#__PURE__*/React.createElement("title", null, `${d.label} · ${d.value}`)))))), /*#__PURE__*/React.createElement("div", {
    className: "m3-bars__toolbar"
  }, /*#__PURE__*/React.createElement(__ds_scope.M3Button, {
    variant: "text",
    icon: asTable ? "bar_chart" : "table",
    onPress: () => setAsTable(v => !v)
  }, asTable ? "Ver como gráfico" : "Ver como tabela")));
}
Object.assign(__ds_scope, { TopNBarChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/dataviz/TopNBarChart.jsx", error: String((e && e.message) || e) }); }

// components/forms/M3ChoiceChip.jsx
try { (() => {
const CSS = `
.m3-chips{ display:inline-flex; gap:8px; flex-wrap:wrap; }
.m3-chip{ position:relative; isolation:isolate; display:inline-flex; align-items:center;
  gap:6px; height:36px; padding:0 16px; border-radius:var(--radius-full);
  border:1.5px solid var(--color-border-default); background:var(--color-bg-elevated);
  font-family:var(--font-sans); font-size:var(--text-sm); font-weight:var(--weight-medium);
  color:var(--color-text-primary); cursor:pointer; white-space:nowrap;
  transition:background var(--duration-fast), border-color var(--duration-fast), color var(--duration-fast); }
.m3-chip::after{ content:""; position:absolute; inset:0; border-radius:inherit;
  background:var(--color-action-primary); opacity:0; z-index:-1; transition:opacity var(--duration-fast); }
.m3-chip:hover::after{ opacity:var(--state-hover); }
.m3-chip:focus-visible{ outline:var(--focus-ring-width) solid var(--color-focus-ring); outline-offset:2px; }
.m3-chip[aria-checked="true"]{ background:var(--color-action-primary-tint);
  border-color:var(--color-action-primary); color:var(--color-action-primary-tint-fg); }
.m3-chip[aria-checked="true"] .m3-chip__check{ display:inline; }
.m3-chip__check{ display:none; font-family:'Material Symbols Rounded'; font-size:18px; line-height:1; }
.m3-chip__icon{ font-family:'Material Symbols Rounded'; font-size:18px; line-height:1; }
.m3-chips[aria-disabled="true"] .m3-chip{ opacity:.5; pointer-events:none; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-chip-css")) {
  const s = document.createElement("style");
  s.id = "m3-chip-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3ChoiceChip({
  options = [],
  value,
  onChange,
  ariaLabel,
  disabled = false,
  showCheck = true
}) {
  function onKey(e, idx) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (idx + dir + options.length) % options.length;
    onChange && onChange(options[next].value);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "m3-chips",
    role: "radiogroup",
    "aria-label": ariaLabel,
    "aria-disabled": disabled || undefined
  }, options.map((o, i) => {
    const checked = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      role: "radio",
      "aria-checked": checked,
      tabIndex: checked || value == null && i === 0 ? 0 : -1,
      className: "m3-chip",
      onClick: () => onChange && onChange(o.value),
      onKeyDown: e => onKey(e, i)
    }, showCheck && /*#__PURE__*/React.createElement("span", {
      className: "m3-chip__check material-symbols-rounded",
      "aria-hidden": "true"
    }, "check"), o.icon && /*#__PURE__*/React.createElement("span", {
      className: "m3-chip__icon material-symbols-rounded",
      "aria-hidden": "true"
    }, o.icon), o.label);
  }));
}
Object.assign(__ds_scope, { M3ChoiceChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/M3ChoiceChip.jsx", error: String((e && e.message) || e) }); }

// components/forms/M3DropdownField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.m3-select{ display:flex; flex-direction:column; gap:6px; font-family:var(--font-sans); }
.m3-select__label{ font-size:var(--text-sm); font-weight:var(--weight-semibold);
  color:var(--color-text-primary); }
.m3-select__box{ position:relative; display:flex; align-items:center; }
.m3-select__box select{ appearance:none; width:100%; height:48px;
  padding:0 40px 0 14px; background:var(--color-bg-elevated);
  border:1.5px solid var(--color-border-default); border-radius:var(--radius-md);
  font-family:inherit; font-size:var(--text-base); color:var(--color-text-primary);
  cursor:pointer; transition:border-color var(--duration-fast) var(--ease-standard); }
.m3-select__box select:focus-visible{ outline:none; border-color:var(--color-border-active);
  box-shadow:0 0 0 var(--focus-ring-offset) var(--color-border-active); }
.m3-select--error select{ border-color:var(--color-border-error); }
.m3-select__chev{ position:absolute; right:12px; pointer-events:none;
  font-family:'Material Symbols Rounded'; font-size:22px; color:var(--color-text-secondary); }
.m3-select__box select:disabled{ background:var(--color-bg-secondary);
  border-color:transparent; color:var(--color-text-disabled); cursor:not-allowed; }
.m3-select__hint{ font-size:var(--text-xs); color:var(--color-text-secondary); }
.m3-select__hint--error{ color:var(--color-text-error); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-select-css")) {
  const s = document.createElement("style");
  s.id = "m3-select-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
let _id = 0;
function M3DropdownField({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  errorMessage,
  hint,
  id,
  ...rest
}) {
  const fid = React.useMemo(() => id || `m3s-${++_id}`, [id]);
  const invalid = Boolean(errorMessage);
  return /*#__PURE__*/React.createElement("div", {
    className: ["m3-select", invalid ? "m3-select--error" : ""].filter(Boolean).join(" ")
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "m3-select__label",
    htmlFor: fid
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "m3-select__box"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fid,
    value: value ?? "",
    disabled: disabled,
    "aria-invalid": invalid || undefined,
    onChange: e => onChange && onChange(e.target.value, e)
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    className: "m3-select__chev material-symbols-rounded",
    "aria-hidden": "true"
  }, "expand_more")), invalid ? /*#__PURE__*/React.createElement("span", {
    className: "m3-select__hint m3-select__hint--error"
  }, errorMessage) : hint && /*#__PURE__*/React.createElement("span", {
    className: "m3-select__hint"
  }, hint));
}
Object.assign(__ds_scope, { M3DropdownField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/M3DropdownField.jsx", error: String((e && e.message) || e) }); }

// components/forms/M3PasswordField.jsx
try { (() => {
const CSS = `
.m3-pw__btn{ display:flex; align-items:center; justify-content:center; background:none; border:none;
  cursor:pointer; color:var(--color-text-secondary); padding:0; margin:0; line-height:1; }
.m3-pw__btn .material-symbols-rounded{ font-family:'Material Symbols Rounded'; font-size:20px; }
.m3-pw__btn:hover{ color:var(--color-text-primary); }
.m3-pw__btn:focus-visible{ outline:var(--focus-ring-width) solid var(--color-focus-ring); outline-offset:2px;
  border-radius:var(--radius-sm); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-pw-css")) {
  const s = document.createElement("style");
  s.id = "m3-pw-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
let _id = 0;

/**
 * Initial-password field. Composes the M3TextField shell (same `.m3-field`
 * styling) plus a reveal/hide toggle and a min-length requirement hint shown via
 * aria-describedby (not colour alone). Optional by design — provisioning can
 * create the user and set the password later via reset. autocomplete is
 * "new-password"; the value is never logged or persisted client-side.
 */
function M3PasswordField({
  label = "Senha inicial",
  value = "",
  onChange,
  errorMessage,
  required = false,
  disabled = false,
  minLength = 8,
  hint,
  id,
  autoComplete = "new-password"
}) {
  const [reveal, setReveal] = React.useState(false);
  const fid = React.useMemo(() => id || `m3pw-${++_id}`, [id]);
  const hintId = `${fid}-hint`;
  const invalid = Boolean(errorMessage);
  const describe = hint || `Mínimo ${minLength} caracteres`;
  return /*#__PURE__*/React.createElement("div", {
    className: ["m3-field", invalid ? "m3-field--error" : ""].filter(Boolean).join(" "),
    "aria-disabled": disabled || undefined
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "m3-field__label",
    htmlFor: fid
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "m3-field__req",
    "aria-hidden": "true"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "m3-field__box"
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-field__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, "lock"), /*#__PURE__*/React.createElement("input", {
    id: fid,
    type: reveal ? "text" : "password",
    value: value,
    disabled: disabled,
    minLength: minLength,
    autoComplete: autoComplete,
    "aria-invalid": invalid || undefined,
    "aria-describedby": hintId,
    onChange: e => onChange && onChange(e.target.value, e)
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "m3-pw__btn",
    "aria-pressed": reveal,
    "aria-label": reveal ? "Ocultar senha" : "Mostrar senha",
    onClick: () => setReveal(r => !r)
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, reveal ? "visibility_off" : "visibility"))), invalid ? /*#__PURE__*/React.createElement("span", {
    id: hintId,
    className: "m3-field__hint m3-field__hint--error"
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-field__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, "error"), errorMessage) : /*#__PURE__*/React.createElement("span", {
    id: hintId,
    className: "m3-field__hint"
  }, describe));
}
Object.assign(__ds_scope, { M3PasswordField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/M3PasswordField.jsx", error: String((e && e.message) || e) }); }

// components/forms/M3SearchBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.m3-search{ display:flex; align-items:center; gap:8px; height:44px; padding:0 14px;
  background:var(--color-bg-secondary); border:1.5px solid transparent;
  border-radius:var(--radius-full); font-family:var(--font-sans);
  transition:border-color var(--duration-fast), background var(--duration-fast); }
.m3-search:focus-within{ background:var(--color-bg-elevated); border-color:var(--color-border-active); }
.m3-search__icon{ font-family:'Material Symbols Rounded'; font-size:22px; color:var(--color-text-secondary); }
.m3-search input{ flex:1; min-width:0; border:none; outline:none; background:none;
  font-family:inherit; font-size:var(--text-base); color:var(--color-text-primary); }
.m3-search input::placeholder{ color:var(--color-text-secondary); }
.m3-search__clear{ display:flex; align-items:center; justify-content:center; width:28px; height:28px;
  border:none; background:none; border-radius:50%; cursor:pointer; color:var(--color-text-secondary);
  position:relative; isolation:isolate; }
.m3-search__clear::after{ content:""; position:absolute; inset:3px; border-radius:50%;
  background:var(--color-text-primary); opacity:0; z-index:-1; }
.m3-search__clear:hover::after{ opacity:var(--state-hover); }
.m3-search__clear .material-symbols-rounded{ font-size:18px; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-search-css")) {
  const s = document.createElement("style");
  s.id = "m3-search-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3SearchBar({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Buscar…",
  ariaLabel,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("form", {
    className: "m3-search",
    role: "search",
    onSubmit: e => {
      e.preventDefault();
      onSubmit && onSubmit(value);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-search__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, "search"), /*#__PURE__*/React.createElement("input", _extends({
    type: "search",
    value: value,
    placeholder: placeholder,
    "aria-label": ariaLabel || placeholder,
    onChange: e => onChange && onChange(e.target.value)
  }, rest)), value && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "m3-search__clear",
    "aria-label": "Limpar busca",
    onClick: () => onChange && onChange("")
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "close")));
}
Object.assign(__ds_scope, { M3SearchBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/M3SearchBar.jsx", error: String((e && e.message) || e) }); }

// components/forms/M3Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.m3-switch{ display:inline-flex; align-items:center; gap:10px; cursor:pointer;
  font-family:var(--font-sans); font-size:var(--text-sm); color:var(--color-text-primary); }
.m3-switch__track{ position:relative; width:48px; height:28px; flex:none;
  background:var(--color-bg-secondary); border:2px solid var(--color-border-strong);
  border-radius:var(--radius-full); transition:background var(--duration-normal) var(--ease-standard),
  border-color var(--duration-normal) var(--ease-standard); }
.m3-switch__thumb{ position:absolute; top:50%; left:6px; width:14px; height:14px;
  translate:0 -50%; border-radius:50%; background:var(--color-border-strong);
  transition:left var(--duration-normal) var(--ease-standard),
  width var(--duration-normal), height var(--duration-normal), background var(--duration-normal); }
.m3-switch input{ position:absolute; opacity:0; width:0; height:0; }
.m3-switch input:checked + .m3-switch__track{ background:var(--color-action-primary);
  border-color:var(--color-action-primary); }
.m3-switch input:checked + .m3-switch__track .m3-switch__thumb{ left:24px; width:18px;
  height:18px; background:var(--white); }
.m3-switch input:focus-visible + .m3-switch__track{ outline:var(--focus-ring-width) solid var(--color-focus-ring);
  outline-offset:2px; }
.m3-switch[aria-disabled="true"]{ opacity:.5; pointer-events:none; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-switch-css")) {
  const s = document.createElement("style");
  s.id = "m3-switch-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
let _id = 0;
function M3Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  id,
  ...rest
}) {
  const fid = React.useMemo(() => id || `m3sw-${++_id}`, [id]);
  return /*#__PURE__*/React.createElement("label", {
    className: "m3-switch",
    htmlFor: fid,
    "aria-disabled": disabled || undefined
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    type: "checkbox",
    role: "switch",
    checked: checked,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.checked, e)
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "m3-switch__track",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-switch__thumb"
  })), label && /*#__PURE__*/React.createElement("span", {
    className: "m3-switch__label"
  }, label));
}
Object.assign(__ds_scope, { M3Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/M3Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/M3TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.m3-field{ display:flex; flex-direction:column; gap:6px; font-family:var(--font-sans); }
.m3-field__label{ font-size:var(--text-sm); font-weight:var(--weight-semibold);
  color:var(--color-text-primary); }
.m3-field__req{ color:var(--color-text-error); margin-left:2px; }
.m3-field__box{ display:flex; align-items:center; gap:8px; height:48px;
  padding:0 14px; background:var(--color-bg-elevated);
  border:1.5px solid var(--color-border-default); border-radius:var(--radius-md);
  transition:border-color var(--duration-fast) var(--ease-standard); }
.m3-field__box:focus-within{ border-color:var(--color-border-active);
  box-shadow:0 0 0 var(--focus-ring-offset) var(--color-border-active); }
.m3-field--error .m3-field__box{ border-color:var(--color-border-error); }
.m3-field--error .m3-field__box:focus-within{ box-shadow:0 0 0 1px var(--color-border-error); }
.m3-field__box input{ flex:1; min-width:0; border:none; outline:none; background:none;
  font-family:inherit; font-size:var(--text-base); color:var(--color-text-primary); }
.m3-field__box input::placeholder{ color:var(--color-text-disabled); }
.m3-field--mono .m3-field__box input{ font-family:var(--font-mono);
  font-variant-numeric:tabular-nums; }
.m3-field__icon{ font-family:'Material Symbols Rounded'; font-size:20px;
  color:var(--color-text-secondary); line-height:1; }
.m3-field[aria-disabled="true"] .m3-field__box{ background:var(--color-bg-secondary);
  border-color:transparent; }
.m3-field[aria-disabled="true"] input{ color:var(--color-text-disabled); }
.m3-field__hint{ font-size:var(--text-xs); color:var(--color-text-secondary); }
.m3-field__hint--error{ color:var(--color-text-error); display:flex; gap:5px; align-items:center; }
.m3-field__hint--error .m3-field__icon{ font-size:15px; color:var(--color-text-error); }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-field-css")) {
  const s = document.createElement("style");
  s.id = "m3-field-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
let _id = 0;
function M3TextField({
  label,
  value = "",
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  errorMessage,
  hint,
  mono = false,
  leadingIcon,
  trailingIcon,
  id,
  ...rest
}) {
  const fid = React.useMemo(() => id || `m3f-${++_id}`, [id]);
  const hintId = `${fid}-hint`;
  const invalid = Boolean(errorMessage);
  return /*#__PURE__*/React.createElement("div", {
    className: ["m3-field", mono ? "m3-field--mono" : "", invalid ? "m3-field--error" : ""].filter(Boolean).join(" "),
    "aria-disabled": disabled || undefined
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "m3-field__label",
    htmlFor: fid
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "m3-field__req",
    "aria-hidden": "true"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "m3-field__box"
  }, leadingIcon && /*#__PURE__*/React.createElement("span", {
    className: "m3-field__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, leadingIcon), /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    type: type,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    "aria-invalid": invalid || undefined,
    "aria-describedby": hint || errorMessage ? hintId : undefined,
    onChange: e => onChange && onChange(e.target.value, e)
  }, rest)), trailingIcon && /*#__PURE__*/React.createElement("span", {
    className: "m3-field__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, trailingIcon)), invalid ? /*#__PURE__*/React.createElement("span", {
    id: hintId,
    className: "m3-field__hint m3-field__hint--error"
  }, /*#__PURE__*/React.createElement("span", {
    className: "m3-field__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, "error"), errorMessage) : hint && /*#__PURE__*/React.createElement("span", {
    id: hintId,
    className: "m3-field__hint"
  }, hint));
}
Object.assign(__ds_scope, { M3TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/M3TextField.jsx", error: String((e && e.message) || e) }); }

// components/forms/M3MaskedField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* PT-BR input masks. Each returns the display string; raw digits are emitted to
   onChange so the BFF receives clean values (FR-002). */
function onlyDigits(s) {
  return (s || "").replace(/\D/g, "");
}
function format(mask, raw) {
  const d = onlyDigits(raw);
  switch (mask) {
    case "cpf":
      return d.slice(0, 11).replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
    case "nis":
      return d.slice(0, 11).replace(/^(\d{3})(\d{5})(\d{2})(\d)/, "$1.$2.$3-$4");
    case "cep":
      return d.slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
    case "phone":
      {
        const x = d.slice(0, 11);
        if (x.length <= 10) return x.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/[-\s()]+$/, "");
        return x.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/[-\s()]+$/, "");
      }
    case "date":
      return d.slice(0, 8).replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
    case "money":
      {
        if (!d) return "";
        const cents = parseInt(d.slice(0, 13), 10);
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL"
        }).format(cents / 100);
      }
    default:
      return raw;
  }
}
const PLACEHOLDER = {
  cpf: "000.000.000-00",
  nis: "000.00000.00-0",
  cep: "00000-000",
  phone: "(00) 00000-0000",
  date: "dd/mm/aaaa",
  money: "R$ 0,00"
};
function M3MaskedField({
  mask = "cpf",
  value = "",
  onChange,
  label,
  placeholder,
  ...rest
}) {
  const display = format(mask, value);
  return /*#__PURE__*/React.createElement(__ds_scope.M3TextField, _extends({
    label: label,
    mono: true,
    value: display,
    placeholder: placeholder || PLACEHOLDER[mask],
    inputMode: mask === "date" || mask === "money" ? "numeric" : "numeric",
    onChange: v => {
      const raw = onlyDigits(v);
      onChange && onChange(raw, format(mask, raw));
    }
  }, rest));
}
Object.assign(__ds_scope, { M3MaskedField, formatMask: format, onlyDigits });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/M3MaskedField.jsx", error: String((e && e.message) || e) }); }

// components/navigation/M3NavRail.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.m3-rail{ display:flex; flex-direction:column; align-items:center; width:var(--rail-width);
  flex:none; background:var(--color-bg-elevated); border-right:1px solid var(--color-border-default);
  padding:12px 0; gap:4px; font-family:var(--font-sans); }
.m3-rail__logo{ width:40px; height:40px; display:flex; align-items:center; justify-content:center;
  margin-bottom:12px; }
.m3-rail__logo img{ max-width:100%; max-height:100%; }
.m3-rail__item{ display:flex; flex-direction:column; align-items:center; gap:4px; width:100%;
  padding:6px 0; border:none; background:none; cursor:pointer; color:var(--color-text-secondary);
  text-decoration:none; font:inherit; }
.m3-rail__icon{ position:relative; isolation:isolate; display:flex; align-items:center;
  justify-content:center; width:48px; height:32px; border-radius:var(--radius-full);
  transition:background var(--duration-fast); }
.m3-rail__icon .material-symbols-rounded{ font-size:24px; }
.m3-rail__icon::after{ content:""; position:absolute; inset:0; border-radius:inherit;
  background:var(--color-action-primary); opacity:0; z-index:-1; transition:opacity var(--duration-fast); }
.m3-rail__item:hover .m3-rail__icon::after{ opacity:var(--state-hover); }
.m3-rail__item:focus-visible{ outline:none; }
.m3-rail__item:focus-visible .m3-rail__icon{ outline:var(--focus-ring-width) solid var(--color-focus-ring);
  outline-offset:2px; }
.m3-rail__label{ font-size:11px; font-weight:var(--weight-medium); line-height:1;
  text-align:center; }
.m3-rail__item[aria-current="page"]{ color:var(--color-action-primary-tint-fg); }
.m3-rail__item[aria-current="page"] .m3-rail__icon{ background:var(--color-action-primary-tint); }
.m3-rail__item[aria-current="page"] .m3-rail__label{ color:var(--color-text-primary);
  font-weight:var(--weight-semibold); }
.m3-rail__spacer{ flex:1; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-rail-css")) {
  const s = document.createElement("style");
  s.id = "m3-rail-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3NavRail({
  items = [],
  activeId,
  onSelect,
  logo,
  footer
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: "m3-rail",
    "aria-label": "Navega\xE7\xE3o principal"
  }, logo && /*#__PURE__*/React.createElement("div", {
    className: "m3-rail__logo"
  }, typeof logo === "string" ? /*#__PURE__*/React.createElement("img", {
    src: logo,
    alt: ""
  }) : logo), items.map(it => {
    const active = it.id === activeId;
    const common = {
      className: "m3-rail__item",
      "aria-current": active ? "page" : undefined,
      key: it.id
    };
    const inner = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "m3-rail__icon"
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-symbols-rounded",
      "aria-hidden": "true"
    }, it.icon)), /*#__PURE__*/React.createElement("span", {
      className: "m3-rail__label"
    }, it.label));
    return it.href ? /*#__PURE__*/React.createElement("a", _extends({
      href: it.href
    }, common), inner) : /*#__PURE__*/React.createElement("button", _extends({
      type: "button",
      onClick: () => onSelect && onSelect(it.id)
    }, common), inner);
  }), footer && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "m3-rail__spacer"
  }), footer));
}
Object.assign(__ds_scope, { M3NavRail });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/M3NavRail.jsx", error: String((e && e.message) || e) }); }

// components/navigation/M3TopAppBar.jsx
try { (() => {
const CSS = `
.m3-topbar{ position:sticky; top:0; z-index:var(--z-sticky); display:flex; align-items:center;
  gap:8px; height:var(--topbar-height); padding:0 16px 0 8px;
  background:var(--color-bg-elevated); border-bottom:1px solid var(--color-border-default);
  font-family:var(--font-sans); }
.m3-topbar__back{ display:inline-flex; align-items:center; justify-content:center;
  width:44px; height:44px; border-radius:var(--radius-full); border:none; background:none;
  cursor:pointer; color:var(--color-text-secondary); position:relative; isolation:isolate; }
.m3-topbar__back::after{ content:""; position:absolute; inset:6px; border-radius:50%;
  background:var(--color-text-primary); opacity:0; z-index:-1; transition:opacity var(--duration-fast); }
.m3-topbar__back:hover::after{ opacity:var(--state-hover); }
.m3-topbar__back:focus-visible{ outline:var(--focus-ring-width) solid var(--color-focus-ring); outline-offset:1px; }
.m3-topbar__back .material-symbols-rounded{ font-size:24px; }
.m3-topbar__title{ font-size:var(--text-xl); font-weight:var(--weight-bold); margin:0;
  letter-spacing:var(--tracking-tight); white-space:nowrap; overflow:hidden;
  text-overflow:ellipsis; padding-left:8px; }
.m3-topbar__status{ margin:0 4px; }
.m3-topbar__spacer{ flex:1; }
.m3-topbar__actions{ display:flex; align-items:center; gap:8px; flex:none; }
`;
if (typeof document !== "undefined" && !document.getElementById("m3-topbar-css")) {
  const s = document.createElement("style");
  s.id = "m3-topbar-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}
function M3TopAppBar({
  title,
  onBack,
  statusSlot,
  actions
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "m3-topbar"
  }, onBack && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "m3-topbar__back",
    onClick: onBack,
    "aria-label": "Voltar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "arrow_back")), /*#__PURE__*/React.createElement("h1", {
    className: "m3-topbar__title"
  }, title), statusSlot && /*#__PURE__*/React.createElement("div", {
    className: "m3-topbar__status"
  }, statusSlot), /*#__PURE__*/React.createElement("div", {
    className: "m3-topbar__spacer"
  }), actions && /*#__PURE__*/React.createElement("div", {
    className: "m3-topbar__actions"
  }, actions));
}
Object.assign(__ds_scope, { M3TopAppBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/M3TopAppBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/analysis-bi/fixtures.js
try { (() => {
/* Synthetic AGGREGATE fixtures only (LGPD: never PII; every cell >= 5 except
   where we demonstrate suppression). Mirrors the analysis-bi envelope shape. */
(function () {
  const BANDS = ["0-4", "5-9", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80+"];
  const pyramid = [];
  BANDS.forEach((b, i) => {
    const base = Math.round(38 * Math.exp(-Math.pow((i - 5) / 4.2, 2)) + 5);
    pyramid.push({
      ageBand: b,
      sex: "MALE",
      value: base + i % 3
    });
    pyramid.push({
      ageBand: b,
      sex: "FEMALE",
      value: base + 5 + i % 4
    });
  });
  pyramid.push({
    ageBand: "30-34",
    sex: "UNKNOWN",
    value: 7
  });
  window.KitData = {
    regions: [{
      code: "1401",
      name: "Norte de Roraima"
    }, {
      code: "1402",
      name: "Sul de Roraima"
    }],
    home: [{
      id: "demographics",
      label: "Demográfico",
      icon: "groups",
      value: 1247,
      unit: "registros",
      note: "Pirâmide etária e território"
    }, {
      id: "epidemiological",
      label: "Epidemiológico",
      icon: "coronavirus",
      value: 37,
      unit: "casos novos",
      note: "Top diagnósticos CID-10"
    }, {
      id: "socioeconomic",
      label: "Socioeconômico",
      icon: "savings",
      value: 412,
      unit: "beneficiários",
      note: "Renda e benefícios"
    }, {
      id: "protection",
      label: "Proteção",
      icon: "gavel",
      value: 89,
      unit: "encaminhamentos",
      note: "Destinos e violações"
    }, {
      id: "care",
      label: "Cuidado",
      icon: "volunteer_activism",
      value: 503,
      unit: "atendimentos",
      note: "Atendimentos e completude"
    }],
    demographics: {
      meta: {
        totalRecords: 1247,
        kThreshold: 5,
        suppressedGroups: 3,
        period: "2025-01/2025-12"
      },
      pyramid,
      breakdown: [{
        mesoregionName: "Norte de Roraima",
        value: 812,
        share: 0.65
      }, {
        mesoregionName: "Sul de Roraima",
        value: 435,
        share: 0.35
      }]
    },
    epidemiological: {
      meta: {
        totalRecords: 137,
        kThreshold: 5,
        suppressedGroups: 2,
        period: "2025-01/2025-12"
      },
      topN: [{
        code: "E75.2",
        label: "Gangliosidose GM2",
        value: 37
      }, {
        code: "Q87.4",
        label: "Síndrome de Marfan",
        value: 21
      }, {
        code: "E70.0",
        label: "Fenilcetonúria clássica",
        value: 18
      }, {
        code: "G71.0",
        label: "Distrofia muscular",
        value: 14
      }, {
        code: "D56.1",
        label: "Talassemia beta",
        value: 9
      }]
    },
    exportFormats: [{
      name: "CSV",
      ext: ".csv",
      ct: "text/csv",
      hint: "Planilhas em geral",
      icon: "table_view"
    }, {
      name: "JSON",
      ext: ".json",
      ct: "application/json",
      hint: "Integrações",
      icon: "data_object"
    }, {
      name: "XML",
      ext: ".xml",
      ct: "application/xml",
      hint: "Sistemas legados",
      icon: "code"
    }, {
      name: "Parquet",
      ext: ".parquet",
      ct: "application/vnd.apache.parquet",
      hint: "Análise de dados",
      icon: "dataset"
    }, {
      name: "DBF",
      ext: ".dbf",
      ct: "application/dbf",
      hint: "Para importar no TabWin",
      icon: "grid_on"
    }, {
      name: "DBC",
      ext: ".dbc",
      ct: "application/octet-stream",
      hint: "Padrão DataSUS (compactado)",
      icon: "folder_zip"
    }, {
      name: "ODS",
      ext: ".ods",
      ct: "application/vnd.oasis.opendocument.spreadsheet",
      hint: "LibreOffice / Excel",
      icon: "ssid_chart"
    }, {
      name: "FHIR",
      ext: ".json",
      ct: "application/fhir+json",
      hint: "Interoperabilidade RNDS (R4 BR Core)",
      icon: "health_and_safety"
    }],
    datasets: [{
      value: "demographics",
      label: "Demográfico"
    }, {
      value: "epidemiological",
      label: "Epidemiológico"
    }, {
      value: "socioeconomic",
      label: "Socioeconômico"
    }, {
      value: "protection",
      label: "Proteção"
    }, {
      value: "care",
      label: "Cuidado"
    }]
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/analysis-bi/fixtures.js", error: String((e && e.message) || e) }); }

// ui_kits/analysis-bi/screens.jsx
try { (() => {
/* web_02 · Analysis BI — interactive recreation.
   Composes the design-system primitives (never re-implements them). All data is
   synthetic aggregate fixtures (window.KitData). */
const DS = window.RAROSWeb02DesignSystem_9e80fa;
const {
  M3Button,
  M3TextField,
  M3DropdownField,
  M3ChoiceChip,
  M3Badge,
  SuppressionBanner,
  M3EmptyState,
  M3Card,
  M3KpiCard,
  M3KpiValue,
  M3SectionHeader,
  M3DataField,
  M3PeriodLabel,
  M3TopAppBar,
  M3NavRail,
  AgePyramidChart,
  TopNBarChart,
  M3SeriesLegendItem
} = DS;
const D = window.KitData;
const GRANS = [{
  value: "monthly",
  label: "Mensal"
}, {
  value: "quarterly",
  label: "Trimestral"
}, {
  value: "yearly",
  label: "Anual"
}];

/* ----------------------------------------------------------------- Filter bar */
function DashboardFilterPanel({
  filters,
  regions,
  onApply
}) {
  const [f, setF] = React.useState(filters);
  const set = (k, v) => setF(p => ({
    ...p,
    [k]: v
  }));
  const invalidEnd = f.periodEnd < f.periodStart;
  return /*#__PURE__*/React.createElement("form", {
    className: "kit-filterbar",
    role: "search",
    "aria-label": "Filtros de indicadores",
    onSubmit: e => {
      e.preventDefault();
      if (!invalidEnd) onApply(f);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-filterbar__inner"
  }, /*#__PURE__*/React.createElement(M3TextField, {
    label: "Per\xEDodo in\xEDcio",
    mono: true,
    value: f.periodStart,
    onChange: v => set("periodStart", v)
  }), /*#__PURE__*/React.createElement(M3TextField, {
    label: "Fim",
    mono: true,
    value: f.periodEnd,
    onChange: v => set("periodEnd", v),
    errorMessage: invalidEnd ? "O fim deve ser ≥ o início" : undefined
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      marginBottom: 6
    }
  }, "Granularidade"), /*#__PURE__*/React.createElement(M3ChoiceChip, {
    ariaLabel: "Granularidade",
    value: f.granularity,
    onChange: v => set("granularity", v),
    options: GRANS
  })), /*#__PURE__*/React.createElement("div", {
    className: "kit-filterbar__grow",
    style: {
      minWidth: 180
    }
  }, /*#__PURE__*/React.createElement(M3DropdownField, {
    label: "Mesorregi\xE3o",
    value: f.mesoregion || "",
    onChange: v => set("mesoregion", v || null),
    options: [{
      value: "",
      label: "Todas"
    }, ...regions.map(r => ({
      value: r.code,
      label: r.name
    }))]
  })), /*#__PURE__*/React.createElement("div", {
    className: "kit-filterbar__actions"
  }, /*#__PURE__*/React.createElement(M3Button, {
    type: "submit",
    variant: "tonal",
    icon: "filter_alt"
  }, "Aplicar"), /*#__PURE__*/React.createElement(M3Button, {
    variant: "text",
    onPress: () => {
      const r = filters;
      setF(r);
      onApply(r);
    }
  }, "Limpar"))));
}

/* --------------------------------------------------------------------- Shell */
const NAV = [{
  id: "social-care",
  label: "Prontuário",
  icon: "folder_shared"
}, {
  id: "people",
  label: "Pessoas",
  icon: "group"
}, {
  id: "indicators",
  label: "Indicadores",
  icon: "monitoring"
}];
function Shell({
  navActive,
  onNav,
  title,
  onBack,
  statusSlot,
  actions,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-shell"
  }, /*#__PURE__*/React.createElement(M3NavRail, {
    items: NAV,
    activeId: navActive,
    onSelect: onNav,
    logo: "../../assets/logo-raros-mark.webp",
    footer: /*#__PURE__*/React.createElement("button", {
      className: "m3-rail__item",
      type: "button",
      "aria-label": "Conta",
      onClick: () => {}
    }, /*#__PURE__*/React.createElement("span", {
      className: "m3-rail__icon"
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-symbols-rounded",
      "aria-hidden": "true"
    }, "account_circle")), /*#__PURE__*/React.createElement("span", {
      className: "m3-rail__label"
    }, "Conta"))
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-main"
  }, /*#__PURE__*/React.createElement(M3TopAppBar, {
    title: title,
    onBack: onBack,
    statusSlot: statusSlot,
    actions: actions
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-content"
  }, children)));
}

/* --------------------------------------------------------- Indicators home */
function IndicatorsHome({
  onOpen,
  onExport
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-pagehead"
  }, /*#__PURE__*/React.createElement("h1", null, "Indicadores"), /*#__PURE__*/React.createElement("p", null, "Dados agregados e an\xF4nimos da rede RAROS. Todos os recortes respeitam K-anonimato (K=5): grupos com menos de 5 pessoas s\xE3o omitidos.")), /*#__PURE__*/React.createElement("div", {
    className: "kit-home-grid"
  }, D.home.map(axis => /*#__PURE__*/React.createElement(M3KpiCard, {
    key: axis.id,
    label: axis.label,
    value: axis.value,
    unitLabel: axis.unit,
    period: "2025-12",
    granularity: "monthly",
    icon: axis.icon,
    footnote: axis.note,
    onPress: () => onOpen(axis.id)
  })), /*#__PURE__*/React.createElement(M3Card, {
    onPress: onExport
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true",
    style: {
      fontSize: 26,
      color: "var(--color-action-primary)"
    }
  }, "download"), /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--color-text-primary)"
    }
  }, "Exportar dados"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--color-text-secondary)"
    }
  }, "5 datasets \xB7 8 formatos (CSV, FHIR, DataSUS\u2026)")))));
}

/* --------------------------------------------------- Demographics dashboard */
function MesoregionBreakdown({
  rows
}) {
  const max = Math.max(...rows.map(r => r.value), 1);
  return /*#__PURE__*/React.createElement("table", {
    className: "kit-breakdown"
  }, /*#__PURE__*/React.createElement("caption", {
    style: {
      textAlign: "left",
      fontSize: "var(--text-xs)",
      color: "var(--color-text-secondary)",
      marginBottom: 8
    }
  }, "Distribui\xE7\xE3o por mesorregi\xE3o"), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Mesorregi\xE3o"), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    style: {
      width: 180
    }
  }, "Propor\xE7\xE3o"), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    style: {
      textAlign: "right"
    }
  }, "Registros"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.mesoregionName
  }, /*#__PURE__*/React.createElement("th", {
    scope: "row",
    style: {
      fontWeight: 500
    }
  }, r.mesoregionName), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "kit-bar-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-bar",
    style: {
      width: `${r.value / max * 100}%`
    }
  }))), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, r.value.toLocaleString("pt-BR"))))));
}
function DemographicsDashboard({
  onBack,
  onExport
}) {
  const data = D.demographics;
  const [filters, setFilters] = React.useState({
    periodStart: "2025-01",
    periodEnd: "2025-12",
    granularity: "monthly",
    mesoregion: null
  });
  const [loading, setLoading] = React.useState(false);
  function apply(f) {
    setFilters(f);
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  }
  const bandsWithData = new Set(data.pyramid.map(p => p.ageBand)).size;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DashboardFilterPanel, {
    filters: filters,
    regions: D.regions,
    onApply: apply
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-page"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(SuppressionBanner, {
    suppressedGroups: data.meta.suppressedGroups,
    kThreshold: data.meta.kThreshold,
    onLearnMore: () => {}
  })), /*#__PURE__*/React.createElement("div", {
    className: "kit-kpis"
  }, /*#__PURE__*/React.createElement(M3KpiCard, {
    label: "Registros agregados",
    value: loading ? null : data.meta.totalRecords,
    unitLabel: "registros",
    period: "2025-12",
    pending: loading,
    icon: "groups"
  }), /*#__PURE__*/React.createElement(M3KpiCard, {
    label: "Faixas com dados",
    value: loading ? null : bandsWithData,
    unitLabel: "de 17",
    period: "2025-12",
    pending: loading,
    icon: "bar_chart"
  }), /*#__PURE__*/React.createElement(M3KpiCard, {
    label: "Mesorregi\xF5es",
    value: loading ? null : data.breakdown.length,
    period: "2025-12",
    pending: loading,
    icon: "map"
  })), /*#__PURE__*/React.createElement("div", {
    className: "kit-charts"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-chartcard kit-chartcard--wide"
  }, /*#__PURE__*/React.createElement(M3SectionHeader, {
    title: "Pir\xE2mide et\xE1ria",
    description: "Faixa et\xE1ria \xD7 sexo no per\xEDodo filtrado",
    action: /*#__PURE__*/React.createElement(M3Badge, {
      variant: "info"
    }, data.meta.totalRecords.toLocaleString("pt-BR"), " registros")
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-chartcard__body"
  }, /*#__PURE__*/React.createElement(AgePyramidChart, {
    items: loading ? [] : data.pyramid,
    suppressedGroups: data.meta.suppressedGroups,
    pending: loading
  }))), /*#__PURE__*/React.createElement("div", {
    className: "kit-chartcard kit-chartcard--wide"
  }, /*#__PURE__*/React.createElement(M3SectionHeader, {
    title: "Por mesorregi\xE3o",
    action: /*#__PURE__*/React.createElement(M3Button, {
      variant: "text",
      icon: "download",
      onPress: onExport
    }, "Exportar este eixo")
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-chartcard__body"
  }, loading ? null : /*#__PURE__*/React.createElement(MesoregionBreakdown, {
    rows: data.breakdown
  }))))));
}

/* -------------------------------------------------------------- Export center */
function ExportCenter({
  preselect
}) {
  const [dataset, setDataset] = React.useState(preselect || "demographics");
  const [fmt, setFmt] = React.useState("CSV");
  const [start, setStart] = React.useState("2025-01");
  const [end, setEnd] = React.useState("2025-12");
  const [downloading, setDownloading] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const fmtObj = D.exportFormats.find(x => x.name === fmt) || D.exportFormats[0];
  const filename = `acdg-${dataset}-${start}-${end}${fmtObj.ext}`;
  function doExport() {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setToast(`Arquivo ${filename} pronto`);
      setTimeout(() => setToast(null), 2600);
    }, 900);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-page kit-page--narrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-pagehead"
  }, /*#__PURE__*/React.createElement("h1", null, "Exportar dados"), /*#__PURE__*/React.createElement("p", null, "5 datasets \xD7 8 formatos. O arquivo aplica o mesmo K-anonimato (K=5) e nunca cont\xE9m dados pessoais.")), /*#__PURE__*/React.createElement("div", {
    className: "kit-stack"
  }, /*#__PURE__*/React.createElement(M3Card, {
    padding: "md"
  }, /*#__PURE__*/React.createElement(M3SectionHeader, {
    title: "Recorte",
    as: "h2"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 16,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(M3DropdownField, {
    label: "Dataset",
    value: dataset,
    onChange: setDataset,
    options: D.datasets
  }), /*#__PURE__*/React.createElement(M3TextField, {
    label: "Per\xEDodo in\xEDcio",
    mono: true,
    value: start,
    onChange: setStart
  }), /*#__PURE__*/React.createElement(M3TextField, {
    label: "Fim",
    mono: true,
    value: end,
    onChange: setEnd
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(M3SectionHeader, {
    title: "Formato do arquivo",
    as: "h2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-formats",
    role: "radiogroup",
    "aria-label": "Formato do arquivo",
    style: {
      marginTop: 14
    }
  }, D.exportFormats.map(x => /*#__PURE__*/React.createElement("button", {
    key: x.name,
    type: "button",
    role: "radio",
    "aria-checked": x.name === fmt,
    className: "kit-fmt",
    onClick: () => setFmt(x.name)
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-fmt__icon material-symbols-rounded",
    "aria-hidden": "true"
  }, x.icon), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "kit-fmt__name"
  }, x.name), /*#__PURE__*/React.createElement("span", {
    className: "kit-fmt__hint"
  }, x.hint), /*#__PURE__*/React.createElement("span", {
    className: "kit-fmt__ext"
  }, x.ext, " \xB7 ", x.ct)))))), /*#__PURE__*/React.createElement(SuppressionBanner, {
    suppressedGroups: 3,
    kThreshold: 5
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-exportfoot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-exportfoot__summary"
  }, D.datasets.find(d => d.value === dataset).label, " \xB7 ", start, " a ", end, " \xB7 todas as regi\xF5es", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "kit-exportfoot__file"
  }, filename)), /*#__PURE__*/React.createElement(M3Button, {
    variant: "filled",
    icon: "download",
    pending: downloading,
    onPress: doExport
  }, downloading ? "Gerando…" : "Exportar"))), toast && /*#__PURE__*/React.createElement("div", {
    className: "kit-toast",
    role: "status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "check_circle"), toast));
}
function ModulePlaceholder({
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-page"
  }, /*#__PURE__*/React.createElement(M3Card, {
    padding: "none"
  }, /*#__PURE__*/React.createElement(M3EmptyState, {
    variant: "default",
    icon: "construction",
    title: `Módulo "${label}" fora do escopo desta demonstração`,
    description: "Este UI kit recria o m\xF3dulo de Indicadores (analysis-bi). Os m\xF3dulos de Prontu\xE1rio e Pessoas compartilham o mesmo shell e design system."
  })));
}

/* ---------------------------------------------------------------------- App */
function App() {
  const [route, setRoute] = React.useState({
    name: "home"
  });
  const [nav, setNav] = React.useState("indicators");
  function onNav(id) {
    setNav(id);
    if (id === "indicators") setRoute({
      name: "home"
    });else setRoute({
      name: "module",
      label: NAV.find(n => n.id === id).label
    });
  }
  let title = "Indicadores";
  let onBack;
  let actions = null;
  let body;
  if (route.name === "home") {
    title = "Indicadores";
    body = /*#__PURE__*/React.createElement(IndicatorsHome, {
      onOpen: id => setRoute({
        name: id
      }),
      onExport: () => setRoute({
        name: "export"
      })
    });
  } else if (route.name === "demographics") {
    title = "Dashboard demográfico";
    onBack = () => setRoute({
      name: "home"
    });
    actions = /*#__PURE__*/React.createElement(M3Button, {
      variant: "filled",
      size: "sm",
      icon: "download",
      onPress: () => setRoute({
        name: "export",
        preselect: "demographics"
      })
    }, "Exportar este eixo");
    body = /*#__PURE__*/React.createElement(DemographicsDashboard, {
      onExport: () => setRoute({
        name: "export",
        preselect: "demographics"
      })
    });
  } else if (route.name === "export") {
    title = "Exportar dados";
    onBack = () => setRoute({
      name: "home"
    });
    body = /*#__PURE__*/React.createElement(ExportCenter, {
      preselect: route.preselect
    });
  } else if (route.name === "module") {
    title = route.label;
    body = /*#__PURE__*/React.createElement(ModulePlaceholder, {
      label: route.label
    });
  } else {
    // other axes: honest placeholder (not implemented in this demo)
    title = "Indicadores";
    onBack = () => setRoute({
      name: "home"
    });
    body = /*#__PURE__*/React.createElement("div", {
      className: "kit-page"
    }, /*#__PURE__*/React.createElement(M3Card, {
      padding: "none"
    }, /*#__PURE__*/React.createElement(M3EmptyState, {
      icon: "bar_chart",
      title: "Dashboard em constru\xE7\xE3o nesta demonstra\xE7\xE3o",
      description: "O kit traz o eixo demogr\xE1fico completo (pir\xE2mide et\xE1ria, supress\xE3o, breakdown). Os demais eixos reusam os mesmos componentes.",
      action: {
        label: "Voltar aos indicadores",
        onPress: () => setRoute({
          name: "home"
        }),
        icon: "arrow_back"
      }
    })));
  }
  const statusSlot = /*#__PURE__*/React.createElement(M3Badge, {
    variant: "success",
    dot: true
  }, "web_02");
  return /*#__PURE__*/React.createElement(Shell, {
    navActive: nav,
    onNav: onNav,
    title: title,
    onBack: onBack,
    statusSlot: statusSlot,
    actions: actions
  }, body);
}
window.KitApp = {
  App
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/analysis-bi/screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/people-context/fixtures.js
try { (() => {
/* web_02 · People Context — synthetic fixtures (no real PII).
   CPF values are display-masked; the kit never holds raw documents. */
(function () {
  function uid(p) {
    return p + "-" + Math.random().toString(16).slice(2, 10);
  }
  const ROLE_POOL = [{
    system: "social-care",
    role: "patient"
  }, {
    system: "social-care",
    role: "professional"
  }, {
    system: "social-care",
    role: "family-member"
  }, {
    system: "timesheet",
    role: "employee"
  }, {
    system: "therapies",
    role: "therapist"
  }, {
    system: "queue-manager",
    role: "professional"
  }];

  // Five hand-authored, representative people (edge-cases), then a generated tail.
  const seed = [{
    id: "p-001",
    fullName: "Maria das Graças Souza",
    cpfMasked: "***.456.789-**",
    birthDate: "1985-03-20",
    email: "maria.souza@example.org",
    active: true,
    idpUserId: "9f3a2b1c-7d8e-4a5f-9c0b-1e2d3c4b5a6f",
    loginState: "linked",
    createdAt: "2026-06-01",
    roles: [{
      id: uid("r"),
      system: "social-care",
      role: "patient",
      active: true,
      assignedAt: "2026-06-05"
    }, {
      id: uid("r"),
      system: "timesheet",
      role: "employee",
      active: false,
      assignedAt: "2026-05-01"
    }]
  }, {
    id: "p-002",
    fullName: "José Raimundo Lima",
    cpfMasked: null,
    birthDate: "1979-11-02",
    email: null,
    active: true,
    idpUserId: null,
    loginState: "none",
    createdAt: "2026-06-03",
    roles: []
  }, {
    id: "p-003",
    fullName: "Ana Beatriz Carvalho de Albuquerque Nogueira",
    cpfMasked: "***.982.247-**",
    birthDate: "1991-03-12",
    email: "ana.carvalho@example.org",
    active: true,
    idpUserId: null,
    loginState: "failed",
    createdAt: "2026-06-12",
    roles: [{
      id: uid("r"),
      system: "social-care",
      role: "professional",
      active: true,
      assignedAt: "2026-06-10"
    }]
  }, {
    id: "p-004",
    fullName: "Antônio Carlos Ferreira",
    cpfMasked: "***.221.870-**",
    birthDate: "1968-07-09",
    email: "antonio.ferreira@example.org",
    active: false,
    idpUserId: "2b7c9d1e-4f5a-6b8c-0d1e-2f3a4b5c6d7e",
    loginState: "linked",
    createdAt: "2025-12-18",
    roles: [{
      id: uid("r"),
      system: "social-care",
      role: "patient",
      active: false,
      assignedAt: "2025-12-20"
    }, {
      id: uid("r"),
      system: "therapies",
      role: "patient",
      active: false,
      assignedAt: "2026-01-04"
    }]
  }, {
    id: "p-005",
    fullName: "Francisca Pereira dos Santos",
    cpfMasked: "***.118.402-**",
    birthDate: "1996-01-25",
    email: "francisca.santos@example.org",
    active: true,
    idpUserId: "5d2e8f1a-9b3c-4d6e-8f0a-1b2c3d4e5f60",
    loginState: "linked",
    createdAt: "2026-04-22",
    roles: [{
      id: uid("r"),
      system: "social-care",
      role: "patient",
      active: true,
      assignedAt: "2026-04-25"
    }, {
      id: uid("r"),
      system: "social-care",
      role: "family-member",
      active: true,
      assignedAt: "2026-05-02"
    }, {
      id: uid("r"),
      system: "therapies",
      role: "therapist",
      active: true,
      assignedAt: "2026-05-10"
    }, {
      id: uid("r"),
      system: "queue-manager",
      role: "professional",
      active: true,
      assignedAt: "2026-05-18"
    }]
  }];
  const FIRST = ["João", "Luiz", "Pedro", "Marcos", "Rafael", "Carla", "Juliana", "Beatriz", "Larissa", "Camila", "Roberto", "Vanessa", "Gabriel", "Mateus", "Sofia"];
  const LAST = ["Oliveira", "Almeida", "Rodrigues", "Barbosa", "Gomes", "Ribeiro", "Martins", "Araújo", "Cardoso", "Teixeira", "Moreira", "Correia"];
  const tail = [];
  for (let i = 6; i <= 22; i++) {
    const fn = FIRST[i % FIRST.length] + " " + LAST[i * 3 % LAST.length] + " " + LAST[i * 7 % LAST.length];
    const hasCpf = i % 4 !== 0;
    const linked = i % 3 !== 0;
    const active = i % 9 !== 0;
    const rn = i % 3;
    const roles = [];
    for (let k = 0; k < rn; k++) {
      const rp = ROLE_POOL[(i + k) % ROLE_POOL.length];
      roles.push({
        id: uid("r"),
        system: rp.system,
        role: rp.role,
        active: k % 2 === 0,
        assignedAt: "2026-0" + (i % 6 + 1) + "-1" + (k + 2)
      });
    }
    tail.push({
      id: "p-0" + (i < 10 ? "0" + i : i),
      fullName: fn,
      cpfMasked: hasCpf ? "***." + (100 + i) + "." + (200 + i * 3) + "-**" : null,
      birthDate: "19" + (60 + i % 39) + "-0" + (i % 9 + 1) + "-1" + i % 9,
      email: i % 5 === 0 ? null : fn.split(" ")[0].toLowerCase() + "." + fn.split(" ")[1].toLowerCase() + "@example.org",
      active,
      idpUserId: linked ? uid("idp") + "-" + uid("x") : null,
      loginState: linked ? "linked" : "none",
      createdAt: "2026-0" + (i % 6 + 1) + "-1" + i % 8,
      roles
    });
  }
  const all = seed.concat(tail);
  window.PeopleData = {
    people: all,
    totalCount: 150,
    pageSize: 12,
    systems: [{
      value: "social-care",
      label: "Social Care"
    }, {
      value: "queue-manager",
      label: "Fila"
    }, {
      value: "therapies",
      label: "Terapias"
    }, {
      value: "timesheet",
      label: "Ponto"
    }],
    roles: [{
      value: "patient",
      label: "Paciente"
    }, {
      value: "professional",
      label: "Profissional"
    }, {
      value: "family-member",
      label: "Membro da família"
    }, {
      value: "employee",
      label: "Funcionário"
    }, {
      value: "therapist",
      label: "Terapeuta"
    }],
    // Logged-in actor: a social-care admin (scoped), not superadmin.
    viewer: {
      role: "admin",
      adminSystems: ["social-care", "therapies"],
      isSuperadmin: false,
      isWorker: false
    },
    fmtDate: function (iso) {
      if (!iso) return "—";
      const p = String(iso).split("-");
      if (p.length !== 3) return iso;
      return p[2] + "/" + p[1] + "/" + p[0];
    }
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/people-context/fixtures.js", error: String((e && e.message) || e) }); }

// ui_kits/people-context/people-panels.jsx
try { (() => {
/* web_02 · People Context — organism panels.
   Composes DS primitives; never re-implements them. Views are dumb: they take
   data + handlers, no server calls. (window.PeoplePanels) */
const _DS = window.RAROSWeb02DesignSystem_9e80fa;
const {
  M3Button,
  M3TextField,
  M3DropdownField,
  M3ChoiceChip,
  M3Switch,
  M3PasswordField,
  M3SectionHeader,
  M3DataField,
  M3EmptyState,
  M3Card,
  M3ActiveBadge,
  M3LoginIndicator,
  M3RoleBadge,
  IdpRetryBanner,
  M3Badge
} = _DS;
const PD = window.PeopleData;

/* ----------------------------------------------------------------- Modal */
function Modal({
  title,
  icon,
  danger,
  onClose,
  children,
  footer,
  labelledById
}) {
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return /*#__PURE__*/React.createElement("div", {
    className: "pc-scrim",
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-modal" + (danger ? " pc-modal--danger" : ""),
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": labelledById
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-modal__head"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded pc-modal__headicon",
    "aria-hidden": "true"
  }, icon), /*#__PURE__*/React.createElement("h2", {
    id: labelledById,
    className: "pc-modal__title"
  }, title), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "pc-iconbtn",
    "aria-label": "Fechar",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "close"))), /*#__PURE__*/React.createElement("div", {
    className: "pc-modal__body"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "pc-modal__foot"
  }, footer)));
}

/* ------------------------------------------------------------- PersonForm */
function PersonForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  idpFailure,
  onRetryIdp,
  retrying
}) {
  const [f, setF] = React.useState(initial);
  const [createLogin, setCreateLogin] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const set = (k, v) => setF(p => ({
    ...p,
    [k]: v
  }));
  const nameErr = touched && !f.fullName.trim() ? "Informe o nome completo" : undefined;
  const emailErr = touched && createLogin && !f.email ? "E-mail é obrigatório para criar login" : undefined;
  const pwErr = touched && createLogin && f.initialPassword && f.initialPassword.length < 8 ? "Mínimo 8 caracteres" : undefined;
  function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (!f.fullName.trim()) return;
    if (createLogin && !f.email) return;
    if (createLogin && f.initialPassword && f.initialPassword.length < 8) return;
    onSubmit({
      ...f,
      createLogin
    });
  }
  return /*#__PURE__*/React.createElement("form", {
    className: "pc-form",
    onSubmit: submit
  }, idpFailure && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(IdpRetryBanner, {
    onRetry: onRetryIdp,
    isPending: retrying,
    error: "IDP-001"
  })), /*#__PURE__*/React.createElement("fieldset", {
    className: "pc-fieldset"
  }, /*#__PURE__*/React.createElement(M3SectionHeader, {
    title: "Dados da pessoa",
    description: "O CPF \xE9 opcional; duplicatas s\xE3o deduplicadas pelo sistema.",
    as: "h2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-form__full"
  }, /*#__PURE__*/React.createElement(M3TextField, {
    label: "Nome completo",
    required: true,
    value: f.fullName,
    maxLength: 200,
    onChange: v => set("fullName", v),
    errorMessage: nameErr,
    placeholder: "Ex.: Ana Beatriz Carvalho"
  })), /*#__PURE__*/React.createElement(M3TextField, {
    label: "CPF",
    mono: true,
    value: f.cpf,
    onChange: v => set("cpf", v),
    placeholder: "000.000.000-00",
    hint: "Opcional",
    leadingIcon: "badge"
  }), /*#__PURE__*/React.createElement(M3TextField, {
    label: "Data de nascimento",
    mono: true,
    value: f.birthDate,
    onChange: v => set("birthDate", v),
    placeholder: "dd/mm/aaaa",
    leadingIcon: "event"
  }), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__full"
  }, /*#__PURE__*/React.createElement(M3TextField, {
    label: "E-mail",
    type: "email",
    value: f.email,
    onChange: v => set("email", v),
    errorMessage: emailErr,
    placeholder: "nome@exemplo.org",
    leadingIcon: "mail",
    hint: createLogin ? undefined : "Opcional — necessário se for criar login"
  })))), mode === "create" && /*#__PURE__*/React.createElement("fieldset", {
    className: "pc-fieldset pc-fieldset--accent"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-form__toggle"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Acesso ao sistema"), /*#__PURE__*/React.createElement("p", null, "Cria um login no provedor de identidade j\xE1 no cadastro. Voc\xEA tamb\xE9m pode provisionar depois.")), /*#__PURE__*/React.createElement(M3Switch, {
    checked: createLogin,
    onChange: setCreateLogin,
    "aria-expanded": createLogin
  })), createLogin && /*#__PURE__*/React.createElement("div", {
    className: "pc-form__grid",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-form__full"
  }, /*#__PURE__*/React.createElement(M3PasswordField, {
    value: f.initialPassword || "",
    onChange: v => set("initialPassword", v),
    errorMessage: pwErr,
    hint: "Opcional \u2014 em branco, a senha \xE9 definida por link de recupera\xE7\xE3o."
  })))), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__actions"
  }, /*#__PURE__*/React.createElement(M3Button, {
    variant: "text",
    type: "button",
    onPress: onCancel
  }, "Cancelar"), /*#__PURE__*/React.createElement(M3Button, {
    variant: "filled",
    type: "submit",
    icon: "check"
  }, mode === "create" ? "Cadastrar pessoa" : "Salvar alterações")));
}

/* --------------------------------------------------- RoleChipWithActions */
function RoleChipWithActions({
  role,
  canManage,
  onDeactivate,
  onReactivate
}) {
  const [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: "pc-rolerow"
  }, /*#__PURE__*/React.createElement(M3RoleBadge, {
    system: role.system,
    role: role.role,
    active: role.active
  }), /*#__PURE__*/React.createElement("span", {
    className: "pc-rolerow__date"
  }, "desde ", PD.fmtDate(role.assignedAt)), /*#__PURE__*/React.createElement(M3ActiveBadge, {
    active: role.active,
    size: "sm",
    labels: {
      on: "Ativo",
      off: "Inativo"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "pc-rolerow__spacer"
  }), canManage ? /*#__PURE__*/React.createElement("div", {
    className: "pc-menuwrap"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "pc-iconbtn",
    "aria-label": "A\xE7\xF5es do v\xEDnculo",
    "aria-haspopup": "menu",
    onClick: () => setOpen(o => !o),
    onBlur: () => setTimeout(() => setOpen(false), 150)
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "more_vert")), open && /*#__PURE__*/React.createElement("div", {
    className: "pc-menu",
    role: "menu"
  }, role.active ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "menuitem",
    className: "pc-menu__item pc-menu__item--danger",
    onMouseDown: onDeactivate
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "pause_circle"), "Desativar v\xEDnculo") : /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "menuitem",
    className: "pc-menu__item",
    onMouseDown: onReactivate
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "play_circle"), "Reativar v\xEDnculo"))) : /*#__PURE__*/React.createElement("span", {
    className: "pc-rolerow__ro",
    title: "Somente leitura"
  }, "lock"));
}

/* ------------------------------------------------------------- RolePanel */
function RolePanel({
  roles,
  viewer,
  onAssign,
  onDeactivate,
  onReactivate
}) {
  const [filter, setFilter] = React.useState("all");
  const [assigning, setAssigning] = React.useState(false);
  const [sys, setSys] = React.useState(viewer.adminSystems[0] || "social-care");
  const [rol, setRol] = React.useState("patient");
  const canManageSystem = system => viewer.isSuperadmin || viewer.adminSystems.includes(system);
  const shown = roles.filter(r => filter === "all" ? true : filter === "active" ? r.active : !r.active);
  const assignableSystems = viewer.isSuperadmin ? PD.systems : PD.systems.filter(s => viewer.adminSystems.includes(s.value));
  return /*#__PURE__*/React.createElement("div", {
    className: "pc-panel"
  }, /*#__PURE__*/React.createElement(M3SectionHeader, {
    title: "V\xEDnculos de sistema",
    description: "Pap\xE9is da pessoa em cada sistema da rede.",
    action: /*#__PURE__*/React.createElement(M3Button, {
      variant: "tonal",
      size: "sm",
      icon: "add",
      onPress: () => setAssigning(true)
    }, "Atribuir v\xEDnculo")
  }), /*#__PURE__*/React.createElement("div", {
    className: "pc-panel__toolbar"
  }, /*#__PURE__*/React.createElement(M3ChoiceChip, {
    ariaLabel: "Filtrar v\xEDnculos",
    value: filter,
    onChange: setFilter,
    options: [{
      value: "all",
      label: "Todos"
    }, {
      value: "active",
      label: "Ativos"
    }, {
      value: "inactive",
      label: "Inativos"
    }]
  }), /*#__PURE__*/React.createElement("span", {
    className: "pc-count"
  }, shown.length, " de ", roles.length)), shown.length === 0 ? /*#__PURE__*/React.createElement(M3Card, {
    padding: "none"
  }, /*#__PURE__*/React.createElement(M3EmptyState, {
    icon: "link_off",
    title: "Nenhum v\xEDnculo de sistema",
    description: filter === "all" ? "Esta pessoa ainda não tem papéis atribuídos em nenhum sistema." : "Nenhum vínculo neste filtro.",
    action: filter === "all" ? {
      label: "Atribuir vínculo",
      onPress: () => setAssigning(true),
      icon: "add"
    } : undefined
  })) : /*#__PURE__*/React.createElement("div", {
    className: "pc-rolelist"
  }, shown.map(r => /*#__PURE__*/React.createElement(RoleChipWithActions, {
    key: r.id,
    role: r,
    canManage: canManageSystem(r.system),
    onDeactivate: () => onDeactivate(r.id),
    onReactivate: () => onReactivate(r.id)
  }))), assigning && /*#__PURE__*/React.createElement(Modal, {
    title: "Atribuir v\xEDnculo de sistema",
    icon: "add_link",
    labelledById: "assign-title",
    onClose: () => setAssigning(false),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(M3Button, {
      variant: "text",
      onPress: () => setAssigning(false)
    }, "Cancelar"), /*#__PURE__*/React.createElement(M3Button, {
      variant: "filled",
      icon: "check",
      onPress: () => {
        onAssign(sys, rol);
        setAssigning(false);
      }
    }, "Atribuir"))
  }, /*#__PURE__*/React.createElement("p", {
    className: "pc-modal__lead"
  }, "Voc\xEA gerencia apenas os sistemas do seu escopo de administra\xE7\xE3o."), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__grid"
  }, /*#__PURE__*/React.createElement(M3DropdownField, {
    label: "Sistema",
    value: sys,
    onChange: setSys,
    options: assignableSystems
  }), /*#__PURE__*/React.createElement(M3DropdownField, {
    label: "Papel",
    value: rol,
    onChange: setRol,
    options: PD.roles
  })), /*#__PURE__*/React.createElement("div", {
    className: "pc-preview"
  }, /*#__PURE__*/React.createElement("span", null, "Pr\xE9-visualiza\xE7\xE3o:"), " ", /*#__PURE__*/React.createElement(M3RoleBadge, {
    system: sys,
    role: rol,
    active: true
  }))));
}

/* ------------------------------------------------------- IdpAccessPanel */
function AccessBlock({
  icon,
  title,
  desc,
  children,
  tone
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "pc-accblock" + (tone ? " pc-accblock--" + tone : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded pc-accblock__icon",
    "aria-hidden": "true"
  }, icon), /*#__PURE__*/React.createElement("div", {
    className: "pc-accblock__body"
  }, /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("p", null, desc), children && /*#__PURE__*/React.createElement("div", {
    className: "pc-accblock__action"
  }, children)));
}
function IdpAccessPanel({
  person,
  viewer,
  onProvision,
  onReset,
  onDeactivate,
  onReactivate,
  onErase,
  pendingAction
}) {
  const hasLogin = person.idpUserId != null;
  return /*#__PURE__*/React.createElement("div", {
    className: "pc-panel"
  }, /*#__PURE__*/React.createElement(M3SectionHeader, {
    title: "Acesso e login",
    description: "V\xEDnculo da pessoa com o provedor de identidade (Authentik).",
    as: "h2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "pc-acclist"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-acclogin"
  }, /*#__PURE__*/React.createElement(M3LoginIndicator, {
    state: person.loginState
  }), hasLogin && /*#__PURE__*/React.createElement(M3DataField, {
    label: "ID no provedor",
    value: person.idpUserId.slice(0, 18) + "…",
    mono: true
  })), !hasLogin ? /*#__PURE__*/React.createElement(AccessBlock, {
    icon: "key",
    title: "Provisionar login",
    desc: "Cria o usu\xE1rio no provedor de identidade. O e-mail \xE9 obrigat\xF3rio."
  }, /*#__PURE__*/React.createElement(M3Button, {
    variant: "tonal",
    icon: "key",
    pending: pendingAction === "provision",
    onPress: onProvision
  }, "Provisionar login")) : /*#__PURE__*/React.createElement(AccessBlock, {
    icon: "lock_reset",
    title: "Recupera\xE7\xE3o de senha",
    desc: "Envia um link de redefini\xE7\xE3o por e-mail. O link nunca \xE9 exibido aqui."
  }, /*#__PURE__*/React.createElement(M3Button, {
    variant: "tonal",
    icon: "mail",
    pending: pendingAction === "reset",
    onPress: onReset
  }, "Enviar link por e-mail")), /*#__PURE__*/React.createElement(AccessBlock, {
    icon: person.active ? "pause_circle" : "play_circle",
    title: person.active ? "Desativar pessoa" : "Reativar pessoa",
    desc: person.active ? "Desativação temporária. O provedor é atualizado primeiro; se ele estiver fora, nada muda no banco." : "Reativa o acesso. Não altera os vínculos de sistema (eixos independentes)."
  }, person.active ? /*#__PURE__*/React.createElement(M3Button, {
    variant: "outlined",
    icon: "pause",
    pending: pendingAction === "deactivate",
    onPress: onDeactivate
  }, "Desativar") : /*#__PURE__*/React.createElement(M3Button, {
    variant: "outlined",
    icon: "play_arrow",
    pending: pendingAction === "reactivate",
    onPress: onReactivate
  }, "Reativar")), viewer.isSuperadmin && /*#__PURE__*/React.createElement(AccessBlock, {
    tone: "danger",
    icon: "delete_forever",
    title: "Apagamento total (LGPD)",
    desc: "Remove o usu\xE1rio no provedor, todos os v\xEDnculos e o registro da pessoa. Irrevers\xEDvel \u2014 LGPD Art. 18 V."
  }, /*#__PURE__*/React.createElement(M3Button, {
    variant: "destructive",
    icon: "delete_forever",
    onPress: onErase
  }, "Apagar definitivamente"))));
}

/* ------------------------------------------------------- ErasureDialog */
function ErasureDialog({
  person,
  onConfirm,
  onCancel,
  isPending
}) {
  const [ack, setAck] = React.useState(false);
  const [typed, setTyped] = React.useState("");
  const norm = s => s.trim().replace(/\s+/g, " ").toLowerCase();
  const nameOk = norm(typed) === norm(person.fullName);
  const ready = ack && nameOk;
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Apagar registro definitivamente",
    icon: "delete_forever",
    danger: true,
    labelledById: "erase-title",
    onClose: onCancel,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(M3Button, {
      variant: "text",
      onPress: onCancel
    }, "Cancelar"), /*#__PURE__*/React.createElement(M3Button, {
      variant: "destructive",
      icon: "delete_forever",
      disabled: !ready,
      pending: isPending,
      onPress: () => ready && onConfirm()
    }, "Apagar definitivamente"))
  }, /*#__PURE__*/React.createElement("p", {
    className: "pc-modal__lead"
  }, "Esta a\xE7\xE3o \xE9 ", /*#__PURE__*/React.createElement("strong", null, "irrevers\xEDvel"), ". Ser\xE3o removidos:"), /*#__PURE__*/React.createElement("ul", {
    className: "pc-erase__list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "person_remove"), "O usu\xE1rio no provedor de identidade"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "link_off"), "Todos os v\xEDnculos de sistema"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "database"), "O registro da pessoa no banco")), /*#__PURE__*/React.createElement("div", {
    className: "pc-erase__review"
  }, /*#__PURE__*/React.createElement(M3DataField, {
    label: "Pessoa",
    value: person.fullName
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "CPF",
    value: person.cpfMasked,
    mono: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "pc-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: ack,
    onChange: e => setAck(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "Entendo que esta a\xE7\xE3o \xE9 irrevers\xEDvel")), /*#__PURE__*/React.createElement(M3TextField, {
    label: 'Digite o nome completo para confirmar',
    value: typed,
    onChange: setTyped,
    placeholder: person.fullName,
    errorMessage: typed && !nameOk ? "O nome não confere" : undefined
  }));
}
window.PeoplePanels = {
  Modal,
  PersonForm,
  RolePanel,
  RoleChipWithActions,
  IdpAccessPanel,
  ErasureDialog
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/people-context/people-panels.jsx", error: String((e && e.message) || e) }); }

// ui_kits/people-context/people-screens.jsx
try { (() => {
/* web_02 · People Context — interactive recreation of the /people routes.
   Composes DS primitives + organism panels (window.PeoplePanels). Synthetic
   fixtures only (window.PeopleData). (window.PeopleKit) */
const DS = window.RAROSWeb02DesignSystem_9e80fa;
const {
  M3Button,
  M3TextField,
  M3SectionHeader,
  M3DataField,
  M3EmptyState,
  M3ActiveBadge,
  M3LoginIndicator,
  M3RoleBadge,
  M3Badge,
  M3Card,
  M3TopAppBar,
  M3NavRail
} = DS;
const {
  PersonForm,
  RolePanel,
  IdpAccessPanel,
  ErasureDialog
} = window.PeoplePanels;
const P = window.PeopleData;
function initials(name) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0] || "")[0] || "") + ((parts[parts.length - 1] || "")[0] || "");
}

/* ------------------------------------------------------------------ Shell */
const NAV = [{
  id: "social-care",
  label: "Prontuário",
  icon: "folder_shared"
}, {
  id: "people",
  label: "Pessoas",
  icon: "group"
}, {
  id: "indicators",
  label: "Indicadores",
  icon: "monitoring"
}];
function Shell({
  title,
  onBack,
  statusSlot,
  actions,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-shell"
  }, /*#__PURE__*/React.createElement(M3NavRail, {
    items: NAV,
    activeId: "people",
    onSelect: () => {},
    logo: "../../assets/logo-raros-mark.webp",
    footer: /*#__PURE__*/React.createElement("button", {
      className: "m3-rail__item",
      type: "button",
      "aria-label": "Conta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "m3-rail__icon"
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-symbols-rounded",
      "aria-hidden": "true"
    }, "account_circle")), /*#__PURE__*/React.createElement("span", {
      className: "m3-rail__label"
    }, "Conta"))
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-main"
  }, /*#__PURE__*/React.createElement(M3TopAppBar, {
    title: title,
    onBack: onBack,
    statusSlot: statusSlot,
    actions: actions
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-content"
  }, children)));
}

/* -------------------------------------------------------------- PersonRow */
function PersonRow({
  person,
  onOpen,
  onEdit,
  onToggleActive,
  canEdit
}) {
  const [open, setOpen] = React.useState(false);
  const extra = person.roles.length - 3;
  return /*#__PURE__*/React.createElement("div", {
    className: "pc-row" + (person.active ? "" : " pc-row--inactive"),
    role: "row"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "pc-row__main",
    "aria-label": "Abrir cadastro de " + person.fullName,
    onClick: onOpen
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-avatar",
    "aria-hidden": "true"
  }, initials(person.fullName).toUpperCase()), /*#__PURE__*/React.createElement("span", {
    className: "pc-row__id"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-row__name"
  }, person.fullName), /*#__PURE__*/React.createElement("span", {
    className: "pc-row__cpf"
  }, person.cpfMasked || "Sem CPF"))), /*#__PURE__*/React.createElement("div", {
    className: "pc-row__badges"
  }, /*#__PURE__*/React.createElement(M3ActiveBadge, {
    active: person.active,
    size: "sm"
  }), /*#__PURE__*/React.createElement(M3LoginIndicator, {
    state: person.loginState
  })), /*#__PURE__*/React.createElement("div", {
    className: "pc-row__roles"
  }, person.roles.slice(0, 3).map(r => /*#__PURE__*/React.createElement(M3RoleBadge, {
    key: r.id,
    system: r.system,
    role: r.role,
    active: r.active
  })), extra > 0 && /*#__PURE__*/React.createElement("span", {
    className: "pc-row__more"
  }, "+", extra), person.roles.length === 0 && /*#__PURE__*/React.createElement("span", {
    className: "pc-row__norole"
  }, "\u2014")), /*#__PURE__*/React.createElement("div", {
    className: "pc-menuwrap pc-row__menu"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "pc-iconbtn",
    "aria-label": "Ações de " + person.fullName,
    "aria-haspopup": "menu",
    onClick: () => setOpen(o => !o),
    onBlur: () => setTimeout(() => setOpen(false), 150)
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "more_vert")), open && /*#__PURE__*/React.createElement("div", {
    className: "pc-menu",
    role: "menu"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "menuitem",
    className: "pc-menu__item",
    onMouseDown: onOpen
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "open_in_new"), "Abrir"), canEdit && /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "menuitem",
    className: "pc-menu__item",
    onMouseDown: onEdit
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "edit"), "Editar"), canEdit && /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "menuitem",
    className: "pc-menu__item" + (person.active ? " pc-menu__item--danger" : ""),
    onMouseDown: onToggleActive
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, person.active ? "pause_circle" : "play_circle"), person.active ? "Desativar" : "Reativar"))));
}

/* ------------------------------------------------------------- ListScreen */
function ListScreen({
  people,
  onOpen,
  onNew,
  onEdit,
  onToggleActive,
  canEdit
}) {
  const [search, setSearch] = React.useState("");
  const [shown, setShown] = React.useState(P.pageSize);
  const q = search.trim().toLowerCase();
  const digits = q.replace(/\D/g, "");
  const filtered = !q ? people : people.filter(p => {
    if (digits.length >= 2 && p.cpfMasked) return p.cpfMasked.replace(/\D/g, "").includes(digits);
    return p.fullName.toLowerCase().includes(q);
  });
  const page = filtered.slice(0, shown);
  const hasMore = !q && shown < people.length;
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-pagehead"
  }, /*#__PURE__*/React.createElement("h1", null, "Pessoas"), /*#__PURE__*/React.createElement("p", null, "Cadastro central de pessoas da rede RAROS. Busque por nome ou CPF; abra um registro para gerir perfil, v\xEDnculos e acesso.")), /*#__PURE__*/React.createElement("div", {
    className: "pc-listbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-search"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "search"), /*#__PURE__*/React.createElement("input", {
    type: "search",
    value: search,
    placeholder: "Buscar por nome ou CPF",
    "aria-label": "Buscar por nome ou CPF",
    onChange: e => {
      setSearch(e.target.value);
      setShown(P.pageSize);
    }
  }), search && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "pc-iconbtn",
    "aria-label": "Limpar",
    onClick: () => setSearch("")
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "close"))), canEdit && /*#__PURE__*/React.createElement(M3Button, {
    variant: "filled",
    icon: "add",
    onPress: onNew
  }, "Nova pessoa")), /*#__PURE__*/React.createElement("div", {
    className: "pc-count pc-count--total",
    "aria-live": "polite"
  }, q ? `${filtered.length} resultado${filtered.length === 1 ? "" : "s"}` : `${P.totalCount.toLocaleString("pt-BR")} pessoas`), filtered.length === 0 ? /*#__PURE__*/React.createElement(M3Card, {
    padding: "none"
  }, /*#__PURE__*/React.createElement(M3EmptyState, {
    icon: "person_search",
    title: "Nenhuma pessoa encontrada",
    description: `Nenhum cadastro corresponde a “${search}”. Verifique o termo ou limpe a busca.`,
    action: {
      label: "Limpar busca",
      onPress: () => setSearch(""),
      icon: "close"
    }
  })) : /*#__PURE__*/React.createElement("div", {
    className: "pc-table",
    role: "table",
    "aria-label": "Pessoas"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-table__head",
    role: "row"
  }, /*#__PURE__*/React.createElement("span", null, "Pessoa"), /*#__PURE__*/React.createElement("span", null, "Situa\xE7\xE3o"), /*#__PURE__*/React.createElement("span", null, "V\xEDnculos"), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  })), page.map(p => /*#__PURE__*/React.createElement(PersonRow, {
    key: p.id,
    person: p,
    canEdit: canEdit,
    onOpen: () => onOpen(p.id),
    onEdit: () => onEdit(p.id),
    onToggleActive: () => onToggleActive(p.id)
  }))), hasMore && /*#__PURE__*/React.createElement("div", {
    className: "pc-loadmore"
  }, /*#__PURE__*/React.createElement("span", null, page.length, " de ", P.totalCount.toLocaleString("pt-BR")), /*#__PURE__*/React.createElement(M3Button, {
    variant: "text",
    icon: "expand_more",
    onPress: () => setShown(s => s + P.pageSize)
  }, "Carregar mais")));
}

/* ------------------------------------------------------------ DetailScreen */
const TABS = [{
  id: "profile",
  label: "Perfil",
  icon: "person"
}, {
  id: "roles",
  label: "Vínculos",
  icon: "link"
}, {
  id: "access",
  label: "Acesso",
  icon: "key"
}];
function ProfileTab({
  person,
  onEdit,
  editing,
  onSave,
  onCancel
}) {
  if (editing) {
    return /*#__PURE__*/React.createElement(PersonForm, {
      mode: "edit",
      initial: {
        fullName: person.fullName,
        cpf: person.cpfMasked || "",
        birthDate: P.fmtDate(person.birthDate),
        email: person.email || ""
      },
      onSubmit: onSave,
      onCancel: onCancel
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "pc-panel"
  }, !person.active && /*#__PURE__*/React.createElement("div", {
    className: "pc-inactivebanner",
    role: "note"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "info"), "Pessoa inativa. A edi\xE7\xE3o segue dispon\xEDvel \u2014 desativa\xE7\xE3o e dados s\xE3o eixos independentes."), /*#__PURE__*/React.createElement(M3SectionHeader, {
    title: "Dados pessoais",
    as: "h2",
    action: /*#__PURE__*/React.createElement(M3Button, {
      variant: "outlined",
      size: "sm",
      icon: "edit",
      onPress: onEdit
    }, "Editar")
  }), /*#__PURE__*/React.createElement("dl", {
    className: "pc-datagrid"
  }, /*#__PURE__*/React.createElement(M3DataField, {
    label: "Nome completo",
    value: person.fullName
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "CPF",
    value: person.cpfMasked,
    mono: true
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "Data de nascimento",
    value: P.fmtDate(person.birthDate),
    mono: true
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "E-mail",
    value: person.email
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "ID no provedor",
    value: person.idpUserId ? person.idpUserId.slice(0, 18) + "…" : null,
    mono: true,
    emptyFallback: "Sem login"
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "Cadastrada em",
    value: P.fmtDate(person.createdAt),
    mono: true
  })));
}
function DetailScreen({
  person,
  tab,
  onTab,
  profileEditing,
  onEditProfile,
  onSaveProfile,
  onCancelProfile,
  onAssignRole,
  onDeactivateRole,
  onReactivateRole,
  onAccess,
  pendingAction,
  erasing,
  onErase,
  onConfirmErase,
  onCancelErase
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "pc-detailhead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-avatar pc-avatar--lg",
    "aria-hidden": "true"
  }, initials(person.fullName).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "pc-detailhead__id"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-detailhead__badges"
  }, /*#__PURE__*/React.createElement(M3ActiveBadge, {
    active: person.active
  }), /*#__PURE__*/React.createElement(M3LoginIndicator, {
    state: person.loginState
  })))), /*#__PURE__*/React.createElement("div", {
    className: "pc-tabs",
    role: "tablist",
    "aria-label": "Se\xE7\xF5es do cadastro"
  }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    type: "button",
    role: "tab",
    "aria-selected": tab === t.id,
    className: "pc-tab" + (tab === t.id ? " pc-tab--active" : ""),
    onClick: () => onTab(t.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, t.icon), t.label))), /*#__PURE__*/React.createElement("div", {
    className: "kit-page"
  }, tab === "profile" && /*#__PURE__*/React.createElement(ProfileTab, {
    person: person,
    editing: profileEditing,
    onEdit: onEditProfile,
    onSave: onSaveProfile,
    onCancel: onCancelProfile
  }), tab === "roles" && /*#__PURE__*/React.createElement(RolePanel, {
    roles: person.roles,
    viewer: P.viewer,
    onAssign: onAssignRole,
    onDeactivate: onDeactivateRole,
    onReactivate: onReactivateRole
  }), tab === "access" && /*#__PURE__*/React.createElement(IdpAccessPanel, {
    person: person,
    viewer: P.viewer,
    onProvision: () => onAccess("provision"),
    onReset: () => onAccess("reset"),
    onDeactivate: () => onAccess("deactivate"),
    onReactivate: () => onAccess("reactivate"),
    onErase: onErase,
    pendingAction: pendingAction
  })), erasing && /*#__PURE__*/React.createElement(ErasureDialog, {
    person: person,
    isPending: false,
    onConfirm: onConfirmErase,
    onCancel: onCancelErase
  }));
}

/* -------------------------------------------------------------------- App */
function App() {
  const [people, setPeople] = React.useState(() => P.people.map(p => ({
    ...p,
    roles: p.roles.slice()
  })));
  const [route, setRoute] = React.useState({
    name: "list"
  });
  const [profileEditing, setProfileEditing] = React.useState(false);
  const [erasing, setErasing] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState(null);
  const [idpFailure, setIdpFailure] = React.useState(false);
  const [retrying, setRetrying] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const canEdit = P.viewer.role === "admin" || P.viewer.role === "worker";
  const current = route.id ? people.find(p => p.id === route.id) : null;
  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }
  function patch(id, fn) {
    setPeople(ps => ps.map(p => p.id === id ? fn(p) : p));
  }
  function openDetail(id, tab) {
    setProfileEditing(false);
    setRoute({
      name: "detail",
      id,
      tab: tab || "profile"
    });
  }
  function createPerson(data) {
    const id = "p-new-" + Math.random().toString(16).slice(2, 7);
    const fail = data.createLogin && /falha|207/i.test(data.fullName); // type "207" in name to simulate
    const np = {
      id,
      fullName: data.fullName,
      cpfMasked: data.cpf || null,
      birthDate: "1990-01-01",
      email: data.email || null,
      active: true,
      idpUserId: data.createLogin && !fail ? "new-" + id : null,
      loginState: data.createLogin ? fail ? "failed" : "linked" : "none",
      createdAt: "2026-06-12",
      roles: []
    };
    setPeople(ps => [np, ...ps]);
    setIdpFailure(fail);
    openDetail(id, "profile");
    flash(fail ? "Pessoa criada — provisão de login falhou (207)" : "Pessoa cadastrada com sucesso");
  }
  function retryIdp() {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      setIdpFailure(false);
      patch(current.id, p => ({
        ...p,
        idpUserId: "retry-" + p.id,
        loginState: "linked"
      }));
      flash("Login provisionado com sucesso");
    }, 900);
  }
  function saveProfile(data) {
    patch(current.id, p => ({
      ...p,
      fullName: data.fullName,
      cpfMasked: data.cpf || p.cpfMasked,
      email: data.email || null
    }));
    setProfileEditing(false);
    flash("Dados atualizados");
  }
  function assignRole(system, role) {
    patch(current.id, p => ({
      ...p,
      roles: [...p.roles, {
        id: "r-" + Math.random().toString(16).slice(2, 8),
        system,
        role,
        active: true,
        assignedAt: "2026-06-12"
      }]
    }));
    flash("Vínculo atribuído");
  }
  function setRoleActive(roleId, active) {
    patch(current.id, p => ({
      ...p,
      roles: p.roles.map(r => r.id === roleId ? {
        ...r,
        active
      } : r)
    }));
    flash(active ? "Vínculo reativado" : "Vínculo desativado");
  }
  function doAccess(action) {
    setPendingAction(action);
    setTimeout(() => {
      setPendingAction(null);
      if (action === "provision") {
        patch(current.id, p => ({
          ...p,
          idpUserId: "prov-" + p.id,
          loginState: "linked"
        }));
        flash("Login provisionado");
      } else if (action === "reset") flash("Link de recuperação enviado por e-mail");else if (action === "deactivate") {
        patch(current.id, p => ({
          ...p,
          active: false
        }));
        flash("Pessoa desativada");
      } else if (action === "reactivate") {
        patch(current.id, p => ({
          ...p,
          active: true
        }));
        flash("Pessoa reativada");
      }
    }, 800);
  }
  function confirmErase() {
    const id = current.id;
    setPeople(ps => ps.filter(p => p.id !== id));
    setErasing(false);
    setRoute({
      name: "list"
    });
    flash("Registro apagado definitivamente");
  }

  // ---- render
  if (route.name === "list") {
    return /*#__PURE__*/React.createElement(Shell, {
      title: "Pessoas",
      statusSlot: /*#__PURE__*/React.createElement(M3Badge, {
        variant: "success",
        dot: true
      }, "web_02")
    }, /*#__PURE__*/React.createElement(ListScreen, {
      people: people,
      canEdit: canEdit,
      onOpen: id => openDetail(id),
      onNew: () => setRoute({
        name: "new"
      }),
      onEdit: id => openDetail(id, "profile"),
      onToggleActive: id => {
        patch(id, p => ({
          ...p,
          active: !p.active
        }));
      }
    }), toast && /*#__PURE__*/React.createElement(Toast, {
      msg: toast
    }));
  }
  if (route.name === "new") {
    return /*#__PURE__*/React.createElement(Shell, {
      title: "Nova pessoa",
      onBack: () => setRoute({
        name: "list"
      })
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-page kit-page--narrow"
    }, /*#__PURE__*/React.createElement("div", {
      className: "kit-pagehead"
    }, /*#__PURE__*/React.createElement("h1", null, "Cadastrar pessoa"), /*#__PURE__*/React.createElement("p", null, "Preencha os dados. O CPF \xE9 opcional. Marque \u201CAcesso ao sistema\u201D para criar um login j\xE1 no cadastro \u2014 dica: inclua \u201C207\u201D no nome para simular falha de provis\xE3o.")), /*#__PURE__*/React.createElement(M3Card, {
      padding: "md"
    }, /*#__PURE__*/React.createElement(PersonForm, {
      mode: "create",
      initial: {
        fullName: "",
        cpf: "",
        birthDate: "",
        email: "",
        initialPassword: ""
      },
      onSubmit: createPerson,
      onCancel: () => setRoute({
        name: "list"
      })
    }))), toast && /*#__PURE__*/React.createElement(Toast, {
      msg: toast
    }));
  }
  if (route.name === "detail" && current) {
    const statusSlot = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(M3ActiveBadge, {
      active: current.active
    }), /*#__PURE__*/React.createElement(M3LoginIndicator, {
      state: current.loginState
    }));
    return /*#__PURE__*/React.createElement(Shell, {
      title: current.fullName,
      onBack: () => setRoute({
        name: "list"
      }),
      statusSlot: statusSlot
    }, idpFailure && /*#__PURE__*/React.createElement("div", {
      className: "kit-page",
      style: {
        paddingBottom: 0
      }
    }, /*#__PURE__*/React.createElement(IdpRetryBannerWrap, {
      onRetry: retryIdp,
      retrying: retrying
    })), /*#__PURE__*/React.createElement(DetailScreen, {
      person: current,
      tab: route.tab,
      onTab: t => setRoute({
        ...route,
        tab: t
      }),
      profileEditing: profileEditing,
      onEditProfile: () => setProfileEditing(true),
      onSaveProfile: saveProfile,
      onCancelProfile: () => setProfileEditing(false),
      onAssignRole: assignRole,
      onDeactivateRole: id => setRoleActive(id, false),
      onReactivateRole: id => setRoleActive(id, true),
      onAccess: doAccess,
      pendingAction: pendingAction,
      erasing: erasing,
      onErase: () => setErasing(true),
      onConfirmErase: confirmErase,
      onCancelErase: () => setErasing(false)
    }), toast && /*#__PURE__*/React.createElement(Toast, {
      msg: toast
    }));
  }

  // person was erased / not found
  return /*#__PURE__*/React.createElement(Shell, {
    title: "Pessoas",
    onBack: () => setRoute({
      name: "list"
    })
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-page"
  }, /*#__PURE__*/React.createElement(M3Card, {
    padding: "none"
  }, /*#__PURE__*/React.createElement(M3EmptyState, {
    icon: "person_off",
    title: "Registro n\xE3o encontrado",
    description: "Esta pessoa n\xE3o existe mais (404). Volte \xE0 lista.",
    action: {
      label: "Voltar à lista",
      onPress: () => setRoute({
        name: "list"
      }),
      icon: "arrow_back"
    }
  }))));
}
function IdpRetryBannerWrap({
  onRetry,
  retrying
}) {
  const {
    IdpRetryBanner
  } = DS;
  return /*#__PURE__*/React.createElement(IdpRetryBanner, {
    onRetry: onRetry,
    isPending: retrying,
    error: "IDP-001"
  });
}
function Toast({
  msg
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-toast",
    role: "status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "check_circle"), msg);
}
window.PeopleKit = {
  App
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/people-context/people-screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/social-care/fixtures.js
try { (() => {
/* Synthetic fixtures for the social-care kit. No real PII — illustrative only. */
(function () {
  window.ScData = {
    patients: [{
      id: "p1",
      name: "Maria das Graças Souza",
      cpf: "12345678900",
      status: "active",
      age: 47,
      risks: ["overcrowding", "dropout"]
    }, {
      id: "p2",
      name: "José Carlos Pereira",
      cpf: "98765432100",
      status: "waitlisted",
      age: 52,
      risks: []
    }, {
      id: "p3",
      name: "Ana Beatriz Lima",
      cpf: "45678912300",
      status: "active",
      age: 9,
      risks: ["prenatal"]
    }, {
      id: "p4",
      name: "Raimundo Nonato da Silva",
      cpf: "32165498700",
      status: "discharged",
      age: 63,
      risks: []
    }, {
      id: "p5",
      name: "Francisca Oliveira",
      cpf: "15975348600",
      status: "active",
      age: 34,
      risks: ["violation"]
    }, {
      id: "p6",
      name: "Paciente [LGPD]",
      cpf: "",
      status: "withdrawn",
      age: null,
      risks: [],
      anonymized: true
    }],
    record: {
      id: "p1",
      name: "Maria das Graças Souza",
      status: "active",
      socialName: "Maria",
      birthDate: "15031978",
      sex: "Feminino",
      cpf: "12345678900",
      nis: "12345678901",
      cns: "700000000000000",
      address: "Rua das Flores, 123 · Boa Vista–RR",
      cep: "69301150",
      diagnoses: [{
        code: "E75.2",
        label: "Gangliosidose GM2"
      }],
      analytics: [{
        label: "Densidade habitacional",
        value: 2.5,
        format: "decimal",
        unit: "hab/cômodo",
        icon: "home",
        tone: "warning",
        toneLabel: "Risco de sobrelotação"
      }, {
        label: "Renda per capita",
        value: 33333,
        format: "currency",
        icon: "payments",
        tone: "warning",
        toneLabel: "Abaixo de ½ SM"
      }, {
        label: "Índice de vulnerabilidade",
        value: "Alta",
        icon: "warning",
        tone: "danger",
        toneLabel: "Prioridade"
      }, {
        label: "Perfil etário",
        value: "1 / 2 / 0 / 2 / 1",
        icon: "groups",
        tone: "neutral",
        toneLabel: "0-6 / 7-14 / 15-18 / 19-59 / 60+"
      }],
      family: [{
        id: "m1",
        name: "José Souza",
        relationship: "Pai",
        age: 52,
        primary: true,
        caregiver: true,
        pending: 0
      }, {
        id: "m2",
        name: "Ana Souza",
        relationship: "Filha",
        age: 9,
        primary: false,
        caregiver: false,
        pending: 2
      }, {
        id: "m3",
        name: "Carlos Souza",
        relationship: "Filho",
        age: 14,
        primary: false,
        caregiver: false,
        pending: 0
      }, {
        id: "m4",
        name: "Dona Lúcia",
        relationship: "Avó",
        age: 71,
        primary: false,
        caregiver: false,
        pending: 0
      }],
      audit: [{
        title: "Condição habitacional atualizada",
        actor: "Téc. Carla",
        datetime: "10/06/2026 14:30",
        iso: "2026-06-10T14:30",
        icon: "edit",
        tone: "info",
        diff: [{
          field: "Nº de dormitórios",
          before: "1",
          after: "2"
        }, {
          field: "Água encanada",
          before: "Não",
          after: "Sim"
        }]
      }, {
        title: "Atendimento registrado",
        actor: "Téc. Carla",
        datetime: "08/06/2026 09:15",
        iso: "2026-06-08T09:15",
        icon: "medical_services",
        tone: "default"
      }, {
        title: "Paciente admitido",
        actor: "Adm. Roberto",
        datetime: "01/06/2026 11:00",
        iso: "2026-06-01T11:00",
        icon: "login",
        tone: "success"
      }, {
        title: "Prontuário criado",
        actor: "Téc. Carla",
        datetime: "28/05/2026 16:40",
        iso: "2026-05-28T16:40",
        icon: "note_add",
        tone: "neutral",
        last: true
      }]
    },
    dischargeReasons: [{
      value: "caseObjectiveAchieved",
      label: "Objetivo do caso alcançado"
    }, {
      value: "transferredToAnotherService",
      label: "Transferido para outro serviço"
    }, {
      value: "patientRequestedDischarge",
      label: "Solicitação do paciente"
    }, {
      value: "lossOfContact",
      label: "Perda de contato"
    }, {
      value: "relocation",
      label: "Mudança de cidade"
    }, {
      value: "death",
      label: "Óbito"
    }, {
      value: "other",
      label: "Outro"
    }],
    parentesco: [{
      value: "pai",
      label: "Pai"
    }, {
      value: "mae",
      label: "Mãe"
    }, {
      value: "filho",
      label: "Filho(a)"
    }, {
      value: "irmao",
      label: "Irmão(ã)"
    }, {
      value: "avo",
      label: "Avô/Avó"
    }, {
      value: "outro",
      label: "Outro"
    }]
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/social-care/fixtures.js", error: String((e && e.message) || e) }); }

// ui_kits/social-care/screens.jsx
try { (() => {
/* web_02 · Social Care — interactive recreation (prontuário).
   Composes the design-system primitives; synthetic fixtures (window.ScData). */
const DS = window.RAROSWeb02DesignSystem_9e80fa;
const {
  M3NavRail,
  M3TopAppBar,
  M3Button,
  M3Badge,
  M3SearchBar,
  M3ChoiceChip,
  M3TextField,
  M3MaskedField,
  M3DropdownField,
  M3StatusChip,
  M3RiskChip,
  M3Dialog,
  M3EmptyState,
  LgpdAnonymizedBanner,
  M3Avatar,
  M3StatCard,
  M3DataField,
  M3SectionHeader,
  M3TimelineItem
} = DS;
const S = window.ScData;

/* Local PT-BR formatter (the DS namespace only exposes PascalCase components,
   not the lowercase mask helper — so we inline it here for display). */
function fmt(type, raw) {
  const d = (raw || "").replace(/\D/g, "");
  switch (type) {
    case "cpf":
      return d.slice(0, 11).replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, "$1.$2.$3-$4");
    case "nis":
      return d.slice(0, 11).replace(/^(\d{3})(\d{5})(\d{2})(\d{0,1}).*/, "$1.$2.$3-$4");
    case "cep":
      return d.slice(0, 8).replace(/^(\d{5})(\d{0,3}).*/, "$1-$2");
    case "date":
      return d.slice(0, 8).replace(/^(\d{2})(\d{2})(\d{0,4}).*/, "$1/$2/$3");
    default:
      return raw;
  }
}
const NAV = [{
  id: "social-care",
  label: "Prontuário",
  icon: "folder_shared"
}, {
  id: "people",
  label: "Pessoas",
  icon: "group"
}, {
  id: "indicators",
  label: "Indicadores",
  icon: "monitoring"
}];
const STATUS_FILTERS = [{
  value: "all",
  label: "Todos"
}, {
  value: "waitlisted",
  label: "Fila de espera"
}, {
  value: "active",
  label: "Acolhidos"
}, {
  value: "discharged",
  label: "Altas"
}, {
  value: "withdrawn",
  label: "Desistentes"
}];
function Shell({
  title,
  onBack,
  statusSlot,
  actions,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-shell"
  }, /*#__PURE__*/React.createElement(M3NavRail, {
    items: NAV,
    activeId: "social-care",
    logo: "../../assets/logo-raros-mark.webp",
    footer: /*#__PURE__*/React.createElement("button", {
      className: "m3-rail__item",
      type: "button",
      "aria-label": "Conta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "m3-rail__icon"
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-symbols-rounded",
      "aria-hidden": "true"
    }, "account_circle")), /*#__PURE__*/React.createElement("span", {
      className: "m3-rail__label"
    }, "Conta"))
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-main"
  }, /*#__PURE__*/React.createElement(M3TopAppBar, {
    title: title,
    onBack: onBack,
    statusSlot: statusSlot,
    actions: actions
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-content"
  }, children)));
}

/* ----------------------------------------------------------- Patient list */
function PatientList({
  onOpen
}) {
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const rows = S.patients.filter(p => {
    const okStatus = status === "all" || p.status === status;
    const okQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
    return okStatus && okQ;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-pagehead"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Pacientes"), /*#__PURE__*/React.createElement("p", null, S.patients.length, " prontu\xE1rios \xB7 busca e filtro por status")), /*#__PURE__*/React.createElement(M3Button, {
    variant: "filled",
    icon: "person_add"
  }, "Novo paciente")), /*#__PURE__*/React.createElement("div", {
    className: "kit-listtools"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-listtools__search"
  }, /*#__PURE__*/React.createElement(M3SearchBar, {
    value: q,
    onChange: setQ,
    placeholder: "Buscar paciente por nome"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(M3ChoiceChip, {
    ariaLabel: "Filtrar por status",
    value: status,
    onChange: setStatus,
    options: STATUS_FILTERS
  })), rows.length === 0 ? /*#__PURE__*/React.createElement(M3EmptyState, {
    title: "Nenhum paciente encontrado",
    description: "Ajuste a busca ou os filtros de status.",
    action: {
      label: "Limpar filtros",
      onPress: () => {
        setQ("");
        setStatus("all");
      },
      icon: "filter_alt_off"
    }
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("table", {
    className: "kit-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Paciente"), /*#__PURE__*/React.createElement("th", null, "CPF"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Riscos"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Idade"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(p => /*#__PURE__*/React.createElement("tr", {
    className: "kit-row",
    key: p.id,
    tabIndex: 0,
    onClick: () => onOpen(p.id),
    onKeyDown: e => {
      if (e.key === "Enter") onOpen(p.id);
    },
    "aria-label": `Abrir prontuário de ${p.name}`
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "kit-cell-name"
  }, /*#__PURE__*/React.createElement(M3Avatar, {
    name: p.anonymized ? null : p.name,
    size: "md"
  }), /*#__PURE__*/React.createElement("b", null, p.name))), /*#__PURE__*/React.createElement("td", {
    className: "kit-cpf"
  }, p.cpf ? "***." + fmt("cpf", p.cpf).slice(4, 11) + "-**" : "—"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(M3StatusChip, {
    status: p.status
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "kit-risks"
  }, p.risks.map(r => /*#__PURE__*/React.createElement(M3RiskChip, {
    key: r,
    risk: r
  })), p.risks.length === 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-text-disabled)"
    }
  }, "\u2014"))), /*#__PURE__*/React.createElement("td", {
    className: "kit-age"
  }, p.age != null ? `${p.age} anos` : "—"))))), /*#__PURE__*/React.createElement("div", {
    className: "kit-loadmore"
  }, /*#__PURE__*/React.createElement(M3Button, {
    variant: "text",
    icon: "expand_more"
  }, "Carregar mais"))));
}

/* ------------------------------------------------------ Record sub-views */
function RegistryTab({
  r
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-cols"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-card"
  }, /*#__PURE__*/React.createElement(M3SectionHeader, {
    title: "Dados pessoais",
    as: "h2"
  }), /*#__PURE__*/React.createElement("dl", null, /*#__PURE__*/React.createElement(M3DataField, {
    label: "Nome social",
    value: r.socialName
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "Sexo",
    value: r.sex
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "Nascimento",
    value: fmt("date", r.birthDate),
    mono: true
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "CPF",
    value: fmt("cpf", r.cpf),
    mono: true
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "NIS",
    value: fmt("nis", r.nis),
    mono: true
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "CNS",
    value: r.cns,
    mono: true
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "Endere\xE7o",
    value: r.address
  }), /*#__PURE__*/React.createElement(M3DataField, {
    label: "CEP",
    value: fmt("cep", r.cep),
    mono: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "kit-card"
  }, /*#__PURE__*/React.createElement(M3SectionHeader, {
    title: "Composi\xE7\xE3o familiar",
    as: "h2",
    action: /*#__PURE__*/React.createElement(M3Button, {
      variant: "text",
      size: "sm",
      icon: "person_add"
    }, "Adicionar")
  }), /*#__PURE__*/React.createElement("table", {
    className: "kit-family"
  }, /*#__PURE__*/React.createElement("caption", {
    style: {
      position: "absolute",
      left: -9999
    }
  }, "Composi\xE7\xE3o familiar"), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Membro"), /*#__PURE__*/React.createElement("th", null, "Parentesco"), /*#__PURE__*/React.createElement("th", null, "Idade"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, r.family.map(m => /*#__PURE__*/React.createElement("tr", {
    key: m.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "kit-member"
  }, /*#__PURE__*/React.createElement(M3Avatar, {
    name: m.name,
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, m.name), m.primary && /*#__PURE__*/React.createElement("div", {
    className: "kit-pref"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "star"), "Pessoa de refer\xEAncia"), m.pending > 0 && /*#__PURE__*/React.createElement("div", {
    className: "kit-pending"
  }, m.pending, " documentos pendentes")))), /*#__PURE__*/React.createElement("td", null, m.relationship), /*#__PURE__*/React.createElement("td", {
    className: "kit-cpf"
  }, m.age, " anos"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement(M3Button, {
    variant: "text",
    size: "sm",
    icon: "more_vert",
    "aria-label": "A\xE7\xF5es do membro"
  }, " "))))))));
}
function AssessmentTab({
  onToast
}) {
  const [saved, setSaved] = React.useState(false);
  const [rooms, setRooms] = React.useState("4");
  const [bedrooms, setBedrooms] = React.useState("2");
  const [type, setType] = React.useState("casa");
  const [water, setWater] = React.useState("sim");
  const [saving, setSaving] = React.useState(false);
  function save() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      onToast("Seção salva");
    }, 700);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-card",
    style: {
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement(M3SectionHeader, {
    title: "Condi\xE7\xE3o habitacional",
    as: "h2",
    description: "Se\xE7\xE3o 1 de 7 \xB7 salv\xE1vel de forma independente"
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-form"
  }, /*#__PURE__*/React.createElement(M3DropdownField, {
    label: "Tipo de moradia",
    value: type,
    onChange: v => {
      setType(v);
      setSaved(false);
    },
    options: [{
      value: "casa",
      label: "Casa"
    }, {
      value: "apartamento",
      label: "Apartamento"
    }, {
      value: "comodo",
      label: "Cômodo"
    }, {
      value: "abrigo",
      label: "Abrigo/Instituição"
    }]
  }), /*#__PURE__*/React.createElement(M3DropdownField, {
    label: "Material de constru\xE7\xE3o",
    value: "alvenaria",
    onChange: () => setSaved(false),
    options: [{
      value: "alvenaria",
      label: "Alvenaria"
    }, {
      value: "madeira",
      label: "Madeira"
    }, {
      value: "mista",
      label: "Mista"
    }]
  }), /*#__PURE__*/React.createElement(M3TextField, {
    label: "N\xBA de c\xF4modos",
    mono: true,
    value: rooms,
    onChange: v => {
      setRooms(v);
      setSaved(false);
    }
  }), /*#__PURE__*/React.createElement(M3TextField, {
    label: "N\xBA de dormit\xF3rios",
    mono: true,
    value: bedrooms,
    onChange: v => {
      setBedrooms(v);
      setSaved(false);
    }
  }), /*#__PURE__*/React.createElement(M3DropdownField, {
    label: "\xC1gua encanada",
    value: water,
    onChange: v => {
      setWater(v);
      setSaved(false);
    },
    options: [{
      value: "sim",
      label: "Sim"
    }, {
      value: "nao",
      label: "Não"
    }]
  }), /*#__PURE__*/React.createElement(M3DropdownField, {
    label: "\xC1rea de risco geogr\xE1fico",
    value: "nao",
    onChange: () => setSaved(false),
    options: [{
      value: "nao",
      label: "Não"
    }, {
      value: "sim",
      label: "Sim"
    }]
  })), /*#__PURE__*/React.createElement("div", {
    className: "kit-formbar"
  }, saved ? /*#__PURE__*/React.createElement("span", {
    className: "kit-autosave"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "check_circle"), "Salvo") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--color-text-secondary)"
    }
  }, "Altera\xE7\xF5es n\xE3o salvas"), /*#__PURE__*/React.createElement(M3Button, {
    variant: "filled",
    icon: "save",
    pending: saving,
    onPress: save
  }, "Salvar se\xE7\xE3o")));
}
function AuditTab({
  r
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-card",
    style: {
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement(M3SectionHeader, {
    title: "Hist\xF3rico do prontu\xE1rio",
    as: "h2",
    action: /*#__PURE__*/React.createElement(M3Button, {
      variant: "text",
      size: "sm",
      icon: "filter_list"
    }, "Filtrar evento")
  }), /*#__PURE__*/React.createElement("ol", {
    className: "m3-timeline",
    style: {
      marginTop: 16
    }
  }, r.audit.map((e, i) => /*#__PURE__*/React.createElement(M3TimelineItem, {
    key: i,
    title: e.title,
    actor: e.actor,
    datetime: e.datetime,
    iso: e.iso,
    icon: e.icon,
    tone: e.tone,
    diff: e.diff,
    last: e.last
  }))));
}

/* ----------------------------------------------------------- Record page */
const TABS = [{
  id: "registry",
  label: "Cadastro",
  icon: "badge"
}, {
  id: "assessment",
  label: "Avaliação",
  icon: "assignment"
}, {
  id: "audit",
  label: "Histórico",
  icon: "history"
}];
function PatientRecord({
  onToast,
  onDischarge
}) {
  const r = S.record;
  const [tab, setTab] = React.useState("registry");
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-recordhead"
  }, /*#__PURE__*/React.createElement(M3Avatar, {
    name: r.name,
    size: "lg"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "var(--text-2xl)"
    }
  }, r.name), /*#__PURE__*/React.createElement("div", {
    className: "kit-recordhead__id"
  }, "#", r.id, " \xB7 ", fmt("cpf", r.cpf))), /*#__PURE__*/React.createElement(M3StatusChip, {
    status: r.status
  }), /*#__PURE__*/React.createElement(M3Button, {
    variant: "outlined",
    icon: "logout",
    onPress: onDischarge
  }, "Desligar do servi\xE7o")), /*#__PURE__*/React.createElement("div", {
    className: "kit-analytics"
  }, r.analytics.map(a => /*#__PURE__*/React.createElement(M3StatCard, {
    key: a.label,
    label: a.label,
    value: a.value,
    format: a.format,
    unit: a.unit,
    icon: a.icon,
    tone: a.tone,
    toneLabel: a.toneLabel
  }))), /*#__PURE__*/React.createElement("div", {
    className: "kit-tabs",
    role: "tablist"
  }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: "kit-tab",
    role: "tab",
    "aria-selected": tab === t.id,
    onClick: () => setTab(t.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, t.icon), t.label))), tab === "registry" && /*#__PURE__*/React.createElement(RegistryTab, {
    r: r
  }), tab === "assessment" && /*#__PURE__*/React.createElement(AssessmentTab, {
    onToast: onToast
  }), tab === "audit" && /*#__PURE__*/React.createElement(AuditTab, {
    r: r
  }));
}

/* ----------------------------------------------- Discharge dialog + App */
function DischargeDialog({
  open,
  onClose,
  onConfirm
}) {
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const needsNotes = reason === "other";
  const valid = reason && (!needsNotes || notes.trim().length > 0);
  return /*#__PURE__*/React.createElement(M3Dialog, {
    open: open,
    destructive: true,
    icon: "logout",
    title: "Desligar do servi\xE7o",
    description: "Registra a alta do paciente. A a\xE7\xE3o fica no hist\xF3rico e pode ser revertida com readmiss\xE3o.",
    onClose: onClose,
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(M3Button, {
      variant: "text",
      onPress: onClose
    }, "Cancelar"), /*#__PURE__*/React.createElement(M3Button, {
      variant: "destructive",
      disabled: !valid,
      onPress: onConfirm
    }, "Confirmar alta"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(M3DropdownField, {
    label: "Motivo",
    placeholder: "Selecione",
    value: reason,
    onChange: setReason,
    options: S.dischargeReasons
  }), /*#__PURE__*/React.createElement(M3TextField, {
    label: "Observa\xE7\xF5es",
    value: notes,
    onChange: setNotes,
    hint: needsNotes ? "Obrigatório quando o motivo é Outro · máx. 1000" : "Opcional · máx. 1000",
    errorMessage: needsNotes && !notes.trim() ? "Informe o motivo" : undefined
  })));
}
function App() {
  const [route, setRoute] = React.useState({
    name: "list"
  });
  const [dialog, setDialog] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }
  let body, title, onBack, statusSlot, actions;
  if (route.name === "list") {
    title = "Atendimento socioassistencial";
    statusSlot = /*#__PURE__*/React.createElement(M3Badge, {
      variant: "success",
      dot: true
    }, "web_02");
    body = /*#__PURE__*/React.createElement(PatientList, {
      onOpen: () => setRoute({
        name: "record"
      })
    });
  } else {
    title = "Prontuário";
    onBack = () => setRoute({
      name: "list"
    });
    body = /*#__PURE__*/React.createElement(PatientRecord, {
      onToast: showToast,
      onDischarge: () => setDialog(true)
    });
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Shell, {
    title: title,
    onBack: onBack,
    statusSlot: statusSlot,
    actions: actions
  }, body), /*#__PURE__*/React.createElement(DischargeDialog, {
    open: dialog,
    onClose: () => setDialog(false),
    onConfirm: () => {
      setDialog(false);
      showToast("Paciente desligado · alta registrada");
    }
  }), toast && /*#__PURE__*/React.createElement("div", {
    className: "kit-toast",
    role: "status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded",
    "aria-hidden": "true"
  }, "check_circle"), toast));
}
window.ScApp = {
  App
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/social-care/screens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.M3Avatar = __ds_scope.M3Avatar;

__ds_ns.M3Card = __ds_scope.M3Card;

__ds_ns.M3DataField = __ds_scope.M3DataField;

__ds_ns.M3KpiCard = __ds_scope.M3KpiCard;

__ds_ns.M3KpiValue = __ds_scope.M3KpiValue;

__ds_ns.M3PeriodLabel = __ds_scope.M3PeriodLabel;

__ds_ns.M3SectionHeader = __ds_scope.M3SectionHeader;

__ds_ns.M3StatCard = __ds_scope.M3StatCard;

__ds_ns.M3TimelineItem = __ds_scope.M3TimelineItem;

__ds_ns.AgePyramidChart = __ds_scope.AgePyramidChart;

__ds_ns.M3SeriesLegendItem = __ds_scope.M3SeriesLegendItem;

__ds_ns.TopNBarChart = __ds_scope.TopNBarChart;

__ds_ns.IdpRetryBanner = __ds_scope.IdpRetryBanner;

__ds_ns.LgpdAnonymizedBanner = __ds_scope.LgpdAnonymizedBanner;

__ds_ns.M3ActiveBadge = __ds_scope.M3ActiveBadge;

__ds_ns.M3Badge = __ds_scope.M3Badge;

__ds_ns.M3Dialog = __ds_scope.M3Dialog;

__ds_ns.M3EmptyState = __ds_scope.M3EmptyState;

__ds_ns.M3LoginIndicator = __ds_scope.M3LoginIndicator;

__ds_ns.M3RiskChip = __ds_scope.M3RiskChip;

__ds_ns.M3RoleBadge = __ds_scope.M3RoleBadge;

__ds_ns.M3StatusChip = __ds_scope.M3StatusChip;

__ds_ns.SuppressionBanner = __ds_scope.SuppressionBanner;

__ds_ns.M3Button = __ds_scope.M3Button;

__ds_ns.M3ChoiceChip = __ds_scope.M3ChoiceChip;

__ds_ns.M3DropdownField = __ds_scope.M3DropdownField;

__ds_ns.M3MaskedField = __ds_scope.M3MaskedField;

__ds_ns.M3PasswordField = __ds_scope.M3PasswordField;

__ds_ns.M3SearchBar = __ds_scope.M3SearchBar;

__ds_ns.M3Switch = __ds_scope.M3Switch;

__ds_ns.M3TextField = __ds_scope.M3TextField;

__ds_ns.M3NavRail = __ds_scope.M3NavRail;

__ds_ns.M3TopAppBar = __ds_scope.M3TopAppBar;

})();
