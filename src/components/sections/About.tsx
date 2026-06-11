import React from 'react';
import { Tv, Trophy, Globe, Zap } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import AnimatedCounter from '../AnimatedCounter';

const stats = [
  { value: '4+', labelFr: 'Années en business', labelEn: 'Years in business' },
  { value: '5',  labelFr: 'Langues parlées',    labelEn: 'Languages spoken'  },
  { value: '2',  labelFr: 'Entreprises fondées', labelEn: 'Companies founded' },
  { value: '1',  labelFr: 'Passage RTS TV',     labelEn: 'RTS TV appearance' },
];

const qualities = {
  fr: ['Leader naturel', 'Orateur', 'Innovateur', 'Polyglotte', 'Rigoureux', 'Stratège'],
  en: ['Natural leader', 'Public speaker', 'Innovator', 'Polyglot', 'Rigorous', 'Strategist'],
};

const languages = [
  { nameFr: 'Français', nameEn: 'French',  level: 'Natif / Native',   pct: 100 },
  { nameFr: 'Arabe',    nameEn: 'Arabic',   level: 'Natif / Native',   pct: 100 },
  { nameFr: 'Anglais',  nameEn: 'English',  level: 'B2',               pct: 70  },
  { nameFr: 'Italien',  nameEn: 'Italian',  level: 'B2',               pct: 70  },
  { nameFr: 'Allemand', nameEn: 'German',   level: 'A2',               pct: 35  },
];

const trustSignals = [
  {
    icon: Tv,
    titleFr: 'Interviewé sur RTS',
    titleEn: 'Featured on RTS TV',
    descFr:  'Passage à la télévision nationale suisse.',
    descEn:  'Appeared on Swiss national television.',
  },
  {
    icon: Trophy,
    titleFr: 'Lauréat Concours d\'Éloquence',
    titleEn: 'Eloquence Contest Winner',
    descFr:  'Vainqueur du Concours Genevois d\'Éloquence 2023-2024.',
    descEn:  'Winner of the Geneva Eloquence Contest 2023-2024.',
  },
  {
    icon: Zap,
    titleFr: 'CEO & Fondateur',
    titleEn: 'CEO & Founder',
    descFr:  'Fondateur de Heal ElectroniX depuis 2020.',
    descEn:  'Founder of Heal ElectroniX since 2020.',
  },
];

const About: React.FC = () => {
  const { language, t } = useLanguage();
  const { ref, inView } = useInView(0.1);

  const bioFr = [
    'Entrepreneur tech genevois, je fonde Heal ElectroniX en 2020, spécialisée en réparation électronique et micro-soudure. Depuis, j\'ai acquis la marque PEPE CHICKEN en Suisse et développé une expertise pointue en IA, prompt engineering et automatisation.',
    'Formé à l\'Université de Genève (Scala & IoT), lauréat du Concours d\'Éloquence, interviewé sur RTS — je combine rigueur technique, vision business et capacités oratoires pour résoudre des problèmes complexes.',
  ];
  const bioEn = [
    'Geneva-based tech entrepreneur, I founded Heal ElectroniX in 2020, specializing in electronics repair and micro-soldering. Since then, I acquired the PEPE CHICKEN brand in Switzerland and developed deep expertise in AI, prompt engineering and automation.',
    'Trained at the University of Geneva (Scala & IoT), Eloquence Contest winner, featured on RTS TV — I combine technical rigor, business vision and public speaking skills to solve complex problems.',
  ];

  return (
    <section id="about" className="py-24 bg-white dark:bg-slate-900">
      <div className="section-container">

        {/* Header */}
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="section-tag mb-3 block">{t('about.title')}</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {t('about.subtitle')}
          </h2>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((s, i) => (
            <div
              key={i}
              className="card p-6 text-center"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <AnimatedCounter value={s.value} className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-1 block" />
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {language === 'fr' ? s.labelFr : s.labelEn}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">

          {/* Left: Bio + qualities */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {t('about.bio.title')}
              </h3>
              <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                {(language === 'fr' ? bioFr : bioEn).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Qualities */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {t('about.qualities.title')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {qualities[language].map((q) => (
                  <span
                    key={q}
                    className="px-3.5 py-1.5 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium border border-brand-100 dark:border-brand-800/40"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Languages */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Globe size={18} className="text-brand-600 dark:text-brand-400" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('about.languages.title')}
              </h3>
            </div>
            <div className="space-y-4">
              {languages.map((lang) => (
                <div key={lang.nameEn}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                      {language === 'fr' ? lang.nameFr : lang.nameEn}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{lang.level}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-1000"
                      style={{ width: inView ? `${lang.pct}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div className="grid sm:grid-cols-3 gap-4">
          {trustSignals.map((ts, i) => {
            const Icon = ts.icon;
            return (
              <div key={i} className="card p-6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                    {language === 'fr' ? ts.titleFr : ts.titleEn}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {language === 'fr' ? ts.descFr : ts.descEn}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;
