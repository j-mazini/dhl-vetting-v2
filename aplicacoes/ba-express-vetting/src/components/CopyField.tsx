'use client';

import { useCallback, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import styles from './CopyField.module.css';

type Props = {
  value: string;
  label: string;
};

export function CopyField({ value, label }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [value]);

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={onCopy}
      aria-label={label}
      title={copied ? 'Copied' : `Copy ${label}`}
    >
      {copied ? (
        <Check size={15} strokeWidth={2.5} className="text-green-700" />
      ) : (
        <Copy size={15} strokeWidth={2} />
      )}
    </button>
  );
}
