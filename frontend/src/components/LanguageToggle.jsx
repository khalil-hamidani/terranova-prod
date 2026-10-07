import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';
import './LanguageToggle.css';

export default function LanguageToggle({ className = '', showLabel = true }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      className={`lang-toggle-btn ${className}`}
      onClick={toggleLanguage}
      title={language === 'fr' ? 'Changer en Arabe (العربية)' : 'Changer en Français'}
      aria-label="Toggle language"
    >
      <Globe size={16} className="lang-icon" />
      <span className="lang-text">
        {language === 'fr' ? (
          <>
            <span className="lang-current">FR</span>
            <span className="lang-sep">/</span>
            <span className="lang-target">عربي</span>
          </>
        ) : (
          <>
            <span className="lang-current">عربي</span>
            <span className="lang-sep">/</span>
            <span className="lang-target">FR</span>
          </>
        )}
      </span>
    </button>
  );
}
