import '~/shared/ui/global.css' // base global + tokens do DS (vanilla-extract)
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'

// Composition root do client (fora da matriz de camadas — ADR-0001).
export default function App() {
  return (
    <Router root={(props) => <Suspense>{props.children}</Suspense>}>
      <FileRoutes />
    </Router>
  )
}
