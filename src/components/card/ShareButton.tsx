import { useEffect, useRef, useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { useL, useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { cn } from '../../lib/cn';

type Status = 'idle' | 'copied' | 'failed';

/** Clipboard API, then the legacy execCommand path (older in-app browsers). */
const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* fall back below */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
};

interface ShareButtonProps {
  title: string;
  url: string;
  className?: string;
}

/**
 * Native share sheet when available (phones), otherwise copies the card URL.
 * The result is announced in a polite live region.
 */
export const ShareButton = ({ title, url, className }: ShareButtonProps) => {
  const t = useT('card');
  const l = useL();
  const [status, setStatus] = useState<Status>('idle');
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = (next: Status) => {
    setStatus(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus('idle'), next === 'failed' ? 5000 : 2400);
  };

  const onShare = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        track('card_share', { method: 'native' });
        return;
      } catch (error) {
        // The visitor closed the sheet: nothing to do
        if ((error as DOMException)?.name === 'AbortError') return;
      }
    }
    const ok = await copyText(url);
    track('card_share', { method: ok ? 'clipboard' : 'failed' });
    flash(ok ? 'copied' : 'failed');
  };

  const copied = status === 'copied';

  return (
    <>
      <button type="button" onClick={onShare} className={cn('btn btn-outline', className)}>
        {copied ? (
          <Check aria-hidden="true" size={16} strokeWidth={1.7} className="shrink-0 text-accent-ink" />
        ) : (
          <Share2 aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0" />
        )}
        <span>{copied ? t.cardShared : t.cardShare}</span>
      </button>
      <p role="status" aria-live="polite" className={cn('col-span-full text-[0.85rem] leading-snug text-ink-2', status !== 'failed' && 'sr-only')}>
        {status === 'copied' ? t.cardShared : status === 'failed' ? l(t.cardShareFailed) : ''}
      </p>
    </>
  );
};
