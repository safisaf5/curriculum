import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MessageCircle, Linkedin, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  onNavigate: (section: string) => void;
}

const sectionIds = ['about', 'services', 'projects', 'experience', 'skills', 'contact'];

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80">
      <div className="section-container py-14">
        <div className="grid gap-10 md:grid-cols-3">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/30">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
              <span className="font-bold text-white text-lg">
                Safwan<span className="text-brand-500">.</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {language === 'fr'
                ? "Entrepreneur tech & consultant IA à Genève. J'aide les entreprises à automatiser et croître avec l'IA."
                : 'Tech entrepreneur & AI consultant in Geneva. I help businesses automate and grow with AI.'}
            </p>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-4">
              <MapPin size={14} />
              <span>{t('contact.location')}</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              {language === 'fr' ? 'Navigation' : 'Navigation'}
            </h3>
            <ul className="space-y-2.5">
              {sectionIds.map((id) => (
                <li key={id}>
                  <button
                    onClick={() => onNavigate(id)}
                    className="text-slate-400 hover:text-brand-400 text-sm transition-colors"
                  >
                    {t(`nav.${id}`)}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/cv" className="text-slate-400 hover:text-brand-400 text-sm transition-colors">
                  {t('nav.cv')}
                </Link>
              </li>
              <li>
                <Link to="/card" className="text-slate-400 hover:text-brand-400 text-sm transition-colors">
                  {t('contact.card')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:abdirahman@safwan.ch" className="flex items-center gap-2 text-slate-400 hover:text-brand-400 text-sm transition-colors">
                  <Mail size={15} /> abdirahman@safwan.ch
                </a>
              </li>
              <li>
                <a href="tel:+41789636223" className="flex items-center gap-2 text-slate-400 hover:text-brand-400 text-sm transition-colors">
                  <Phone size={15} /> +41 78 963 62 23
                </a>
              </li>
              <li>
                <a href="https://wa.me/41789636223" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-brand-400 text-sm transition-colors">
                  <MessageCircle size={15} /> WhatsApp
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/safwan-abdirahman" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-brand-400 text-sm transition-colors">
                  <Linkedin size={15} /> LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            © {year} Safwan Abdirahman. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
          </p>
          <p className="text-slate-600 text-xs italic">
            {language === 'fr'
              ? '« Agir avec excellence, servir avec conscience. »'
              : '"Act with excellence, serve with conscience."'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
