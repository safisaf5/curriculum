import React from 'react';
import { Code, User, Globe, Monitor } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { skills } from '../../data/skills';

const Skills: React.FC = () => {
  const { t, language } = useLanguage();

  const getIcon = (index: number) => {
    const icons = [Code, User, Globe, Monitor];
    const IconComponent = icons[index] || Code;
    return <IconComponent className="h-6 w-6" />;
  };

  const getGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500'
    ];
    return gradients[index] || gradients[0];
  };

  return (
    <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('skills.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('skills.subtitle')}
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {skills.map((skillCategory, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Category Header */}
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${getGradient(index)} text-white mr-4`}>
                  {getIcon(index)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {skillCategory.category[language]}
                </h3>
              </div>

              {/* Skills List */}
              <div className="grid grid-cols-1 gap-3">
                {skillCategory.items.map((skill, skillIndex) => (
                  <div
                    key={skillIndex}
                    className="group flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getGradient(index)} mr-3 group-hover:scale-125 transition-transform`}></div>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Skills Summary */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Expertise polyvalente
            </h3>
            <p className="text-blue-100 max-w-3xl mx-auto text-lg">
              Ma formation diversifiée et mon expérience pratique me permettent d'aborder les défis 
              technologiques avec une approche holistique, combinant compétences techniques, 
              leadership et vision stratégique.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;