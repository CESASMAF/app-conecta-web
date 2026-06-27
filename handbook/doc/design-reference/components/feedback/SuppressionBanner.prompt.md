Mandatory privacy banner — render next to ANY aggregated visualization and in the export summary. Pass the envelope's `meta`; it shows itself only when groups were suppressed.

```jsx
<SuppressionBanner suppressedGroups={meta.suppressed_groups} kThreshold={meta.k_threshold} />
<SuppressionBanner suppressedGroups={3} compact />
```

Returns `null` when `suppressedGroups <= 0`. There is no prop to hide it when groups > 0 — that is a compliance requirement, not a style option. Use `meta.k_threshold`, never the literal 5.
