'use client';

import { db } from '@/lib/firebase';
import { doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { AssessmentDoc } from '../../admin/interview/assessment-types';
import styles from './page.module.css';

export default function CandidateAssessmentPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? '';

  const [data, setData] = useState<AssessmentDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const seeded = useRef(false);

  useEffect(() => {
    if (!token) return;
    const ref = doc(db, 'assessments', token);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setLoading(false);
        if (!snap.exists()) {
          setNotFound(true);
          return;
        }
        const d = snap.data() as AssessmentDoc;
        setData(d);
        // Seed local state from the doc just once; after that we are the writer.
        if (!seeded.current) {
          seeded.current = true;
          setAnswers(d.answers ?? {});
          setIdx(Math.min(d.currentIndex ?? 0, Math.max(0, (d.questions?.length ?? 1) - 1)));
          if (d.status === 'released') {
            updateDoc(ref, { status: 'in_progress', startedAt: serverTimestamp(), updatedAt: serverTimestamp() })
              .catch(() => setSaveError(true));
          }
        }
      },
      () => {
        setLoading(false);
        setNotFound(true);
      },
    );
    return () => unsub();
  }, [token]);

  const persist = async (patch: Record<string, unknown>) => {
    if (!token) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'assessments', token), { ...patch, updatedAt: serverTimestamp() });
      setSaveError(false);
    } catch {
      // Surface the failure so the candidate knows progress wasn't saved; the next
      // answer/navigation re-sends the full state, so it self-heals once back online.
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const questions = data?.questions ?? [];
  const q = questions[idx];

  const select = (optionIndex: number) => {
    if (!q) return;
    const next = { ...answers, [q.id]: optionIndex };
    setAnswers(next);
    persist({ answers: next, currentIndex: idx, status: 'in_progress' });
  };

  const go = (to: number) => {
    const clamped = Math.max(0, Math.min(questions.length - 1, to));
    setIdx(clamped);
    persist({ currentIndex: clamped });
  };

  const finish = () => {
    persist({ answers, currentIndex: idx, status: 'completed', completedAt: serverTimestamp() });
  };

  // ── states ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner} />
        </div>
      </main>
    );
  }

  if (notFound || !data) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Link not available</h1>
          <p className={styles.lead}>This assessment link is invalid or has expired. Please contact the recruitment team.</p>
        </div>
      </main>
    );
  }

  if (data.status === 'completed') {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.tick}>✓</div>
          <h1 className={styles.title}>Assessment complete</h1>
          <p className={styles.lead}>
            Thank you{data.candidateName ? `, ${data.candidateName.split(' ')[0]}` : ''}. Your answers have
            been submitted to the recruitment team. You can close this page.
          </p>
        </div>
      </main>
    );
  }

  const answeredAll = questions.every((qq) => answers[qq.id] !== undefined);
  const isLast = idx === questions.length - 1;
  const selected = q ? answers[q.id] : undefined;
  const answeredCount = questions.filter((qq) => answers[qq.id] !== undefined).length;
  const pct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const canGoBack = idx > 0;
  const canGoNext = !isLast && selected !== undefined;

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Driver Assessment</h1>
          <span className={styles.qcount}>
            Question {idx + 1} of {questions.length}
          </span>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>

        {saveError && (
          <div className={styles.saveError} role="alert">
            Couldn&apos;t save your progress — check your connection. Your latest answer will be retried automatically.
          </div>
        )}

        <div className={styles.questionDeck}>
          <button
            type="button"
            className={`${styles.arrowButton} ${styles.arrowLeft}`}
            onClick={() => go(idx - 1)}
            disabled={!canGoBack || saving}
            aria-label="Previous question"
          >
            ‹
          </button>

          {q && (
            <section className={styles.questionCard} aria-live="polite">
              <div className={styles.cardTop}>
                <div className={styles.category}>{q.category}</div>
                <span className={`${styles.answerState} ${selected !== undefined ? styles.answerStateDone : ''}`}>
                  {selected !== undefined ? 'Answered' : 'Pending'}
                </span>
              </div>

              <p className={styles.qtext}>{q.question}</p>

              <ul className={styles.optionsGrid}>
                {q.options.map((opt, oi) => (
                  <li key={oi}>
                    <label className={`${styles.option} ${selected === oi ? styles.optionSelected : ''}`}>
                      <input
                        type="radio"
                        name={q.id}
                        checked={selected === oi}
                        onChange={() => select(oi)}
                      />
                      <span className={styles.optionMark}>{String.fromCharCode(65 + oi)}</span>
                      <span>{opt}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <button
            type="button"
            className={`${styles.arrowButton} ${styles.arrowRight}`}
            onClick={() => go(idx + 1)}
            disabled={!canGoNext || saving}
            aria-label="Next question"
          >
            ›
          </button>
        </div>

        <div className={styles.questionRail} aria-label="Question navigation">
          {questions.map((question, questionIndex) => {
            const isActive = questionIndex === idx;
            const isAnswered = answers[question.id] !== undefined;
            return (
              <button
                key={question.id}
                type="button"
                className={[
                  styles.railDot,
                  isActive ? styles.railDotActive : '',
                  isAnswered ? styles.railDotAnswered : '',
                ].join(' ')}
                onClick={() => go(questionIndex)}
                disabled={saving}
                aria-label={`Go to question ${questionIndex + 1}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {questionIndex + 1}
              </button>
            );
          })}
        </div>

        {isLast && (
          <div className={styles.submitRow}>
            <button
              className={`${styles.navBtn} ${styles.navPrimary}`}
              onClick={finish}
              disabled={!answeredAll || saving}
            >
              {saving ? 'Submitting…' : 'Finish & submit'}
            </button>
          </div>
        )}
        {isLast && !answeredAll && (
          <p className={styles.hint}>Please answer every question before submitting.</p>
        )}
      </div>
    </main>
  );
}

// Para static export, retorna array vazio (nenhuma página será pré-gerada)
export async function generateStaticParams() {
  return [];
}
