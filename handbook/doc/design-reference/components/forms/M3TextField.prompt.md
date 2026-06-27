A labelled outlined text input — use for any single-line entry; set `mono` for codes/periods/amounts so figures align.

```jsx
<M3TextField label="Período início" placeholder="AAAA-MM" mono value={start} onChange={setStart} />
<M3TextField label="Buscar pessoa" leadingIcon="search" value={q} onChange={setQ} />
<M3TextField label="CPF" mono errorMessage="Use o formato 000.000.000-00" value={cpf} onChange={setCpf} />
```

Props: `errorMessage` (presence = error state + inline message), `hint`, `required`, `disabled`, `leadingIcon` / `trailingIcon` (Material Symbols), `id`. Validate at the edge and surface a PT-BR message that names the fix.
