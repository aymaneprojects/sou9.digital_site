import React from 'react';
import { 
  FaPlaystation, 
  FaXbox, 
  FaSteam, 
  FaWindows,
  FaApple,
  FaGamepad,
  FaGift,
  FaGoogle,
  FaAmazon
} from 'react-icons/fa';
import { SiNintendoswitch, SiEpicgames, SiOrigin, SiUbisoft, SiBattledotnet } from 'react-icons/si';

interface PlatformIconProps {
  platform: string;
  className?: string;
  size?: keyof typeof PlatformIconSizes;
}

// Tailles d'icônes pour la cohérence dans l'ensemble du site
export enum PlatformIconSizes {
  xs = "h-3 w-3",
  sm = "h-4 w-4",
  md = "h-5 w-5",
  lg = "h-6 w-6",
  xl = "h-8 w-8",
  xxl = "h-10 w-10"
}

// Pour la compatibilité avec les autres composants qui utilisent cette fonction
export const getPlatformIcon = (platform: string) => {
  const normalizedPlatform = platform?.toLowerCase().trim() || "";
  
  if (normalizedPlatform.includes('playstation') || normalizedPlatform.includes('ps4') || normalizedPlatform.includes('ps5')) {
    return <FaPlaystation />;
  }
  
  if (normalizedPlatform.includes('xbox')) {
    return <FaXbox />;
  }
  
  if (normalizedPlatform.includes('steam')) {
    return <FaSteam />;
  }
  
  if (normalizedPlatform.includes('nintendo') || normalizedPlatform.includes('switch')) {
    return <SiNintendoswitch />;
  }
  
  if (normalizedPlatform.includes('pc') || normalizedPlatform.includes('windows')) {
    return <FaWindows />;
  }
  
  if (normalizedPlatform.includes('mac') || normalizedPlatform.includes('apple')) {
    return <FaApple />;
  }
  
  if (normalizedPlatform.includes('epic') || normalizedPlatform.includes('fortnite')) {
    return <SiEpicgames />;
  }
  
  if (normalizedPlatform.includes('origin') || normalizedPlatform.includes('ea')) {
    return <SiOrigin />;
  }
  
  if (normalizedPlatform.includes('ubisoft') || normalizedPlatform.includes('uplay')) {
    return <SiUbisoft />;
  }
  
  if (normalizedPlatform.includes('battle.net') || normalizedPlatform.includes('blizzard')) {
    return <SiBattledotnet />;
  }
  
  if (normalizedPlatform.includes('google') || normalizedPlatform.includes('stadia') || normalizedPlatform.includes('play')) {
    return <FaGoogle />;
  }
  
  if (normalizedPlatform.includes('amazon')) {
    return <FaAmazon />;
  }
  
  if (normalizedPlatform.includes('gift') || normalizedPlatform.includes('card') || normalizedPlatform.includes('credit')) {
    return <FaGift />;
  }
  
  // Fallback
  return <FaGamepad />;
};

// Fonction auxiliaire pour le rendu d'une icône avec une taille et une classe personnalisées
export const renderPlatformIcon = (platform: string, size: string, className: string = "") => {
  const icon = getPlatformIcon(platform);
  return React.cloneElement(icon, { className: `${size} ${className}` });
};

const PlatformIcon: React.FC<PlatformIconProps> = ({ 
  platform, 
  className = "", 
  size = "md" 
}) => {
  const icon = getPlatformIcon(platform);
  const sizeClass = PlatformIconSizes[size] || PlatformIconSizes.md;
  return React.cloneElement(icon, { className: `${sizeClass} ${className}` });
};

export default PlatformIcon;