import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"

interface StackProps {
  readonly gap?: string
  readonly align?: string
  readonly justify?: string
  readonly children: unknown
}

interface RowProps {
  readonly gap?: string
  readonly align?: string
  readonly justify?: string
  readonly children: unknown
}

export const Stack: FC<StackProps> = ({ gap, align, justify, children }) => (
  <div
    class={css`
      display: flex;
      flex-direction: column;
      gap: ${gap ?? "0"};
      align-items: ${align ?? "stretch"};
      justify-content: ${justify ?? "flex-start"};
    `}
  >
    {children}
  </div>
)

export const Row: FC<RowProps> = ({ gap, align, justify, children }) => (
  <div
    class={css`
      display: flex;
      flex-direction: row;
      gap: ${gap ?? "0"};
      align-items: ${align ?? "center"};
      justify-content: ${justify ?? "flex-start"};
    `}
  >
    {children}
  </div>
)
