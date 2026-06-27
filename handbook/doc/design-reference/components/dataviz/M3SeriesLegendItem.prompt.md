Legend entry tying a series label to its chart token. Use inside chart headers.

```jsx
<M3SeriesLegendItem label="Feminino" colorToken="--chart-sex-female" />
<M3SeriesLegendItem label="Casos novos" colorToken="--chart-cat-1" shape="line" onPress={toggle} muted={hidden} />
```
`colorToken` must be a `--chart-*` token name — raw colors are forbidden in charts.
