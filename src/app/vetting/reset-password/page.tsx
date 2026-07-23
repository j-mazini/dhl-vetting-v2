import { Suspense } from 'react';
import ResetPasswordContent from './reset-content';
import styles from './page.module.css';

function LoadingFallback() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <p>Validating reset link...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
