**M3PasswordField** — initial-password input with reveal toggle and a min-length hint. Use it in the optional "Acesso ao sistema" section of `PersonForm` (`createLogin=true`) and for retroactive provisioning in the access panel.

```jsx
<M3PasswordField
  value={form.initialPassword}
  onChange={(v) => set("initialPassword", v)}
  errorMessage={form.errors.initialPassword}
/>
```

Optional by design — an empty value provisions the user and defers the password to a reset link. `minLength` mirrors the backend TypeBox rule (default 8). The value is never logged; `autocomplete="new-password"`.
