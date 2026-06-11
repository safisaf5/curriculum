import React from 'react';
import { Mail, Phone, MessageCircle, CreditCard, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const { ref, inView } = useInView(0.1);

  const contactActions = [
    {
      icon: Mail,
      label: t('contact.email'),
      value: 'abdirahman@safwan.ch',
      href: 'mailto:abdirahman@safwan.ch',
      bg: 'bg-brand-600 hover:bg-brand-500',
      shadow: 'shadow-brand-600/30',
    },
    {
      icon: Phone,
      label: t('contact.phone'),
      value: '+41 78 963 62 23',
      href: 'tel:+41789636223',
      bg: 'bg-slate-700 hover:bg-slate-600',
      shadow: 'shadow-slate-700/30',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: 'WhatsApp',
      href: 'https://wa.me/41789636223',
      bg: 'bg-emerald-600 hover:bg-emerald-500',
      shadow: 'shadow-emerald-600/30',
    },
  ];

  return (
    <section id="contact" className="py-24 bg-slate-950">
      <div className="section-container">

        {/* Header */}
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="section-tag mb-3 block text-brand-400">Contact</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-slate-400 mb-2 font-light">
            {t('contact.subtitle')}
          </p>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
            {t('contact.body')}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          {contactActions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.label}
                href={action.href}
                target={action.href.startsWith('http') ? '_blank' : undefined}
                rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`${action.bg} ${action.shadow} inline-flex items-center justify-center gap-3 text-white font-semibold px-7 py-4 rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group`}
              >
                <Icon size={18} />
                <div className="text-left">
                  <div className="text-xs opacity-70">{action.label}</div>
                  <div className="text-sm font-semibold">{action.value}</div>
                </div>
                <ArrowRight size={15} className="ml-1 group-hover:translate-x-1 transition-transform opacity-70" />
              </a>
            );
          })}
        </div>

        {/* Divider + secondary info */}
        <div className="border-t border-slate-800 pt-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Location */}
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin size={14} />
              <span>{t('contact.location')}</span>
            </div>

            {/* Digital card link */}
            <a
              href="/card"
              className="flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors group"
            >
              <CreditCard size={14} />
              {t('contact.card')} →
            </a>

            {/* Quote */}
            <p className="text-slate-600 text-sm italic max-w-xs text-center sm:text-right">
              "Agir avec excellence, servir avec conscience."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
