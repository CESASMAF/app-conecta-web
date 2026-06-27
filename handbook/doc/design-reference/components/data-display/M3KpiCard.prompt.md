Indicator summary card — the indicators home (clickable, one per axis) and the KPI strip atop a dashboard (static). Composes M3KpiValue + M3PeriodLabel.

```jsx
<M3KpiCard label="Demográfico" value={1247} unitLabel="registros"
  period="2025-12" granularity="monthly" icon="groups"
  href="/indicators/demographics" />

<M3KpiCard label="Completude média" value={0.72} format="percent"
  period="2025-Q4" granularity="quarterly" pending={loading} />
```
`null` value → "—" with a "sem dados / omitido por privacidade" footnote you supply. Skeleton when `pending`.
