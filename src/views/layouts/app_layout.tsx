import type { FC } from "@hono/hono/jsx";
import { Style } from "@hono/hono/css";

interface AppLayoutProps {
  readonly title: string;
  readonly nonce: string;
  readonly children: unknown;
  readonly scripts?: readonly string[];
}

export const AppLayout: FC<AppLayoutProps> = ({ title, nonce, children, scripts }) => (
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title} — Conecta ACDG</title>

      {/* Fonts: Satoshi, Playfair Display, Erode */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,300;1,400&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700&f[]=erode@300,400,500,600,700&display=swap"
        rel="stylesheet"
      />

      {/* CSP nonce for inline styles collected by hono/css */}
      <Style nonce={nonce} />

      {/* Base reset */}
      <style nonce={nonce}>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 16px; -webkit-font-smoothing: antialiased; }
        body { font-family: 'Satoshi', sans-serif; background: #F2E2C4; color: #261D11; min-height: 100vh; }
        a { text-decoration: none; color: inherit; }
        button { font-family: inherit; }
      `}</style>
    </head>
    <body>
      {children}

      {/* Client-side app scripts */}
      {scripts?.map((src) => (
        <script type="module" src={src} nonce={nonce} />
      ))}
    </body>
  </html>
);
