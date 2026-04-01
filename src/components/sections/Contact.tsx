import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Contact: React.FC = () => {
  const { t } = useLanguage();

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      label: t('contact.email'),
      value: 'abdirahman@safwan.ch',
      href: 'mailto:abdirahman@safwan.ch',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      label: t('contact.phone'),
      value: '+41 78 963 62 23',
      href: 'tel:+41789636223',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      label: 'Localisation',
      value: 'Genève, Suisse',
      href: null,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${info.color} text-white mb-6 group-hover:scale-110 transition-transform`}>
                    {info.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {info.label}
                  </h3>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                      target={info.href.startsWith('http') ? '_blank' : undefined}
                      rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {info.value}
                    </a>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {info.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Professional Message */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Collaborons ensemble
              </h3>
              <p className="text-blue-100 max-w-2xl mx-auto text-lg leading-relaxed">
                Que ce soit pour un projet innovant, une collaboration entrepreneuriale, 
                ou simplement pour échanger sur les nouvelles technologies, 
                je suis toujours ouvert aux nouvelles opportunités.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;