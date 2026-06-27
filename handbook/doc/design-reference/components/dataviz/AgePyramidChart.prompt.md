Demographic age pyramid — pass aggregated `{ageBand, sex, value}` rows. Handles the 17 canonical bands, fixed sex colors, the suppressed/empty/error/loading states, and a built-in "Ver como tabela" toggle.

```jsx
<AgePyramidChart items={vm.items} suppressedGroups={vm.meta.suppressedGroups}
  pending={vm.loading} error={vm.error} onRetry={vm.retry} />
```
Normalize/aggregate in the view-model; the chart just renders. Color is paired with position (left/right) + legend — never color alone.
