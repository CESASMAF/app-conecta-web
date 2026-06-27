The platform's left navigation rail (the single shell across all three modules). Icon + short label per destination; active item highlighted.

```jsx
<M3NavRail activeId="indicators" onSelect={setRoute} logo="/assets/logo-raros-mark.webp"
  items={[
    { id: "social-care", label: "Prontuário", icon: "folder_shared" },
    { id: "people", label: "Pessoas", icon: "group" },
    { id: "indicators", label: "Indicadores", icon: "monitoring" },
  ]} />
```
Items take `href` (link) or fall back to `onSelect(id)`. Add a `footer` for the user/avatar menu.
