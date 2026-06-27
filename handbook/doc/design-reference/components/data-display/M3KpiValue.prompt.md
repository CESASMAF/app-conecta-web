Big aggregated number in mono, pt-BR formatted. The UI never recalculates — show the service's value as-is.

```jsx
<M3KpiValue value={1247} format="integer" unitLabel="registros" />
<M3KpiValue value={141200} format="currency" />   {/* cents → R$ 1.412,00 */}
<M3KpiValue value={0.72} format="percent" />        {/* → 72% */}
<M3KpiValue value={null} />                          {/* → — */}
```
Formats: `integer · decimal · percent · currency`. `currency` expects cents; `percent` expects 0–1.
