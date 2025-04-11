import { useTranslation as useReactI18nTranslation } from 'react-i18next';

export function useTranslation() {
  const { t, i18n } = useReactI18nTranslation();
  
  const translate = (key: string, options?: any): string => {
    const result = t(key, options);
    return typeof result === 'string' ? result : key.split('.').pop() || '';
  };
  
  return {
    translate,
    t,
    i18n,
    changeLanguage: i18n.changeLanguage,
    language: i18n.language
  };
}