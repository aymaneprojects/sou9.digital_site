import { useEffect, useRef } from "react";

interface ParticleBackgroundProps {
  className?: string;
}

const ParticleBackground = ({ className = "" }: ParticleBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const particleCount = 15;
    
    // Clear any existing particles
    container.innerHTML = '';
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('span');
      particle.classList.add('absolute', 'block', 'rounded-full', 'opacity-20', 'animate-float');
      
      // Random size between 3-8px
      const size = Math.random() * 5 + 3;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Golden color
      particle.style.backgroundColor = '#FFD700';
      
      // Random position
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.left = `${Math.random() * 100}%`;
      
      // Random animation delay and duration
      const animationDuration = Math.random() * 10 + 10;
      particle.style.animationDuration = `${animationDuration}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      
      container.appendChild(particle);
    }
    
    // Clean up function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    ></div>
  );
};

export default ParticleBackground;
