import { render } from "hono/jsx/dom"
import { SocialCarePage } from "../../views/pages/social-care-page.tsx"

const root = document.getElementById("social-care-app")
if (root) render(<SocialCarePage />, root)
