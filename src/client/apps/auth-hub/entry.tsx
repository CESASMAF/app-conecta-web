import { render } from "hono/jsx/dom"
import { AuthHubPage } from "../../views/pages/auth-hub-page.tsx"

const root = document.getElementById("auth-hub-app")
if (root) render(<AuthHubPage />, root)
