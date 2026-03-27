import React from 'react';
import { Watch, ScanLine, Sparkles, ExternalLink } from 'lucide-react';
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

        {/* Project cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {projects.map((project, i) => {
            const Icon = projectIcons[i] ?? Sparkles;
            const gradient = projectGradients[i] ?? projectGradients[0];
            return (
              <div
                key={project.id}
                className={`card group overflow-hidden transition-all duration-700 hover:-translate-y-1 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
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
