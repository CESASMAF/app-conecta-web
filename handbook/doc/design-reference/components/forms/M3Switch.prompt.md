Binary on/off toggle — use for settings, not for choosing between options (use chips/radio for that).

```jsx
<M3Switch checked={dark} onChange={setDark} label="Tema escuro" />
```

Props: `checked`, `onChange(checked)`, `label`, `disabled`. Coral track when on.
