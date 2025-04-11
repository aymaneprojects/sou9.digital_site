import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface NavigationEventDetail {
  to: string;
  replace?: boolean;
}

/**
 * Navigation event handler component that listens for custom navigation events
 * and uses wouter's useLocation hook to navigate without page reloads
 */
export function NavigationHandler() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<NavigationEventDetail>;
      if (customEvent.detail?.to) {
        console.log('🧭 Navigation vers', customEvent.detail.to, 
          customEvent.detail.replace ? '(replace)' : '');
        
        setLocation(customEvent.detail.to, { replace: customEvent.detail.replace });
      }
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, [setLocation]);

  return null;
}

/**
 * Helper function to navigate programmatically without using window.location
 */
export function navigate(to: string, options?: { replace?: boolean }) {
  const navigationEvent = new CustomEvent('navigate', { 
    detail: { 
      to, 
      replace: options?.replace 
    } 
  });
  window.dispatchEvent(navigationEvent);
}