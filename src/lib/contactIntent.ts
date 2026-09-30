import { useEffect, useState } from 'react';
import type { ContactSubject } from '../data/types';

/**
 * Tiny contract between "call to action" buttons (services, project pages)
 * and the contact form: a CTA can pre-select the form subject.
 *
 *   requestContact('ai')            → selects the subject, scrolls to #contact
 *   const subject = useContactSubject()   → inside the form
 *
 * Deep links work too: /?subject=hardware#contact
 */
const EVENT = 'contact:subject';
const KEY = 'contact-subject';
const SUBJECTS: ContactSubject[] = ['ai', 'digital', 'hardware', 'speaking', 'other'];

export const isContactSubject = (v: unknown): v is ContactSubject => SUBJECTS.includes(v as ContactSubject);

export const requestContact = (subject: ContactSubject, scroll = true) => {
  try {
    sessionStorage.setItem(KEY, subject);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent<ContactSubject>(EVENT, { detail: subject }));
  if (scroll) {
    const el = document.getElementById('contact');
    if (el) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }
};

/** Subject requested by a CTA or the ?subject= query. null until one is requested (SSR-safe). */
export const useContactSubject = (): ContactSubject | null => {
  const [subject, setSubject] = useState<ContactSubject | null>(null);
  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('subject');
    let fromStorage: string | null = null;
    try {
      fromStorage = sessionStorage.getItem(KEY);
    } catch {
      /* ignore */
    }
    const initial = fromQuery ?? fromStorage;
    if (isContactSubject(initial)) setSubject(initial);
    const onEvent = (e: Event) => {
      const detail = (e as CustomEvent<ContactSubject>).detail;
      if (isContactSubject(detail)) setSubject(detail);
    };
    window.addEventListener(EVENT, onEvent);
    return () => window.removeEventListener(EVENT, onEvent);
  }, []);
  return subject;
};
