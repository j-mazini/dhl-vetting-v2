# DHL Vetting Tracker v2

Vetting system integrado com BA Express landing page. Desenvolvido com Next.js, Firebase e admin portal.

**GitHub:** https://github.com/j-mazini/dhl-vetting-v2  
**Live:** https://j-mazini.github.io/dhl-vetting-v2/ (GitHub Pages)

## Estrutura

```text
.
├── aplicacoes/
│   ├── backend-api/            # Backend NestJS (APIs e integracoes)
│   ├── ba-express-vetting/     # App Next.js: landing, apply, vetting, admin
│   └── dhl-vetting-arquivo/    # Copia estatica do tracker DHL
├── configuracoes/
│   ├── firebase/               # Firestore rules e CORS
│   └── git/                    # Configuracao Git
├── .github/workflows/
│   └── deploy.yml              # Auto-deploy para GitHub Pages
└── [legado]/                   # Projetos e arquivos anteriores
```

## Deploy Automático

- **Trigger:** Push na branch `main`
- **Build:** Next.js build + static export
- **Deploy:** GitHub Pages (branch `gh-pages`)
- **Status:** Ver em https://github.com/j-mazini/dhl-vetting-v2/actions

## Caminhos Principais

- **App Principal:** `aplicacoes/ba-express-vetting/`
- **Backend API:** `aplicacoes/backend-api/`
- **Firebase Config:** `configuracoes/firebase/`
- **Workflow Deploy:** `.github/workflows/deploy.yml`

## Dev Local

```bash
cd aplicacoes/ba-express-vetting
npm install
npm run dev  # http://localhost:3000
```

## Tech Stack

- **Frontend:** Next.js 14, React 19, Tailwind CSS
- **Backend:** NestJS, Prisma
- **Database:** Firebase/Firestore
- **Auth:** Firebase Authentication
- **Hosting:** GitHub Pages (static) / Firebase (backend)
