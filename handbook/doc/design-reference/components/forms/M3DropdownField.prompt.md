A labelled dropdown over a native `<select>` — use for single-choice from a list (mesoregion filter, export dataset/format).

```jsx
<M3DropdownField label="Mesorregião" placeholder="Todas"
  value={code} onChange={setCode}
  options={[{value:"1401",label:"Norte de Roraima"},{value:"1402",label:"Sul de Roraima"}]} />
```

Props: `options` (`{value,label}[]`), `placeholder` (disabled first row), `errorMessage`, `hint`, `disabled`. Emit codes, display names.
