import { profile } from '../../data';
import { useReveal, useRevealChildren } from '../../hooks';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { Channels } from '../contact/Channels';
import { ContactForm } from '../contact/ContactForm';
import { sectionNumber } from '../ui/SectionHeader';

/**
 * Word by word rise, masked. Words stay visible without JS, with reduced
 * motion, and after 2.5 s if hydration never happens (same contract as
 * `.reveal` in index.css).
 */
const wordClass = cn(
  'inline-block transition-transform duration-[1100ms] ease-out-expo',
  'motion-safe:[.js_.words-in:not(.is-in)_&]:translate-y-[112%]',
  'motion-safe:[.js_.words-in:not(.is-in)_&]:animate-[reveal-fallback_0.01s_linear_2.5s_forwards]',
);

/**
 * Title size: "SOMETHING." measures about 8em in Archivo wide extrabold,
 * so 11vw (capped at 11rem) keeps it inside the gutters from 360 px up to
 * the 1520 px container.
 */
const RevealTitle = ({ id, text }: { id: string; text: string }) => {
  const ref = useReveal<HTMLHeadingElement>();
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <h2
      id={id}
      ref={ref}
      className="words-in font-wide text-[clamp(2.3rem,11vw,11rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.045em] text-ink"
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => {
          const last = i === words.length - 1;
          const stop = last && word.endsWith('.');
          return (
            <span key={i}>
              <span className="inline-block overflow-hidden pb-[0.06em] align-top">
                <span className={wordClass} style={{ transitionDelay: `${i * 90}ms` }}>
                  {stop ? word.slice(0, -1) : word}
                  {stop && <span className="text-accent">.</span>}
                </span>
              </span>
              {!last && ' '}
            </span>
          );
        })}
      </span>
    </h2>
  );
};

const columnTitle = 'flex items-baseline gap-3 font-semiwide text-[1.35rem] font-semibold tracking-[-0.015em] text-ink';

/**
 * Contact: the conversion point of the site.
 * Oversized statement, the invitation and availability, then two columns
 * on desktop: direct channels (left) and the message form (right).
 * Stacked on mobile, channels first: a tap on "call" or "WhatsApp" is
 * often the fastest way in.
 */
export default function Contact() {
  const t = useT('contact');
  const { l } = useI18n();
  const lineRef = useReveal<HTMLDivElement>();
  const bodyRef = useRevealChildren<HTMLDivElement>();
  const index = sectionNumber('contact');

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative py-section">
      <div className="container-site">
        {/* Opener: rule, index, label */}
        <div ref={lineRef} className="reveal-line h-px w-full bg-line" aria-hidden="true" />
        <p className="label mt-4 flex items-center gap-3">
          <span className="tabular text-accent-ink">{index}</span>
          <span aria-hidden="true" className="h-px w-6 bg-ink-3/60" />
          <span>{t.label}</span>
        </p>

        <div className="mt-10 md:mt-14">
          <RevealTitle id="contact-title" text={l(t.title)} />
        </div>

        <div ref={bodyRef}>
          {/* Invitation + availability */}
          <div className="mt-10 grid gap-x-10 gap-y-8 md:mt-14 md:grid-cols-12">
            <p className="reveal max-w-[36ch] text-lead text-ink-2 md:col-span-7 lg:col-span-6">{t.subtitle}</p>
            <div
              className="reveal label flex flex-col gap-2.5 md:col-span-5 md:col-start-8 md:pt-2 lg:col-span-6 lg:col-start-7"
              style={{ ['--reveal-delay' as string]: '90ms' }}
            >
              <p className="flex items-center gap-2.5 text-ink">
                <span aria-hidden="true" className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent/60 motion-reduce:hidden" />
                  <span className="relative h-2 w-2 rounded-full bg-accent" />
                </span>
                {l(profile.availability)}
              </p>
              <p className="pl-[1.125rem]">{l(profile.responseTime)}</p>
            </div>
          </div>

          <div className="mt-16 grid gap-x-10 gap-y-16 md:mt-20 lg:grid-cols-12">
            {/* A · Direct channels */}
            <div className="lg:col-span-5">
              <h3 className={cn('reveal', columnTitle)}>
                <span className="label tabular text-accent-ink">{index}.1</span>
                {t.channels}
              </h3>
              <Channels className="reveal mt-6" />
            </div>

            {/* B · Message form */}
            <div className="lg:col-span-6 lg:col-start-7">
              <h3 id="contact-form-title" className={cn('reveal', columnTitle)} style={{ ['--reveal-delay' as string]: '90ms' }}>
                <span className="label tabular text-accent-ink">{index}.2</span>
                {t.formTitle}
              </h3>
              <ContactForm className="reveal mt-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
