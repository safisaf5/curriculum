import React from 'react';
import { Tv, Newspaper, Mic, Camera, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Media: React.FC = () => {
  const { t, language } = useLanguage();

  const mediaAppearances = [
    {
      title: {
        fr: 'Témoignage sur la politique - RTS',
        en: 'Political Testimony - RTS'
      },
      description: {
        fr: 'Interview télévisée sur l\'engagement politique des jeunes',
        en: 'Television interview on young people\'s political engagement'
      },
      type: {
        fr: 'Télévision',
        en: 'Television'
      },
      date: '2024',
      url: 'https://www.rts.ch/play/tv/lactu-en-video/video/le-temoignage-de-safwan-abdirahman?urn=urn:rts:video:14370758',
      icon: <Tv className="h-6 w-6" />
    },
    {
      title: {
        fr: 'Interview Entrepreneuriat',
        en: 'Entrepreneurship Interview'
      },
      description: {
        fr: 'Discussion sur mon parcours entrepreneurial et mes projets',
        en: 'Discussion about my entrepreneurial journey and projects'
      },
      type: {
        fr: 'YouTube',
        en: 'YouTube'
      },
      date: '2024',
      url: 'https://www.youtube.com/watch?v=4KK-bxnwAUo',
      icon: <Camera className="h-6 w-6" />
    }
  ];

  const mediaTypes = [
    {
      icon: <Tv className="h-8 w-8" />,
      title: {
        fr: 'Télévision',
        en: 'Television'
      },
      description: {
        fr: 'Interviews et reportages télévisés',
        en: 'Television interviews and reports'
      }
    },
    {
      icon: <Newspaper className="h-8 w-8" />,
      title: {
        fr: 'Presse écrite',
        en: 'Print Media'
      },
      description: {
        fr: 'Articles et portraits dans la presse',
        en: 'Press articles and profiles'
      }
    },
    {
      icon: <Mic className="h-8 w-8" />,
      title: {
        fr: 'Podcasts',
        en: 'Podcasts'
      },
      description: {
        fr: 'Interventions dans des podcasts spécialisés',
        en: 'Appearances on specialized podcasts'
      }
    },
    {
      icon: <Camera className="h-8 w-8" />,
      title: {
        fr: 'Événements',
        en: 'Events'
      },
      description: {
        fr: 'Conférences et prises de parole publiques',
        en: 'Conferences and public speaking'
      }
    }
  ];

  return (
    <section id="media" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('media.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('media.subtitle')}
          </p>
        </div>

        {/* Media Appearances */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {language === 'fr' ? 'Apparitions Médias' : 'Media Appearances'}
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {mediaAppearances.map((media, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-lg text-white mr-4">
                    {media.icon}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {media.type[language]} • {media.date}
                    </span>
                  </div>
                </div>
                
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {media.title[language]}
                </h4>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {media.description[language]}
                </p>
                
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <span className="text-sm">
                    {language === 'fr' ? 'Voir l\'interview' : 'Watch interview'}
                  </span>
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Media Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {mediaTypes.map((type, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-4">
                {type.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {type.title[language]}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {type.description[language]}
              </p>
            </div>
          ))}
        </div>

        {/* Future Content Section */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-12">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {language === 'fr' ? 'Plus de contenu à venir' : 'More content coming soon'}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {language === 'fr' 
                  ? 'Restez connecté pour découvrir mes prochaines interventions médiatiques, interviews et prises de parole publiques sur l\'entrepreneuriat et l\'innovation.'
                  : 'Stay connected to discover my upcoming media appearances, interviews and public speaking engagements on entrepreneurship and innovation.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Media;