import { Suspense } from 'react';
import SetupPasswordContent from './setup-content';
import styles from './page.module.css';

function LoadingFallback() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <p>Validating invitation...</p>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SetupPasswordContent />
    </Suspense>
  );
}
