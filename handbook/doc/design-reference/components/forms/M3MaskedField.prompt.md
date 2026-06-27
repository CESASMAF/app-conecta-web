Masked PT-BR input for documents/dates/money — shows formatted, emits raw digits.

```jsx
<M3MaskedField mask="cpf" label="CPF" value={cpf} onChange={(raw) => setCpf(raw)}
  errorMessage={cpfError} />
<M3MaskedField mask="money" label="Renda total" value={cents} onChange={setCents} />
<M3MaskedField mask="date" label="Data de nascimento" value={birth} onChange={setBirth} />
```
Masks: `cpf · nis · cep · phone · date · money` (money = cents). Validate the raw value at the edge and pass a PT-BR `errorMessage`.
