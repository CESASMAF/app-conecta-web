import type { FC } from "@hono/hono/jsx";

export const LoginView: FC = () => (
  <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;background:#172D48;color:#F2E2C4;">
    <h1 style="font-family:'Playfair Display',serif;font-size:48px;font-weight:400;margin-bottom:16px;">
      Conecta
    </h1>
    <p style="font-family:'Satoshi',sans-serif;font-size:16px;margin-bottom:40px;opacity:0.7;">
      Plataforma de Cuidado Social — ACDG
    </p>
    <a
      href="/auth/login"
      style="background:#4F8448;color:white;padding:16px 48px;border-radius:100px;font-family:'Playfair Display',serif;font-style:italic;font-size:18px;text-decoration:none;transition:opacity 0.2s;"
    >
      Entrar com Zitadel
    </a>
  </div>
);
