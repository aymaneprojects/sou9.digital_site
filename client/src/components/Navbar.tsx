import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useLocation } from "wouter";
import { FaUser, FaShoppingCart, FaSignOutAlt, FaUserCircle, FaUserCog, FaHome, FaGamepad, FaGift, FaWallet, FaHeadset, FaSearch, FaTags, FaListAlt, FaPercent, FaEllipsisH, FaLanguage, FaCheck, FaGlobeAmericas } from "react-icons/fa";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/context/LocalAuthContext";
import { motion } from "framer-motion";
import { useSettings } from "@/hooks/useSettings";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const scrollPosition = useScrollPosition();
  const { translate, currentLanguage, changeLanguage, languages } = useLanguage();
  const { items } = useCart();
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  // Pour gérer la fermeture des menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  const toggleMoreMenu = () => {
    setMoreMenuOpen(!moreMenuOpen);
  };
  
  const toggleLangMenu = () => {
    setLangMenuOpen(!langMenuOpen);
  };

  // Navigation principale - toujours visible
  const navItems = [
    { name: translate('navigation.home'), path: "/", icon: <FaHome className="mr-1.5" /> },
    { name: translate('navigation.store'), path: "/store", icon: <FaGamepad className="mr-1.5" /> },
  ];
  
  // Menu déroulant "Plus" - masquer le vérificateur de commandes pour les utilisateurs authentifiés
  const moreItems = [
    { name: translate('navigation.giftCards') || "Gift Cards", path: "/gift-cards", icon: <FaGift className="mr-1.5" /> },
    { name: "Promotions", path: "/promotions", icon: <FaPercent className="mr-1.5" /> },
    { name: translate('navigation.support'), path: "/support", icon: <FaHeadset className="mr-1.5" /> },
    ...(!user ? [{ name: translate('navigation.orderCheck') || "Check Order", path: "/orders/check", icon: <FaSearch className="mr-1.5" /> }] : []),
  ];
  
  // Items visible for all visitors - used in mobile navigation
  const publicItems = [
    { name: translate('navigation.giftCards') || "Gift Cards", path: "/gift-cards", icon: <FaGift className="mr-1.5" /> },
    { name: "Promotions", path: "/promotions", icon: <FaPercent className="mr-1.5" /> },
    { name: translate('navigation.support'), path: "/support", icon: <FaHeadset className="mr-1.5" /> },
    ...(!user ? [{ name: translate('navigation.orderCheck') || "Check Order", path: "/orders/check", icon: <FaSearch className="mr-1.5" /> }] : []),
  ];
  
  // Éléments visibles uniquement aux utilisateurs authentifiés
  const authenticatedItems = user ? [
    { name: translate('navigation.wallet'), path: "/wallet", icon: <FaWallet className="mr-1.5" /> },
    { name: "My Orders", path: "/orders", icon: <FaListAlt className="mr-1.5" /> },
  ] : [];

  const totalCartItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav id="main-navbar" className={`fixed w-full z-50 transition-all duration-300 ${scrollPosition > 50 ? 'bg-background shadow-lg' : 'bg-background/90 backdrop-blur-md'}`}>
      {/* Bande promotionnelle supérieure */}
      {settings.promo.showPromoBanner && (
        <div className="bg-gradient-to-r from-primary/90 to-yellow-500/90 text-background py-1 text-center text-sm font-medium">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto"
          >
            🔥 {settings.promo.promoText} : <span className="font-bold">{settings.promo.discount}</span> sur votre première commande avec le code <span className="bg-background/20 px-2 py-0.5 rounded font-mono">{settings.promo.promoCode}</span>
          </motion.div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-2 shadow-lg shadow-primary/20"
            >
              <span className="font-cairo font-bold text-background text-xl">S9</span>
            </motion.div>
            <span className="font-cairo font-bold text-2xl text-primary group-hover:text-primary/80 transition-colors duration-300">Sou9<span className="text-white group-hover:text-gray-200 transition-colors duration-300">Digital</span></span>
          </Link>
        </div>
        
        {/* Search bar */}
        <div className="hidden lg:flex mx-4 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Rechercher un jeu, carte cadeau..."
              className="w-full py-2 pl-10 pr-4 bg-[#0a121f] border border-[#1e3a6a] rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-white"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Main navigation items */}
          <div className="flex items-center">
            {navItems.map((item, index) => (
              <div key={item.path} className="flex items-center">
                <Link 
                  href={item.path}
                  className={`text-white hover:text-primary font-medium transition-colors duration-200 flex items-center px-3 py-1 rounded-md hover:bg-[#132743]/50 ${
                    location === item.path ? 'text-primary bg-[#132743]/30' : ''
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
                {index < navItems.length - 1 && (
                  <div className="h-4 w-px bg-yellow-500/50 mx-1"></div>
                )}
              </div>
            ))}
            
            {/* More dropdown button */}
            <div className="flex items-center ml-1">
              <div className="h-4 w-px bg-yellow-500/50 mr-1"></div>
              <div className="relative">
                <button 
                  onClick={toggleMoreMenu}
                  className="flex items-center text-white hover:text-primary font-medium transition-colors duration-200 px-3 py-1 rounded-md hover:bg-[#132743]/50"
                >
                  <FaEllipsisH className="mr-1.5" />
                  Plus
                </button>
                
                {/* More menu dropdown */}
                {moreMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    ref={moreMenuRef}
                    className="absolute right-0 mt-2 w-48 py-2 bg-[#101f38] border border-[#1e3a6a] rounded-md shadow-xl z-50 max-h-80 overflow-y-auto custom-scrollbar"
                  >
                    {moreItems.map((item) => (
                      <Link 
                        key={item.path}
                        href={item.path}
                        className={`flex items-center px-4 py-2 text-sm hover:bg-[#1a3354] transition-all duration-200 ${
                          location === item.path ? 'text-primary' : 'text-white'
                        }`}
                        onClick={() => setMoreMenuOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                    
                    {authenticatedItems.length > 0 && moreItems.length > 0 && (
                      <div className="border-t border-[#1e3a6a] my-1"></div>
                    )}
                    
                    {authenticatedItems.map((item) => (
                      <Link 
                        key={item.path}
                        href={item.path}
                        className={`flex items-center px-4 py-2 text-sm hover:bg-[#1a3354] transition-all duration-200 ${
                          location === item.path ? 'text-primary' : 'text-white'
                        }`}
                        onClick={() => setMoreMenuOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          {!user ? (
            <Link href="/auth" className="flex items-center text-white hover:text-white font-medium transition-all duration-300 bg-gradient-to-r from-primary to-yellow-500 px-4 py-2 rounded-full hover:shadow-lg hover:shadow-primary/20 transform hover:scale-105">
              <div className="flex items-center">
                <FaUser className="mr-2" />
                <span>{translate('Login/Register')}</span>
              </div>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center text-white hover:text-primary font-medium transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center mr-1 overflow-hidden shadow-inner">
                  <FaUserCircle className="w-full h-full text-primary" />
                </div>
                <span className="hidden sm:inline">{user.firstName || user.username || 'User'}</span>
              </button>
              
              {userMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  ref={userMenuRef}
                  className="absolute right-0 mt-2 w-56 py-2 bg-[#101f38] border border-[#1e3a6a] rounded-md shadow-xl z-50 max-h-80 overflow-y-auto custom-scrollbar"
                >
                  <div className="px-4 py-3 border-b border-[#1e3a6a] bg-gradient-to-r from-[#0c1c36]/80 to-[#132743]/80">
                    <p className="text-sm font-bold text-primary">{user.firstName || user.username || user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-3 text-sm hover:bg-[#1a3354] group transition-all duration-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="bg-primary/10 rounded-full p-1.5 mr-3 group-hover:bg-primary/20 transition-all duration-200">
                        <FaUserCircle className="h-4 w-4 text-primary" />
                      </div>
                      {translate('Mon profil')}
                    </Link>
                    
                    {isAdmin && (
                      <Link 
                        href="/admin" 
                        className="flex items-center px-4 py-3 text-sm hover:bg-[#1a3354] group transition-all duration-200"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="bg-primary/10 rounded-full p-1.5 mr-3 group-hover:bg-primary/20 transition-all duration-200">
                          <FaUserCog className="h-4 w-4 text-primary" />
                        </div>
                        {translate('Administration')}
                      </Link>
                    )}
                    
                    <div className="border-t border-[#1e3a6a] my-1 mx-4"></div>
                    
                    <button 
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-red-900/20 transition-all duration-200 group"
                    >
                      <div className="bg-red-900/20 rounded-full p-1.5 mr-3 group-hover:bg-red-900/30 transition-all duration-200">
                        <FaSignOutAlt className="h-4 w-4 text-red-500" />
                      </div>
                      <span className="text-red-500">{translate('Déconnexion')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          
          {/* Language Selector */}
          <div className="relative ml-1">
            <button
              onClick={toggleLangMenu}
              className="flex items-center justify-center text-white hover:text-primary bg-[#132743] hover:bg-[#1a3354] w-10 h-10 rounded-full hover:shadow-lg hover:shadow-[#132743]/30 transition-all duration-200"
              aria-label="Change language"
            >
              <FaGlobeAmericas className="text-lg" />
            </button>
            
            {langMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                ref={langMenuRef}
                className="absolute right-0 mt-2 w-32 py-2 bg-[#101f38] border border-[#1e3a6a] rounded-md shadow-xl z-50"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-[#1a3354] transition-all duration-200 ${
                      currentLanguage === lang.code ? 'text-primary' : 'text-white'
                    }`}
                    onClick={() => {
                      changeLanguage(lang.code as 'en' | 'fr' | 'ar');
                      setLangMenuOpen(false);
                    }}
                  >
                    <span>{lang.name}</span>
                    {currentLanguage === lang.code && <FaCheck className="ml-2 text-primary" size={12} />}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          
          {/* Cart Button */}
          <div className="relative ml-1">
            <Link 
              href="/cart" 
              className="flex items-center justify-center text-white hover:text-primary bg-[#132743] hover:bg-[#1a3354] w-10 h-10 rounded-full hover:shadow-lg hover:shadow-[#132743]/30 transition-all duration-200"
            >
              <FaShoppingCart className="text-lg" />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </Link>
          </div>
        </div>
        
        {/* Mobile Navigation Toggle */}
        <div className="md:hidden">
          <button 
            onClick={toggleMobileMenu}
            className="text-white hover:text-primary transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
              <path d="M3,6 L21,6 M3,12 L21,12 M3,18 L21,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#132743] px-4 py-3">
          <div className="flex flex-col space-y-3 mobile-menu-container custom-scrollbar">
            {/* Primary navigation items */}
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`text-white hover:text-primary font-medium transition-colors duration-200 py-2 flex items-center ${
                  location === item.path ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            {/* Public items - visible to all users */}
            {publicItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`text-white hover:text-primary font-medium transition-colors duration-200 py-2 flex items-center ${
                  location === item.path ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            {/* Authenticated items - only visible to logged in users */}
            {authenticatedItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`text-white hover:text-primary font-medium transition-colors duration-200 py-2 flex items-center ${
                  location === item.path ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            {!user ? (
              <Link 
                href="/auth" 
                className="text-white hover:text-white font-medium bg-gradient-to-r from-primary to-yellow-500 px-4 py-2 rounded-full transition-all duration-200 my-1 hover:shadow-lg hover:shadow-primary/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <FaUser className="mr-2" />
                  <span>{translate('Login/Register')}</span>
                </div>
              </Link>
            ) : (
              <>
                <Link 
                  href="/profile" 
                  className="text-white hover:text-primary font-medium transition-colors duration-200 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <FaUserCircle className="mr-1" />
                    <span>{translate('Mon profil')}</span>
                  </div>
                </Link>
                
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="text-white hover:text-primary font-medium transition-colors duration-200 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <FaUserCog className="mr-1" />
                      <span>{translate('Administration')}</span>
                    </div>
                  </Link>
                )}
                
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center text-white hover:text-red-500 font-medium transition-colors duration-200 py-2"
                >
                  <div className="flex items-center">
                    <FaSignOutAlt className="mr-1" />
                    <span>{translate('Déconnexion')}</span>
                  </div>
                </button>
              </>
            )}
            <Link 
              href="/cart" 
              className="text-white hover:text-primary font-medium transition-colors duration-200 py-2 mt-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center bg-[#132743] py-2 px-4 rounded-full hover:bg-[#1a3354] transition-all duration-300 shadow hover:shadow-lg hover:shadow-[#132743]/20">
                <FaShoppingCart className="mr-2 text-primary" />
                <span>{translate('navigation.cart')} {totalCartItems > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 ml-1 animate-pulse">{totalCartItems}</span>}</span>
              </div>
            </Link>
            
            {/* Language selector for mobile */}
            <div className="mt-3 py-2 border-t border-[#1e3a6a] pt-3">
              <p className="text-gray-400 mb-2 text-sm">{translate('navigation.language') || "Language"}</p>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`py-1 px-3 rounded ${
                      currentLanguage === lang.code 
                        ? 'bg-primary text-background' 
                        : 'bg-[#0a121f] text-white'
                    }`}
                    onClick={() => {
                      changeLanguage(lang.code as 'en' | 'fr' | 'ar');
                      setMobileMenuOpen(false);
                    }}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
