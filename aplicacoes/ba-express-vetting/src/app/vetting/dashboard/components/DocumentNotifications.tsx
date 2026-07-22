'use client';

import { useEffect, useState } from 'react';
import type { DocumentNotification } from '@/app/admin/checklist/modules/notifications/types';
import {
  getDriverNotifications,
  markNotificationAsRead,
} from '@/app/admin/checklist/modules/notifications/service';
import { DocumentSubmissionForm } from './DocumentSubmissionForm';
import styles from '../page.module.css';

export function DocumentNotifications({
  driverId,
  candidateName = 'Driver',
  adminEmail = 'admin@baexpress.co.uk',
}: {
  driverId: string;
  candidateName?: string;
  adminEmail?: string;
}) {
  const [notifications, setNotifications] = useState<DocumentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getDriverNotifications(driverId);
        setNotifications(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setLoading(false);
      }
    };

    loadNotifications();
  }, [driverId]);

  const handleMarkRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, readBy: true } : n,
        ),
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  if (loading) {
    return <div className={styles.loadingState}>Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No document updates yet. Check back soon!</p>
      </div>
    );
  }

  const stats = {
    approved: notifications.filter((n) => n.status === 'approved').length,
    rejected: notifications.filter((n) => n.status === 'rejected').length,
    pending: notifications.filter(
      (n) => n.status === 'pending' || n.status === 'pending-review',
    ).length,
  };

  return (
    <div className={styles.notificationsBlock}>
      <h3 className={styles.notificationsTitle}>Document Status Updates</h3>

      {/* Summary Stats */}
      <div className={styles.notificationStats}>
        <div className={`${styles.statItem} ${styles.statApproved}`}>
          <span className={styles.statLabel}>Approved</span>
          <span className={styles.statValue}>{stats.approved}</span>
        </div>
        <div className={`${styles.statItem} ${styles.statPending}`}>
          <span className={styles.statLabel}>Pending Review</span>
          <span className={styles.statValue}>{stats.pending}</span>
        </div>
        <div className={`${styles.statItem} ${styles.statRejected}`}>
          <span className={styles.statLabel}>Rejected</span>
          <span className={styles.statValue}>{stats.rejected}</span>
        </div>
      </div>

      {/* Notifications List */}
      <div className={styles.notificationsList}>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`${styles.notificationItem} ${
              !notif.readBy ? styles.notificationUnread : ''
            } ${styles[`status${notif.status.charAt(0).toUpperCase() + notif.status.slice(1)}`]}`}
            onClick={() => {
              if (!notif.readBy) handleMarkRead(notif.id);
            }}
          >
            <div className={styles.notificationHeader}>
              <span className={styles.documentLabel}>{notif.documentLabel}</span>
              <span className={`${styles.statusBadge} ${styles[`badge${notif.status}`]}`}>
                {notif.status === 'approved' && '✓ Approved'}
                {notif.status === 'rejected' && '✕ Rejected'}
                {notif.status === 'pending-review' && '⏳ Under Review'}
                {notif.status === 'pending' && '⏸ Pending'}
              </span>
            </div>

            {/*
              Rejection reasons (notif.adminFeedback) are internal-only and must
              never be shown to the candidate. Candidates see a single, neutral,
              standardised message and the resubmission option below.
            */}
            {notif.status === 'rejected' && (
              <p className={styles.adminFeedback}>
                This document could not be accepted. Please resubmit a clear, valid
                version using the option below.
              </p>
            )}

            <DocumentSubmissionForm
              notification={notif}
              candidateName={candidateName}
              adminEmail={adminEmail}
            />

            <div className={styles.notificationMeta}>
              <span className={styles.timestamp}>
                {new Date(notif.approvedAt).toLocaleDateString()}
              </span>
              {notif.approvedBy && (
                <span className={styles.reviewer}>Reviewed by {notif.approvedBy}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
