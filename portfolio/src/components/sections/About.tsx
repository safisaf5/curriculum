import React from 'react';
import { User, Award, Globe, BookOpen } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const About: React.FC = () => {
  const { t, language } = useLanguage();

  const qualities = t('about.qualities.items').split(' • ');
  
  const languages = [
    { name: t('about.languages.french'), level: 'native' },
    { name: t('about.languages.arabic'), level: 'native' },
    { name: t('about.languages.english'), level: 'B2' },
    { name: t('about.languages.italian'), level: 'B2' },
    { name: t('about.languages.german'), level: 'A2' },
  ];

  const bioContent = {
    fr: [
      "Diplômé du Collège Voltaire avec une maturité gymnasiale mention en Biochimie (2020-2024), je me suis spécialisé dans les technologies émergentes et l'entrepreneuriat.",
      "Ma formation diversifiée inclut la programmation Scala & IoT par l'Université de Genève, un diplôme cantonal de cafetier, et une solide expérience en électronique et réparation d'appareils.",
      "Polyglotte accompli et leader naturel, je préside l'association Les GEunes et participe activement au Club Genevois de Débat. Lauréat du Concours Genevois d'Éloquence 2023-2024.",
      "Actuellement CEO de Heal ElectroniX depuis 2020, j'ai récemment acquis la marque PEPE CHICKEN en Suisse, marquant mon expansion dans le secteur de la restauration."
    ],
    en: [
      "Graduate of Collège Voltaire with a high school diploma with honors in Biochemistry (2020-2024), I specialized in emerging technologies and entrepreneurship.",
      "My diverse training includes Scala & IoT programming from the University of Geneva, a cantonal café owner diploma, and solid experience in electronics and device repair.",
      "An accomplished polyglot and natural leader, I chair the Les GEunes association and actively participate in the Geneva Debate Club. Winner of the Geneva Eloquence Contest 2023-2024.",
      "Currently CEO of Heal ElectroniX since 2020, I recently acquired the PEPE CHICKEN brand in Switzerland, marking my expansion into the restaurant sector."
    ]
  };

  const keyEducation = {
    fr: [
      {
        title: "Maturité Gymnasiale avec Mention",
        subtitle: "Collège Voltaire • Spécialité Biochimie • 2020-2024"
      },
      {
        title: "Patente de Cafetier",
        subtitle: "IFAGE Genève • Novembre 2024"
      },
      {
        title: "Formation Scala & IoT",
        subtitle: "Université de Genève & HEG • Automne 2022"
      }
    ],
    en: [
      {
        title: "High School Diploma with Honors",
        subtitle: "Collège Voltaire • Biochemistry Specialty • 2020-2024"
      },
      {
        title: "Café Owner License",
        subtitle: "IFAGE Geneva • November 2024"
      },
      {
        title: "Scala & IoT Training",
        subtitle: "University of Geneva & HEG • Fall 2022"
      }
    ]
  };

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('about.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('about.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Biography */}
          <div className="space-y-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('about.bio.title')}
                </h3>
              </div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {bioContent[language].map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Personal Qualities */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('about.qualities.title')}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {qualities.map((quality, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {quality}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Languages & Education */}
          <div className="space-y-8">
            {/* Languages */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('about.languages.title')}
                </h3>
              </div>
              <div className="space-y-4">
                {languages.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {lang.name}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      lang.level === 'native' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {lang.level === 'native' ? (language === 'fr' ? 'Natif' : 'Native') : lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Education Highlights */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {language === 'fr' ? 'Formations clés' : 'Key Education'}
                </h3>
              </div>
              <div className="space-y-4">
                {keyEducation[language].map((education, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {education.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {education.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;