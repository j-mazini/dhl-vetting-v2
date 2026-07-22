// Diagnóstico do Firebase — execute no console do navegador
export async function diagnoseFirebase() {
  const results: Record<string, any> = {};

  try {
    const { db } = await import('./firebase');
    results.firebaseInitialized = true;

    // Testa permissões de escrita
    const { collection, addDoc } = await import('firebase/firestore');
    const testDoc = {
      __TEST__: true,
      timestamp: new Date().toISOString(),
      purpose: 'Firebase connectivity test',
    };

    try {
      const ref = await addDoc(collection(db, 'drivers'), testDoc);
      results.firestoreWrite = `SUCCESS - Doc ID: ${ref.id}`;
      results.canWriteToDrivers = true;

      // Limpa o documento de teste
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'drivers', ref.id));
      results.cleanupSuccess = true;
    } catch (e: any) {
      results.firestoreWrite = `FAILED - ${e.message}`;
      results.firestoreError = e.code || 'unknown';
      results.canWriteToDrivers = false;

      // Tenta ler para verificar permissões
      try {
        const { getDocs, query } = await import('firebase/firestore');
        await getDocs(query(collection(db, 'drivers')));
        results.canReadFromDrivers = true;
      } catch (readErr: any) {
        results.canReadFromDrivers = false;
        results.readError = readErr.code || readErr.message;
      }
    }
  } catch (e: any) {
    results.firebaseInitialized = false;
    results.error = e.message;
  }

  console.log('=== FIREBASE DIAGNOSTIC ===');
  console.table(results);
  return results;
}

// Execute no console: import { diagnoseFirebase } from '@/lib/firebaseDebug'; diagnoseFirebase();
