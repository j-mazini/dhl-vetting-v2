'use client';

import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Mail } from 'lucide-react';
import styles from './ApplyInterestModal.module.css';

interface ApplyInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HR_EMAIL = 'info@baexpress.co.uk';

const APPLICATION_MESSAGE = `Hi BA Express,

I am interested in joining your driver network. I would like to apply to drive with your team.

Please let me know the next steps in the application process.

Thank you,
[Your Name]`;

export function ApplyInterestModal({ isOpen, onClose }: ApplyInterestModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(APPLICATION_MESSAGE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEmail = () => {
    const subject = encodeURIComponent('Driver Application');
    const body = encodeURIComponent(APPLICATION_MESSAGE);
    window.location.href = `mailto:${HR_EMAIL}?subject=${subject}&body=${body}`;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gate-card header strip */}
        <div className={styles.gateHead}>
          <span>GATE D · DRIVER APPLICATION</span>
          <span className={styles.now}>● BOARDING</span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className={styles.body}>
          <h2 id="apply-modal-title" className={styles.heading}>
            Apply to drive<span className={styles.headingDot}>.</span>
          </h2>
          <p className={styles.lede}>
            No forms, no CV upload. Send us the message below — our team replies
            with your personal application link within 24h.
          </p>

          {/* Boarding sequence */}
          <ol className={styles.sequence}>
            <li className={styles.hop}>
              <small>01 · COPY</small>Message below
            </li>
            <li className={styles.hop}>
              <small>02 · SEND</small>{HR_EMAIL}
            </li>
            <li className={`${styles.hop} ${styles.hopFinal}`}>
              <small>03 · WITHIN 24H</small>Get your link
            </li>
          </ol>

          {/* Telex-style message ticket */}
          <div className={styles.ticket}>
            <div className={styles.ticketHead}>
              <span>MSG · APPLICATION REQUEST</span>
              <span>TO: {HR_EMAIL.toUpperCase()}</span>
            </div>
            <pre className={styles.ticketText}>{APPLICATION_MESSAGE}</pre>
            <div className={styles.ticketFoot}>
              REPLACE [YOUR NAME] BEFORE SENDING
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleOpenEmail}
              className={`${styles.cta} ${styles.ctaPrimary}`}
            >
              <Mail size={14} />
              OPEN EMAIL
            </button>
            <button
              type="button"
              onClick={handleCopyMessage}
              className={`${styles.cta} ${copied ? styles.ctaCopied : ''}`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'COPIED' : 'COPY MESSAGE'}
            </button>
          </div>

          <p className={styles.footNote}>
            ✉ <a href={`mailto:${HR_EMAIL}`}>{HR_EMAIL.toUpperCase()}</a>
            &nbsp;·&nbsp; WE USUALLY REPLY WITHIN 24H
          </p>
        </div>
      </div>
    </div>
  );
}
