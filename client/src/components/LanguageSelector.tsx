import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { FaLanguage, FaChevronDown } from "react-icons/fa";

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const selectLanguage = (lang: string) => {
    changeLanguage(lang);
    setIsOpen(false);
  };
  
  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'en':
        return 'EN';
      case 'fr':
        return 'FR';
      default:
        return 'EN';
    }
  };
  
  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="flex items-center text-white hover:text-primary font-medium transition-colors duration-200"
      >
        <FaLanguage className="mr-1" />
        <span>{getLanguageLabel(currentLanguage)}</span>
        <FaChevronDown className="ml-1 text-xs" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-24 bg-[#132743] rounded-[0.5rem] overflow-hidden z-50 shadow-lg">
          <button
            onClick={() => selectLanguage('en')}
            className={`block w-full px-4 py-2 text-left hover:bg-primary hover:text-background transition-colors duration-200 ${
              currentLanguage === 'en' ? 'text-primary' : 'text-white'
            }`}
          >
            English
          </button>
          <button
            onClick={() => selectLanguage('fr')}
            className={`block w-full px-4 py-2 text-left hover:bg-primary hover:text-background transition-colors duration-200 ${
              currentLanguage === 'fr' ? 'text-primary' : 'text-white'
            }`}
          >
            Français
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
