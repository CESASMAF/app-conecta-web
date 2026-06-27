Computed-analytics stat card. Numbers render in mono; add a `tone` chip to carry the judgement.

```jsx
<M3StatCard label="Densidade habitacional" value={2.5} format="decimal" unit="hab/cômodo"
  icon="home" tone="warning" toneLabel="Sobrelotação" />
<M3StatCard label="Renda per capita" value={33333} format="currency" icon="payments" />
<M3StatCard label="Vulnerabilidade" value="Alta" tone="danger" toneLabel="Prioridade" icon="warning" />
```
Never compute the value in the client — show the service's `computedAnalytics` as-is.
