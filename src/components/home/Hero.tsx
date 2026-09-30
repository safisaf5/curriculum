import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { profile, type Universe } from '../../data';
import { useReducedMotion, useZonedClock } from '../../hooks';
import { useI18n, useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { cn } from '../../lib/cn';
import { FILES } from '../../site';
import { ButtonLink } from '../ui/Button';
import { EcosystemDial } from './EcosystemDial';

const dms = (value: number, pos: string, neg: string) => {
  const abs = Math.abs(value);
  const d = Math.floor(abs);
  const m = Math.round((abs - d) * 60);
  return `${d}°${String(m).padStart(2, '0')}′${value >= 0 ? pos : neg}`;
};

const GenevaClock = () => {
  const t = useT('common');
  const time = useZonedClock(profile.location.timeZone);
  return (
    <span className="flex items-center gap-2" title={t.genevaTime}>
      <span aria-hidden="true" className="h-1.5 w-1.5 animate-blink rounded-full bg-accent" />
      <span className="sr-only">{t.genevaTime} </span>
      <span className="tabular text-ink-2">{time ? `${time.label}:${String(time.s).padStart(2, '0')}` : '--:--:--'}</span>
      <span>{time?.zone ?? ''}</span>
    </span>
  );
};

export default function Hero() {
  const { l, lang } = useI18n();
  const t = useT('home');
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<Universe['id'] | null>(null);
  const [cycled, setCycled] = useState<Universe['id'] | null>(null);
  const active = hovered ?? cycled;

  // Slowly cycle through the universes while the hero is visible and idle.
  useEffect(() => {
    if (reduced || hovered) return;
    const el = sectionRef.current;
    if (!el) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    const ids = profile.universes.map((u) => u.id);
    let i = -1;
    const timer = window.setInterval(() => {
      if (!visible || document.hidden) return;
      i = (i + 1) % (ids.length + 1);
      setCycled(i === ids.length ? null : ids[i]);
    }, 2800);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [reduced, hovered]);

  const coords = `${dms(profile.location.lat, 'N', 'S')} ${dms(profile.location.lng, 'E', 'W')}`;

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col pt-[4.5rem]"
    >
      <div className="container-site flex flex-1 flex-col">
        {/* Meta row */}
        <div className="label flex items-center justify-between gap-4 border-b border-line py-4 animate-fade-in">
          <span className="flex items-center gap-3">
            <span className="tabular text-accent-ink">01</span>
            <span aria-hidden="true" className="h-px w-6 bg-ink-3/60" />
            {t.heroIndex}
          </span>
          <span className="hidden md:inline">{coords}</span>
          <GenevaClock />
        </div>

        <div className="grid flex-1 items-center gap-x-10 gap-y-12 py-10 md:py-14 lg:grid-cols-12">
          <div className="relative z-10 lg:col-span-7">
            <p className="label mb-6 flex items-center gap-2.5 animate-fade-in">
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent/60 motion-reduce:hidden" />
                <span className="relative h-2 w-2 rounded-full bg-accent" />
              </span>
              {l(profile.availability)}
            </p>

            <h1
              id="hero-title"
              className="font-wide text-[clamp(2.55rem,11.4vw,5.5rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.045em] text-ink lg:text-[clamp(3.4rem,5.75vw,8.2rem)]"
            >
              <span className="block overflow-hidden pb-[0.04em]">
                <span className="block animate-rise-in">{profile.givenName}</span>
              </span>
              <span className="block overflow-hidden pb-[0.04em]">
                <span className="block animate-rise-in [animation-delay:90ms]">
                  {profile.familyName}
                  <span className="text-accent">.</span>
                </span>
              </span>
            </h1>

            <p className="mt-8 max-w-[24ch] font-semiwide text-[clamp(1.45rem,2.5vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.02em] text-ink animate-fade-up [animation-delay:150ms]">
              {l(profile.headline)}
            </p>
            <p className="mt-5 max-w-[48ch] text-lead text-ink-2 animate-fade-up [animation-delay:220ms]">
              {l(profile.subline)}
            </p>

            <div className="mt-9 flex flex-col gap-3 animate-fade-up [animation-delay:300ms] xs:flex-row xs:flex-wrap xs:items-center">
              <ButtonLink to="/#about" icon="down">
                {t.heroCtaJourney}
              </ButtonLink>
              <ButtonLink to="/#contact" variant="outline">
                {t.heroCtaWork}
              </ButtonLink>
              <a
                href={FILES.cvPdf[lang]}
                download
                onClick={() => track('cv_download', { lang, from: 'hero' })}
                className="group inline-flex min-h-12 items-center gap-2 px-1 text-[0.95rem] text-ink-2 transition-colors hover:text-ink xs:ml-2"
              >
                <span className="link">{t.heroCtaCv}</span>
                <ArrowDown aria-hidden="true" size={15} strokeWidth={1.6} className="transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[26rem] animate-fade-in [animation-delay:200ms] sm:max-w-[30rem] lg:col-span-5 lg:max-w-none">
            <EcosystemDial
              active={active}
              onActivate={setHovered}
              pointerTarget={sectionRef}
              className="mx-auto max-w-[36rem]"
            />
            <div className="mt-4 flex flex-wrap justify-center gap-x-1 gap-y-1" role="group" aria-label={t.dialHint}>
              {profile.universes.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  aria-pressed={active === u.id}
                  onPointerEnter={() => setHovered(u.id)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(u.id)}
                  onBlur={() => setHovered(null)}
                  onClick={() => setHovered((v) => (v === u.id ? null : u.id))}
                  className={cn(
                    'px-2.5 py-1.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] transition-colors',
                    active === u.id ? 'text-accent-ink' : 'text-ink-3 hover:text-ink',
                  )}
                >
                  {l(u.label)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="label grid grid-cols-2 items-center gap-x-6 gap-y-3 border-t border-line py-4 animate-fade-in [animation-delay:400ms] md:grid-cols-4">
          <span>{t.heroLocation}</span>
          <span className="text-ink-2">{t.heroDisciplines}</span>
          <span>{t.heroSince(profile.buildingSince)}</span>
          <a href="#about" className="hidden items-center gap-2 justify-self-end text-ink-2 transition-colors hover:text-ink md:inline-flex">
            {t.heroScroll}
            <ArrowDown aria-hidden="true" size={13} strokeWidth={1.6} className="animate-bounce motion-reduce:animate-none" />
          </a>
        </div>
      </div>
    </section>
  );
}
