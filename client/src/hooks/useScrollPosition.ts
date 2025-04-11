import { useState, useEffect } from "react";

export const useScrollPosition = (): number => {
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.scrollY);
    };
    
    // Add scroll event listener
    window.addEventListener("scroll", updatePosition);
    
    // Initial position
    updatePosition();
    
    // Clean up
    return () => window.removeEventListener("scroll", updatePosition);
  }, []);
  
  return scrollPosition;
};
