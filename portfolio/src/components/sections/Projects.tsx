import React from 'react';
import { Code, Lightbulb } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { projects } from '../../data/projects';

const Projects: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('projects.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('projects.subtitle')}
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="group bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Project Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-lg">
                  {index === 0 ? (
                    <Lightbulb className="h-6 w-6 text-white" />
                  ) : (
                    <Code className="h-6 w-6 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {project.year}
                </span>
              </div>

              {/* Project Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {project.title[language]}
              </h3>

              {/* Project Description */}
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                {project.description[language]}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Projects Teaser */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Plus de projets à venir
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Je travaille constamment sur de nouveaux projets innovants dans les domaines de l'IA, 
              de l'électronique et des technologies émergentes. Restez connecté pour découvrir mes prochaines créations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;