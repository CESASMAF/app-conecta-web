**M3ActiveBadge** — active/inactive state pill mirroring the domain `active` boolean of a Person or SystemRole. Use it in person rows, the record header, and role chips.

```jsx
<M3ActiveBadge active={person.active} />
<M3ActiveBadge active={role.active} size="sm" labels={{ on: "Ativo", off: "Inativo" }} />
```

Always renders colour **and** icon **and** label — never colour alone. There is no third/unknown state: if you only have a nullable, resolve it in the ViewModel first. Defaults are feminine ("Ativa"/"Inativa"); override `labels` for masculine subjects (a vínculo → "Ativo"/"Inativo").
