import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navIds = ['about', 'services', 'projects', 'experience', 'skills', 'contact'];

const Navigation: React.FC<NavigationProps> = ({ activeSection, onSectionChange }) => {
  const [isScrolled, setIsScrolled]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { language, setLanguage, t }  = useLanguage();
  const { theme, toggleTheme }        = useTheme();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (id: string) => {
    onSectionChange(id);
    setIsMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 group"
            aria-label="Go to top"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
              <span className="text-white font-bold text-sm tracking-tight">SA</span>
            </div>
            <span className="hidden sm:block font-bold text-slate-900 dark:text-white text-lg">
              Safwan<span className="text-brand-600">.</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navIds.map((id) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeSection === id
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/70'
                }`}
              >
                {t(`nav.${id}`)}
              </button>
            ))}
            <Link
              to="/cv"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/70 transition-all duration-150"
            >
              {t('nav.cv')}
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all uppercase tracking-wide"
              aria-label="Toggle language"
            >
              <Globe size={13} />
              {language}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all"
              aria-label={t(theme === 'light' ? 'common.darkMode' : 'common.lightMode')}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* CTA (desktop) */}
            <button
              onClick={() => handleNav('contact')}
              className="hidden md:inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-lg ml-2 transition-all duration-200 shadow-md shadow-brand-600/20 hover:shadow-brand-500/30 hover:-translate-y-px"
            >
              {t('nav.cta')}
            </button>

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
            {navIds.map((id) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === id
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {t(`nav.${id}`)}
              </button>
            ))}
            <Link
              to="/cv"
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-all block"
            >
              {t('nav.cv')}
            </Link>
            <div className="pt-2 pb-1">
              <button
                onClick={() => handleNav('contact')}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-xl transition-all"
              >
                {t('nav.cta')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
