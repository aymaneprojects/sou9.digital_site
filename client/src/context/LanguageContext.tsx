import { createContext, useState, useEffect, ReactNode } from "react";
import i18n from "@/lib/i18n";

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  translate: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: "en",
  changeLanguage: () => {},
  translate: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    // Always use French as the default language
    return "fr";
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem("language", currentLanguage);
    
    // Set RTL for Arabic, LTR for other languages
    if (currentLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = currentLanguage;
      document.body.classList.remove('rtl');
    }
    
    // Set the language in i18n
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (lang: string) => {
    setCurrentLanguage(lang);
  };

  const translate = (key: string): string => {
    return i18n.t(key);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        translate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
