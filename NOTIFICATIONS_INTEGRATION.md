# Sistema de Notificações Admin-Driver

## Overview
Sistema de comunicação bidirecional onde admin aprova/rejeita/comenta documentos e drivers recebem notificações em tempo real no painel pessoal.

## Arquitetura

### Firestore Collection: `candidate_notifications`
```
{
  id: string (auto)
  candidateId: string (FK)
  driverId: string (FK)
  documentType: string ('rtw_doc', 'dvla_doc', etc.)
  documentLabel: string ('Right to Work', etc.)
  status: 'approved' | 'rejected' | 'pending' | 'pending-review'
  adminFeedback?: string (rejection reason)
  approvedBy?: string (admin name)
  approvedAt: number (timestamp)
  readBy?: boolean
  readAt?: number
  createdAt: number
  updatedAt: number
}
```

## Como Usar

### 1. No Admin Checklist (page.tsx)
Quando admin muda o status de um documento via CaseRegistrationPanel:

```typescript
import { notifyDriverOnStatusChange } from '@/app/admin/checklist/modules/notifications/admin-integration';

// Após atualizar o documento
await notifyDriverOnStatusChange(
  candidate.id,
  candidate.rawId, // ou driverId
  'dvla_doc',
  'Verified original', // novo status
  user?.displayName || 'Admin Team'
);
```

### 2. Com Feedback/Rejeição
```typescript
import { notifyDriverWithFeedback } from '@/app/admin/checklist/modules/notifications/admin-integration';

await notifyDriverWithFeedback(
  candidate.id,
  candidate.rawId,
  'dvla_doc',
  'rejected',
  'Licence number format is incorrect. Please resubmit with valid DVLA number.',
  user?.displayName
);
```

### 3. No Driver Dashboard (page.tsx)
Importar e renderizar o componente:

```typescript
import { DocumentNotifications } from './components/DocumentNotifications';

// No render:
<DocumentNotifications driverId={user.uid} />
```

## Fluxo de Dados

```
Admin Checklist (CaseRegistrationPanel)
    ↓ (DocField changed)
notifyDriverOnStatusChange()
    ↓
Firestore: candidate_notifications
    ↓ (Real-time listener)
Driver Dashboard: DocumentNotifications
    ↓ (User clicks notification)
markNotificationAsRead()
```

## Integration Checklist

- [ ] Adicionar chamada a `notifyDriverOnStatusChange` em page.tsx quando DocField é atualizado
- [ ] Adicionar `DocumentNotifications` component ao driver dashboard
- [ ] Testar com admin aprovando um documento
- [ ] Verificar notificação aparece no driver dashboard
- [ ] Testar com feedback de rejeição
- [ ] Testar mark-as-read functionality
- [ ] Configurar limites de Firestore rules se necessário

## Firestore Rules (Recomendado)

```firestore
match /candidate_notifications/{document=**} {
  // Drivers podem ler suas próprias notificações
  allow read: if request.auth.uid == resource.data.driverId;
  
  // Admins podem criar
  allow create: if request.auth.token.admin == true;
  
  // Drivers podem atualizar readBy do documento deles
  allow update: if request.auth.uid == resource.data.driverId
    && request.resource.data.readBy == true;
}
```

## Próximas Melhorias

1. **Real-time Updates**: Adicionar listeners no Dashboard para atualizações live
2. **Push Notifications**: Integrar com Firebase Cloud Messaging para notificações push
3. **Email Notifications**: Enviar email quando documento é aprovado/rejeitado
4. **Admin Dashboard**: Painel para admin ver que notificações foram lidas
5. **Bulk Operations**: Notificar múltiplos drivers de uma vez
