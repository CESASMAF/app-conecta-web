**M3LoginIndicator** — small pill showing whether a Person has an IdP login. Use it next to a person's name in rows, the record header, and the access panel.

```jsx
<M3LoginIndicator state={person.loginState} /> // "linked" | "none" | "failed"
```

Derive `state` in the ViewModel: `idpUserId != null` → `linked`; `null` → `none`; `null` + a 207 provisioning failure recorded this session → `failed`. The `failed` state is **not** an alert — pair it with `IdpRetryBanner`, which carries `role="alert"` and the retry action.
