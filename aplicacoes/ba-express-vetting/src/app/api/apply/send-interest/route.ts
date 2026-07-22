import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const sendInterestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(5, 'Invalid phone number'),
  message: z.string().optional().default(''),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = sendInterestSchema.parse(body);

    const emailContent = formatInterestEmail(validatedData);
    const emailResult = await sendEmailToHR(emailContent, validatedData.email);

    if (!emailResult.success) {
      throw new Error('Failed to send email to HR');
    }

    return NextResponse.json(
      { message: 'Interest received. Our team will contact you soon.' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.flatten() },
        { status: 400 }
      );
    }

    console.error('[POST /api/v1/apply/send-interest] Error:', error);
    return NextResponse.json(
      { message: 'Failed to process your application. Please try again.' },
      { status: 500 }
    );
  }
}

function formatInterestEmail(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): string {
  return `
New Driver Application Interest

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Message: ${data.message || '(no message)'}

---
This applicant has shown interest in joining BA Express.
Please review and send them an invitation link to complete the full application.

To send the link, use the HR Admin Panel at: /admin/hr-invitations
  `;
}

async function sendEmailToHR(
  content: string,
  applicantEmail: string
): Promise<{ success: boolean }> {
  const hrEmail = process.env.HR_EMAIL || 'info@baexpress.co.uk';

  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@baexpress.co.uk',
          to: hrEmail,
          subject: `New Driver Application Interest from ${applicantEmail}`,
          html: `<pre>${escapeHtml(content)}</pre>`,
        }),
      });

      if (!response.ok) {
        throw new Error('Resend API failed');
      }

      return { success: true };
    } catch (error) {
      console.error('[sendEmailToHR] Resend error:', error);
    }
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || hrEmail,
        to: hrEmail,
        subject: `New Driver Application Interest from ${applicantEmail}`,
        text: content,
      });

      return { success: true };
    } catch (error) {
      console.error('[sendEmailToHR] Nodemailer error:', error);
    }
  }

  console.log('[HR Email Notification]');
  console.log('To:', hrEmail);
  console.log(content);

  return { success: true };
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
