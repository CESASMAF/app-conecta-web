// templates/dashboard-page/ds-base.js
// One-line loader for the RAROS web_02 design system: pulls the global stylesheet
// (tokens + webfonts) and the compiled component bundle. A consuming project only
// edits the `base` path below to point at the bound _ds/<folder> tree.
(() => {
  const base = '../..';
  for (const p of ['styles.css']) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base + '/' + p;
    document.head.appendChild(l);
  }
  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js';
  s.onerror = () =>
    console.error(
      'ds-base.js: failed to load ' + s.src +
      ' — point the base line at the bound _ds/<folder> tree relative to this page ' +
      '(e.g. _ds/<folder> at project root, ../_ds/<folder> one level down). ' +
      'In a fresh design system this just means the bundle is not compiled yet.'
    );
  document.head.appendChild(s);
})();
