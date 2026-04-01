import React from 'react';
import { Watch, ScanLine, Sparkles, ExternalLink, Brain, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { projects } from '../../data/projects';

const projectIcons = [Watch, ScanLine, Sparkles];
const projectGradients = [
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
  'from-violet-500 to-purple-500',
];

const Projects: React.FC = () => {
  const { language, t } = useLanguage();
  const { ref, inView } = useInView(0.1);

  const featuredProject = projects.find((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="py-24 bg-white dark:bg-slate-900">
      <div className="section-container">

        {/* Header */}
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="section-tag mb-3 block">{t('projects.title')}</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {t('projects.subtitle')}
          </h2>
        </div>

        {/* Featured project */}
        {featuredProject && (
          <div
            className={`mb-10 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <a
              href={featuredProject.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-[1px]">
                <div className="relative rounded-2xl bg-slate-900 dark:bg-slate-950 p-8 sm:p-10 md:p-12 overflow-hidden">
                  {/* Background glow */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
                  <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div className="flex-1 min-w-0">
                      {/* Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {language === 'fr' ? 'Projet principal' : 'Featured project'}
                      </div>

                      {/* Icon + Title */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                          <Brain size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                            {featuredProject.title[language]}
                          </h3>
                          <span className="text-xs font-semibold text-emerald-400/70">
                            {featuredProject.year}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-300 text-base leading-relaxed mb-6 max-w-2xl">
                        {featuredProject.description[language]}
                      </p>

                      {/* Tech tags */}
                      <div className="flex flex-wrap gap-2">
                        {featuredProject.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-white/5 text-slate-300 rounded-lg text-xs font-medium border border-white/10"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex-shrink-0 flex lg:flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 group-hover:shadow-emerald-500/40 transition-all">
                        <ArrowUpRight size={24} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-400 group-hover:text-emerald-400 transition-colors">
                        neuronia.ch
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        )}

        {/* Other project cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {otherProjects.map((project, i) => {
            const Icon = projectIcons[i] ?? Sparkles;
            const gradient = projectGradients[i] ?? projectGradients[0];
            return (
              <div
                key={project.id}
                className={`card group overflow-hidden transition-all duration-700 hover:-translate-y-1 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(i + 1) * 100}ms` }}
              >
                {/* Card top band */}
                <div className={`h-2 bg-gradient-to-r ${gradient}`} />

                <div className="p-7">
                  {/* Icon + year */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-2.5 py-1 rounded-full">
                      {project.year}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 leading-snug">
                    {project.title[language]}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-5">
                    {project.description[language]}
                  </p>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 bg-slate-50 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium border border-slate-100 dark:border-slate-600/40"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* More coming */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-xl px-6 py-3">
            <ExternalLink size={14} />
            {t('projects.more')}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
