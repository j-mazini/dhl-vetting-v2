'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, limit, onSnapshot, query, where, type DocumentData } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WorkHistoryForm, type WorkHistoryEntry } from '@/components/vetting/WorkHistoryForm';
import { useWorkHistory } from '@/hooks/useWorkHistory';
import styles from './page.module.css';

// Vetting checklist configuration
const TOTAL_CHECKLIST_ITEMS = 10;
const CHECKLIST_STEPS = [
  { id: 'dbs', label: 'DBS Check' },
  { id: 'dvla', label: 'DVLA Check' },
  { id: 'insurance', label: 'Insurance Verification' },
  { id: 'licence', label: 'Driving Licence' },
  { id: 'rightToWork', label: 'Right to Work' },
  { id: 'references', label: 'References' },
  { id: 'address', label: 'Address History' },
  { id: 'workHistory', label: 'Work History' },
  { id: 'medicals', label: 'Medicals' },
  { id: 'interview', label: 'Interview' },
];

type DocFields = Record<string, any>;

const inferDriverChecks = (data: any): boolean[] => {
  const checks = [
    !!data.dbs,
    !!data.dvla,
    !!data.insurance,
    !!data.licence,
    !!data.rightToWork,
    !!data.references,
    !!data.address,
    !!data.workHistory,
    !!data.medicals,
    !!data.interview,
  ];
  return checks;
};

const PROCESS = [
  {
    status: 'PRE_REGISTERED',
    label: 'Application',
    desc: 'Online application received by BA Express',
  },
  {
    status: 'PRE_SCREEN_IN_PROGRESS',
    label: 'Pre-screen',
    desc: 'Eligibility, Right to Work and insurance criteria review',
  },
  {
    status: 'INTERVIEW_SCHEDULED',
    label: 'Interview',
    desc: 'Face-to-face interview, tests and original document sighting',
  },
  {
    status: 'INTERVIEW_PASSED',
    label: 'Suitability',
    desc: 'Director suitability declaration and interview notes',
  },
  {
    status: 'DOCUMENTS_REQUESTED',
    label: 'Documents',
    desc: 'DBS or CRC and 5-year work reference evidence',
  },
  {
    status: 'VETTING_IN_PROGRESS',
    label: 'Vetting checks',
    desc: 'DBS, references, gaps, sanctions and risk assessment',
  },
  {
    status: 'DHL_SUBMITTED',
    label: 'DHL submission',
    desc: 'APHIDS and DHL vetting form submitted for approval',
  },
  {
    status: 'DHL_APPROVED',
    label: 'Van hire',
    desc: 'Vehicle hire, handover and deduction agreements',
  },
  {
    status: 'TRAINING_IN_PROGRESS',
    label: 'Training',
    desc: 'Mandatory training and operational familiarisation',
  },
  {
    status: 'APPROVED',
    label: 'Active',
    desc: 'Portal access live and first route assigned',
  },
] as const;

const STATUS_INDEX: Record<string, number> = {
  PRE_REGISTERED: 0,
  PRE_SCREEN_PENDING: 1,
  PRE_SCREEN_IN_PROGRESS: 1,
  PRE_SCREEN_PASSED: 2,
  INTERVIEW_SCHEDULED: 2,
  INTERVIEW_IN_PROGRESS: 2,
  INTERVIEW_PASSED: 3,
  SUITABILITY_APPROVED: 3,
  DOCUMENTS_REQUESTED: 4,
  DOCUMENTS_SUBMITTED: 4,
  VETTING_IN_PROGRESS: 5,
  VRA_REQUIRED: 5,
  VRA_APPROVED: 5,
  DHL_SUBMITTED: 6,
  DHL_APPROVED: 7,
  VAN_HIRE_IN_PROGRESS: 7,
  TRAINING_IN_PROGRESS: 8,
  APPROVED: 9,
  ACTIVE: 9,
};

const DOCUMENTS = [
  { label: 'DBS certificate', desc: 'Disclosure and Barring Service', key: 'dbs' },
  { label: 'Work reference', desc: 'Last 5 years of work history', key: 'workReference' },
  { label: 'Right to work', desc: 'Passport, visa or share code', key: 'rtw' },
  { label: 'Driving licence', desc: 'Valid licence details', key: 'dvla' },
] as const;

const DOC_CLASS: Record<string, string> = {
  pending: 'badgePending',
  uploaded: 'badgeUploaded',
  approved: 'badgeApproved',
};

const DOC_LABEL: Record<string, string> = {
  pending: 'Pending',
  uploaded: 'Submitted',
  approved: 'Approved',
};

const DOCUMENT_LABELS = Object.fromEntries(
  CHECKLIST_STEPS.flatMap((step) =>
    step.items
      .filter((item) => item.docKey && !item.hidden)
      .map((item) => [item.docKey!, item.title]),
  ),
);

interface PendingDocument {
  docKey: string;
  label: string;
  type: string;
  note: string;
}

function PendingDocumentsAlert({ documents }: { documents: PendingDocument[] }) {
  if (!documents.length) return null;

  return (
    <section className={styles.documentAlert} aria-live="polite">
      <div className={styles.documentAlertIcon}>!</div>
      <div className={styles.documentAlertContent}>
        <p className={styles.documentAlertKicker}>Action required</p>
        <h2 className={styles.documentAlertTitle}>
          {documents.length === 1
            ? 'A document is pending'
            : `${documents.length} documents are pending`}
        </h2>
        <p className={styles.documentAlertText}>
          The BA Express vetting team needs the following information from you.
        </p>
        <div className={styles.documentAlertList}>
          {documents.map((document) => (
            <div key={document.docKey} className={styles.documentAlertItem}>
              <div>
                <strong>{document.label}</strong>
                {document.type && <span>{document.type}</span>}
              </div>
              {document.note && <p>{document.note}</p>}
            </div>
          ))}
        </div>
        <p className={styles.documentAlertHelp}>
          Contact your BA Express recruiter to provide or update the requested document.
        </p>
      </div>
    </section>
  );
}

// Shown on the driver's dashboard once the admin releases a knowledge test for
// them. Reads live status from the assessments/{token} doc.
function DriverAssessmentCard({ token }: { token: string }) {
  const [status, setStatus] = useState('released');
  const [answered, setAnswered] = useState(0);
  const [total, setTotal] = useState(0);
  const [exists, setExists] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'assessments', token),
      (snap) => {
        if (!snap.exists()) { setExists(false); return; }
        const d = snap.data();
        setExists(true);
        setStatus(typeof d.status === 'string' ? d.status : 'released');
        setAnswered(d.answers ? Object.keys(d.answers).length : 0);
        setTotal(
          typeof d.totalQuestions === 'number'
            ? d.totalQuestions
            : Array.isArray(d.questions) ? d.questions.length : 0,
        );
      },
      () => setExists(false),
    );
    return () => unsub();
  }, [token]);

  if (!exists) return null;

  const completed = status === 'completed';
  const inProgress = status === 'in_progress';

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <div className={styles.cardTitleLine} />
          <span className={styles.cardTitleText}>Driver assessment</span>
        </div>
        <span
          className={`${styles.assessBadge} ${
            completed ? styles.assessBadgeDone : inProgress ? styles.assessBadgeProgress : styles.assessBadgeNew
          }`}
        >
          {completed ? 'Completed' : inProgress ? 'In progress' : 'To do'}
        </span>
      </div>

      {completed ? (
        <p className={styles.assessText}>
          Thank you — your assessment has been submitted to the recruitment team. No further action is needed.
        </p>
      ) : (
        <>
          <p className={styles.assessText}>
            Please complete a short multiple-choice driver knowledge test. It takes a few minutes and your
            progress is saved as you go.
          </p>
          {total > 0 && inProgress && (
            <span className={styles.assessProgress}>{answered}/{total} answered</span>
          )}
          <Link href={`/assessment/${token}`} className={styles.assessBtn}>
            {inProgress ? 'Continue test' : 'Start test'}
          </Link>
        </>
      )}
    </section>
  );
}

function WorkHistoryCard({ driver }: { driver: DriverRecord }) {
  const { saveWorkHistory } = useWorkHistory(driver.id, driver.source);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const isInterviewPassed = STATUS_INDEX[driver.currentStatus] >= STATUS_INDEX['INTERVIEW_PASSED'];
  const isExplicitlyReleased =
    (driver.checklistDocs as Record<string, unknown>)?.work_history_released === true;
  const isUnlocked = isInterviewPassed || isExplicitlyReleased;

  const workHistoryData = driver.checklistDocs?.work_history as
    | { entries?: Record<string, unknown>[]; lastUpdated?: string }
    | undefined;
  const initialEntries: WorkHistoryEntry[] = Array.isArray(workHistoryData?.entries)
    ? workHistoryData.entries.map((entry) => ({
        employer: String(entry?.employer ?? ''),
        companyContact: String(entry?.companyContact ?? ''),
        jobTitle: String(entry?.jobTitle ?? ''),
        startDate: String(entry?.startDate ?? ''),
        endDate: String(entry?.endDate ?? ''),
        reasonForLeaving: String(entry?.reasonForLeaving ?? ''),
      }))
    : [];

  const handleSave = async (entries: WorkHistoryEntry[]) => {
    setLoading(true);
    try {
      await saveWorkHistory(entries);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setShowForm(!showForm);
  };

  const handleSaveWithClose = async (entries: WorkHistoryEntry[]) => {
    await handleSave(entries);
    setShowForm(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <div className={styles.cardTitleLine} />
          <span className={styles.cardTitleText}>Work history</span>
        </div>
        {isUnlocked && (
          <button
            type="button"
            onClick={handleAddClick}
            className={styles.cardAddBtn}
            title="Add new work history entry"
            aria-label="Add work history entry"
          >
            <span className={styles.cardAddBtnIcon}>+</span>
            <span className={styles.cardAddBtnLabel}>Add</span>
          </button>
        )}
      </div>
      <WorkHistoryForm
        initialData={initialEntries}
        isLocked={!isUnlocked}
        onSave={handleSaveWithClose}
      />
    </div>
  );
}

interface DriverRecord {
  id: string;
  fullName: string;
  email: string;
  currentStatus: string;
  source: 'drivers' | 'legacy-vendors';
  checks: boolean[];
  createdAt?: unknown;
  rtw?: Record<string, unknown>;
  dvla?: Record<string, unknown>;
  documents?: Record<string, string>;
  checklistDocs: DocFields;
  accessGranted: boolean;
  applicationRejected: boolean;
  applicationRejectionReason: string;
  applicationOnHold: boolean;
  applicationHoldReason: string;
  assessmentToken: string;
}

function normaliseChecks(value: unknown) {
  const checks = Array.isArray(value)
    ? value.slice(0, TOTAL_CHECKLIST_ITEMS).map(Boolean)
    : Array(TOTAL_CHECKLIST_ITEMS).fill(false);
  while (checks.length < TOTAL_CHECKLIST_ITEMS) checks.push(false);
  return checks;
}

function mapDriver(id: string, data: DocumentData): DriverRecord {
  const personalInfo = data.personalInfo ?? {};

  return {
    id,
    fullName: personalInfo.fullName ?? data.fullName ?? 'Driver',
    email: personalInfo.email ?? data.email ?? '',
    currentStatus: data.currentStatus ?? 'PRE_REGISTERED',
    source: 'drivers',
    checks: inferDriverChecks(data),
    createdAt: data.createdAt,
    rtw: data.rtw,
    dvla: data.dvla,
    documents: data.documents,
    checklistDocs: (data.checklistDocs as DocFields) ?? {},
    accessGranted: data.accessGranted === true,
    applicationRejected: data.applicationRejected === true,
    applicationRejectionReason: typeof data.applicationRejectionReason === 'string' ? data.applicationRejectionReason : '',
    applicationOnHold: data.applicationOnHold === true,
    applicationHoldReason: typeof data.applicationHoldReason === 'string' ? data.applicationHoldReason : '',
    assessmentToken:
      typeof data.assessmentToken === 'string'
        ? data.assessmentToken
        : typeof data.interview?.assessmentToken === 'string'
          ? data.interview.assessmentToken
          : typeof data.assessment?.token === 'string'
            ? data.assessment.token
            : '',
  };
}

function mapLegacyVendor(id: string, data: DocumentData): DriverRecord {
  return {
    id,
    fullName: data.name ?? data.fullName ?? 'Driver',
    email: data.email ?? '',
    currentStatus:
      data.status === 'approved' ? 'APPROVED' :
      data.status === 'rejected' ? 'REJECTED' :
      'VETTING_IN_PROGRESS',
    source: 'legacy-vendors',
    checks: normaliseChecks(data.checks),
    createdAt: data.createdAt,
    documents: data.documents,
    checklistDocs: (data.checklistDocs as DocFields) ?? {},
    accessGranted: data.accessGranted === true,
    applicationRejected: data.applicationRejected === true,
    applicationRejectionReason: typeof data.applicationRejectionReason === 'string' ? data.applicationRejectionReason : '',
    applicationOnHold: data.applicationOnHold === true,
    applicationHoldReason: typeof data.applicationHoldReason === 'string' ? data.applicationHoldReason : '',
    assessmentToken:
      typeof data.assessmentToken === 'string'
        ? data.assessmentToken
        : typeof data.interview?.assessmentToken === 'string'
          ? data.interview.assessmentToken
          : typeof data.assessment?.token === 'string'
            ? data.assessment.token
            : '',
  };
}

function toShortDate(value: unknown) {
  if (!value) return null;
  const date =
    value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function'
      ? value.toDate()
      : new Date(String(value));

  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function documentStatus(driver: DriverRecord, key: string) {
  if (driver.documents?.[key] === 'approved') return 'approved';
  if (driver.documents?.[key] === 'uploaded') return 'uploaded';
  if (key === 'rtw' && driver.rtw?.documentNumber) return 'uploaded';
  if (key === 'dvla' && driver.dvla?.number) return 'uploaded';
  return 'pending';
}

export default function CandidateDashboard() {
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const router = useRouter();
  const [driver, setDriver] = useState<DriverRecord | null>(null);
  const [driverLoading, setDriverLoading] = useState(true);
  const [driverError, setDriverError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) { router.replace('/vetting'); return; }
    if (user?.isAdmin) router.replace('/admin/vetting');
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (loading || !isAuthenticated || !user?.email || user.isAdmin) return;

    setDriverLoading(true);
    const driversQuery = query(
      collection(db, 'drivers'),
      where('email', '==', user.email),
      limit(1),
    );
    const legacyQuery = query(
      collection(db, 'workspaces', 'ba-express-vetting', 'vendors'),
      where('email', '==', user.email),
      limit(1),
    );

    let driversLoaded = false;
    let legacyLoaded = false;
    let driverRecord: DriverRecord | null = null;
    let legacyRecord: DriverRecord | null = null;

    const publish = () => {
      if (!driversLoaded || !legacyLoaded) return;
      setDriver(driverRecord ?? legacyRecord ?? null);
      setDriverError(null);
      setDriverLoading(false);
    };

    const unsubscribeDrivers = onSnapshot(
      driversQuery,
      (snapshot) => {
        const doc = snapshot.docs[0];
        driverRecord = doc ? mapDriver(doc.id, doc.data()) : null;
        driversLoaded = true;
        publish();
      },
      (error) => {
        driversLoaded = true;
        setDriverError(`drivers: ${error.message}`);
        setDriverLoading(false);
      },
    );

    const unsubscribeLegacy = onSnapshot(
      legacyQuery,
      (snapshot) => {
        const doc = snapshot.docs[0];
        legacyRecord = doc ? mapLegacyVendor(doc.id, doc.data()) : null;
        legacyLoaded = true;
        publish();
      },
      (error) => {
        legacyLoaded = true;
        setDriverError(`legacy vendors: ${error.message}`);
        setDriverLoading(false);
      },
    );

    return () => {
      unsubscribeDrivers();
      unsubscribeLegacy();
    };
  }, [loading, isAuthenticated, user]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const currentIdx = useMemo(() => {
    return driver ? STATUS_INDEX[driver.currentStatus] ?? 0 : 0;
  }, [driver]);
  const statusProgressPct = Math.round((currentIdx / (PROCESS.length - 1)) * 100);
  const checklistDone = driver?.checks.filter(Boolean).length ?? 0;
  const checklistPct = driver
    ? Math.round((checklistDone / TOTAL_CHECKLIST_ITEMS) * 100)
    : 0;
  const progressPct = driver ? checklistPct : statusProgressPct;
  const firstName = driver?.fullName.split(' ')[0] ?? user?.displayName?.split(' ')[0] ?? 'there';
  const submittedAt = toShortDate(driver?.createdAt);
  const pendingDocuments = useMemo(() => {
    if (!driver) return [];
    return Object.entries(driver.checklistDocs)
      .filter(([docKey, registration]) =>
        docKey in DOCUMENT_LABELS &&
        ['Pending', 'Requested'].includes(registration.__documentStatus),
      )
      .map(([docKey, registration]) => ({
        docKey,
        label: DOCUMENT_LABELS[docKey] ?? registration.docType ?? docKey.replaceAll('_', ' '),
        type: registration.docType ?? '',
        note: registration.__documentNotes ?? '',
      }));
  }, [driver]);

  if (loading || driverLoading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // Rejection gate: admin has rejected this application
  if (driver && driver.applicationRejected) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <Image src="/assets/logo-ba.png" alt="BA Express" width={44} height={44} />
            <div className={styles.brandText}>
              <span className={styles.brandName}>BA Express</span>
              <span className={styles.divider}>/</span>
              <span className={styles.sectionLabel}>My Application</span>
            </div>
          </div>
          <div className={styles.userActions}>
            {user?.photoURL && <img src={user.photoURL} alt="" className={styles.avatar} />}
            <span className={styles.userName}>{user?.displayName}</span>
            <button onClick={handleSignOut} className={styles.signOutButton}>Sign out</button>
          </div>
        </header>
        <div className={styles.content}>
          <div className={styles.rejectedCard}>
            <div className={styles.rejectedIcon}>💌</div>
            <h2 className={styles.rejectedTitle}>Thank you for applying, {firstName}</h2>
            <p className={styles.rejectedText}>
              We appreciate the time you took to apply to BA Express. After reviewing your
              application, we have decided not to move forward at this stage.
            </p>
            {/* Internal rejection reason is intentionally NOT shown to the candidate (compliance). */}
            <p className={styles.rejectedText}>
              We wish you the very best in your search and hope our paths may cross again in
              the future.
            </p>
            {submittedAt && (
              <p className={styles.rejectedMeta}>Application submitted {submittedAt}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Hold gate: admin has paused this application and provided a candidate-facing reason
  if (driver && driver.applicationOnHold) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <Image src="/assets/logo-ba.png" alt="BA Express" width={44} height={44} />
            <div className={styles.brandText}>
              <span className={styles.brandName}>BA Express</span>
              <span className={styles.divider}>/</span>
              <span className={styles.sectionLabel}>My Application</span>
            </div>
          </div>
          <div className={styles.userActions}>
            {user?.photoURL && <img src={user.photoURL} alt="" className={styles.avatar} />}
            <span className={styles.userName}>{user?.displayName}</span>
            <button onClick={handleSignOut} className={styles.signOutButton}>Sign out</button>
          </div>
        </header>
        <div className={styles.content}>
          <PendingDocumentsAlert documents={pendingDocuments} />
          {driver.assessmentToken && <DriverAssessmentCard token={driver.assessmentToken} />}
          <div className={styles.holdCard}>
            <div className={styles.holdIcon}>!</div>
            <h2 className={styles.holdTitle}>Application on hold</h2>
            <p className={styles.holdText}>
              Hello {firstName} — your BA Express application is currently on hold.
              Please review the message from our recruitment team below.
            </p>
            {driver.applicationHoldReason && (
              <div className={styles.holdReasonBlock}>
                <p className={styles.holdReasonLabel}>Reason</p>
                <p className={styles.holdReasonText}>{driver.applicationHoldReason}</p>
              </div>
            )}
            <p className={styles.holdText}>
              Once this is resolved, the BA Express team will continue your application.
            </p>
            {submittedAt && (
              <p className={styles.holdMeta}>Application submitted {submittedAt}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Access gate: driver record found but admin has not yet approved the application
  if (driver && !driver.accessGranted) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <Image src="/assets/logo-ba.png" alt="BA Express" width={44} height={44} />
            <div className={styles.brandText}>
              <span className={styles.brandName}>BA Express</span>
              <span className={styles.divider}>/</span>
              <span className={styles.sectionLabel}>My Application</span>
            </div>
          </div>
          <div className={styles.userActions}>
            {user?.photoURL && <img src={user.photoURL} alt="" className={styles.avatar} />}
            <span className={styles.userName}>{user?.displayName}</span>
            <button onClick={handleSignOut} className={styles.signOutButton}>Sign out</button>
          </div>
        </header>
        <div className={styles.content}>
          <PendingDocumentsAlert documents={pendingDocuments} />
          {driver.assessmentToken && <DriverAssessmentCard token={driver.assessmentToken} />}
          <div className={styles.pendingCard}>
            <div className={styles.pendingIcon}>⏳</div>
            <h2 className={styles.pendingTitle}>Application under review</h2>
            <p className={styles.pendingText}>
              Hello {firstName} — your application has been received by BA Express.
              Our recruitment team is reviewing your details and will activate your
              portal access once the initial checks are complete.
            </p>
            <p className={styles.pendingText}>
              You will receive a confirmation email when your profile is ready.
              If you have questions, contact your BA Express recruiter directly.
            </p>
            {submittedAt && (
              <p className={styles.pendingMeta}>Application submitted {submittedAt}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image src="/assets/logo-ba.png" alt="BA Express" width={44} height={44} />
          <div className={styles.brandText}>
            <span className={styles.brandName}>BA Express</span>
            <span className={styles.divider}>/</span>
            <span className={styles.sectionLabel}>My Application</span>
          </div>
        </div>
        <div className={styles.userActions}>
          {user?.photoURL && <img src={user.photoURL} alt="" className={styles.avatar} />}
          <span className={styles.userName}>{user?.displayName}</span>
          <button onClick={handleSignOut} className={styles.signOutButton}>Sign out</button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.greeting}>
          <div className={styles.eyebrow}>
            <div className={styles.eyebrowLine} />
            <span className={styles.eyebrowText}>Driver Portal</span>
          </div>
          <h1 className={styles.greetingTitle}>
            Hello, <span className={styles.greetingAccent}>{firstName}</span>
          </h1>
          <p className={styles.greetingSub}>
            {driver
              ? `Track your BA Express vetting application${submittedAt ? ` submitted on ${submittedAt}` : ''}.`
              : 'No application was found for this Google account email.'}
          </p>
        </div>

        {driverError && (
          <div className={styles.card}>
            <p className={styles.helpTitle}>Unable to load your application</p>
            <p className={styles.helpText}>{driverError}</p>
          </div>
        )}

        {!driver && !driverError ? (
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <div className={styles.cardTitleLine} />
              <span className={styles.cardTitleText}>Application not found</span>
            </div>
            <p className={styles.helpText}>
              Submit the apply form using the same email as your Google account, then return here.
            </p>
            <button className={styles.cardAction} onClick={() => router.push('/apply')}>
              Start application →
            </button>
          </div>
        ) : null}

        {driver && (
          <>
            <PendingDocumentsAlert documents={pendingDocuments} />

            {driver.assessmentToken && <DriverAssessmentCard token={driver.assessmentToken} />}

            <div className={styles.card}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Overall progress</span>
                <span className={styles.progressPct}>{progressPct}%</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
              </div>
              <span className={styles.progressBadge}>
                <span className={styles.progressDot} />
                {checklistDone}/{TOTAL_CHECKLIST_ITEMS} checks complete
              </span>
              <span className={styles.progressHint}>updated by the BA Express vetting team</span>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <div className={styles.cardTitleLine} />
                  <span className={styles.cardTitleText}>Process stages</span>
                </div>
              </div>

              <div className={styles.timeline}>
                {PROCESS.map((step, idx) => {
                  const status =
                    idx < currentIdx ? 'done' :
                    idx === currentIdx ? 'current' :
                    'pending';

                  return (
                    <div key={step.status} className={styles.timelineRow}>
                      <div className={styles.timelineCol}>
                        <div className={
                          status === 'done' ? styles.timelineNodeDone :
                          status === 'current' ? styles.timelineNodeCurrent :
                          styles.timelineNodePending
                        }>
                          {status === 'done' ? '✓' : idx + 1}
                        </div>
                        {idx < PROCESS.length - 1 && (
                          <div
                            className={status === 'done' ? styles.timelineConnectorDone : styles.timelineConnectorPending}
                            style={{ minHeight: 24 }}
                          />
                        )}
                      </div>

                      <div className={styles.timelineContent}>
                        <div className={styles.timelineInner}>
                          <div>
                            <p className={
                              status === 'done' ? styles.timelineLabelDone :
                              status === 'current' ? styles.timelineLabelCurrent :
                              styles.timelineLabelPending
                            }>
                              {step.label}
                            </p>
                            <p className={styles.timelineDesc}>{step.desc}</p>
                          </div>
                          {status === 'current' ? (
                            <span className={styles.timelineCurrent}>In progress</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <div className={styles.cardTitleLine} />
                  <span className={styles.cardTitleText}>Documents</span>
                </div>
              </div>

              {DOCUMENTS.map((doc) => {
                const status = documentStatus(driver, doc.key);
                return (
                  <div key={doc.label} className={styles.docRow}>
                    <div>
                      <p className={styles.docLabel}>{doc.label}</p>
                      <p className={styles.docDesc}>{doc.desc}</p>
                    </div>
                    <span className={styles[DOC_CLASS[status] as keyof typeof styles]}>
                      {DOC_LABEL[status]}
                    </span>
                  </div>
                );
              })}
            </div>

            <WorkHistoryCard driver={driver} />
          </>
        )}

        <div className={styles.helpCard}>
          <div className={styles.helpIcon}>✉</div>
          <div>
            <p className={styles.helpTitle}>Need help?</p>
            <p className={styles.helpText}>
              Contact the BA Express team if you have questions about the vetting process.
            </p>
            <a href="mailto:vetting@baexpress.co.uk" className={styles.helpLink}>
              vetting@baexpress.co.uk →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
