// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server'

// O 2o argumento injeta o nonce (de locals, setado no middleware) nos scripts de hidratação do Solid,
// permitindo a CSP estrita `script-src 'nonce-...' 'strict-dynamic'` sem quebrar a hidratação (ADR-0006).
export default createHandler(
  () => (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="pt-BR">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
            {assets}
          </head>
          <body>
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  ),
  (event) => ({ nonce: event.locals.nonce }),
)
