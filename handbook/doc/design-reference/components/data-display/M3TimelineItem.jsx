import React from "react";

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

export function M3TimelineItem({
  title,
  actor,
  datetime,
  iso,
  icon,
  tone = "default",
  diff,
  last = false,
}) {
  const dotTone = tone === "default" ? "" : `m3-tl__dot--${tone}`;
  return (
    <li className="m3-tl">
      <div className="m3-tl__rail">
        <span className={`m3-tl__dot ${dotTone}`} aria-hidden="true">
          {icon && <span className="material-symbols-rounded">{icon}</span>}
        </span>
        {!last && <span className="m3-tl__line" />}
      </div>
      <div className="m3-tl__body">
        <div className="m3-tl__title">{title}</div>
        <div className="m3-tl__meta">
          {actor && <span className="m3-tl__actor">{actor}</span>}
          {datetime && <time dateTime={iso}>{datetime}</time>}
        </div>
        {diff && diff.length > 0 && (
          <div className="m3-tl__diff">
            {diff.map((d, i) => (
              <div className="m3-tl__diffrow" key={i}>
                <span className="m3-tl__field">{d.field}</span>
                <span className="m3-tl__before">{d.before}</span>
                <span className="m3-tl__arrow material-symbols-rounded" aria-hidden="true">arrow_forward</span>
                <span className="m3-tl__after">{d.after}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
