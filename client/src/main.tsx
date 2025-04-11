import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n"; // Import i18n config ONCE AND ONLY ONCE
import { safeStringify } from './lib/utils';

// Charger explicitement les fichiers de traduction pour debugging
import './i18n/en';
import './i18n/fr';
import './i18n/ar';

// Surcharge de JSON.stringify pour gérer les structures cycliques
const originalJSONStringify = JSON.stringify;
JSON.stringify = function(value: any, replacer?: any, space?: any) {
  try {
    return originalJSONStringify(value, replacer, space);
  } catch (error) {
    console.warn('JSON.stringify error intercepted:', error);
    // Utiliser notre version sécurisée en cas d'erreur
    return safeStringify(value) || 'null';
  }
};

createRoot(document.getElementById("root")!).render(<App />);
