'use client';

import { useState } from 'react';
import styles from './WorkHistoryForm.module.css';

export interface WorkHistoryEntry {
  employer: string;
  companyContact: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  reasonForLeaving: string;
}

interface WorkHistoryFormProps {
  initialData?: WorkHistoryEntry[];
  isLocked: boolean;
  onSave: (entries: WorkHistoryEntry[]) => Promise<void>;
}

export function WorkHistoryForm({ initialData = [], isLocked, onSave }: WorkHistoryFormProps) {
  const [entries, setEntries] = useState<WorkHistoryEntry[]>(initialData);
  const [newEntry, setNewEntry] = useState<WorkHistoryEntry>({
    employer: '',
    companyContact: '',
    jobTitle: '',
    startDate: '',
    endDate: '',
    reasonForLeaving: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const handleAddEntry = async () => {
    if (!newEntry.employer || !newEntry.companyContact || !newEntry.jobTitle || !newEntry.startDate) {
      setSaveMessage({
        type: 'error',
        text: 'Please fill in employer, company contact, job title, and start date',
      });
      return;
    }

    const updatedEntries = [...entries, newEntry];
    setIsSaving(true);

    try {
      await onSave(updatedEntries);
      setEntries(updatedEntries);
      setNewEntry({
        employer: '',
        companyContact: '',
        jobTitle: '',
        startDate: '',
        endDate: '',
        reasonForLeaving: '',
      });
      setSaveMessage({ type: 'success', text: 'Work history entry added' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: `Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (index: number) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setIsSaving(true);

    try {
      await onSave(updatedEntries);
      setEntries(updatedEntries);
      setSaveMessage({ type: 'success', text: 'Entry removed' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: `Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLocked) {
    return (
      <div className={styles.lockedContainer}>
        <p className={styles.lockedMessage}>
          ✓ Work history will be available after your interview is completed.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Work History</h3>
        <p className={styles.subtitle}>
          Provide details of your employment history for the last 5 years
        </p>
      </div>

      {saveMessage && (
        <div className={`${styles.message} ${styles[`message${saveMessage.type}`]}`}>
          {saveMessage.text}
        </div>
      )}

      {entries.length > 0 && (
        <div className={styles.entriesList}>
          {entries.map((entry, index) => (
            <div key={index} className={styles.entryCard}>
              <div className={styles.entryHeader}>
                <div>
                  <p className={styles.entryEmployer}>{entry.employer}</p>
                  <p className={styles.entryTitle}>{entry.jobTitle}</p>
                  <p className={styles.entryDates}>
                    {entry.startDate}
                    {entry.endDate && ` – ${entry.endDate}`}
                  </p>
                  {entry.companyContact && (
                    <p className={styles.entryContact}>Contact: {entry.companyContact}</p>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteEntry(index)}
                  disabled={isSaving}
                  aria-label="Delete entry"
                >
                  ✕
                </button>
              </div>
              {entry.reasonForLeaving && (
                <p className={styles.entryReason}>{entry.reasonForLeaving}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.formSection}>
        <h4>Add new entry</h4>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="employer">Employer name *</label>
            <input
              id="employer"
              type="text"
              value={newEntry.employer}
              onChange={(e) => setNewEntry({ ...newEntry, employer: e.target.value })}
              placeholder="Company name"
              disabled={isSaving}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="companyContact">Company contact (email or phone) *</label>
            <input
              id="companyContact"
              type="text"
              value={newEntry.companyContact}
              onChange={(e) => setNewEntry({ ...newEntry, companyContact: e.target.value })}
              placeholder="hr@company.com or phone number"
              disabled={isSaving}
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="jobTitle">Job title *</label>
            <input
              id="jobTitle"
              type="text"
              value={newEntry.jobTitle}
              onChange={(e) => setNewEntry({ ...newEntry, jobTitle: e.target.value })}
              placeholder="e.g., Delivery Driver"
              disabled={isSaving}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="startDate">Start date (YYYY-MM) *</label>
            <input
              id="startDate"
              type="month"
              value={newEntry.startDate}
              onChange={(e) => setNewEntry({ ...newEntry, startDate: e.target.value })}
              disabled={isSaving}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endDate">End date (YYYY-MM)</label>
            <input
              id="endDate"
              type="month"
              value={newEntry.endDate}
              onChange={(e) => setNewEntry({ ...newEntry, endDate: e.target.value })}
              placeholder="Leave blank if current"
              disabled={isSaving}
            />
          </div>

          <div className={styles.formGroup + ' ' + styles.fullWidth}>
            <label htmlFor="reason">Reason for leaving</label>
            <textarea
              id="reason"
              value={newEntry.reasonForLeaving}
              onChange={(e) => setNewEntry({ ...newEntry, reasonForLeaving: e.target.value })}
              placeholder="Optional"
              rows={3}
              disabled={isSaving}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddEntry}
          disabled={isSaving}
          className={styles.addBtn}
        >
          {isSaving ? 'Saving...' : 'Add entry'}
        </button>
      </div>
    </div>
  );
}
