/**
 * Contact form model: limits, sanitising, validation, draft storage and the
 * mailto fallback. Pure functions, no React: easy to reason about and test.
 */
import type { ContactSubject } from '../../data';
import { isContactSubject } from '../../lib/contactIntent';

export const SUBJECTS: ContactSubject[] = ['ai', 'digital', 'hardware', 'speaking', 'other'];

export interface Values {
  name: string;
  email: string;
  company: string;
  subject: ContactSubject;
  message: string;
}

/** Fields that can be invalid, in DOM order (the first one gets focus on submit). */
export const CHECKED = ['name', 'email', 'company', 'message'] as const;
export type CheckedField = (typeof CHECKED)[number];

export const LIMITS: Record<CheckedField, { min: number; max: number }> = {
  name: { min: 2, max: 100 },
  email: { min: 3, max: 254 },
  company: { min: 0, max: 120 },
  message: { min: 20, max: 4000 },
};

export const EMPTY: Values = { name: '', email: '', company: '', subject: 'ai', message: '' };

export type FieldError = { kind: 'invalid' } | { kind: 'tooLong'; max: number };
export type Errors = Partial<Record<CheckedField, FieldError>>;

// ── Sanitising ─────────────────────────────────────────────────────────────

/** C0 / C1 control characters and the BOM. Tab and line feed survive in multi-line text. */
const isControl = (code: number, multiline: boolean) =>
  (code < 32 && !(multiline && (code === 9 || code === 10))) || (code >= 127 && code < 160) || code === 0xfeff;

const stripControls = (value: string, multiline: boolean) =>
  Array.from(value)
    .filter((ch) => !isControl(ch.codePointAt(0) ?? 0, multiline))
    .join('');

/** One line of text: no controls, whitespace collapsed, trimmed. */
export const cleanLine = (value: string) => stripControls(value, false).replace(/\s+/g, ' ').trim();

/** Free text: normalised line breaks, no controls, at most one empty line in a row, trimmed. */
export const cleanText = (value: string) =>
  stripControls(value.replace(/\r\n?/g, '\n'), true)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const sanitize = (v: Values): Values => ({
  name: cleanLine(v.name),
  email: cleanLine(v.email).replace(/\s/g, ''),
  company: cleanLine(v.company),
  subject: isContactSubject(v.subject) ? v.subject : 'other',
  message: cleanText(v.message),
});

/** Length in characters as a person counts them (an emoji is one). */
export const charLength = (value: string) => Array.from(value).length;

// ── Validation ─────────────────────────────────────────────────────────────

/** Deliberately simple: something@domain.tld, no spaces. The reply is the real check. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

export const validate = (raw: Values): Errors => {
  const v = sanitize(raw);
  const errors: Errors = {};
  for (const field of CHECKED) {
    const { max } = LIMITS[field];
    if (charLength(v[field]) > max) errors[field] = { kind: 'tooLong', max };
  }
  if (!errors.name && charLength(v.name) < LIMITS.name.min) errors.name = { kind: 'invalid' };
  if (!errors.email && !EMAIL.test(v.email)) errors.email = { kind: 'invalid' };
  if (!errors.message && charLength(v.message) < LIMITS.message.min) errors.message = { kind: 'invalid' };
  return errors;
};

// ── Draft (per tab, survives a reload, cleared once sent) ──────────────────

const DRAFT_KEY = 'contact-draft';

const isBlank = (v: Values) => !v.name && !v.email && !v.company && !v.message;

export const loadDraft = (): Partial<Values> | null => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, unknown>;
    const out: Partial<Values> = {};
    for (const key of ['name', 'email', 'company', 'message'] as const) {
      if (typeof data[key] === 'string') out[key] = (data[key] as string).slice(0, LIMITS[key].max * 2);
    }
    if (isContactSubject(data.subject)) out.subject = data.subject;
    return out;
  } catch {
    return null;
  }
};

export const saveDraft = (v: Values) => {
  try {
    if (isBlank(v)) sessionStorage.removeItem(DRAFT_KEY);
    else sessionStorage.setItem(DRAFT_KEY, JSON.stringify(v));
  } catch {
    /* storage full or blocked: the draft is a convenience only */
  }
};

export const clearDraft = () => {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
};

// ── Netlify payload and mailto fallback ───────────────────────────────────

export const FORM_NAME = 'contact';

export const encodeForm = (v: Values, lang: string) =>
  new URLSearchParams({
    'form-name': FORM_NAME,
    'bot-field': '',
    name: v.name,
    email: v.email,
    company: v.company,
    subject: v.subject,
    lang,
    message: v.message,
  }).toString();

const MAILTO_BODY_MAX = 1500;

/** Cut to `max` characters without splitting an emoji, with an ellipsis. */
const truncate = (value: string, max: number) => {
  const chars = Array.from(value);
  return chars.length <= max ? value : `${chars.slice(0, Math.max(0, max - 1)).join('').trimEnd()}…`;
};

/** mailto: link with the message prefilled, for when the form cannot be sent. */
export const buildMailto = (to: string, subjectLine: string, v: Values) => {
  const signature = [v.company ? `${v.name}, ${v.company}` : v.name, v.email].filter(Boolean).join('\n');
  const room = MAILTO_BODY_MAX - charLength(signature) - 2;
  const body = signature ? `${truncate(v.message, room)}\n\n${signature}` : truncate(v.message, MAILTO_BODY_MAX);
  return `mailto:${to}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
};
