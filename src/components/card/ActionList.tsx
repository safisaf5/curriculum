import type { CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, Globe, Linkedin, Mail, MessageCircle, Phone, type LucideIcon } from 'lucide-react';
import { profile } from '../../data';
import { useT } from '../../i18n';
import { track, type AnalyticsEvent } from '../../lib/analytics';
import { SmartLink } from '../ui/SmartLink';

interface Action {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  to: string;
  event?: AnalyticsEvent;
  external?: boolean;
}

const stripProtocol = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/**
 * Full-width contact rows (64px tall): icon, label, value, arrow.
 * Hover / focus: the text indents 8px, the icon box inks in, the arrow moves.
 */
export const ActionList = () => {
  const t = useT('card');
  const c = profile.contact;

  const actions: Action[] = [
    { id: 'email', icon: Mail, label: t.cardEmail, value: c.email, to: `mailto:${c.email}`, event: 'contact_email' },
    { id: 'phone', icon: Phone, label: t.cardCall, value: c.phone, to: `tel:${c.phoneE164}`, event: 'contact_phone' },
    { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', value: t.cardWhatsappValue, to: c.whatsapp, event: 'contact_whatsapp', external: true },
    {
      id: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      value: stripProtocol(c.linkedin).replace(/^linkedin\.com\//, ''),
      to: c.linkedin,
      event: 'contact_linkedin',
      external: true,
    },
    { id: 'website', icon: Globe, label: t.cardWebsite, value: stripProtocol(c.website), to: '/' },
  ];

  return (
    <ul aria-label={t.cardActions} className="border-t border-line">
      {actions.map((a, i) => {
        const Icon = a.icon;
        const Arrow = a.external ? ArrowUpRight : ArrowRight;
        return (
          <li
            key={a.id}
            className="animate-fade-up border-b border-line"
            style={{ animationDelay: `${260 + i * 50}ms` } as CSSProperties}
          >
            <SmartLink
              to={a.to}
              onClick={a.event ? () => track(a.event!, { from: 'card' }) : undefined}
              className="group flex min-h-16 items-center gap-4 py-2.5"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-line text-ink transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-bg group-focus-visible:border-ink group-focus-visible:bg-ink group-focus-visible:text-bg"
              >
                <Icon size={16} strokeWidth={1.6} />
              </span>
              <span className="min-w-0 flex-1 transition-transform duration-500 ease-out-expo group-hover:translate-x-2 group-focus-visible:translate-x-2">
                <span className="label block">{a.label}</span>
                <span className="mt-1 block truncate text-[1rem] leading-tight text-ink">{a.value}</span>
              </span>
              <Arrow
                aria-hidden="true"
                size={17}
                strokeWidth={1.6}
                className="shrink-0 text-ink-3 transition-[transform,color] duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-accent-ink group-focus-visible:translate-x-1 group-focus-visible:text-accent-ink"
              />
            </SmartLink>
          </li>
        );
      })}
    </ul>
  );
};
