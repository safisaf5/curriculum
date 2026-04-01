import React from 'react';
import { Brain, TrendingUp, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { services } from '../../data/services';

const iconMap: Record<string, React.ElementType> = {
  Brain,
  TrendingUp,
  Cpu,
};

interface ServicesProps {
  onNavigate: (section: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const { ref, inView } = useInView(0.1);

  return (
    <section id="services" className="py-24 bg-slate-50 dark:bg-slate-800/50">
      <div className="section-container">

        {/* Header */}
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="section-tag mb-3 block">{t('services.title')}</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {t('services.subtitle')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {language === 'fr'
              ? "Des solutions concrètes pour moderniser, automatiser et faire croître votre entreprise."
              : "Concrete solutions to modernize, automate and grow your business."}
          </p>
        </div>

        {/* Service cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon] ?? Brain;
            return (
              <div
                key={service.id}
                className={`card p-8 group hover:-translate-y-1 transition-all duration-700 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.accent} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon size={22} className="text-white" />
                </div>

                {/* Title + description */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {service.title[language]}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  {service.description[language]}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 size={14} className="text-brand-500 flex-shrink-0" />
                      {f[language]}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => onNavigate('contact')}
                  className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold text-sm hover:gap-3 transition-all"
                >
                  {t('services.contact')}
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-8 py-6 shadow-sm">
            <div className="text-left">
              <div className="font-bold text-slate-900 dark:text-white">
                {language === 'fr' ? 'Besoin d\'une solution sur-mesure ?' : 'Need a custom solution?'}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {language === 'fr' ? 'Discutons de votre projet.' : 'Let\'s discuss your project.'}
              </div>
            </div>
            <button
              onClick={() => onNavigate('contact')}
              className="btn-primary flex-shrink-0"
            >
              {language === 'fr' ? 'Prendre contact' : 'Get in touch'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
