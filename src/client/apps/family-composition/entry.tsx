import { render } from "hono/jsx/dom"
import { Style } from "hono/css"
import { FamilyPage } from "../../views/pages/family-page.tsx"

const root = document.getElementById("family-app")
if (root) {
  const pathParts = window.location.pathname.split("/")
  const patientId = pathParts[pathParts.indexOf("family-composition") + 1] ?? ""
  render(<><Style /><FamilyPage patientId={patientId} /></>, root)
}
