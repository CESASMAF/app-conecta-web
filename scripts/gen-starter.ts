/**
 * Generates prototypes/STARTER.html from src/client/styles/tokens.ts
 *
 * Run: deno task gen-starter
 *
 * This ensures the STARTER.html always has the same token values
 * as production. When tokens.ts changes, run this script and commit
 * the updated STARTER.html.
 */

import { color, font, weight, space, radius, breakpoint } from "../src/client/styles/tokens.ts";

const camelToKebab = (s: string): string =>
  s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// Build CSS custom properties from tokens
const colorVars = Object.entries(color)
  .map(([k, v]) => `  --color-${camelToKebab(k)}: ${v};`)
  .join("\n");

const spaceVars = Object.entries(space)
  .map(([k, v]) => `  --space-${k}: ${v};`)
  .join("\n");

const radiusVars = Object.entries(radius)
  .map(([k, v]) => `  --radius-${k}: ${v};`)
  .join("\n");

const fontVars = Object.entries(font)
  .map(([k, v]) => `  --font-${k}: ${v};`)
  .join("\n");

const weightVars = Object.entries(weight)
  .map(([k, v]) => `  --weight-${k}: ${v};`)
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Conecta ACDG — [NOME DA TELA]</title>

<!-- ============================================================
     FONTES — Satoshi (UI), Playfair Display (decorativa), Erode (inputs)
     ============================================================ -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,300;1,400&display=swap" rel="stylesheet" />
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700&f[]=erode@300,400,500,600,700&display=swap" rel="stylesheet" />

<style>
/* ============================================================
   DESIGN TOKENS — Conecta ACDG (Sage Garden)
   GERADO AUTOMATICAMENTE por: deno task gen-starter
   NÃO EDITE MANUALMENTE — edite src/client/styles/tokens.ts

   REGRA: USE APENAS var(--nome) nos seus estilos.
   NUNCA escreva um hex (#...) ou rgb() diretamente.
   Se precisar de uma cor que não existe aqui, PEÇA ao dev
   para adicionar no tokens.ts — não invente.
   ============================================================ */
:root {
  /* Colors */
${colorVars}

  /* Spacing scale (use: var(--space-1) até var(--space-10)) */
${spaceVars}

  /* Border radius */
${radiusVars}

  /* Fonts */
${fontVars}

  /* Font weights */
${weightVars}

  /* Shadows */
  --shadow-button: 2.5px 2.5px 5px 2px rgba(0,0,0,0.12), -1px -1px 4px rgba(0,0,0,0.06);
  --shadow-card:   0 2px 8px rgba(0,0,0,0.08);
  --shadow-modal:  0 24px 80px rgba(38, 29, 17, 0.2);

  /* Breakpoints (referência — use em @media) */
  /* Mobile: < ${breakpoint.mobile}px */
  /* Tablet: ${breakpoint.mobile}px - ${breakpoint.tablet - 1}px */
  /* Desktop: >= ${breakpoint.tablet}px */
}

/* ============================================================
   CSS RESET — idêntico à produção (app_layout.tsx)
   NÃO MODIFIQUE este bloco.
   ============================================================ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; -webkit-font-smoothing: antialiased; }
body {
  font-family: var(--font-satoshi);
  background: var(--color-background);
  color: var(--color-text-primary);
  min-height: 100vh;
  line-height: 1.5;
}
a { text-decoration: none; color: inherit; }
button { font-family: inherit; cursor: pointer; }
::selection { background: var(--color-primary); color: #fff; }

/* ============================================================
   SEUS ESTILOS COMEÇAM AQUI

   Dicas:
   - Cores: var(--color-primary), var(--color-surface), etc.
   - Espaçamento: var(--space-3), var(--space-4), etc.
   - Bordas: var(--radius-card), var(--radius-pill), etc.
   - Fontes: var(--font-satoshi), var(--font-playfair), var(--font-erode)
   - Peso: var(--weight-bold), var(--weight-medium), etc.
   - Sombras: var(--shadow-button), var(--shadow-card), var(--shadow-modal)

   Breakpoints:
   @media (max-width: ${breakpoint.mobile - 1}px)  { /* Mobile */ }
   @media (min-width: ${breakpoint.mobile}px)  { /* Tablet+ */ }
   @media (min-width: ${breakpoint.tablet}px) { /* Desktop */ }
   ============================================================ */

</style>
</head>
<body>

<!-- ============================================================
     SEU PROTÓTIPO COMEÇA AQUI

     Marque cada componente com data-component="NomeDoComponente"
     Exemplo:

     <header data-component="PageHeader">
       <h1>Título da Página</h1>
     </header>

     <section data-component="FamilyMemberCard">
       <div>Nome do membro</div>
     </section>

     Isso ajuda o dev a saber onde cortar os componentes.
     ============================================================ -->



</body>
</html>
`;

const outPath = "prototypes/STARTER.html";
await Deno.writeTextFile(outPath, html);
console.log(`Generated ${outPath} from tokens.ts`);
console.log(`  Colors: ${Object.keys(color).length}`);
console.log(`  Spacing: ${Object.keys(space).length}`);
console.log(`  Radius: ${Object.keys(radius).length}`);
console.log(`  Fonts: ${Object.keys(font).length}`);
console.log(`  Weights: ${Object.keys(weight).length}`);

