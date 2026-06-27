Modal dialog for confirmations. Compose form fields as children and buttons as `actions`.

```jsx
<M3Dialog open={open} destructive icon="logout" title="Desligar do serviço"
  description="Esta ação registra a alta do paciente e fica no histórico."
  onClose={cancel}
  actions={<>
    <M3Button variant="text" onPress={cancel}>Cancelar</M3Button>
    <M3Button variant="destructive" disabled={!notes} onPress={confirm}>Desligar</M3Button>
  </>}>
  <M3DropdownField label="Motivo" value={reason} onChange={setReason} options={reasons} />
  <M3TextField label="Observações" value={notes} onChange={setNotes} hint="Obrigatório quando o motivo é Outro · máx. 1000" />
</M3Dialog>
```
Only offer transitions valid for the current status. Esc and scrim-click call `onClose`.
