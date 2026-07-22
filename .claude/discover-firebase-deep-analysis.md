# 🔍 DEEP DISCOVERY — Firebase Firestore + NestJS Implementation

**Intensidade:** Profunda (3-6 min análise)  
**Foco:** Implementação técnica  
**Data:** 2026-06-16  

---

## 1. Melhorias para o Setup Firebase

### 1.1 Error Handling Robusto

**Problema atual:** Firebase pode falhar silenciosamente

**Solução recomendada:**
```typescript
// src/firebase/firebase.service.ts
export class FirebaseService {
  constructor() {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({...});
      }
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      throw new Error('Firebase service unavailable');
    }
  }

  // Retry logic for transient failures
  async createDriver(data) {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.db.collection('drivers').add(data);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await sleep(1000 * (i + 1)); // exponential backoff
      }
    }
  }
}
```

### 1.2 Connection Pooling & Optimization

**Problema:** Cada request cria nova conexão Firestore

**Solução:**
```typescript
// src/firebase/firebase.pool.ts
export class FirestorePool {
  private static instance: Firestore;

  static getInstance(): Firestore {
    if (!FirestorePool.instance) {
      const app = admin.app();
      FirestorePool.instance = admin.firestore(app);
      
      // Configure connection settings
      FirestorePool.instance.settings({
        ignoreUndefinedProperties: true,
        cacheSizeBytes: 100 * 1024 * 1024, // 100MB
      });
    }
    return FirestorePool.instance;
  }
}
```

### 1.3 Caching Layer (Redis alternativa)

**Problema:** Firestore cobra por leitura mesmo que dados mudem raramente

**Solução com In-Memory Cache:**
```typescript
// src/firebase/firebase-cache.service.ts
@Injectable()
export class FirebaseCacheService {
  private cache = new Map<string, CachedEntry>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  async getDriver(driverId: string): Promise<Driver> {
    const cached = this.cache.get(`driver:${driverId}`);
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }

    const driver = await this.firebaseService.getDriver(driverId);
    this.cache.set(`driver:${driverId}`, {
      data: driver,
      timestamp: Date.now(),
    });

    return driver;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  private isExpired(entry: CachedEntry): boolean {
    return Date.now() - entry.timestamp > this.ttl;
  }
}
```

---

## 2. Padrões Recomendados para Firestore

### 2.1 Data Modeling

**❌ Anti-pattern: Deep nesting**
```
drivers/
├── {driverId}
│   ├── documents/ ← Subcollection (problema: custos altos)
│   │   ├── {docId}
```

**✅ Recomendado: Flat structure com references**
```
drivers/{driverId}
  ├── documentIds: [ref1, ref2, ...]  ← Array de referencias
  
documents/{docId}
  ├── driverId: {driverId}  ← Reference back
```

### 2.2 Query Optimization

**❌ Problema:** Queries que leem muitos docs desnecessariamente

```typescript
// Ruim: Lê TODOS os drivers, depois filtra em memória
const allDrivers = await db.collection('drivers').get();
const active = allDrivers.docs.filter(d => d.data().currentStatus === 'ACTIVE_DRIVER');
```

**✅ Solução: Usar indexes e where clauses**

```typescript
// Bom: Firestore filtra antes de retornar
const active = await db.collection('drivers')
  .where('currentStatus', '==', 'ACTIVE_DRIVER')
  .get();

// Melhor: Paginar grandes resultsets
const snapshot = await db.collection('drivers')
  .where('currentStatus', '==', 'ACTIVE_DRIVER')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get();

const nextSnapshot = await db.collection('drivers')
  .where('currentStatus', '==', 'ACTIVE_DRIVER')
  .orderBy('createdAt', 'desc')
  .startAfter(snapshot.docs[snapshot.docs.length - 1])
  .limit(10)
  .get();
```

### 2.3 Transactions vs Batch Operations

**Quando usar cada:**

```typescript
// TRANSACTION: Múltiplos reads + writes atômicos (máx 25 writes)
await db.runTransaction(async (transaction) => {
  const driverRef = db.collection('drivers').doc(driverId);
  const driver = await transaction.get(driverRef);
  
  if (driver.data().currentStatus === 'INTERVIEW_COMPLETED') {
    transaction.update(driverRef, { currentStatus: 'INTERVIEW_APPROVED' });
    transaction.set(db.collection('stateTransitions').doc(), {...});
  }
});

// BATCH: Múltiplos writes SEM reads (máx 500 ops)
const batch = db.batch();
batch.set(doc1Ref, {...});
batch.update(doc2Ref, {...});
batch.delete(doc3Ref);
await batch.commit();
```

---

## 3. Pitfalls Comuns & Como Evitar

### 3.1 Reads Duplicados

**❌ Problema:**
```typescript
// Cada call faz um read (custos!)
const driver1 = await db.collection('drivers').doc(id).get();
const driver2 = await db.collection('drivers').doc(id).get();
```

**✅ Solução:**
```typescript
const driver = await db.collection('drivers').doc(id).get();
const data = driver.data();
// Reutilize data
```

### 3.2 Unlimited Growth

**❌ Problema:** Colections crescem indefinidamente, queries ficam lentas

**✅ Solução: Implementar cleanup**
```typescript
// src/firebase/cleanup.scheduler.ts
@Injectable()
export class CleanupScheduler {
  @Cron('0 2 * * *') // 2 AM daily
  async cleanupArchivedDrivers() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const snapshot = await this.db.collection('drivers')
      .where('currentStatus', '==', 'ARCHIVED')
      .where('updatedAt', '<', thirtyDaysAgo)
      .limit(100)
      .get();

    const batch = this.db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}
```

### 3.3 N+1 Queries

**❌ Problema:**
```typescript
const drivers = await db.collection('drivers').get();
for (const driver of drivers.docs) {
  // Para cada driver, faz uma query separada!
  const docs = await db.collection('documents')
    .where('driverId', '==', driver.id)
    .get();
}
```

**✅ Solução: Denormalize ou use batch reads**
```typescript
// Opção 1: Denormalize (adicione documentIds em drivers)
// drivers/{driverId}
//   documentIds: [ref1, ref2]

// Opção 2: Batch read
const drivers = await db.collection('drivers').get();
const documentSnapshots = await Promise.all(
  drivers.docs.map(driver =>
    db.collection('documents')
      .where('driverId', '==', driver.id)
      .get()
  )
);
```

---

## 4. Otimizações de Performance

### 4.1 Indexes Strategy

**Críticos para Vetting 2.0:**

```bash
# Index 1: Pipeline Dashboard
db.collection('drivers')
  .where('currentStatus', '==', status)
  .orderBy('createdAt', 'desc')
  # Firestore criará automaticamente ou manual:
  # gcloud firestore indexes create --collection=drivers --fields=currentStatus,createdAt

# Index 2: SLA Tracking
db.collection('drivers')
  .where('currentStatus', '==', status)
  .where('updatedAt', '<', timestamp)
  # Manual: gcloud firestore indexes create...

# Index 3: Applications by Driver
db.collection('applications')
  .where('driverId', '==', id)
  .orderBy('createdAt', 'desc')
```

### 4.2 Query Patterns Eficientes

**Aplicar Bulk Reads:**
```typescript
// src/firebase/batch-loader.ts
export class BatchLoader {
  private batch = new DataLoader(async (ids: string[]) => {
    const snapshot = await db.collection('drivers')
      .where(FieldPath.documentId(), 'in', ids)
      .get();

    const map = new Map();
    snapshot.docs.forEach(doc => {
      map.set(doc.id, doc.data());
    });

    return ids.map(id => map.get(id) || null);
  });

  async load(id: string): Promise<Driver> {
    return this.batch.load(id);
  }
}
```

### 4.3 Timestamp Indexing

**Problema:** Queries por data são lentas sem indexes

**Solução:**
```typescript
// Sempre adicione timestamp ao criar
const driver = {
  fullName: '...',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
};

// Query eficiente
const recent = await db.collection('drivers')
  .where('createdAt', '>', thirtyDaysAgo)
  .get();
```

---

## 5. Segurança Aprimorada

### 5.1 Firestore Security Rules Avançadas

**Recomendado:**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid))
        .data.role == 'ADMIN';
    }
    
    function hasValidPermission(resource) {
      return isOwner(resource.data.userId) || isAdmin();
    }
    
    function validateDriverData(data) {
      return data.size() <= 100 && // Size limit
             data.fullName is string &&
             data.email is string &&
             data.email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }
    
    // Drivers collection
    match /drivers/{driverId} {
      allow read: if isOwner(driverId) || isAdmin();
      allow create: if request.auth != null && validateDriverData(request.resource.data);
      allow update: if hasValidPermission(resource) &&
                       validateDriverData(request.resource.data);
      allow delete: if isAdmin();
    }
    
    // Audit logs
    match /auditLogs/{logId} {
      allow read: if isAdmin();
      allow create: if request.auth != null;
      allow write: if false; // Audit logs são immutable
    }
  }
}
```

### 5.2 Rate Limiting

**Implementar no NestJS:**
```typescript
// src/common/guards/rate-limit.guard.ts
@Injectable()
export class RateLimitGuard implements CanActivate {
  private cache = new Map<string, { count: number; resetTime: number }>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = request.ip;
    const now = Date.now();

    const current = this.cache.get(key);
    if (!current || now > current.resetTime) {
      this.cache.set(key, { count: 1, resetTime: now + 60000 }); // 60s window
      return true;
    }

    if (current.count > 100) { // 100 req/min
      throw new HttpException('Too Many Requests', 429);
    }

    current.count++;
    return true;
  }
}
```

---

## 6. Monitoramento & Observabilidade

### 6.1 Logging Estruturado

```typescript
// src/common/logger/firebase.logger.ts
@Injectable()
export class FirebaseLogger {
  log(message: string, context: string, metadata?: any) {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
      timestamp,
      level: 'INFO',
      context,
      message,
      ...metadata,
    }));

    // Also log to Firestore for audit
    this.db.collection('logs').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      level: 'INFO',
      context,
      message,
      ...metadata,
    });
  }
}
```

### 6.2 Metrics Collection

```typescript
// src/firebase/firebase-metrics.service.ts
@Injectable()
export class FirebaseMetricsService {
  private metrics = {
    readCount: 0,
    writeCount: 0,
    transactionCount: 0,
  };

  recordRead() {
    this.metrics.readCount++;
  }

  recordWrite() {
    this.metrics.writeCount++;
  }

  getMetrics() {
    return {
      ...this.metrics,
      cost: (this.metrics.readCount * 0.06 + this.metrics.writeCount * 0.18) / 1000000, // $
    };
  }
}
```

---

## 7. Checklist para Sprint 1

- [ ] FirebaseService com retry logic
- [ ] Firestore indexes criados
- [ ] Caching layer implementado
- [ ] Rate limiting configurado
- [ ] Security rules deployed
- [ ] Logging estruturado
- [ ] Metrics coletadas
- [ ] 80%+ test coverage
- [ ] Performance benchmarks (< 100ms queries)
- [ ] Audit trail funcional

---

## 8. Próximas Melhorias (Sprint 2+)

1. **Replicação:** Geo-redundancy para alta disponibilidade
2. **Backup:** Automated daily backups to GCS
3. **Observabilidade:** Sentry integration para error tracking
4. **Analytics:** Análise de padrões de uso
5. **AI/ML:** Sugestões automáticas baseadas em histórico

---

## Conclusão

**Firebase Firestore + NestJS é uma combinação poderosa:**
- ✅ Serverless (zero ops)
- ✅ Escalável (auto-scaling)
- ✅ Real-time (listeners)
- ⚠️ Custos (monitorar leituras/escritas)
- ⚠️ Complexidade de queries (precisa pensar em denormalização)

**Recomendações principais:**
1. Implementar caching layer
2. Monitorar custos Firestore
3. Usar indexes agressivamente
4. Denormalizar dados quando apropriado
5. Implementar audit trail completo
