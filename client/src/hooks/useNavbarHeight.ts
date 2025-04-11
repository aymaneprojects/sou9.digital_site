import { useState, useEffect, useCallback } from 'react';
import { useSettings } from './useSettings';

export function useNavbarHeight() {
  const [navbarHeight, setNavbarHeight] = useState<number>(0);
  const { settings } = useSettings();
  
  const calculateNavbarHeight = useCallback(() => {
    // Attendre que le DOM soit complètement chargé
    setTimeout(() => {
      const navbar = document.getElementById('main-navbar');
      if (navbar) {
        const height = navbar.getBoundingClientRect().height;
        setNavbarHeight(height);
        console.log("Hauteur de la navbar détectée:", height);
      }
    }, 100);
  }, []);

  useEffect(() => {
    // Calculer la hauteur initiale
    calculateNavbarHeight();
    
    // Utiliser ResizeObserver pour détecter les changements de taille
    let resizeObserver: ResizeObserver | null = null;
    const navbar = document.getElementById('main-navbar');
    
    if (navbar && window.ResizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === navbar) {
            const height = entry.contentRect.height;
            setNavbarHeight(height);
            console.log("Hauteur de la navbar mise à jour:", height);
          }
        }
      });
      
      resizeObserver.observe(navbar);
    }
    
    // Recalculer à chaque modification de la fenêtre également
    window.addEventListener('resize', calculateNavbarHeight);
    window.addEventListener('load', calculateNavbarHeight);
    
    // Nettoyage
    return () => {
      if (resizeObserver && navbar) {
        resizeObserver.unobserve(navbar);
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', calculateNavbarHeight);
      window.removeEventListener('load', calculateNavbarHeight);
    };
  }, [calculateNavbarHeight, settings.promo.showPromoBanner]); // Recalculer lorsque la bannière promo change
  
  return navbarHeight;
}