/**
 * Email template generator for document resubmission
 * Creates pre-formatted email body for candidates to send corrected documents
 */

export interface DocumentSubmissionEmailParams {
  candidateName: string;
  documentLabel: string;
  documentType: string;
  fileName?: string;
}

export function generateDocumentSubmissionEmail(
  params: DocumentSubmissionEmailParams,
): string {
  const {
    candidateName,
    documentLabel,
    documentType,
    fileName,
  } = params;

  const fileNameNote = fileName ? `[${fileName}]` : '[corrected_document]';

  const sections = [
    `Hello,`,
    ``,
    `I am resubmitting my ${documentLabel} for your review.`,
    ``,
    `Candidate Name: ${candidateName}`,
    `Document Type: ${documentLabel}`,
    `Document Reference: ${documentType}`,
    ``,
    `I have corrected the issues identified previously and am resubmitting the document for approval.\n`,
    `Please find the corrected document attached as ${fileNameNote}.`,
    ``,
    `Thank you for reviewing my application.`,
    ``,
    `Best regards,`,
    `${candidateName}`,
  ];

  return sections.join('\n');
}

/**
 * Generate mailto link for document resubmission
 */
export function generateDocumentMailtoLink(
  adminEmail: string,
  params: DocumentSubmissionEmailParams,
): string {
  const subject = `Document Resubmission - ${params.documentLabel}`;
  const body = generateDocumentSubmissionEmail(params);

  return `mailto:${encodeURIComponent(adminEmail)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

/**
 * Get admin contact email for a candidate
 * (In production, this would fetch from Firestore or config)
 */
export function getAdminEmailForCandidate(_candidateId: string): string {
  // Placeholder - in production, fetch from Firestore or environment config
  return process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@baexpress.co.uk';
}
