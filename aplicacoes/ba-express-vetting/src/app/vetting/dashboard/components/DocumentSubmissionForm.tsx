'use client';

import { useState } from 'react';
import type { DocumentNotification } from '@/app/admin/checklist/modules/notifications/types';
import { generateDocumentSubmissionEmail } from '../modules/email-submission';
import styles from '../notifications.module.css';

export function DocumentSubmissionForm({
  notification,
  candidateName,
  adminEmail,
}: {
  notification: DocumentNotification;
  candidateName: string;
  adminEmail: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [useCustomEmail, setUseCustomEmail] = useState(false);
  const [customEmail, setCustomEmail] = useState<string>('');

  const handleSubmitClick = () => {
    const finalEmail = useCustomEmail && customEmail ? customEmail : adminEmail;

    // Validate custom email if provided
    if (useCustomEmail && customEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customEmail)) {
        alert('Please enter a valid email address');
        return;
      }
    }

    // Internal rejection reason (notification.adminFeedback) is intentionally
    // NOT passed here — it must stay internal and out of candidate-facing email.
    const emailBody = generateDocumentSubmissionEmail({
      candidateName,
      documentLabel: notification.documentLabel,
      documentType: notification.documentType,
      fileName,
    });

    const mailtoLink = `mailto:${encodeURIComponent(finalEmail)}?subject=Document%20Resubmission%20-%20${encodeURIComponent(
      notification.documentLabel,
    )}&body=${encodeURIComponent(emailBody)}`;

    window.location.href = mailtoLink;
  };

  const isRejected = notification.status === 'rejected';

  if (!isRejected) {
    return null;
  }

  return (
    <div className={styles.submissionFormBlock}>
      <button
        type="button"
        className={styles.submissionToggle}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        📎 Send Corrected Document
        <span className={styles.toggleArrow}>{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className={styles.submissionForm}>
          <div className={styles.submissionInstructions}>
            <h4>How to resubmit:</h4>
            <ol>
              <li>Click "Open Email" below</li>
              <li>Your email client will open with the admin's email and pre-filled message</li>
              <li>
                Attach the corrected document file (PDF, JPG, PNG, etc.)
              </li>
              <li>Send the email</li>
            </ol>
          </div>

          <div className={styles.submissionFields}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Corrected filename (optional)
              </label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="e.g., passport_corrected.pdf"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
              <p className={styles.formHint}>
                This helps the admin identify which file you're sending
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.emailCheckbox}>
                <input
                  type="checkbox"
                  checked={useCustomEmail}
                  onChange={(e) => setUseCustomEmail(e.target.checked)}
                  className={styles.checkboxInput}
                />
                <span>Use different email address</span>
              </label>
            </div>

            {useCustomEmail && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email address</label>
                <input
                  type="email"
                  className={styles.formInput}
                  placeholder="your.email@example.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                />
                <p className={styles.formHint}>
                  The email will be sent to this address instead of the default
                  admin email
                </p>
              </div>
            )}

            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmitClick}
            >
              📧 Open Email Client
            </button>

            <p className={styles.submissionNote}>
              This will open your default email application. If it doesn't open,
              you can manually email{' '}
              <strong>
                {useCustomEmail && customEmail ? customEmail : adminEmail}
              </strong>{' '}
              with your corrected document attached.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
