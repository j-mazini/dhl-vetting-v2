import { useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import type { WorkHistoryEntry } from '@/components/vetting/WorkHistoryForm';

type DriverSource = 'drivers' | 'legacy-vendors';

/**
 * Saves the applicant-filled work history to the driver's own record
 * (checklistDocs.work_history). Firestore rules only allow this specific
 * field to change, and only after interview / explicit admin release.
 */
export function useWorkHistory(driverId: string, source: DriverSource = 'drivers') {
  const saveWorkHistory = useCallback(
    async (entries: WorkHistoryEntry[]) => {
      if (!driverId) {
        throw new Error('Driver ID required');
      }

      const docRef =
        source === 'drivers'
          ? doc(db, 'drivers', driverId)
          : doc(db, 'workspaces', 'ba-express-vetting', 'vendors', driverId);

      const workHistoryData = {
        entries: entries.map((entry) => ({
          employer: entry.employer || '',
          companyContact: entry.companyContact || '',
          jobTitle: entry.jobTitle || '',
          startDate: entry.startDate || '',
          endDate: entry.endDate || '',
          reasonForLeaving: entry.reasonForLeaving || '',
          savedAt: new Date().toISOString(),
        })),
        lastUpdated: new Date().toISOString(),
      };

      await updateDoc(docRef, {
        'checklistDocs.work_history': workHistoryData,
        updatedAt: source === 'drivers' ? serverTimestamp() : Date.now(),
      });
    },
    [driverId, source],
  );

  return { saveWorkHistory };
}
