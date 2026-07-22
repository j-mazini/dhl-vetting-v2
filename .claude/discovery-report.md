# 🔍 DISCOVERY REPORT — Vetting 2.0 System Architecture

**Data:** 2026-06-16  
**Fase:** Discover (20% do plano)  
**Intensidade:** Standard (análise equilibrada)  
**Foco:** Implementação técnica e reutilização de código

---

## Executive Summary

**Status:** ✅ Código base TypeScript/Next.js **já existe e está pronto para integração**

O projeto contém uma landing page Next.js 16 (modern, TypeScript, React 19) com:
- Firebase authentication e storage já configurados
- Estrutura de componentes reutilizável
- CLAUDE.md com padrões arquiteturais definidos
- Documentação de blueprint no Thiago folder (5 arquivos de especificação)

**Implicação:** Vetting 2.0 pode ser **integrado dentro dessa estrutura Next.js existente** em vez de ser um repositório separado.

---

## 1. Análise da Landing Page (logix-sphere-landing-page)

### 1.1 Tech Stack Atual

```
Frontend:
  ✅ Next.js 16.2.2           (Full-stack, App Router)
  ✅ React 19.2.4             (Latest, RSC ready)
  ✅ TypeScript 5             (Strict type safety)
  ✅ Tailwind CSS             (via clsx, tailwind-merge)
  ✅ React Hook Form 7.72.1   (Forms with validation)
  ✅ Zod 4.3.6                (Schema validation)
  ✅ Lucide React             (Icons)
  ✅ Framer Motion 12.38.0    (Animations)

Build Tools:
  ✅ ESLint 9                 (Code linting)
  ✅ TypeScript 5             (Strict mode)

Package Manager:
  ✅ npm (package-lock.json)
```

**Decisão Já Tomada:** Não precisa mudar de HTML para TypeScript — **já é TypeScript!**

### 1.2 Estrutura de Projeto

```
logix-sphere-landing-page/
├── src/
│   ├── app/                    # Next.js App Router
│   │   └── page.module.css     # Estilos da página
│   ├── components/             # Componentes reutilizáveis (21 arquivos)
│   │   ├── LandingHeader.tsx
│   │   ├── GlassPanel.tsx
│   │   ├── ServiceTabs.tsx
│   │   ├── AnimatedStatValue.tsx
│   │   ├── FleetSpotlight.tsx
│   │   ├── CopyField.tsx
│   │   ├── ScrollRail.tsx
│   │   ├── ContactForm.tsx
│   │   └── ... (mais componentes)
│   ├── content/                # Dados e assets
│   │   ├── baExpress.ts       # Conteúdo BA Express
│   │   └── images.ts          # Referências de imagem
│   └── constants/              # Constantes globais
├── public/                      # Imagens estáticas
├── index.tsx                   # Entry point principal
├── next.config.ts              # Config Next.js
├── tsconfig.json              # TypeScript config
├── package.json               # Dependências
└── CLAUDE.md                  # 📌 Padrões arquiteturais definidos
```

### 1.3 CLAUDE.md — Padrões Arquiteturais Definidos

**Muito importante:** O arquivo CLAUDE.md define:

1. **Separação Frontend/Backend:**
   - Frontend: Next.js (App Router)
   - Backend: Node.js + Express (separado)
   - **Implicação:** Vetting 2.0 backend deve ser **repositório separado**

2. **Regras de Código:**
   - Todo código, variáveis, nomes de rotas em **INGLÊS**
   - Sem lógica de negócio no frontend
   - Nomenclatura PascalCase/camelCase (TypeScript)
   - Zod para validação de entrada
   - React Query para estado de servidor

3. **Estrutura Recomendada para Backend:**
   ```
   backend/
   ├── domain/          # Entidades, regras de negócio
   ├── use-cases/       # Orquestração (ApproveOrderUseCase)
   ├── ports/           # Interfaces (IOrderRepository)
   ├── infrastructure/  # Implementações (DB, HTTP)
   └── api/v1/          # Rotas REST versionadas
   ```

4. **Segurança:**
   - httpOnly cookies para auth (não localStorage)
   - Sanitização de entrada
   - Rate limiting em rotas de auth
   - Headers de segurança (helmet)
   - Dados isolados por CNPJ (princípio: multi-tenancy)

---

## 2. Firebase Integration (Já Configurado)

### 2.1 Firebase Config

**Arquivo:** `firebase-config.js`

```javascript
window.BA_FIREBASE = {
    config: {
        apiKey: "AIzaSyCpueUMJVALaB75GsHrNJcta-EgGsq9tWM",
        authDomain: "vetting-63c6d.firebaseapp.com",
        projectId: "vetting-63c6d",
        storageBucket: "vetting-63c6d.firebasestorage.app",
        messagingSenderId: "443177968978",
        appId: "1:443177968978:web:b205f3d3b16f88c704c68b",
    },
    workspaceId: "ba-express-vetting"
};
```

**Status:** ✅ Configurado e pronto

### 2.2 Firebase Sync (firebase-sync.js)

Implementa adaptador Firestore com:
- ✅ Autenticação Google
- ✅ Firestore para persistência
- ✅ Google Cloud Storage para documentos
- ✅ Debounce de 650ms para save
- ✅ Callbacks de subscriber
- ✅ flushNow() para save imediato (para uploads)

**Funções principais:**
```javascript
// Firestore initialization
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// Data operations
adapter.saveAll(nextVendors)      // Debounced save
adapter.flushNow()                // Immediate flush
adapter.subscribe(callback)       // Listen to updates
adapter.deleteOne(id, paths)      // Delete with cleanup
```

**Observação:** Código é **client-side JavaScript**. Para Vetting 2.0 escalável, preferimos:
- Backend Node.js/Express com APIs REST
- Firestore usado apenas para leitura crítica (caching)

---

## 3. Thiago Folder — Blueprints & Specifications

### 3.1 Conteúdo

```
Thiago/
├── BA_Express_DOS_Live_Preview.html           (116 KB - Prototipo interativo)
├── BA_Express_Driver_Pipeline_DRAFT_v1.html   (17 KB - Workflow diagram)
├── BA_Express_Strategic_Blueprint_v2.html     (81 KB - Especificação completa)
├── BA_Express_Master_Vetting_Protocol_v3.0.pdf (42 KB - Protocolo de vetting)
└── Suitability_Assessment_Pedro_Eduardo_Monte_2026-06-16.pdf (60 KB - Exemplo de documento)
```

**Total:** 5 arquivos, 316 KB

### 3.2 Strategic Blueprint (v2)

HTML interativo contendo:
- ✅ Fluxograma visual do driver pipeline (states machine)
- ✅ Regras de decisão (RTW check, age, experience)
- ✅ SLAs por etapa (1h pre-screen, 24h insurance, 48h interview)
- ✅ Integração com DHL (auto-population forms)
- ✅ Campos de formulário esperados
- ✅ Documentos gerados (Suitability Assessment, Interview Notes, VRA)

**Uso:** Consultar para entender a máquina de estados esperada

### 3.3 Master Vetting Protocol (PDF)

Protocolo formal definindo:
- Sequência de perguntas para entrevista
- Critérios de aprovação/rejeição
- Documentos obrigatórios
- Checklist de vetting officer

---

## 4. Root-Level Code (firebase-sync.js, google-drive-sync.js)

### 4.1 Funções Úteis para Reutilizar

**firebase-sync.js:**
- `safeId(string)` → Sanitiza IDs para Firestore
- Firebase adapter pattern (subscribe, saveAll, flushNow)
- Google OAuth provider setup
- Document storage implementation

**Observação:** Este é código **legacy client-side**. Mover para backend é melhor.

### 4.2 Google Drive Sync

Arquivo `google-drive-sync.js` — aparentemente desusado (arquivo histórico).

---

## 5. Inventory of Reusable Code

### 5.1 O Que Pode Ser Reutilizado

| Componente | Localização | Status | Ação para Vetting 2.0 |
|-----------|------------|--------|----------------------|
| **Landing Page Layout** | `/logix-sphere-landing-page/src/components/` | ✅ Pronto | Manter, adicionar seção Vetting |
| **Form Validation** | React Hook Form + Zod | ✅ Pronto | Reutilizar para pré-inscrição |
| **Firebase Auth** | `firebase-sync.js` | ✅ Funcional | Mover para backend (melhor) |
| **Cloud Storage** | Firebase Storage config | ✅ Funcional | Manter, expandir para documentos |
| **UI Components** | Lucide, Tailwind, Framer Motion | ✅ Pronto | Expandir com novos componentes |
| **Type Safety** | TypeScript 5 | ✅ Pronto | Usar em tudo Vetting 2.0 |
| **Doc Templates** | Thiago/Strategic_Blueprint_v2.html | ✅ Pronto | Usar como base para máquina de estados |

### 5.2 O Que Precisa Ser Reescrito

| Item | Motivo | Abordagem |
|------|--------|-----------|
| **Client-side Firebase sync** | Não escala, sem auditoria | Mover para backend REST API |
| **Google Drive integration** | Legacy, sem manutenção | Remover ou substituir por cloud storage |
| **Manual state management** | Sem máquina de estados | Implementar state machine com transições |
| **Email sending** | Não existe ainda | Implementar SendGrid/Resend no backend |
| **DHL integration** | Não existe | Criar API client para DHL APHIDS |

---

## 6. Current Project Structure Analysis

### 6.1 Identificação de Dependências

**Frontend depends on:**
- ✅ Firebase SDK (v12.14.0)
- ✅ React Hook Form, Zod
- ✅ Next.js 16 (App Router)

**Backend would need:**
- Express.js ou NestJS
- PostgreSQL ou Firebase Firestore
- SendGrid/Resend for email
- Stripe or payment processor (se necessário)
- Redis for task queue (Bull)

### 6.2 Git State

```bash
✅ .git/                      # Git configured
✅ .gitignore                # Standard Node.js ignore
✅ package-lock.json         # Locked dependencies
```

---

## 7. Recommendations for Vetting 2.0 Implementation

### 7.1 Architecture Decision

**RECOMMENDED:** Monorepo com 3 camadas

```
dhl-vetting-tracker/
├── frontend/                  # Next.js app (ampliado)
│   ├── apps/
│   │   ├── landing-page/      # Existing logix-sphere
│   │   ├── admin-dashboard/   # New
│   │   └── driver-portal/     # New
│   └── packages/
│       ├── ui-components/
│       └── shared-types/
│
├── backend/                   # Node.js + Express/NestJS (new)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── pre-registration/
│   │   │   ├── interview/
│   │   │   ├── vetting/
│   │   │   ├── dhl-integration/
│   │   │   └── lifecycle/
│   │   ├── database/
│   │   └── api/v1/
│   └── tests/
│
└── shared/                    # Shared types, constants
    ├── types/
    ├── constants/
    └── utils/
```

### 7.2 Tech Stack Decision (Recomendação Refinada)

| Camada | Escolha | Razão |
|--------|---------|-------|
| **Frontend** | Next.js 16 (existente) | Escalável, RSC, App Router moderno |
| **Backend** | NestJS + TypeScript | Arquitetura robusta, injectável, testável |
| **BD Principal** | PostgreSQL | ACID, escalável, suporta máquina de estados |
| **Cache** | Redis + Bull | Automação de SLAs, task queue |
| **Auth** | OAuth2 (Google) + JWT | Seguro, flexível |
| **Document Storage** | Google Cloud Storage | Integração com DHL, escalável |
| **Email** | SendGrid API | Confiável, templates, webhooks |

### 7.3 Sequência de Desenvolvimento

**Fase 1 — Backend Core (semanas 1-2)**
1. Setup NestJS project
2. PostgreSQL schema (Central Driver Record)
3. State machine implementation
4. Base API (auth, CRUD drivers)

**Fase 2 — Frontend Integration (semanas 3-4)**
1. Admin Dashboard (React components)
2. Driver Portal (login, progress tracking)
3. Pre-registration form
4. Interview interface

**Fase 3 — Workflow Modules (semanas 5-7)**
1. Pre-registration → Pre-screening rules
2. Interview → Tests + notes
3. Vetting → Document review
4. DHL Integration → Auto-population

**Fase 4 — Advanced Features (semanas 8-12)**
1. Lifecycle monitoring
2. Email automation
3. Document signing
4. Reporting & analytics

---

## 8. Critical Findings

### ✅ Strengths

1. **Landing page já é TypeScript** — não precisa converter HTML
2. **Firebase já está configurado** — pode ser usado para auth
3. **React Hook Form + Zod** — perfeito para vetting forms
4. **CLAUDE.md definiu padrões** — follow conventions
5. **Blueprints especificados** — roadmap está claro
6. **Next.js 16** — moderna, escalável, App Router

### ⚠️ Gaps

1. **Sem backend** — precisa criar Node.js/Express
2. **Sem máquina de estados** — precisa implementar 34 estados
3. **Sem banco de dados** — precisa PostgreSQL schema
4. **Sem email system** — precisa SendGrid integration
5. **Sem DHL API** — precisa APHIDS client
6. **Documentos gerados manualmente** — precisa PDF generation

### 🔴 Risks

1. **Firebase client-side** não é escalável para Vetting 2.0 volume
2. **Multi-tenancy** não está implementado
3. **Audit trail** não existe
4. **Vetting Officer dashboard** precisa ser built from scratch

---

## 9. Integration Points

### 9.1 How to Integrate Existing Code

**Landing Page:**
```
Keep: /logix-sphere-landing-page/ 
Expand: Add /admin-dashboard and /driver-portal apps
Migrate: Move Firebase auth to backend JWT
```

**Firebase Auth:**
```
Current: Google OAuth in firebase-sync.js (client-side)
Future: OAuth2 in backend, JWT tokens to frontend
```

**Forms & Validation:**
```
Reuse: React Hook Form + Zod patterns
Extend: Add vetting-specific validators
```

### 9.2 Data Flow

```
Browser (Frontend)
  ↓
Next.js API Routes (light validation only)
  ↓
Backend REST API (NestJS)
  ├── Authentication (JWT)
  ├── Business Logic (Use Cases)
  ├── State Transitions (Machine)
  └── Database (PostgreSQL)
```

---

## 10. Next Steps (After Discover → Define Phase)

**Em DEFINE (40% do plano), você vai:**

1. ✅ **Confirmar Tech Stack**
   - NestJS? Express? (recomenda NestJS)
   - PostgreSQL? Firebase? (recomenda PostgreSQL)

2. ✅ **Design Central Driver Record Schema**
   - Tabelas: drivers, applications, interviews, documents, decisions
   - Relationships e indexes

3. ✅ **State Machine Specification**
   - 34 estados mapeados
   - Transições permitidas
   - Ações por estado

4. ✅ **API Specification**
   - Endpoints REST com Swagger
   - Payloads de entrada/saída (Zod schemas)

5. ✅ **Module Dependencies**
   - Qual módulo depende de qual?
   - Ordem de implementação

6. ✅ **Integração Thiago Folder**
   - Mapear blueprint HTML para código
   - Extrair regras de decisão

---

## Summary Table

| Categoria | Status | Reutilizável | Novo |
|-----------|--------|-------------|------|
| **Frontend** | ✅ Pronto | Next.js, Componentes, Forms | Admin Dashboard, Driver Portal |
| **Backend** | ❌ Não existe | - | NestJS, APIs, State Machine |
| **BD** | ❌ Não existe | Firebase config | PostgreSQL schema |
| **Auth** | ⚠️ Parcial | Google OAuth | JWT backend |
| **Docs** | ⚠️ Parcial | Strategic Blueprint | PDF generation, signing |
| **Integration** | ❌ Não existe | - | DHL APHIDS, SendGrid, Cloud Storage |

---

**Conclusão:** Você tem uma **base sólida em TypeScript/Next.js**. Vetting 2.0 é principalmente um **problema de backend** — construir a orquestração de workflow, máquina de estados, e integrações. O frontend é principalmente **reutilização de componentes existentes**.

