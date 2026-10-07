import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('terranova_lang');
      if (saved === 'fr' || saved === 'ar') return saved;
      return 'fr';
    } catch {
      return 'fr';
    }
  });

  const isRtl = language === 'ar';

  useEffect(() => {
    try {
      document.documentElement.lang = language;
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      localStorage.setItem('terranova_lang', language);
    } catch (e) {
      console.warn('Could not persist language:', e);
    }
  }, [language, isRtl]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'fr' ? 'ar' : 'fr'));
  };

  const t = (key, fallback = '') => {
    const langDict = translations[language] || translations.fr;
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    // Fallback to French if missing in current language
    if (translations.fr && translations.fr[key] !== undefined) {
      return translations.fr[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isRtl, isRTL: isRtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
