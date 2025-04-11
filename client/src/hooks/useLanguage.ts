import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

type SupportedLanguage = 'en' | 'fr' | 'ar';

export function useLanguage() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    (localStorage.getItem('language') as SupportedLanguage) || 'fr'
  );

  useEffect(() => {
    // Set the initial language based on localStorage or default to French
    const savedLanguage = localStorage.getItem('language') as SupportedLanguage;
    const initialLanguage = savedLanguage || 'fr';
    
    if (i18n.language !== initialLanguage) {
      changeLanguage(initialLanguage);
    }
  }, []);

  const changeLanguage = (language: SupportedLanguage) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    setCurrentLanguage(language);
    
    // Handle RTL for Arabic
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
      document.body.classList.remove('rtl');
    }
  };

  // Fonction de traduction améliorée qui renvoie toujours une chaîne de caractères
  const translate = (key: string, options?: any): string => {
    const translated = t(key, options);
    // S'assurer que le résultat est toujours une chaîne de caractères
    if (typeof translated === 'string') {
      return translated;
    }
    // Si la traduction n'est pas trouvée ou est un objet, retourner une chaîne vide
    return '';
  };

  return {
    currentLanguage,
    changeLanguage,
    translate,
    isRTL: currentLanguage === 'ar',
    languages: [
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'Français' },
      { code: 'ar', name: 'العربية' }
    ]
  };
}