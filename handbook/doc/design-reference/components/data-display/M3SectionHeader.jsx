import React from "react";

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

export function M3SectionHeader({ title, description, action, as = "h2" }) {
  const Title = as;
  return (
    <div className="m3-secthead">
      <div className="m3-secthead__titles">
        <Title className="m3-secthead__title">{title}</Title>
        {description && <p className="m3-secthead__desc">{description}</p>}
      </div>
      {action && <div className="m3-secthead__action">{action}</div>}
    </div>
  );
}
