import React from 'react';
import { Briefcase, GraduationCap, Trophy } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { experiences } from '../../data/experiences';

const typeConfig = {
  work: {
    Icon: Briefcase,
    dot: 'bg-brand-600 dark:bg-brand-500',
    badge: 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400',
  },
  education: {
    Icon: GraduationCap,
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  achievement: {
    Icon: Trophy,
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  },
};

/* Show the 6 most relevant experiences */
const FEATURED_COUNT = 6;

const Experience: React.FC = () => {
  const { language, t } = useLanguage();
  const { ref, inView } = useInView(0.05);

  const featured = experiences.slice(0, FEATURED_COUNT);

  return (
    <section id="experience" className="py-24 bg-slate-50 dark:bg-slate-800/50">
      <div className="section-container">

        {/* Header */}
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="section-tag mb-3 block">{t('experience.title')}</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {t('experience.subtitle')}
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="space-y-8">
            {featured.map((exp, i) => {
              const cfg = typeConfig[exp.type] ?? typeConfig.work;
              const Icon = cfg.Icon;
              return (
                <div
                  key={exp.id}
                  className={`relative pl-16 transition-all duration-700 ${
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  {/* Dot */}
                  <div className={`absolute left-0 w-10 h-10 ${cfg.dot} rounded-full flex items-center justify-center shadow-md z-10`}>
                    <Icon size={16} className="text-white" />
                  </div>

                  {/* Card */}
                  <div className="card p-6 hover:-translate-y-0.5 transition-all">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
                        {exp.period}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                      {exp.title[language]}
                    </h3>
                    <div className="text-brand-600 dark:text-brand-400 font-semibold text-sm mb-3">
                      {exp.company[language]}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {exp.description[language]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
