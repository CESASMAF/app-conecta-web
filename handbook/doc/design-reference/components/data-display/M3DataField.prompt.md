Label–value pair inside a `<dl>` — export metadata, query meta, record fields. Set `mono` for codes/amounts, `inline` for a compact row.

```jsx
<dl>
  <M3DataField label="Formato" value="CSV" />
  <M3DataField label="Extensão" value=".csv" mono inline />
  <M3DataField label="Content-type" value="text/csv" mono />
</dl>
```
Empty values render `emptyFallback` ("—").
