import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Copy, QrCode, UserPlus } from 'lucide-react';
import { profile } from '../../data';
import { useZonedClock } from '../../hooks';
import { useI18n, useT } from '../../i18n';
import { track, type AnalyticsEvent } from '../../lib/analytics';
import { cn } from '../../lib/cn';
import { FILES } from '../../site';
import { SmartLink } from '../ui/SmartLink';

const c = profile.contact;

/** 'https://www.linkedin.com/in/safwanab' → 'linkedin.com/in/safwanab' */
const displayUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

// ── Row anatomy ────────────────────────────────────────────────────────────
// Mono label (left on desktop, above on mobile), large value, arrow.
// Hover / focus: a 2px ink rule draws over the hairline, the value indents
// 8px, the arrow moves 4px and turns vermilion.

const rowInner = 'flex min-w-0 flex-1 flex-col gap-1.5 md:flex-row md:items-baseline md:gap-6';
const rowLabel = 'label w-[7.5rem] shrink-0 transition-colors duration-300';
const rowValue =
  'block min-w-0 truncate font-semiwide text-[1.2rem] font-medium leading-tight tracking-[-0.015em] text-ink transition-transform duration-500 ease-out-expo sm:text-[1.35rem]';

const DrawnRule = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 -bottom-px h-[2px] origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out-expo group-hover/row:scale-x-100 group-focus-visible/row:scale-x-100"
  />
);

interface ChannelProps {
  to: string;
  label: string;
  value: string;
  event: AnalyticsEvent;
  external?: boolean;
  /** Extra control placed at the end of the row (outside the link). */
  after?: ReactNode;
}

const Channel = ({ to, label, value, event, external, after }: ChannelProps) => {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  return (
    <li className="relative flex items-stretch border-b border-line">
      <SmartLink
        to={to}
        onClick={() => track(event, { from: 'contact' })}
        className="group/row relative flex min-h-[4.5rem] flex-1 items-center gap-4 py-4 md:min-h-[4.75rem]"
      >
        <span className={rowInner}>
          <span className={cn(rowLabel, 'group-hover/row:text-ink group-focus-visible/row:text-ink')}>{label}</span>
          <span className={cn(rowValue, 'group-hover/row:translate-x-2 group-focus-visible/row:translate-x-2')}>{value}</span>
        </span>
        <Arrow
          aria-hidden="true"
          size={18}
          strokeWidth={1.6}
          className={cn(
            'shrink-0 text-ink-3 transition-[transform,color] duration-500 ease-out-expo group-hover/row:text-accent-ink group-focus-visible/row:text-accent-ink',
            external
              ? 'group-hover/row:-translate-y-1 group-hover/row:translate-x-1 group-focus-visible/row:-translate-y-1 group-focus-visible/row:translate-x-1'
              : 'group-hover/row:translate-x-1 group-focus-visible/row:translate-x-1',
          )}
        />
        <DrawnRule />
      </SmartLink>
      {after}
    </li>
  );
};

// ── Copy e-mail ────────────────────────────────────────────────────────────

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / insecure contexts: hidden textarea + execCommand
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
};

const CopyEmail = () => {
  const t = useT('contact');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          const ok = await copyText(c.email);
          if (!ok) return;
          setCopied(true);
          track('contact_email', { from: 'contact', action: 'copy' });
        }}
        aria-label={t.copyEmail}
        title={t.copyEmail}
        className="group/copy relative ml-2 flex w-12 shrink-0 items-center justify-center border-l border-line text-ink-3 transition-colors duration-300 hover:text-ink md:w-14"
      >
        <span className="relative h-[17px] w-[17px]">
          <Copy
            aria-hidden="true"
            size={17}
            strokeWidth={1.6}
            className={cn(
              'absolute inset-0 transition-[opacity,transform] duration-300 ease-out-expo',
              copied ? 'scale-50 opacity-0' : 'scale-100 opacity-100',
            )}
          />
          <Check
            aria-hidden="true"
            size={17}
            strokeWidth={1.8}
            className={cn(
              'absolute inset-0 text-accent-ink transition-[opacity,transform] duration-300 ease-out-expo',
              copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
            )}
          />
        </span>
      </button>
      <span
        role="status"
        className={cn(
          'label pointer-events-none absolute right-0 top-2 text-accent-ink transition-opacity duration-300',
          copied ? 'opacity-100' : 'opacity-0',
        )}
      >
        {copied ? t.emailCopied : ''}
      </span>
    </>
  );
};

// ── Local time, ticking only while visible ────────────────────────────────

const LocalTime = () => {
  const t = useT('contact');
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const time = useZonedClock(profile.location.timeZone, visible);
  return (
    <span ref={ref} className="label tabular shrink-0 text-right" title={t.localTime}>
      <span className="sr-only">{t.localTime} </span>
      <span className="text-ink-2">{time ? time.label : '--:--'}</span> {time?.zone ?? ''}
    </span>
  );
};

// ── Channels ───────────────────────────────────────────────────────────────

export const Channels = ({ className }: { className?: string }) => {
  const t = useT('contact');
  const { l } = useI18n();

  return (
    <div className={className}>
      <ul className="border-t border-line">
        <Channel to={`mailto:${c.email}`} label={t.email} value={c.email} event="contact_email" after={<CopyEmail />} />
        <Channel to={`tel:${c.phoneE164}`} label={t.phone} value={c.phone} event="contact_phone" />
        <Channel to={c.whatsapp} label={t.whatsapp} value={t.whatsappValue} event="contact_whatsapp" external />
        <Channel to={c.linkedin} label={t.linkedin} value={displayUrl(c.linkedin)} event="contact_linkedin" external />
        <li className="flex min-h-[4.5rem] items-center gap-4 border-b border-line py-4 md:min-h-[4.75rem]">
          <span className={rowInner}>
            <span className={rowLabel}>{t.location}</span>
            <span className={cn(rowValue, 'text-ink-2')}>
              {l(profile.location.city)}, {l(profile.location.country)}
            </span>
          </span>
          <LocalTime />
        </li>
      </ul>

      <ul className="mt-5 flex flex-col gap-x-8 sm:flex-row sm:flex-wrap">
        <li>
          <SmartLink
            to="/card"
            className="group inline-flex min-h-11 items-center gap-2.5 text-[0.95rem] text-ink-2 transition-colors duration-300 hover:text-ink"
          >
            <QrCode aria-hidden="true" size={16} strokeWidth={1.6} className="text-ink-3 transition-colors group-hover:text-accent-ink" />
            <span className="link">{t.card}</span>
            <ArrowRight aria-hidden="true" size={14} strokeWidth={1.6} className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
          </SmartLink>
        </li>
        <li>
          <a
            href={FILES.vcard}
            download
            onClick={() => track('vcard_download', { from: 'contact' })}
            className="group inline-flex min-h-11 items-center gap-2.5 text-[0.95rem] text-ink-2 transition-colors duration-300 hover:text-ink"
          >
            <UserPlus aria-hidden="true" size={16} strokeWidth={1.6} className="text-ink-3 transition-colors group-hover:text-accent-ink" />
            <span className="link">{t.vcard}</span>
            <ArrowDown aria-hidden="true" size={14} strokeWidth={1.6} className="transition-transform duration-500 ease-out-expo group-hover:translate-y-0.5" />
          </a>
        </li>
      </ul>
    </div>
  );
};
