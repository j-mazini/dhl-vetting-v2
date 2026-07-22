'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send } from 'lucide-react';
import { contactForm as defaultCopy, contactInfo } from '@/content/baExpress';
import type { ContactFormCopy } from '@/content/baExpress';
import styles from './ContactForm.module.css';

// 1. Zod Schema
const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm({
  copy = defaultCopy,
}: {
  copy?: ContactFormCopy;
}) {
  // 2. React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange', // Validate in real-time
  });

  const onSubmit = (data: ContactFormValues) => {
    // 3. Generate Gmail Link
    const recipient = contactInfo.email;
    const subject = data.name; // "usar o campo name"
    const body = `Nome: ${data.name}\nEmail: ${data.email}\nMensagem: ${data.message}`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      recipient
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // 4. Open in new tab
    window.open(gmailUrl, '_blank');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <div className={styles.fields}>
        <div className={styles.row2}>
          <div className={styles.field}>
            <label htmlFor="contact-name">{copy.nameLabel}</label>
            <input
              {...register('name')}
              id="contact-name"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              type="text"
              autoComplete="name"
              placeholder={copy.namePlaceholder}
            />
            {errors.name && (
              <span className={styles.errorText}>{errors.name.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="contact-email">{copy.emailLabel}</label>
            <input
              {...register('email')}
              id="contact-email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              type="email"
              autoComplete="email"
              placeholder={copy.emailPlaceholder}
            />
            {errors.email && (
              <span className={styles.errorText}>{errors.email.message}</span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-message">{copy.messageLabel}</label>
          <textarea
            {...register('message')}
            id="contact-message"
            className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
            placeholder={copy.messagePlaceholder}
          />
          {errors.message && (
            <span className={styles.errorText}>{errors.message.message}</span>
          )}
        </div>

        <button
          type="submit"
          className={`btn-primary ${styles.submit}`}
          disabled={!isValid || !isDirty}
        >
          <Send size={17} strokeWidth={2.25} aria-hidden />
          {copy.submit}
        </button>
      </div>
    </form>
  );
}
