import React, { useState } from 'react';
import {
  Printer, Briefcase, GraduationCap, Globe, Award, Shield, Users,
  ChevronDown, ChevronUp, Mail, Phone, MapPin, ExternalLink,
  Code, Heart, Star, BookOpen, Mic, ThumbsUp
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cvData } from '../../data/cv';

const getStr = (val: string | { fr: string; en: string }, lang: 'fr' | 'en'): string => {
  if (typeof val === 'string') return val;
  return val[lang];
};

const CV: React.FC = () => {
  const { t, language } = useLanguage();
  const [showAllExp, setShowAllExp] = useState(false);
  const [showGrades, setShowGrades] = useState(false);
  const [showAllEdu, setShowAllEdu] = useState(false);

  const handlePrint = () => {
    setShowAllExp(true);
    setShowAllEdu(true);
    setShowGrades(true);
    setTimeout(() => window.print(), 200);
  };

  const visibleExp = showAllExp ? cvData.experience : cvData.experience.slice(0, 6);
  const visibleEdu = showAllEdu ? cvData.education : cvData.education.slice(0, 5);

  const typeColors: Record<string, string> = {
    work: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    military: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    stage: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    volunteer: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const typeLabels: Record<string, { fr: string; en: string }> = {
    work: { fr: 'Emploi', en: 'Employment' },
    military: { fr: 'Militaire', en: 'Military' },
    stage: { fr: 'Stage', en: 'Internship' },
    volunteer: { fr: 'Bénévole', en: 'Volunteer' },
  };

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          nav, #home, #about, #experience, #projects, #skills, #media, #contact, .print-hide { display: none !important; }
          #cv { padding-top: 0 !important; background: white !important; }
          #cv * { color: #1a1a1a !important; }
          .dark #cv * { background: white !important; }
        }
      `}</style>

      <section id="cv" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('cv.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {t('cv.subtitle')}
            </p>
            <button
              onClick={handlePrint}
              className="print-hide inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Printer className="h-5 w-5 mr-2" />
              {t('cv.print')}
            </button>
          </div>

          {/* ===== PROFILE CARD ===== */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <img
                src="/IMG_8964.JPG"
                alt="Safwan Abdirahman"
                className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-xl"
              />
              <div className="text-center md:text-left flex-1">
                <h3 className="text-3xl font-bold mb-1">{cvData.profile.name}</h3>
                <p className="text-xl text-blue-100 mb-4">{getStr(cvData.profile.title, language)}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <a href={`mailto:${cvData.profile.contact.email}`} className="flex items-center gap-1.5 hover:text-blue-200 transition-colors">
                    <Mail className="h-4 w-4" /> {cvData.profile.contact.email}
                  </a>
                  <a href={`tel:${cvData.profile.contact.phone.replace(/\s|\(|\)/g, '')}`} className="flex items-center gap-1.5 hover:text-blue-200 transition-colors">
                    <Phone className="h-4 w-4" /> {cvData.profile.contact.phone}
                  </a>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {getStr(cvData.profile.location, language)}
                  </span>
                  <a href={cvData.profile.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-200 transition-colors">
                    <ExternalLink className="h-4 w-4" /> LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ===== PROFESSIONAL SUMMARY ===== */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cv.summary')}</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {getStr(cvData.profile.summary, language)}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* ===== LEFT COLUMN ===== */}
            <div className="space-y-8">

              {/* EXPERIENCE */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cv.experience')}</h3>
                  <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{cvData.experience.length}</span>
                </div>
                <div className="space-y-4">
                  {visibleExp.map((exp, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[exp.type]}`}>
                          {getStr(typeLabels[exp.type], language)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{getStr(exp.period, language)}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{getStr(exp.title, language)}</h4>
                      <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">{getStr(exp.company, language)}</p>
                      {exp.location && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {getStr(exp.location, language)}
                        </p>
                      )}
                      {exp.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">{getStr(exp.description, language)}</p>
                      )}
                    </div>
                  ))}
                </div>
                {cvData.experience.length > 6 && (
                  <button
                    onClick={() => setShowAllExp(!showAllExp)}
                    className="print-hide mt-4 flex items-center gap-2 mx-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium transition-colors"
                  >
                    {showAllExp ? t('cv.showLess') : t('cv.showMore')} ({cvData.experience.length - 6} {language === 'fr' ? 'de plus' : 'more'})
                    {showAllExp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                )}
              </div>

              {/* AWARDS */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <Award className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cv.awards')}</h3>
                </div>
                <div className="space-y-4">
                  {cvData.awards.map((award, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Star className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{getStr(award.title, language)}</h4>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{getStr(award.event, language)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{award.date}</p>
                          {award.details && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{getStr(award.details, language)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PUBLICATIONS */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <Mic className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cv.publications')}</h3>
                </div>
                <div className="space-y-4">
                  {cvData.publications.map((pub, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-gray-900 dark:text-white">{getStr(pub.title, language)}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getStr(pub.summary, language)}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{pub.date}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {pub.reactions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== RIGHT COLUMN ===== */}
            <div className="space-y-8">

              {/* EDUCATION */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cv.education')}</h3>
                </div>
                <div className="space-y-4">
                  {visibleEdu.map((edu, i) => {
                    const isVoltaire = edu.grades !== undefined;
                    return (
                      <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border-l-4 border-green-500">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{getStr(edu.period, language)}</p>
                        <h4 className="font-bold text-gray-900 dark:text-white">{getStr(edu.degree, language)}</h4>
                        <p className="text-green-600 dark:text-green-400 font-medium text-sm">{getStr(edu.institution, language)}</p>
                        {edu.status && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs font-medium">
                            {getStr(edu.status, language)}
                          </span>
                        )}
                        {edu.speciality && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {language === 'fr' ? 'Option spécifique' : 'Specialty'}: {getStr(edu.speciality, language)}
                          </p>
                        )}
                        {edu.average && (
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                            {language === 'fr' ? 'Moyenne' : 'Average'}: {edu.average}
                          </p>
                        )}
                        {edu.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{getStr(edu.description, language)}</p>
                        )}

                        {/* Voltaire grades expandable */}
                        {isVoltaire && (
                          <div className="mt-3">
                            <button
                              onClick={() => setShowGrades(!showGrades)}
                              className="print-hide flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                            >
                              {t('cv.grades')}
                              {showGrades ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            {showGrades && edu.grades && (
                              <div className="mt-3 space-y-1">
                                {edu.tmTitle && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">
                                    TM: "{getStr(edu.tmTitle, language)}"
                                  </p>
                                )}
                                <div className="grid grid-cols-1 gap-1">
                                  {edu.grades.map((g, gi) => (
                                    <div key={gi} className="flex justify-between items-center text-sm py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                                      <span className="text-gray-700 dark:text-gray-300">{getStr(g.subject, language)}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">{g.type}</span>
                                        <span className={`font-bold ${parseFloat(g.grade) >= 5.5 ? 'text-green-600 dark:text-green-400' : parseFloat(g.grade) >= 5.0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                          {g.grade}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {cvData.education.length > 5 && (
                  <button
                    onClick={() => setShowAllEdu(!showAllEdu)}
                    className="print-hide mt-4 flex items-center gap-2 mx-auto text-green-600 dark:text-green-400 hover:text-green-700 font-medium transition-colors"
                  >
                    {showAllEdu ? t('cv.showLess') : t('cv.showMore')} ({cvData.education.length - 5} {language === 'fr' ? 'de plus' : 'more'})
                    {showAllEdu ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                )}
              </div>

              {/* LANGUAGES */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cv.languages')}</h3>
                </div>
                <div className="space-y-3">
                  {cvData.languages.map((lang, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900 dark:text-white">{getStr(lang.name, language)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                            {lang.cecrl}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{getStr(lang.level, language)}</span>
                        </div>
                      </div>
                      {lang.certification && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{lang.certification}</p>
                      )}
                      {lang.certDetails && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{getStr(lang.certDetails, language)}</p>
                      )}
                      {lang.details && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{getStr(lang.details, language)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SKILLS */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <Code className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cv.skills')}</h3>
                </div>
                <div className="space-y-5">
                  {Object.entries(cvData.skills).filter(([key]) => key !== 'personal').map(([key, cat]) => (
                    <div key={key}>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{getStr(cat.label, language)}</h4>
                      <div className="flex flex-wrap gap-2">
                        {cat.items.map((item: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Personal skills */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      {getStr(cvData.skills.personal.label, language)}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cvData.skills.personal.items.map((item, i) => (
                        <span key={i} className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 rounded-full text-xs font-medium">
                          {getStr(item, language)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* PERMITS */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cv.certifications')}</h3>
                </div>
                <div className="space-y-3">
                  {cvData.permits.map((p, i) => (
                    <div key={i} className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{getStr(p.name, language)}</span>
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        {getStr(p.category, language)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* HOBBIES */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cv.hobbies')}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cvData.hobbies.map((h, i) => (
                    <span key={i} className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium shadow-sm">
                      {getStr(h, language)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== ASSOCIATIONS - Full width ===== */}
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cv.associations')}</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cvData.associations.map((assoc, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs font-medium mb-2">
                    {getStr(assoc.role, language)}
                  </span>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">{getStr(assoc.name, language)}</h4>
                  {assoc.period && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getStr(assoc.period, language)}</p>
                  )}
                  {assoc.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{getStr(assoc.description, language)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default CV;
