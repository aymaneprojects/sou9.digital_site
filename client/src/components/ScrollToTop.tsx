import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Composant qui ramène la page tout en haut après chaque navigation
 */
function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Cette fonction sera exécutée à chaque changement de route
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Pour un défilement fluide, utiliser 'auto' pour un défilement instantané
    });
  }, [location]); // Dépendance au location pour que l'effet s'exécute à chaque changement de route

  return null; // Ce composant ne rend rien
}

export default ScrollToTop;