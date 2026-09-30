import { useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Loader2 } from 'lucide-react';
import { profile, type ContactSubject } from '../../data';
import { useMounted } from '../../hooks';
import { useI18n, useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { cn } from '../../lib/cn';
import { useContactSubject } from '../../lib/contactIntent';
import { Button } from '../ui/Button';
import { Field, controlClass, errorId } from './Field';
import {
  CHECKED,
  EMPTY,
  FORM_NAME,
  LIMITS,
  SUBJECTS,
  buildMailto,
  charLength,
  clearDraft,
  encodeForm,
  loadDraft,
  sanitize,
  saveDraft,
  validate,
  type CheckedField,
  type Values,
} from './form';

type Status = 'idle' | 'sending' | 'success' | 'error' | 'offline';

const SUBJECT_KEY = {
  ai: 'subjectAi',
  digital: 'subjectDigital',
  hardware: 'subjectHardware',
  speaking: 'subjectSpeaking',
  other: 'subjectOther',
} as const satisfies Record<ContactSubject, string>;

const TIMEOUT_MS = 15000;
const ID = (field: string) => `contact-${field}`;

/**
 * Netlify Forms, progressively enhanced.
 *  - Without JavaScript: a plain POST (Netlify detects the form in the
 *    prerendered HTML) with native browser validation.
 *  - With JavaScript: inline validation (on blur, then live), fetch submit,
 *    sending / success / error / offline states, a mailto fallback, and an
 *    unsent draft kept in sessionStorage for the tab.
 */
export const ContactForm = ({ className }: { className?: string }) => {
  const t = useT('contact');
  const { lang } = useI18n();
  const mounted = useMounted();
  const requested = useContactSubject();

  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<CheckedField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  /** What was sent, shown back as a receipt (plain text, never HTML). */
  const [sent, setSent] = useState<Values | null>(null);
  /** Form height at the moment of success: the panel keeps it on desktop so the page does not jump. */
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const restored = useRef(false);

  // Restore an unsent draft (client only, after hydration)
  useEffect(() => {
    const draft = loadDraft();
    if (draft) setValues((v) => ({ ...v, ...draft }));
    restored.current = true;
  }, []);

  // Keep the draft while typing (debounced)
  useEffect(() => {
    if (!restored.current || status === 'success') return;
    const timer = window.setTimeout(() => saveDraft(values), 300);
    return () => window.clearTimeout(timer);
  }, [values, status]);

  // A call to action elsewhere on the site picked a subject
  useEffect(() => {
    if (!requested) return;
    setValues((v) => ({ ...v, subject: requested }));
    setStatus((s) => (s === 'success' ? 'idle' : s));
  }, [requested]);

  // Move focus to the confirmation so keyboard and screen reader users land on it
  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const errors = useMemo(() => validate(values), [values]);

  /** Errors show after a field was left with a value, or after a submit; then they follow the typing. */
  const messageFor = (field: CheckedField): string | undefined => {
    if (!touched[field] && !submitted) return undefined;
    const error = errors[field];
    if (!error) return undefined;
    if (error.kind === 'tooLong') return t.errTooLong(error.max);
    return { name: t.errName, email: t.errEmail, company: undefined, message: t.errMessage }[field];
  };

  const onChange = (field: keyof Values) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { value } = e.target;
    setValues((v) => ({ ...v, [field]: value }));
  };

  const onBlur = (field: CheckedField) => () => {
    // An untouched empty field is not an error yet: wait for a value or a submit
    if (!values[field].trim() && !submitted) return;
    setTouched((s) => (s[field] ? s : { ...s, [field]: true }));
  };

  const succeed = (clean: Values) => {
    setLockedHeight(formRef.current?.offsetHeight ?? null);
    setSent(clean);
    clearDraft();
    setValues((v) => ({ ...EMPTY, subject: v.subject }));
    setTouched({});
    setSubmitted(false);
    setStatus('success');
  };

  const reset = () => {
    setStatus('idle');
    setSent(null);
    setLockedHeight(null);
    window.requestAnimationFrame(() => document.getElementById(ID('name'))?.focus());
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    setSubmitted(true);

    const firstInvalid = CHECKED.find((f) => errors[f]);
    if (firstInvalid) {
      document.getElementById(ID(firstInvalid))?.focus();
      return;
    }

    const clean = sanitize(values);

    // Honeypot filled: a bot. Pretend it worked, send nothing.
    if (honeypotRef.current?.value) {
      succeed(clean);
      return;
    }

    track('contact_form_submit', { subject: clean.subject, lang });

    if (!navigator.onLine) {
      setStatus('offline');
      track('contact_form_error', { reason: 'offline' });
      return;
    }

    setStatus('sending');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm(clean, lang),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      succeed(clean);
      track('contact_form_success', { subject: clean.subject, lang });
    } catch (err) {
      setStatus(navigator.onLine ? 'error' : 'offline');
      track('contact_form_error', {
        reason: controller.signal.aborted ? 'timeout' : err instanceof Error && err.message.startsWith('HTTP') ? err.message : 'network',
      });
    } finally {
      window.clearTimeout(timer);
    }
  };

  const sending = status === 'sending';
  const failed = status === 'error' || status === 'offline';
  const count = charLength(values.message);
  const clean = failed ? sanitize(values) : null;
  const mailto = clean
    ? buildMailto(profile.contact.email, `safwan.ch · ${t[SUBJECT_KEY[clean.subject]]}`, clean)
    : '';

  const fieldError = {
    name: messageFor('name'),
    email: messageFor('email'),
    company: messageFor('company'),
    message: messageFor('message'),
  };
  const aria = (field: CheckedField, extra?: string) => ({
    'aria-invalid': fieldError[field] ? true : undefined,
    'aria-describedby': [extra, fieldError[field] ? errorId(ID(field)) : undefined].filter(Boolean).join(' ') || undefined,
  });

  return (
    <div className={className}>
      {status === 'success' ? (
        <div
          className="flex animate-fade-up flex-col justify-between gap-10 border-t border-line pt-8 lg:min-h-[var(--locked-h)]"
          style={lockedHeight ? ({ '--locked-h': `${lockedHeight}px` } as CSSProperties) : undefined}
        >
          <div>
            <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center border border-line text-accent">
              <Check size={18} strokeWidth={1.7} />
            </span>
            <p ref={successRef} tabIndex={-1} className="mt-8 max-w-[22ch] font-semiwide text-display-s font-semibold text-ink">
              {t.success}
            </p>

            {sent && (
              <dl className="mt-10 border-t border-line text-[0.95rem]">
                {[
                  [t.subject, t[SUBJECT_KEY[sent.subject]]],
                  [t.name, sent.company ? `${sent.name}, ${sent.company}` : sent.name],
                  [t.emailField, sent.email],
                  [t.message, sent.message.replace(/\s+/g, ' ')],
                ].map(([term, detail]) => (
                  <div key={term} className="grid gap-1 border-b border-line py-3 sm:grid-cols-[8rem_1fr] sm:gap-6">
                    <dt className="label pt-[0.3em]">{term}</dt>
                    <dd className="line-clamp-3 min-w-0 break-words text-ink-2">{detail}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div>
            <Button variant="outline" icon="right" onClick={reset} className="w-full sm:w-auto">
              {t.successAgain}
            </Button>
          </div>
        </div>
      ) : (
        <form
          ref={formRef}
          name={FORM_NAME}
          method="POST"
          action="/"
          data-netlify="true"
          netlify-honeypot="bot-field"
          noValidate={mounted}
          onSubmit={onSubmit}
          aria-labelledby="contact-form-title"
          aria-busy={sending || undefined}
          className="border-t border-line pt-8"
        >
          <input type="hidden" name="form-name" value={FORM_NAME} />
          <input type="hidden" name="lang" value={lang} />
          <div className="sr-only" aria-hidden="true">
            <label htmlFor={ID('bot-field')}>{t.honeypot}</label>
            <input ref={honeypotRef} id={ID('bot-field')} type="text" name="bot-field" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
            <Field id={ID('name')} label={t.name} required error={fieldError.name}>
              <input
                id={ID('name')}
                name="name"
                type="text"
                required
                minLength={LIMITS.name.min}
                maxLength={LIMITS.name.max}
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                placeholder={t.namePlaceholder}
                value={values.name}
                onChange={onChange('name')}
                onBlur={onBlur('name')}
                className={controlClass(Boolean(fieldError.name))}
                {...aria('name')}
              />
            </Field>

            <Field id={ID('email')} label={t.emailField} required error={fieldError.email}>
              <input
                id={ID('email')}
                name="email"
                type="email"
                required
                maxLength={LIMITS.email.max}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
                enterKeyHint="next"
                placeholder={t.emailPlaceholder}
                value={values.email}
                onChange={onChange('email')}
                onBlur={onBlur('email')}
                className={controlClass(Boolean(fieldError.email))}
                {...aria('email')}
              />
            </Field>

            <Field id={ID('company')} label={t.company} error={fieldError.company}>
              <input
                id={ID('company')}
                name="company"
                type="text"
                maxLength={LIMITS.company.max}
                autoComplete="organization"
                enterKeyHint="next"
                placeholder={t.companyPlaceholder}
                value={values.company}
                onChange={onChange('company')}
                onBlur={onBlur('company')}
                className={controlClass(Boolean(fieldError.company))}
                {...aria('company')}
              />
            </Field>

            <Field id={ID('subject')} label={t.subject}>
              <select
                id={ID('subject')}
                name="subject"
                value={values.subject}
                onChange={onChange('subject')}
                className={cn(controlClass(false), 'cursor-pointer pr-10')}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s} className="bg-surface text-ink">
                    {t[SUBJECT_KEY[s]]}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                size={16}
                strokeWidth={1.6}
                className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-ink-3"
              />
            </Field>

            <Field
              id={ID('message')}
              label={t.message}
              required
              error={fieldError.message}
              className="md:col-span-2"
              aside={
                <span id={ID('message-count')} className="label tabular">
                  <span aria-hidden="true" className={cn(count > LIMITS.message.max ? 'text-accent-ink' : count >= LIMITS.message.min ? 'text-ink-2' : '')}>
                    {count} / {LIMITS.message.max}
                  </span>
                  <span className="sr-only">{t.charCount(count, LIMITS.message.max)}</span>
                </span>
              }
            >
              <textarea
                id={ID('message')}
                name="message"
                required
                minLength={LIMITS.message.min}
                rows={6}
                placeholder={t.messagePlaceholder}
                value={values.message}
                onChange={onChange('message')}
                onBlur={onBlur('message')}
                className={cn(controlClass(Boolean(fieldError.message)), 'max-h-[28rem] min-h-[10rem] resize-y [field-sizing:content] supports-[field-sizing:content]:resize-none')}
                {...aria('message', ID('message-count'))}
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <button
              type="submit"
              aria-disabled={sending || undefined}
              className={cn('btn btn-primary w-full sm:w-auto sm:min-w-[13rem]', sending && 'cursor-progress')}
            >
              <span>{sending ? t.sending : t.send}</span>
              {sending ? (
                <Loader2 aria-hidden="true" size={17} strokeWidth={1.6} className="shrink-0 animate-spin" />
              ) : (
                <ArrowRight aria-hidden="true" size={17} strokeWidth={1.6} className="btn-arrow shrink-0" />
              )}
            </button>
            <p className="max-w-[34ch] text-[0.875rem] leading-snug text-ink-3">
              {t.privacy}
              <span aria-hidden="true" className="ml-2 whitespace-nowrap font-mono text-[0.75rem]">
                <span className="text-accent-ink">*</span> {t.required}
              </span>
            </p>
          </div>

          <p role="status" className="sr-only">
            {sending ? t.sending : ''}
          </p>

          {failed && (
            <div role="alert" className="mt-8 flex animate-fade-up gap-4 border-t border-line pt-5">
              <span aria-hidden="true" className="mt-[0.55em] h-2 w-2 shrink-0 bg-accent" />
              <div className="min-w-0">
                <p className="max-w-[52ch] text-ink">{status === 'offline' ? t.errorOffline : t.errorGeneric}</p>
                <a
                  href={mailto}
                  onClick={() => track('contact_email', { from: 'form-fallback' })}
                  className="group mt-2 inline-flex min-h-11 items-center gap-2 font-medium text-ink"
                >
                  <span className="link-static">{t.openMail}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    size={16}
                    strokeWidth={1.6}
                    className="text-accent-ink transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
