One audit-trail entry — wrap a list of these in `<ol className="m3-timeline">`. Renders marker + title + actor/time + optional before→after diff.

```jsx
<ol className="m3-timeline">
  <M3TimelineItem title="Condição habitacional atualizada" actor="Téc. Carla"
    datetime="10/06/2026 14:30" iso="2026-06-10T14:30" icon="edit" tone="info"
    diff={[{ field: "Dormitórios", before: "1", after: "2" }]} />
  <M3TimelineItem title="Paciente admitido" actor="Téc. Carla"
    datetime="01/06/2026" icon="login" tone="success" last />
</ol>
```
Resolve actor names in the view-model; fall back to an abbreviated mono UUID.
