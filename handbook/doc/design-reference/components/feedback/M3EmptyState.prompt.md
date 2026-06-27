Explained empty / error state — use instead of a blank region. Distinguish the three cases so "no data" is never confused with "suppressed" or "service down".

```jsx
<M3EmptyState title="Sem dados no período selecionado"
  description="Amplie o intervalo para ver resultados."
  action={{ label: "Ampliar período", onPress: widen, icon: "date_range" }} />

<M3EmptyState variant="privacy" title="Dados omitidos por privacidade"
  description="Todos os grupos do recorte têm menos de 5 pessoas (K=5)." />

<M3EmptyState variant="unavailable" title="Indicadores indisponíveis"
  action={{ label: "Tentar de novo", onPress: retry, icon: "refresh" }} />
```

Variants: `default · privacy · unavailable`. Copy is neutral, never celebratory.
