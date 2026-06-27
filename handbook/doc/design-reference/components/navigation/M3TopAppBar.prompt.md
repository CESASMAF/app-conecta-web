Sticky top bar for the content area — back navigation, page title, and actions.

```jsx
<M3TopAppBar title="Dashboard demográfico" onBack={goHome}
  statusSlot={<M3Badge variant="success" dot>Online</M3Badge>}
  actions={<M3Button variant="filled" icon="download">Exportar este eixo</M3Button>} />
```
Title is `h1` and truncates to one line.
