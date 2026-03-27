import React from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface HomeProps {
  onNavigate: (section: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();

  const handleViewCV = () => {
    window.open('https://www.canva.com/design/DAEmzGFLTe8/zepS7WwwMDJG7OrvP5m67A/edit?utm_content=DAEmzGFLTe8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton', '_blank');
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Profile Image */}
        <div className="mb-4 sm:mb-6">
          <div className="relative inline-block">
            <img
              src="/IMG_8964.JPG"
              alt="Safwan Abdirahman"
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover shadow-2xl border-4 border-white dark:border-gray-800"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20"></div>
          </div>
        </div>

        {/* Name and Title */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Safwan Abdirahman
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light">
            {language === 'fr' ? 'Entrepreneur & Innovateur' : 'Entrepreneur & Innovator'}
          </p>
        </div>

        {/* Quote */}
        <div className="mb-6 sm:mb-8">
          <blockquote className="text-lg sm:text-xl md:text-2xl font-light text-gray-700 dark:text-gray-300 italic border-l-4 border-blue-500 pl-4 sm:pl-6 max-w-3xl mx-auto">
            "{t('home.quote')}"
          </blockquote>
        </div>

        {/* Introduction */}
        <div className="mb-6 sm:mb-8">
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl mx-auto">
            {t('home.intro')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <button
            onClick={() => onNavigate('about')}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {t('home.cta')}
            <ChevronDown className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          
          <button
            onClick={handleViewCV}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <ExternalLink className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            {language === 'fr' ? 'Voir mon CV' : 'View my CV'}
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-gray-400 dark:text-gray-600" />
      </div>
    </section>
  );
};

export default Home;