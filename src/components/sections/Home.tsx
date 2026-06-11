import React, { useRef } from 'react';
import { ArrowRight, Zap, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import AnimatedCounter from '../AnimatedCounter';

interface HomeProps {
  onNavigate: (section: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { ref: heroRef, inView } = useInView(0.05);
  const sectionRef = useRef<HTMLElement>(null);
  const frame = useRef(0);

  // Pointer-following glow (desktop) — cheap, rAF-throttled
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (frame.current) return;
    const { clientX, clientY, currentTarget } = e;
    frame.current = requestAnimationFrame(() => {
      const rect = currentTarget.getBoundingClientRect();
      currentTarget.style.setProperty('--mx', `${clientX - rect.left}px`);
      currentTarget.style.setProperty('--my', `${clientY - rect.top}px`);
      frame.current = 0;
    });
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      className="relative min-h-screen flex items-center overflow-hidden bg-slate-950"
    >
      {/* Background: grid + orbs + pointer glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.05] animate-grid-flow"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.6) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
        {/* Radial mask to fade the grid towards the edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950" />
        {/* Interactive glow that follows the cursor */}
        <div
          className="absolute inset-0 hidden md:block transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%), rgba(99,102,241,0.12), transparent 70%)',
          }}
        />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-brand-600/15 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '2.5s' }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Content ── */}
          <div
            ref={heroRef as React.RefObject<HTMLDivElement>}
            className={`transition-all duration-1000 ease-out ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Availability badge */}
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-brand-300 text-sm font-medium">{t('hero.badge')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.12] mb-6">
              {t('hero.h1a')}
              <span className="gradient-text-animated">
                {t('hero.h1b')}
              </span>
              {t('hero.h1c')}
            </h1>

            {/* Sub */}
            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
              {t('hero.sub')}
            </p>

            {/* Who I help */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap size={14} className="text-brand-400" />
                <span className="text-brand-400 font-semibold text-xs uppercase tracking-widest">
                  {t('hero.who.label')}
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{t('hero.who.text')}</p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={() => onNavigate('contact')}
                className="btn-primary group"
              >
                {t('hero.cta1')}
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('projects')}
                className="btn-ghost-dark"
              >
                {t('hero.cta2')}
              </button>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <MapPin size={13} />
              <span>{t('contact.location')}</span>
            </div>
          </div>

          {/* ── RIGHT: Photo + floating stats ── */}
          <div
            className={`flex justify-center lg:justify-end transition-all duration-1000 delay-300 ease-out ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="relative">
              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-full border border-brand-500/20 scale-[1.12]" />
              <div className="absolute inset-0 rounded-full border border-brand-500/10 scale-[1.28]" />

              {/* Photo */}
              <div className="w-64 h-64 sm:w-72 sm:h-72 lg:w-[340px] lg:h-[340px] rounded-full overflow-hidden border-2 border-brand-500/30 shadow-2xl shadow-brand-500/20">
                <img
                  src="/IMG_8964.JPG"
                  alt="Safwan Abdirahman — Tech Entrepreneur & AI Consultant"
                  width={340}
                  height={340}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-slate-950/30 to-transparent" />
              </div>

              {/* Stat: languages */}
              <div className="absolute -bottom-4 -left-6 bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-xl border border-slate-100 dark:border-slate-700 animate-float">
                <AnimatedCounter value="5+" className="text-2xl font-bold text-slate-900 dark:text-white block" />
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('hero.languages')}</div>
              </div>

              {/* Stat: years */}
              <div className="absolute -top-4 -right-6 bg-brand-600 rounded-2xl px-4 py-3 shadow-xl shadow-brand-600/30 animate-float" style={{ animationDelay: '1.5s' }}>
                <AnimatedCounter value="4+" className="text-2xl font-bold text-white block" />
                <div className="text-xs text-brand-200 mt-0.5">{t('hero.years')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow opacity-50">
          <span className="text-slate-500 text-xs tracking-wide">{t('hero.scroll')}</span>
          <div className="w-5 h-8 border border-slate-600 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-slate-500 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
