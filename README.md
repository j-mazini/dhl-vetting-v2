# Organizacao do Workspace

Este workspace foi organizado por responsabilidade para facilitar a navegacao entre front, back, configuracoes, documentos e projetos separados.

## Estrutura

```text
.
├── aplicacoes/
│   ├── backend-api/            # Backend NestJS
│   ├── ba-express-vetting/     # App Next.js integrado: landing, apply, vetting e admin
│   └── dhl-vetting-arquivo/    # Copia estatica/arquivo do tracker DHL
├── configuracoes/
│   ├── firebase/               # Firebase, rules e CORS
│   └── git/                    # Configuracao Git preservada da raiz antiga
├── documentos/
│   ├── documentos-originais/   # DOCX/TXT originais
│   ├── guias/                  # Setup, status e integracoes
│   └── referencias/            # Documentacao tecnica
├── projetos/
│   ├── ba-express-dos-prototipo/  # Repositorio do prototipo BA Express DOS
│   └── logix-sphere-legado/    # Projeto legado da LogixSphere
├── landing-page-legado/        # Landing antiga preservada
├── vetting-legado/             # Vetting estatico antigo preservado
└── arquivo/
    ├── artefatos-teste/        # PDFs e saidas de teste
    ├── arquivos-sistema/       # Arquivos locais do sistema
    ├── cache-build/            # Cache/builds movidos da raiz
    └── logs-debug/             # Logs de debug
```

## Caminhos Principais

- Prototipo BA Express DOS: `projetos/ba-express-dos-prototipo/src/BA_Express_DOS_Live_Preview.html`
- Vetting estatico legado: `vetting-legado/dhl-vetting-tracker/index.html`
- Copia estatica do tracker DHL: `aplicacoes/dhl-vetting-arquivo/index.html`
- Backend API: `aplicacoes/backend-api/`
- App BA Express Vetting: `aplicacoes/ba-express-vetting/`

## Git

Repositorios Git ativos neste workspace:

```text
aplicacoes/backend-api/.git
aplicacoes/dhl-vetting-arquivo/.git
aplicacoes/ba-express-vetting/.git
landing-page-legado/logix-sphere-landing-page/.git
projetos/ba-express-dos-prototipo/.git
projetos/logix-sphere-legado/logix-sphere-landing-page/.git
vetting-legado/dhl-vetting-tracker/.git
```

Os repositorios `landing-page-legado/logix-sphere-landing-page` e `vetting-legado/dhl-vetting-tracker`
ja possuem `origin` configurado. Os demais estao ativos localmente e aguardam remote.
# Ba
