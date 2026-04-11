import { render } from "hono/jsx/dom"
import { Style } from "hono/css"
import { RegistrationPage } from "../../views/pages/registration-page.tsx"

const root = document.getElementById("registration-app")
if (root) {
  render(
    <>
      <Style />
      <RegistrationPage />
    </>,
    root,
  )
}
