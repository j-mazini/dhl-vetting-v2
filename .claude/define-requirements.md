# DEFINE PHASE — Vetting 2.0 System Requirements & Architecture

**Data:** 2026-06-16  
**Fase:** Define (40% do plano)  
**Base:** Discovery Report + CLAUDE.md patterns + Strategic Blueprint  

---

## 1. Problem Statement

**O que precisa ser resolvido:**

Integrar um sistema completo de Vetting de drivers (34 estados) dentro da landing page BA Express (Next.js), com separação clara entre frontend (cliente admin/driver) e backend (orquestração de workflow, regras de negócio, integrações).

**Constraints:**
- ✅ Frontend já é TypeScript/Next.js 16
- ✅ Firebase já configurado
- ✅ CLAUDE.md define padrões arquiteturais
- ❌ Backend não existe
- ❌ Máquina de estados não existe
- ❌ Banco de dados não existe

**Success Criteria:**
1. Arquitetura escalável (suporte crescimento de drivers)
2. Máquina de estados com 34 estados bem definidos
3. SLAs implementados (< 1h pre-screen, 24h insurance, 48h interview)
4. Integrações com DHL, email, document storage
5. Admin dashboard para orquestração
6. Driver portal para progress tracking

---

## 2. Tech Stack Decision Matrix

### 2.1 Frontend (Decidido ✅)

**Escolha:** Manter Next.js 16 existente + expandir

```
✅ Next.js 16.2.2       (Não mudar)
✅ React 19.2.4         (Não mudar)
✅ TypeScript 5         (Não mudar)
✅ React Hook Form      (Não mudar)
✅ Zod                  (Não mudar)
✅ Tailwind CSS         (Não mudar)

Adicionar:
+ React Query           (para estado servidor - recomendado CLAUDE.md)
+ Zustand ou Jotai     (estado local complexo, se necessário)
```

**Justificativa:** 
- Já tem as dependências corretas
- CLAUDE.md recomenda React Query para dados de servidor
- Reduz risco de reescrita

---

### 2.2 Backend (Decisão Crítica)

**Opção A: NestJS** ✅ RECOMENDADO
```
Pros:
  ✅ Arquitetura robusta (modules, services, controllers)
  ✅ Injeção de dependência nativa (testabilidade)
  ✅ TypeScript first
  ✅ Pipes, Guards, Interceptors (middleware poderoso)
  ✅ Database agnostic (TypeORM, Prisma)
  ✅ OpenAPI/Swagger integrado

Cons:
  ⚠️ Curva de aprendizado (maiores para iniciantes)
  ⚠️ Mais overhead (inicialização mais lenta)

Align com CLAUDE.md: ✅ SIM (Clean Architecture pattern)
```

**Opção B: Express + TypeScript**
```
Pros:
  ✅ Simples, minimalista
  ✅ Ecossistema grande
  ✅ Rápido para prototipar

Cons:
  ❌ Sem estrutura arquitetural (responsabilidade do dev)
  ❌ Menos testável por padrão
  ❌ Mais boilerplate para escalabilidade

Align com CLAUDE.md: ⚠️ PARCIAL (requer disciplina)
```

**DECISÃO FINAL: NestJS**

**Razão:** CLAUDE.md enfatiza Clean Architecture, Use Cases, Ports/Interfaces. NestJS suporta isso nativamente. Express exigiria implementação manual.

---

### 2.3 Database (Decisão Crítica)

**Opção A: PostgreSQL** ✅ RECOMENDADO
```
Pros:
  ✅ ACID transactions (importante para máquina de estados)
  ✅ Escalável (índices, partições)
  ✅ Suporta JSON (para dados flexíveis)
  ✅ Full-text search
  ✅ Replicação master-slave

Cons:
  ⚠️ Setup mais complexo (self-hosted ou managed)

Ideal para: Vetting 2.0 com SLAs críticas
```

**Opção B: Firebase Firestore**
```
Pros:
  ✅ Serverless (sem ops)
  ✅ Real-time listeners
  ✅ Já configurado no projeto

Cons:
  ❌ Sem ACID transactions (problema para estado machine)
  ❌ Custos podem escalar
  ❌ Joins custosos (denormalização)
  ❌ Sem full-text search nativo

Ideal para: MVP ou app simples
```

**DECISÃO FINAL: PostgreSQL**

**Razão:** 
- Máquina de estados com 34 transições precisa de ACID
- Firestore tem fraco suporte a transações multi-documento
- Vetting é processo crítico (precisa auditoria)
- PostgreSQL já é padrão em projetos Node.js

**Hosted Option:** Amazon RDS, Google Cloud SQL, ou Vercel Postgres (integrado)

---

### 2.4 Supporting Services

| Serviço | Escolha | Razão |
|---------|---------|-------|
| **Cache** | Redis + Bull | Task queue para SLAs (auto-chase DHL D+3) |
| **Auth** | OAuth2 Google + JWT | Seguro, sem storing secrets no frontend |
| **Document Storage** | Google Cloud Storage | Escalável, integração DHL |
| **Email** | SendGrid API | Confiável, templates, webhooks |
| **PDF Generation** | PDFKit ou Puppeteer | Gerar suitability assessment, contrato |
| **ORM** | Prisma | Type-safe, migrations automáticas |
| **Validation** | Zod (frontend) + decorators NestJS | Validação dupla (segurança) |
| **Logging** | Winston ou Pino | Structured logging para auditoria |
| **Monitoring** | Sentry | Error tracking em produção |

---

## 3. Central Driver Record — Schema

### 3.1 Entities Principais

```sql
-- Core Tables

CREATE TABLE drivers (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  address TEXT,
  
  -- RTW (Right to Work)
  rtw_document_type VARCHAR(50),        -- BRITISH_PASSPORT, EU_PASSPORT, SHARE_CODE, SPONSOR_VISA, OTHER
  rtw_document_number VARCHAR(100),
  rtw_expiration_date DATE,
  
  -- DVLA (Driving License)
  dvla_type VARCHAR(50),               -- BRITISH, EU, OTHER
  dvla_number VARCHAR(50),
  dvla_expiration_date DATE,
  
  -- Insurance
  insurance_number VARCHAR(100),
  insurance_status VARCHAR(50),        -- PENDING, APPROVED, DECLINED
  
  -- Work Experience
  years_of_experience INT,
  
  -- Status Machine
  current_status VARCHAR(100) NOT NULL DEFAULT 'PRE_REGISTERED',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Audit
  created_by UUID,
  updated_by UUID
);

CREATE TABLE applications (
  id UUID PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  
  application_status VARCHAR(100),    -- tracks which step of flow
  interview_date TIMESTAMP,
  interview_notes TEXT,
  
  suitability_assessment_score INT,
  suitability_assessment_notes TEXT,
  
  vetting_status VARCHAR(100),        -- PENDING, VRA_REQUIRED, APPROVED, REJECTED
  vra_document_url VARCHAR(255),
  vra_notes TEXT,
  
  dhl_status VARCHAR(100),            -- PENDING, APPROVED, REJECTED, AUTO_CHASE_D3
  dhl_sent_date TIMESTAMP,
  dhl_response_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  
  document_type VARCHAR(100),         -- RTW, DVLA, DBS, CRC, WORK_REFERENCE, OTHER
  document_url VARCHAR(255) NOT NULL, -- Cloud Storage path
  upload_date TIMESTAMP DEFAULT NOW(),
  expiration_date DATE,
  
  verification_status VARCHAR(50),    -- PENDING, VERIFIED, REJECTED
  verified_by UUID,
  verified_date TIMESTAMP
);

CREATE TABLE state_transitions (
  id UUID PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  
  from_state VARCHAR(100) NOT NULL,
  to_state VARCHAR(100) NOT NULL,
  action VARCHAR(100),                -- APPLY, PASS_PRESCREEN, AUTO_REJECT, SCHEDULE_INTERVIEW, etc
  
  triggered_by VARCHAR(100),          -- SYSTEM, USER, ADMIN
  triggered_by_user_id UUID,
  
  transition_date TIMESTAMP DEFAULT NOW(),
  reason TEXT,                        -- Explicação da transição
  
  INDEX (driver_id, transition_date),
  INDEX (from_state, to_state)
);

CREATE TABLE emails_sent (
  id UUID PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  
  email_type VARCHAR(100),            -- PREREGISTRATION_CONFIRMATION, APPROVAL_INITIAL, INTERVIEW_DETAILS, etc
  recipient_email VARCHAR(255),
  sent_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50),                 -- SENT, OPENED, BOUNCED, COMPLAINED
  
  INDEX (driver_id, email_type)
);

CREATE TABLE dhl_integration (
  id UUID PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  
  dhl_submission_date TIMESTAMP,
  dhl_form_data JSONB,                -- Auto-populated form
  dhl_response JSONB,
  
  auto_chase_date TIMESTAMP,          -- D+3 for follow-up
  auto_chase_count INT DEFAULT 0,
  
  INDEX (driver_id, dhl_submission_date)
);
```

### 3.2 Indexes Críticas

```sql
CREATE INDEX idx_drivers_current_status ON drivers(current_status);
CREATE INDEX idx_applications_dhl_status ON applications(dhl_status);
CREATE INDEX idx_applications_interview_date ON applications(interview_date);
CREATE INDEX idx_state_transitions_date ON state_transitions(transition_date);
CREATE INDEX idx_documents_expiration ON documents(expiration_date);
```

### 3.3 Views para Reporting

```sql
-- Dashboard para admin
CREATE VIEW driver_pipeline AS
  SELECT 
    current_status,
    COUNT(*) as count,
    COUNT(CASE WHEN updated_at > NOW() - INTERVAL '24 hours' THEN 1 END) as recent_24h
  FROM drivers
  GROUP BY current_status
  ORDER BY count DESC;

-- SLA tracking
CREATE VIEW sla_tracking AS
  SELECT 
    d.id,
    d.full_name,
    a.current_status,
    EXTRACT(HOUR FROM NOW() - a.created_at) as hours_in_state,
    CASE 
      WHEN a.current_status = 'PRE_SCREEN_IN_PROGRESS' AND EXTRACT(HOUR FROM NOW() - a.created_at) > 1 THEN 'SLA_BREACH'
      WHEN a.current_status = 'INSURANCE_EXCEPTION' AND EXTRACT(HOUR FROM NOW() - a.created_at) > 24 THEN 'SLA_BREACH'
      WHEN a.current_status = 'INTERVIEW_PENDING' AND EXTRACT(HOUR FROM NOW() - a.created_at) > 48 THEN 'SLA_BREACH'
    END as sla_status
  FROM drivers d
  JOIN applications a ON d.id = a.driver_id;
```

---

## 4. State Machine Specification

### 4.1 Estados (34 estados mapeados)

```
GRUPO 1: PRE-REGISTRATION
  1. PRE_REGISTERED                 → Candidato preencheu formulário
  2. PRE_SCREEN_IN_PROGRESS        → Sistema analisando dados iniciais (SLA: <1h)

GRUPO 2: SCREENING RULES
  3. AUTO_REJECTED_NO_RTW          → Rejeição automática (sem documentação RTW válida)
  4. INSURANCE_EXCEPTION            → Encaminhado para exceção de seguro (< 25 anos ou < 1 ano exp)
  5. INSURANCE_DECLINED             → Seguro recusou exceção
  6. INSURANCE_APPROVED             → Seguro aprovou exceção

GRUPO 3: INTERVIEW
  7. INTERVIEW_PENDING              → Aguardando agendamento (SLA: 48h)
  8. INTERVIEW_BOOKED               → Entrevista agendada
  9. INTERVIEW_COMPLETED            → Entrevista finalizada
  10. INTERVIEW_REJECTED             → Candidato rejeitado após entrevista
  11. INTERVIEW_APPROVED             → Candidato passou na entrevista

GRUPO 4: DOCUMENT COLLECTION
  12. DOCUMENTS_REQUESTED            → Sistema solicitou documentos (DBS, CRC, work ref)
  13. DOCUMENTS_UPLOADED             → Candidato fez upload dos documentos
  14. VETTING_REVIEW                 → Vetting Officer revisando documentos

GRUPO 5: VETTING
  15. VRA_REQUIRED                   → Gap > 28 dias ou concerns encontrados
  16. VRA_REJECTED                   → Risco análise rejeitada
  17. VRA_APPROVED                   → Risco análise aprovada

GRUPO 6: CLIENT ALLOCATION
  18. CLIENT_ALLOCATION_FIT_SCORING  → Analisando compatibilidade com clientes

GRUPO 7: DHL INTEGRATION
  19. SENT_TO_DHL                    → Formulário DHL enviado
  20. DHL_PENDING                    → Aguardando resposta DHL
  21. DHL_AUTO_CHASE_D3              → Auto-cobrança depois de 3 dias
  22. DHL_REJECTED                   → DHL rejeitou candidato
  23. APPROVED_IN_WRITING            → DHL aprovou por escrito

GRUPO 8: HANDOVER
  24. VAN_HIRE_PENDING               → Processo de hire da van
  25. HANDOVER_PENDING               → Aguardando assinatura de contrato
  26. CONTRACTS_SIGNED               → Contrato de hire + deductions assinados

GRUPO 9: TRAINING
  27. TRAINING_PENDING               → Treino agendado
  28. INDUCTION_COMPLETED            → Indução finalizada

GRUPO 10: DEPLOYMENT
  29. PORTAL_LIVE                    → Acesso ao Logixsphere liberado
  30. ACTIVE_DRIVER                  → Driver ativo e primeira rota atribuída

GRUPO 11: LIFECYCLE
  31. LIFECYCLE_MONITORING           → Ciclo de rechecagens
  32. RE_VETTING_REQUIRED            → Recheck de DVLA/CRC/RTW necessário

GRUPO 12: TERMINAL
  33. SUSPENDED                      → Driver suspenso temporariamente
  34. ARCHIVED                       → Registro arquivado (histórico)
```

### 4.2 Transições e Regras

```typescript
// Exemplo de state machine com xstate ou similar

const driverStateMachine = {
  PRE_REGISTERED: {
    transitions: {
      'RUN_PRESCREEN': {
        target: 'PRE_SCREEN_IN_PROGRESS',
        condition: () => true,
        action: () => startPreScreenTimer()  // SLA: 1h
      }
    }
  },
  
  PRE_SCREEN_IN_PROGRESS: {
    transitions: {
      'RTW_INVALID': {
        target: 'AUTO_REJECTED_NO_RTW',
        action: () => sendRejectionEmail()
      },
      'AGE_OR_EXP_EXCEPTION': {
        target: 'INSURANCE_EXCEPTION',
        action: () => requestBrokerQuote()  // SLA: 24h
      },
      'PRESCREEN_PASS': {
        target: 'INTERVIEW_PENDING',
        action: () => scheduleInterview()   // SLA: 48h
      }
    },
    timeout: 3600  // 1 hour SLA
  },
  
  INTERVIEW_PENDING: {
    transitions: {
      'INTERVIEW_SCHEDULED': {
        target: 'INTERVIEW_BOOKED',
        action: () => sendInterviewConfirmation()
      }
    },
    timeout: 172800  // 48 hour SLA
  },
  
  // ... more states
  
  DHL_PENDING: {
    transitions: {
      'DHL_APPROVED': {
        target: 'APPROVED_IN_WRITING'
      },
      'DHL_REJECTED': {
        target: 'DHL_REJECTED'
      }
    },
    timeout: 259200,  // 3 days
    onTimeout: () => transitionTo('DHL_AUTO_CHASE_D3')
  }
};
```

---

## 5. API Specification

### 5.1 Base URL & Versioning

```
http://localhost:3011/api/v1
```

Baseado em CLAUDE.md:
- ✅ Versionado em `/api/v1/`
- ✅ Nunca alterar rotas existentes (quebra compatibilidade)
- ✅ Novos endpoints em versões novas (`/api/v2/`)

### 5.2 Core Endpoints

#### Authentication
```
POST   /api/v1/auth/login              # Google OAuth
POST   /api/v1/auth/logout
GET    /api/v1/auth/me                 # Current user
GET    /api/v1/auth/refresh-token
```

#### Pre-Registration
```
POST   /api/v1/drivers                 # Create new driver application
GET    /api/v1/drivers/:id             # Get driver record
PUT    /api/v1/drivers/:id             # Update driver info
GET    /api/v1/drivers/:id/status      # Get current state
```

#### Pre-Screening
```
POST   /api/v1/drivers/:id/prescreen   # Trigger auto-screening rules
GET    /api/v1/drivers/:id/prescreen-result
POST   /api/v1/drivers/:id/insurance-exception
```

#### Interview Management
```
POST   /api/v1/interviews              # Schedule interview
GET    /api/v1/interviews/:id
PUT    /api/v1/interviews/:id          # Update with test scores, notes
GET    /api/v1/drivers/:id/interview   # Get interview results
```

#### Document Management
```
POST   /api/v1/documents               # Upload document
GET    /api/v1/drivers/:id/documents
DELETE /api/v1/documents/:id
```

#### Vetting
```
GET    /api/v1/drivers/:id/vetting-review
POST   /api/v1/drivers/:id/vetting-review  # Submit vetting decision
POST   /api/v1/drivers/:id/vra             # Generate VRA form
```

#### DHL Integration
```
POST   /api/v1/drivers/:id/dhl-submit     # Submit to DHL
GET    /api/v1/drivers/:id/dhl-status
POST   /api/v1/drivers/:id/dhl-chase      # Manual DHL follow-up
```

#### Admin Dashboard
```
GET    /api/v1/admin/pipeline             # All drivers by status
GET    /api/v1/admin/sla-tracking         # SLA breaches
GET    /api/v1/admin/analytics            # Stats
POST   /api/v1/admin/drivers/:id/transition  # Force state transition (audit)
```

### 5.3 Request/Response Examples

```typescript
// POST /api/v1/drivers
// Create pre-registration

Request Body (Zod validated):
{
  fullName: "João Silva",
  email: "joao@example.com",
  phone: "+55 11 98765-4321",
  dateOfBirth: "1990-05-15",
  address: "Rua X, 123, São Paulo, SP",
  rtwDocumentType: "BRITISH_PASSPORT",
  rtwDocumentNumber: "123456789",
  rtwExpirationDate: "2030-12-31",
  dvlaType: "BRITISH",
  dvlaNumber: "SILVA901156AB9IJ",
  dvlaExpirationDate: "2028-06-30",
  insuranceNumber: "NI123456789",
  yearsOfExperience: 5
}

Response (200 Created):
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "joao@example.com",
  currentStatus: "PRE_REGISTERED",
  createdAt: "2026-06-16T15:13:00Z"
}

Error Response (400 Bad Request):
{
  errors: {
    rtwDocumentNumber: ["Expected string, received undefined"],
    dvlaExpirationDate: ["Date must be in future"]
  }
}
```

---

## 6. Module Architecture (NestJS)

### 6.1 Module Structure

```
src/
├── shared/                        # Shared across modules
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
│
├── database/                      # Database layer
│   ├── migrations/
│   ├── entities/
│   └── repositories/
│
├── auth/                          # Auth module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── google-oauth.strategy.ts
│   └── jwt.strategy.ts
│
├── drivers/                       # Core driver module
│   ├── drivers.controller.ts
│   ├── drivers.service.ts
│   ├── create-driver.use-case.ts
│   └── get-driver.use-case.ts
│
├── preregistration/              # Pre-registration module
│   ├── preregistration.controller.ts
│   ├── submit-preregistration.use-case.ts
│   └── validate-rtw.use-case.ts
│
├── prescreening/                 # Pre-screening rules
│   ├── prescreening.service.ts
│   ├── check-rtw.use-case.ts
│   ├── check-age-experience.use-case.ts
│   └── insurance-exception.service.ts
│
├── interview/                    # Interview management
│   ├── interview.controller.ts
│   ├── schedule-interview.use-case.ts
│   ├── submit-interview-results.use-case.ts
│   └── interview.service.ts
│
├── documents/                    # Document management
│   ├── documents.controller.ts
│   ├── upload-document.use-case.ts
│   ├── validate-document.use-case.ts
│   └── cloud-storage.service.ts
│
├── vetting/                      # Vetting review
│   ├── vetting.controller.ts
│   ├── review-documents.use-case.ts
│   ├── generate-vra.use-case.ts
│   └── vetting-decision.service.ts
│
├── dhl-integration/              # DHL integration
│   ├── dhl.controller.ts
│   ├── submit-to-dhl.use-case.ts
│   ├── dhl-client.service.ts
│   └── dhl-form-builder.ts
│
├── state-machine/                # State transitions (core)
│   ├── state-machine.service.ts
│   ├── state-transition.use-case.ts
│   ├── state-validators/
│   └── state-transitions.config.ts
│
├── email/                        # Email system
│   ├── email.service.ts
│   ├── email-templates/
│   └── sendgrid.adapter.ts
│
├── lifecycle/                    # Lifecycle monitoring
│   ├── lifecycle.service.ts
│   ├── schedule-rechecks.use-case.ts
│   └── dvla-recheck.service.ts
│
└── admin/                        # Admin dashboard
    ├── admin.controller.ts
    ├── pipeline.service.ts
    ├── sla-tracking.service.ts
    └── analytics.service.ts
```

### 6.2 Module Dependencies

```
preregistration
  → drivers
  → prescreening
    → insurance-exception
      → email

interview
  → drivers
  → documents
  → email

documents
  → cloud-storage
  → vetting (para validation)

vetting
  → documents
  → state-machine

dhl-integration
  → drivers
  → dhl-client
  → email

state-machine (CORE)
  ← todos outros módulos

email (SHARED)
  ← preregistration, interview, vetting, dhl-integration, lifecycle

lifecycle
  → drivers
  → state-machine
  → email
```

---

## 7. Integration Architecture

### 7.1 Frontend ↔ Backend Communication

```
Frontend (Next.js)
  ↓
Next.js API Routes (/app/api/proxy/* - thin proxy)
  ↓
Backend REST API (NestJS)
  ├── Validation (Zod decorators)
  ├── Authentication (JWT guard)
  ├── Business Logic (Use Cases)
  ├── State Transitions (State Machine)
  ├── Database (Prisma → PostgreSQL)
  └── External Services (DHL, SendGrid, GCS)
```

### 7.2 External Integrations

```
DHL Integration:
  Backend → DHL APHIDS API
  ├── POST: Submit vetting form (auto-populated)
  ├── GET: Check approval status
  └── Webhook: Listen for DHL responses

Email System:
  Backend (SendGrid)
  ├── 9+ email templates
  ├── Webhook tracking (sent, opened, bounced)
  └── Scheduled sends (SLA timers)

Document Storage:
  Backend → Google Cloud Storage
  ├── Driver documents (DBS, CRC, work ref)
  ├── Generated PDFs (Suitability Assessment)
  └── Signed contracts

Task Queue:
  Redis + Bull
  ├── Auto-chase DHL (D+3)
  ├── Email reminders
  └── Scheduled rechecks (DVLA annual)
```

---

## 8. Implementation Sequence

### Phase 1: Backend Foundation (Weeks 1-2)
```
Week 1:
  [ ] Setup NestJS project
  [ ] Configure PostgreSQL
  [ ] Implement database schema
  [ ] Setup Prisma migrations
  
Week 2:
  [ ] Auth module (Google OAuth + JWT)
  [ ] Drivers module (CRUD)
  [ ] State machine service
  [ ] Base API structure
```

### Phase 2: Core Workflow (Weeks 3-5)
```
Week 3:
  [ ] Pre-registration module
  [ ] Pre-screening rules engine
  [ ] Insurance exception handling
  
Week 4:
  [ ] Interview module
  [ ] Document upload/validation
  [ ] Tests (unit + integration)
  
Week 5:
  [ ] Vetting review module
  [ ] VRA form generation
  [ ] Email system integration
```

### Phase 3: Integrations (Weeks 6-8)
```
Week 6:
  [ ] DHL API integration
  [ ] DHL form builder (auto-population)
  [ ] Webhook handlers
  
Week 7:
  [ ] Lifecycle monitoring
  [ ] Task queue (Bull/Redis)
  [ ] Auto-chase implementation
  
Week 8:
  [ ] Admin dashboard API
  [ ] SLA tracking
  [ ] Analytics
```

### Phase 4: Frontend & Testing (Weeks 9-12)
```
Week 9:
  [ ] Admin dashboard (React)
  [ ] Driver portal (login, progress)
  [ ] Pre-registration form
  
Week 10:
  [ ] Interview interface
  [ ] Document upload UI
  [ ] E2E tests
  
Week 11-12:
  [ ] Staging deployment
  [ ] Load testing
  [ ] Production hardening
```

---

## 9. Risk Assessment

### High Risk ⚠️

| Risk | Mitigation |
|------|-----------|
| **State machine complexity** | Design thoroughly before coding; use xstate library; extensive testing |
| **DHL API integration** | Get API docs early; mock integration until creds ready |
| **SLA timers** | Use reliable task queue (Bull); don't rely on crons |
| **Multi-tenancy (future)** | Design schema for tenancy from day 1 (workspace_id) |

### Medium Risk

| Risk | Mitigation |
|------|-----------|
| **Email deliverability** | Use SendGrid with webhooks; monitor bounces |
| **Document validation** | Test edge cases; allow manual override by admin |
| **Audit trail completeness** | Log all state transitions; database triggers |

### Low Risk

| Risk | Mitigation |
|------|-----------|
| **Frontend migration** | Incremental: add admin dashboard, then driver portal |
| **Database scaling** | PostgreSQL handles 100k+ drivers; RDS managed service |

---

## 10. Summary of Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework Backend** | NestJS | Clean Architecture, testability, scalability |
| **Database** | PostgreSQL | ACID, machine-friendly, audit trail |
| **Task Queue** | Bull (Redis) | SLA automation, reliability |
| **Auth** | OAuth2 + JWT | Secure, no password storage |
| **Document Storage** | Google Cloud Storage | Scalable, DHL integration ready |
| **Email Service** | SendGrid | Reliable, templates, webhooks |
| **Frontend** | Next.js (existing) | Avoid rewrite, leverage investment |
| **ORM** | Prisma | Type-safe, migrations, developer experience |

---

## Próximos Passos (Define → Develop)

1. ✅ **Aprovação de Tech Stack**
   - Confirmar: NestJS? PostgreSQL?
   - Ou ajustar preferências

2. ✅ **Schema Database Detalhado**
   - Tabelas adicionais (audit_logs, webhooks_received)
   - Triggers para auditoria

3. ✅ **State Machine Finalization**
   - Validators por estado
   - Callbacks (email, external APIs)

4. ✅ **API Documentation**
   - OpenAPI/Swagger spec completo
   - Exemplos de payloads

5. ✅ **Development Environment Setup**
   - Docker compose (PostgreSQL, Redis)
   - Local development guide

---

**Status:** Define Phase Completo ✅  
**Próxima Fase:** Develop (Implementação)
