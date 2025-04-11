import { useLocation } from 'wouter';
import { navigate } from '@/lib/navigation';

/**
 * Custom hook that combines wouter's useLocation with our custom navigate function
 * to provide a consistent navigation experience in the application
 */
export function useCustomNavigation() {
  const [location, setLocation] = useLocation();

  const navigateTo = (to: string, options?: { replace?: boolean }) => {
    // For consistency, use the custom navigate function which dispatches an event
    // This ensures that all navigation goes through the same flow and doesn't cause
    // unexpected behaviors like page reloads or loss of state
    console.log(`🧭 useCustomNavigation: navigating to ${to}${options?.replace ? ' (replace)' : ''}`);
    navigate(to, options);
  };

  return { 
    location, 
    navigateTo,
    // Also expose the original setLocation for cases where we want direct control
    // but generally prefer using navigateTo for consistency
    setLocation
  };
}