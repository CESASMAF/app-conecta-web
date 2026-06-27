**IdpRetryBanner** — alert shown after a `207 Multi-Status` from `POST /people` (person saved, IdP login failed) or a `502 IDP-001` on retry. Carries the retry CTA.

```jsx
{idpFailure && (
  <IdpRetryBanner onRetry={provisionLogin} isPending={pending} error="IDP-001" />
)}
```

`role="alert"` — move focus to it after the 207. The button delegates the retry to the ViewModel; on success unmount the banner and flip `M3LoginIndicator` to `linked`. Use it in `PersonForm` (post-submit), the access panel, and the record header.
