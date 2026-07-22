#!/usr/bin/env node

/**
 * Exporta apenas a landing page (home) como HTML estático
 * Usado para deploy no GitHub Pages
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const appDir = path.join(__dirname, '../../aplicacoes/ba-express-vetting');
const outDir = path.join(__dirname, '../../_gh-pages');
const nextBuildDir = path.join(appDir, '.next');
const htmlFile = path.join(nextBuildDir, 'server/pages/index.html');

// Garantir que o diretório de saída existe
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`✓ Criado diretório: ${outDir}`);
}

// Copiar arquivos estáticos públicos
const publicDir = path.join(appDir, 'public');
if (fs.existsSync(publicDir)) {
  const copy = (src, dest) => {
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest);
      fs.readdirSync(src).forEach(file => {
        copy(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };

  copy(publicDir, outDir);
  console.log(`✓ Copiado arquivos públicos`);
}

// Copiar Next.js static assets
const staticDir = path.join(nextBuildDir, 'static');
if (fs.existsSync(staticDir)) {
  const copy = (src, dest) => {
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest);
      fs.readdirSync(src).forEach(file => {
        copy(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };

  copy(staticDir, path.join(outDir, '_next/static'));
  console.log(`✓ Copiado assets Next.js`);
}

// Criar página index.html com conteúdo estático
const landingHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BA Express - Vetting Tracker v2</title>
  <meta name="description" content="Sistema de vetting para candidatos a motoristas DA EXPRESS">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
    }

    .container {
      background: white;
      border-radius: 10px;
      padding: 3rem 2rem;
      max-width: 600px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 2rem;
    }

    .features {
      text-align: left;
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .feature {
      display: flex;
      align-items: center;
      margin: 0.8rem 0;
      font-size: 1rem;
    }

    .feature::before {
      content: "✓";
      color: #667eea;
      font-weight: bold;
      margin-right: 0.8rem;
      font-size: 1.2rem;
    }

    .cta {
      display: inline-block;
      margin-top: 2rem;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      transition: transform 0.2s;
    }

    .cta:hover {
      transform: scale(1.05);
    }

    .info {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
      font-size: 0.9rem;
      color: #999;
    }

    .links {
      margin-top: 1rem;
    }

    .links a {
      color: #667eea;
      text-decoration: none;
      margin: 0 1rem;
    }

    .links a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 BA Express Vetting</h1>
    <p class="subtitle">Sistema de Vetting v2 - Em Desenvolvimento</p>

    <div class="features">
      <div class="feature">Landing page com Next.js</div>
      <div class="feature">Portal de aplicação integrado</div>
      <div class="feature">Sistema de vetting automático</div>
      <div class="feature">Admin dashboard completo</div>
      <div class="feature">Firebase Firestore</div>
    </div>

    <a href="https://github.com/j-mazini/dhl-vetting-v2" class="cta">Ver no GitHub</a>

    <div class="info">
      <p>Esta é uma landing page estática hospedada no GitHub Pages.</p>
      <p>A aplicação completa roda localmente com: <code>npm run dev</code></p>
      <div class="links">
        <a href="https://github.com/j-mazini/dhl-vetting-v2">GitHub</a>
        <a href="https://github.com/j-mazini/dhl-vetting-v2/blob/main/README.md">Docs</a>
      </div>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'index.html'), landingHtml);
console.log(`✓ Gerado index.html`);

// Criar arquivo de status
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
console.log(`✓ Criado .nojekyll (GitHub Pages config)`);

console.log(`\n✅ Landing page exportada para: ${outDir}`);
console.log('   Pronto para fazer push na branch gh-pages!');
