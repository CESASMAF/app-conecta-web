Renders a contract period in pt-BR. `axis` = short (mar/2025 · T1 2025 · 2025); `inline` = long (março de 2025). Outputs `<time>` with a spelled-out aria-label.

```jsx
<M3PeriodLabel period="2025-03" granularity="monthly" variant="axis" />
<M3PeriodLabel period="2025-Q1" granularity="quarterly" />
```
`parsePeriod(period, granularity)` is exported for view-models.
