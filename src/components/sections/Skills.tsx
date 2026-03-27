import React from 'react';
import { Cpu, Users, Globe, Wrench } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { skills } from '../../data/skills';

const categoryConfig = [
  { Icon: Cpu,    gradient: 'from-brand-500 to-purple-500',  bg: 'bg-brand-50 dark:bg-brand-950/30'  },
  { Icon: Users,  gradient: 'from-emerald-500 to-teal-500',  bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { Icon: Globe,  gradient: 'from-cyan-500 to-blue-500',     bg: 'bg-cyan-50 dark:bg-cyan-950/30'    },
  { Icon: Wrench, gradient: 'from-orange-500 to-amber-500',  bg: 'bg-orange-50 dark:bg-orange-950/30' },
];

const Skills: React.FC = () => {
  const { language, t } = useLanguage();
  const { ref, inView } = useInView(0.1);

  return (
    <section id="skills" className="py-24 bg-white dark:bg-slate-900">
      <div className="section-container">

        {/* Header */}
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="section-tag mb-3 block">{t('skills.title')}</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {t('skills.subtitle')}
          </h2>
        </div>

        {/* Skills grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {skills.map((cat, i) => {
            const cfg = categoryConfig[i] ?? categoryConfig[0];
            const Icon = cfg.Icon;
            return (
              <div
                key={i}
                className={`card p-7 transition-all duration-700 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Category header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-md`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {cat.category[language]}
                  </h3>
                </div>

                {/* Skill tags */}
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((skill) => (
                    <span
                      key={skill}
                      className={`px-3 py-1.5 ${cfg.bg} text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-100 dark:border-slate-700/50 hover:scale-105 transition-transform cursor-default`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tagline */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xl mx-auto">
            {language === 'fr'
              ? 'Une combinaison rare de compétences techniques, business et interpersonnelles — en 5 langues.'
              : 'A rare combination of technical, business and interpersonal skills — across 5 languages.'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Skills;
