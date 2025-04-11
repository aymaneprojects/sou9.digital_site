import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations from TypeScript files
import { en } from '../i18n/en';
import { fr } from '../i18n/fr';
import { ar } from '../i18n/ar';

console.log('📚 Chargement des traductions:');
console.log('🇫🇷 FR:', Object.keys(fr).length, 'entrées');
console.log('🇬🇧 EN:', Object.keys(en).length, 'entrées');
console.log('🇸🇦 AR:', Object.keys(ar).length, 'entrées');

// Définir les ressources de traduction
const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar }
};

console.log('🌐 Ressources i18n:', resources);

// Initialize i18next (only if not already initialized)
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: localStorage.getItem('language') || 'fr', // Default to French if no language is set
      fallbackLng: 'fr',
      interpolation: {
        escapeValue: false // React already escapes values
      },
      debug: false // Passer à false pour éviter les logs inutiles
    });
}

// Vérifier que les traductions sont bien chargées (uniquement en développement)
// Pour éviter de surcharger la console
if (process.env.NODE_ENV !== 'production') {
  console.log('🔄 Langue actuelle:', i18n.language);
  console.log('🔍 Test de traduction "home.title":', i18n.t('home.title'));
  console.log('🔍 Test de traduction "navigation.home":', i18n.t('navigation.home'));
}

export default i18n;