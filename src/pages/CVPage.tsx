import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer, Briefcase, GraduationCap, Globe, Award, Shield, Users,
  ChevronDown, ChevronUp, Mail, Phone, MapPin, ExternalLink,
  Code, Heart, Star, BookOpen, Mic, ThumbsUp, ArrowLeft, Moon, Sun
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useInView } from '../hooks/useInView';
import { useTheme } from '../contexts/ThemeContext';
import { cvData } from '../data/cv';

const getStr = (val: string | { fr: string; en: string }, lang: 'fr' | 'en'): string => {
  if (typeof val === 'string') return val;
  return val[lang];
};

const CVPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { ref, inView } = useInView(0.05);
  const [showAllExp, setShowAllExp] = useState(false);
  const [showAllEdu, setShowAllEdu] = useState(false);

  const handlePrint = () => {
    setShowAllExp(true);
    setShowAllEdu(true);
    setTimeout(() => window.print(), 200);
  };

  const visibleExp = showAllExp ? cvData.experience : cvData.experience.slice(0, 6);
  const visibleEdu = showAllEdu ? cvData.education : cvData.education.slice(0, 5);

  const typeColors: Record<string, string> = {
    work: 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400',
    military: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    stage: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    volunteer: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  };

  const typeLabels: Record<string, { fr: string; en: string }> = {
    work: { fr: 'Emploi', en: 'Employment' },
    military: { fr: 'Militaire', en: 'Military' },
    stage: { fr: 'Stage', en: 'Internship' },
    volunteer: { fr: 'Bénévole', en: 'Volunteer' },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <style>{`
        @media print {
          .print-hide { display: none !important; }
          #cv { padding-top: 0 !important; background: white !important; }
          #cv * { color: #1a1a1a !important; border-color: #e2e8f0 !important; }
        }
      `}</style>

      {/* Top bar */}
      <header className="print-hide fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors">
            <ArrowLeft size={16} />
            {language === 'fr' ? 'Retour au site' : 'Back to site'}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all uppercase tracking-wide"
            >
              <Globe size={13} />
              {language}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <section id="cv" className="pt-24 pb-24 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <span className="section-tag mb-3 block">{t('cv.title')}</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {t('cv.subtitle')}
            </h2>
            <button
              onClick={handlePrint}
              className="print-hide inline-flex items-center gap-2 mt-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-600/25 hover:shadow-brand-500/40 hover:-translate-y-0.5"
            >
              <Printer size={18} />
              {t('cv.print')}
            </button>
          </div>

          {/* ===== PROFILE CARD ===== */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-8 mb-8 text-white shadow-xl shadow-brand-600/20">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <img
                src="/IMG_8964.JPG"
                alt="Safwan Abdirahman"
                className="w-28 h-28 rounded-full object-cover object-top border-4 border-white/20 shadow-xl"
              />
              <div className="text-center md:text-left flex-1">
                <h3 className="text-3xl font-bold mb-1">{cvData.profile.name}</h3>
                <p className="text-xl text-brand-200 mb-1">{getStr(cvData.profile.title, language)}</p>
                <p className="text-sm text-brand-300 mb-4">
                  {getStr(cvData.profile.nationality, language)} — {getStr(cvData.profile.origin, language)}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <a href={`mailto:${cvData.profile.contact.email}`} className="flex items-center gap-1.5 hover:text-brand-200 transition-colors">
                    <Mail size={14} /> {cvData.profile.contact.email}
                  </a>
                  <a href={`tel:${cvData.profile.contact.phone.replace(/\s|\(|\)/g, '')}`} className="flex items-center gap-1.5 hover:text-brand-200 transition-colors">
                    <Phone size={14} /> {cvData.profile.contact.phone}
                  </a>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} /> {getStr(cvData.profile.location, language)}
                  </span>
                  <a href={cvData.profile.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-brand-200 transition-colors">
                    <ExternalLink size={14} /> LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ===== SUMMARY ===== */}
          <div className="card p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
                <BookOpen size={18} className="text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('cv.summary')}</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {getStr(cvData.profile.summary, language)}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* ===== LEFT COLUMN ===== */}
            <div className="space-y-8">

              {/* EXPERIENCE */}
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
                    <Briefcase size={18} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('cv.experience')}</h3>
                  <span className="ml-auto text-xs font-semibold text-slate-400">{cvData.experience.length}</span>
                </div>
                <div className="space-y-4">
                  {visibleExp.map((exp, i) => (
                    <div key={i} className="relative pl-5 border-l-2 border-brand-200 dark:border-brand-800 hover:border-brand-500 transition-colors">
                      <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-brand-500" />
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeColors[exp.type]}`}>
                          {getStr(typeLabels[exp.type], language)}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{getStr(exp.period, language)}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{getStr(exp.title, language)}</h4>
                      <p className="text-brand-600 dark:text-brand-400 font-semibold text-xs">{getStr(exp.company, language)}</p>
                      {exp.location && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {getStr(exp.location, language)}
                        </p>
                      )}
                      {exp.description && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">{getStr(exp.description, language)}</p>
                      )}
                    </div>
                  ))}
                </div>
                {cvData.experience.length > 6 && (
                  <button
                    onClick={() => setShowAllExp(!showAllExp)}
                    className="print-hide mt-5 flex items-center gap-1.5 mx-auto text-brand-600 dark:text-brand-400 hover:text-brand-500 text-sm font-semibold transition-colors"
                  >
                    {showAllExp ? t('cv.showLess') : `${t('cv.showMore')} (+${cvData.experience.length - 6})`}
                    {showAllExp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>

              {/* AWARDS */}
              <div className="card p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border-amber-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                    <Award size={18} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('cv.awards')}</h3>
                </div>
                <div className="space-y-4">
                  {cvData.awards.map((award, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Star size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{getStr(award.title, language)}</h4>
                        <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{getStr(award.event, language)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{award.date}</p>
                        {award.details && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{getStr(award.details, language)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PUBLICATIONS */}
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
                    <Mic size={18} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('cv.publications')}</h3>
                </div>
                <div className="space-y-4">
                  {cvData.publications.map((pub, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{getStr(pub.title, language)}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{getStr(pub.summary, language)}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>{pub.date}</span>
                        <span className="flex items-center gap-1"><ThumbsUp size={11} /> {pub.reactions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== RIGHT COLUMN ===== */}
            <div className="space-y-8">

              {/* EDUCATION */}
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                    <GraduationCap size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('cv.education')}</h3>
                </div>
                <div className="space-y-4">
                  {visibleEdu.map((edu, i) => (
                      <div key={i} className="relative pl-5 border-l-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 transition-colors">
                        <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="text-xs text-slate-400 font-medium mb-0.5">{getStr(edu.period, language)}</p>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{getStr(edu.degree, language)}</h4>
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">{getStr(edu.institution, language)}</p>
                        {edu.status && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 rounded-full text-xs font-semibold">
                            {getStr(edu.status, language)}
                          </span>
                        )}
                        {edu.speciality && (
                          <p className="text-xs text-slate-500 mt-1">
                            {language === 'fr' ? 'Option spécifique' : 'Specialty'}: {getStr(edu.speciality, language)}
                          </p>
                        )}
                        {edu.average && (
                          <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                            {language === 'fr' ? 'Moyenne' : 'Average'}: {edu.average}
                          </p>
                        )}
                        {edu.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{getStr(edu.description, language)}</p>
                        )}
                      </div>
                  ))}
                </div>
                {cvData.education.length > 5 && (
                  <button
                    onClick={() => setShowAllEdu(!showAllEdu)}
                    className="print-hide mt-5 flex items-center gap-1.5 mx-auto text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 text-sm font-semibold transition-colors"
                  >
                    {showAllEdu ? t('cv.showLess') : `${t('cv.showMore')} (+${cvData.education.length - 5})`}
                    {showAllEdu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>

              {/* LANGUAGES */}
              <div className="card p-8 bg-gradient-to-br from-indigo-50 to-brand-50 dark:from-slate-800 dark:to-slate-800 border-indigo-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
                    <Globe size={18} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('cv.languages')}</h3>
                </div>
                <div className="space-y-3">
                  {cvData.languages.map((lang, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/80 dark:bg-slate-700/50">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{getStr(lang.name, language)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                            {lang.cecrl}
                          </span>
                          <span className="text-xs text-slate-500">{getStr(lang.level, language)}</span>
                        </div>
                      </div>
                      {lang.certification && <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{lang.certification}</p>}
                      {lang.certDetails && <p className="text-xs text-slate-400 mt-0.5">{getStr(lang.certDetails, language)}</p>}
                      {lang.details && <p className="text-xs text-slate-400 mt-0.5">{getStr(lang.details, language)}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* SKILLS */}
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
                    <Code size={18} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('cv.skills')}</h3>
                </div>
                <div className="space-y-5">
                  {Object.entries(cvData.skills).filter(([key]) => key !== 'personal').map(([key, cat]) => (
                    <div key={key}>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-widest mb-2">{getStr(cat.label, language)}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map((item: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 rounded-full text-xs font-medium border border-brand-100 dark:border-brand-800/40">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Heart size={12} className="text-pink-500" />
                      {getStr(cvData.skills.personal.label, language)}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {cvData.skills.personal.items.map((item, i) => (
                        <span key={i} className="px-2.5 py-1 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 rounded-full text-xs font-medium border border-pink-100 dark:border-pink-800/40">
                          {getStr(item, language)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* PERMITS */}
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                    <Shield size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('cv.permits')}</h3>
                </div>
                <div className="space-y-2">
                  {cvData.permits.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <span className="font-medium text-slate-900 dark:text-white text-sm">{getStr(p.name, language)}</span>
                      <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                        {getStr(p.category, language)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* HOBBIES */}
              <div className="card p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-800 border-purple-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
                    <Heart size={18} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('cv.hobbies')}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cvData.hobbies.map((h, i) => (
                    <span key={i} className="px-3.5 py-1.5 bg-white/80 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 rounded-full text-sm font-medium border border-purple-100 dark:border-slate-600">
                      {getStr(h, language)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== ASSOCIATIONS - Full width ===== */}
          <div className="mt-8 card p-8 bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-brand-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/40 flex items-center justify-center">
                <Users size={18} className="text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('cv.associations')}</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cvData.associations.map((assoc, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/80 dark:bg-slate-700/50 hover:shadow-md transition-all">
                  <span className="inline-block px-2 py-0.5 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 rounded-full text-xs font-semibold mb-2">
                    {getStr(assoc.role, language)}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{getStr(assoc.name, language)}</h4>
                  {assoc.period && <p className="text-xs text-slate-400 mt-1">{getStr(assoc.period, language)}</p>}
                  {assoc.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{getStr(assoc.description, language)}</p>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default CVPage;
