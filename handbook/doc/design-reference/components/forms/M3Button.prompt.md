The platform's action button — use for every clickable action; `filled` for the single primary CTA on a surface, `tonal` for secondary actions, `text` for low-emphasis ("Limpar filtros", "Ver como tabela"), `destructive` for irreversible actions.

```jsx
<M3Button variant="filled" icon="download" onPress={exportData}>Exportar</M3Button>
<M3Button variant="tonal" onPress={apply}>Aplicar filtros</M3Button>
<M3Button variant="text">Limpar</M3Button>
<M3Button variant="filled" pending>Gerando…</M3Button>
```

Variants: `filled · tonal · outlined · text · destructive`. Sizes: `sm · md`. Props: `pending` (spinner + disabled), `icon` / `iconTrailing` (Material Symbols Rounded ligature names), `disabled`. Requires the Material Symbols Rounded font loaded for icons. PT-BR, sentence case, never emoji.
