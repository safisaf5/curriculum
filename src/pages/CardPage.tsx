import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Phone, Mail, MessageCircle, Globe, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CARD_URL = typeof window !== 'undefined' ? window.location.origin + '/card' : 'https://safwan.ch/card';

const actions = [
  {
    icon: Phone,
    labelFr: 'Appeler',
    labelEn: 'Call',
    value: '+41 78 963 62 23',
    href: 'tel:+41789636223',
    bg: 'bg-slate-800 hover:bg-slate-700',
    textColor: 'text-white',
  },
  {
    icon: MessageCircle,
    labelFr: 'WhatsApp',
    labelEn: 'WhatsApp',
    value: 'WhatsApp',
    href: 'https://wa.me/41789636223',
    bg: 'bg-emerald-500 hover:bg-emerald-400',
    textColor: 'text-white',
  },
  {
    icon: Mail,
    labelFr: 'Email',
    labelEn: 'Email',
    value: 'abdirahman@safwan.ch',
    href: 'mailto:abdirahman@safwan.ch',
    bg: 'bg-brand-600 hover:bg-brand-500',
    textColor: 'text-white',
  },
  {
    icon: Globe,
    labelFr: 'Site web',
    labelEn: 'Website',
    value: 'safwan.ch',
    href: '/',
    bg: 'bg-white/10 hover:bg-white/15 border border-white/20',
    textColor: 'text-white',
  },
];

const CardPage: React.FC = () => {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Back link */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">{lang === 'fr' ? 'Site principal' : 'Main site'}</span>
        </Link>
      </div>

      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          className="text-slate-500 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>
      </div>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main card */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">

          {/* Profile */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-5">
              {/* Rings */}
              <div className="absolute inset-0 rounded-full border border-brand-500/30 scale-110" />
              <div className="absolute inset-0 rounded-full border border-brand-500/10 scale-125" />
              <img
                src="/IMG_8964.JPG"
                alt="Safwan Abdirahman"
                width={112}
                height={112}
                decoding="async"
                className="w-28 h-28 rounded-full object-cover object-top border-2 border-brand-500/40 shadow-xl shadow-brand-500/20"
              />
              {/* Online dot */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-950 shadow" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-1">Safwan Abdirahman</h1>
            <p className="text-brand-400 font-semibold text-sm mb-3">
              {lang === 'fr' ? 'Entrepreneur Tech · Consultant IA' : 'Tech Entrepreneur · AI Consultant'}
            </p>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[260px] mx-auto">
              {lang === 'fr'
                ? "J'aide les entreprises à automatiser et croître avec l'IA."
                : 'I help businesses automate and grow with AI.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 mb-8">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.href}
                  href={action.href}
                  target={action.href.startsWith('http') ? '_blank' : undefined}
                  rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`${action.bg} ${action.textColor} flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-semibold transition-all duration-200 active:scale-98 hover:-translate-y-px`}
                >
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs opacity-70">
                      {lang === 'fr' ? action.labelFr : action.labelEn}
                    </div>
                    <div className="text-sm font-semibold truncate">{action.value}</div>
                  </div>
                  <ExternalLink size={14} className="opacity-40 flex-shrink-0" />
                </a>
              );
            })}
          </div>

          {/* QR Code */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-slate-400 text-xs mb-3 uppercase tracking-wider font-medium">
              {lang === 'fr' ? 'Scannez pour me contacter' : 'Scan to connect with me'}
            </p>
            <div className="flex justify-center mb-3">
              <div className="bg-white p-3 rounded-xl">
                <QRCodeSVG
                  value={CARD_URL}
                  size={128}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  level="M"
                />
              </div>
            </div>
            <p className="text-slate-600 text-xs">{CARD_URL}</p>
          </div>

          {/* Location tag */}
          <div className="mt-6 text-center">
            <span className="text-slate-600 text-xs">📍 Genève, Suisse</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPage;
