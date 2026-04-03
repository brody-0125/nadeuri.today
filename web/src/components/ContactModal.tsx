'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ContactFormData {
  name: string;
  contact: string;
  message: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ContactFormData) => Promise<void>;
}

export default function ContactModal({ isOpen, onClose, onSubmit }: ContactModalProps) {
  const t = useTranslations('contact');
  const tCommon = useTranslations('common');

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [recaptchaFailed, setRecaptchaFailed] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const mountTime = useRef(Date.now());
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      mountTime.current = Date.now();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableSelectors =
      'button, [href], input:not([type="hidden"]):not([tabindex="-1"]), textarea, select, [tabindex]:not([tabindex="-1"])';

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(focusableSelectors);
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);

    const focusableElements = modal.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  useEffect(() => {
    if (status !== 'success') return;
    const timer = setTimeout(() => {
      resetForm();
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [status, onClose]);

  const resetForm = useCallback(() => {
    setName('');
    setContact('');
    setMessage('');
    setHoneypot('');
    setStatus('idle');
    setRecaptchaFailed(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) return;
    if (Date.now() - mountTime.current < 3000) return;

    const now = Date.now();
    const elapsed = (now - lastSubmitTime) / 1000;
    if (lastSubmitTime > 0 && elapsed < 30) {
      setCooldownRemaining(Math.ceil(30 - elapsed));
      return;
    }

    setStatus('loading');

    try {
      if (onSubmit) {
        await onSubmit({ name, contact, message });
      } else {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        let recaptchaToken = '';
        if (siteKey && typeof window !== 'undefined' && window.grecaptcha) {
          try {
            recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'contact' });
            setRecaptchaFailed(false);
          } catch {
            setRecaptchaFailed(true);
            setStatus('idle');
            return;
          }
        }

        const gasUrl = process.env.NEXT_PUBLIC_GAS_URL;
        if (!gasUrl) throw new Error('GAS URL not configured');

        await fetch(gasUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            name,
            contact,
            message,
            honeypot,
            recaptchaToken,
            timestamp: Date.now(),
          }),
        });
      }
      setStatus('success');
      setLastSubmitTime(Date.now());
    } catch {
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
        className="relative w-full sm:max-w-md bg-surface border border-border rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-lg font-bold text-text-primary">{t('title')}</h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
            aria-label={tCommon('close')}
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-text-primary mb-1">
              {t('name')}
            </label>
            <input
              id="contact-name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className="block w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-border-strong focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="contact-info" className="block text-sm font-medium text-text-primary mb-1">
              {t('contactInfo')}
            </label>
            <input
              id="contact-info"
              type="text"
              required
              maxLength={200}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={t('contactPlaceholder')}
              className="block w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-border-strong focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-text-primary mb-1">
              {t('message')}
            </label>
            <textarea
              id="contact-message"
              required
              maxLength={2000}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('messagePlaceholder')}
              className="block w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary focus:border-border-strong focus:outline-none transition-colors resize-none"
            />
          </div>

          <div
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
            aria-hidden="true"
          >
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {cooldownRemaining > 0 && (
            <p className="text-sm text-status-fault font-medium">
              {t('cooldown', { seconds: cooldownRemaining })}
            </p>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-status-operating">
              <span className="material-symbols-outlined text-lg" aria-hidden="true">
                check_circle
              </span>
              <span className="text-sm font-medium">{t('success')}</span>
            </div>
          )}

          {status === 'error' && (
            <p className="text-sm text-status-fault font-medium">
              {t('error')}
            </p>
          )}

          {recaptchaFailed && status === 'idle' && (
            <p className="text-sm text-status-fault font-medium">
              {t('recaptchaError')}
            </p>
          )}

          <button
            ref={lastFocusableRef}
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full bg-status-operating text-white rounded-lg font-semibold py-3 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                <span>{t('sending')}</span>
              </>
            ) : status === 'success' ? (
              <>
                <span className="material-symbols-outlined text-lg" aria-hidden="true">
                  check
                </span>
                <span>{t('sent')}</span>
              </>
            ) : (
              t('submit')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
