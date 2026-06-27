Ranking bars for any top-N axis. Sorts by value by default; pass `fixedOrder` for ordinal scales (the 6 income bands stay in domain order). Direct labels + values, table alternative, suppression-aware empty state.

```jsx
<TopNBarChart caption="Top diagnósticos (CID-10)" unitLabel="casos"
  items={[{code:"E75.2",label:"Gangliosidose GM2",value:37},{code:"Q87.4",label:"Síndrome de Marfan",value:21}]} />

<TopNBarChart fixedOrder unitLabel="pessoas"
  items={[{label:"0–0,5 SM",value:218}, {label:"0,5–1 SM",value:140}]} />
```
Max 8 categories (palette limit). Codes render in mono.
