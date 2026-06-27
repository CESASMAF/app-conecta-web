Exclusive single-select chip group — use for short mutually-exclusive options (time granularity, top-N). Keyboard: arrows move selection.

```jsx
<M3ChoiceChip ariaLabel="Granularidade" value={g} onChange={setG}
  options={[{value:"monthly",label:"Mensal"},{value:"quarterly",label:"Trimestral"},{value:"yearly",label:"Anual"}]} />
```

Props: `options` (`{value,label,icon?}[]`), `value`, `onChange`, `ariaLabel`, `disabled`. For many/long options use `M3DropdownField` instead.
