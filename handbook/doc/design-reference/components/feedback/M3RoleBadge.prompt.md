**M3RoleBadge** — pill for a `system:role` vínculo. Translates known system/role pairs to PT-BR ("Paciente · Social Care") and degrades gracefully to the raw mono identifier for unknown pairs.

```jsx
<M3RoleBadge system="social-care" role="patient" active />
<M3RoleBadge system="timesheet" role="employee" active={false} />
```

Pass the raw backend keys — the component owns the i18n map. Inactive vínculos render dashed + muted. Use it inside `PersonRow` (up to 3, then `+N`), `RoleChipWithActions`, and the roles panel.
