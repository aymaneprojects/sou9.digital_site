import { Link } from "wouter";
import { motion } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { useLanguage } from "@/hooks/useLanguage";

const Footer = () => {
  const { translate } = useLanguage();
  
  return (
    <footer className="bg-[#0c1c36] text-gray-300">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 relative">
          {/* Logo and about */}
          <div className="relative px-4 lg:px-0">
            <Link href="/" className="flex items-center group mb-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-2 shadow-lg shadow-primary/20"
              >
                <span className="font-cairo font-bold text-background text-xl">S9</span>
              </motion.div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-yellow-500">
                Sou9 Digital
              </span>
            </Link>
            <p className="mb-4 text-sm text-gray-400">
              {translate('footer.aboutUs') || "Votre destination pour les jeux numériques avec les meilleurs prix du marché et une livraison instantanée."}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaFacebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaYoutube size={18} />
              </a>
            </div>
            <div className="absolute right-0 top-0 bottom-0 hidden md:block lg:hidden w-px bg-gradient-to-b from-[#1e3a6a] via-primary/20 to-[#1e3a6a]"></div>
          </div>
          
          {/* Quick Links */}
          <div className="relative px-4 lg:px-6">
            <h3 className="text-lg font-medium mb-4 text-white after:content-[''] after:block after:w-12 after:h-[2px] after:bg-primary/50 after:mt-1">
              {translate('footer.quickLinks') || "Liens Rapides"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/store" className="text-gray-400 hover:text-primary transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></span>
                  {translate('navigation.store') || "Boutique"}
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-gray-400 hover:text-primary transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></span>
                  {translate('navigation.promotions') || "Promotions"}
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="text-gray-400 hover:text-primary transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></span>
                  {translate('navigation.giftCards') || "Cartes Cadeaux"}
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-400 hover:text-primary transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></span>
                  {translate('navigation.support') || "Support"}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-primary transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></span>
                  {translate('navigation.faq') || "FAQ"}
                </Link>
              </li>
            </ul>
            <div className="absolute right-0 top-0 bottom-0 hidden lg:block w-px bg-gradient-to-b from-[#1e3a6a] via-primary/20 to-[#1e3a6a]"></div>
          </div>
          
          {/* Legal */}
          <div className="relative px-4 lg:px-6">
            <h3 className="text-lg font-medium mb-4 text-white after:content-[''] after:block after:w-12 after:h-[2px] after:bg-primary/50 after:mt-1">
              {translate('footer.legal') || "Informations Légales"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></span>
                  {translate('footer.terms') || "Conditions d'utilisation"}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></span>
                  {translate('footer.privacy') || "Politique de confidentialité"}
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-400 hover:text-primary transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></span>
                  {translate('footer.refund') || "Politique de remboursement"}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary transition-colors inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></span>
                  {translate('footer.aboutUs') || "À propos de nous"}
                </Link>
              </li>
            </ul>
            <div className="absolute right-0 top-0 bottom-0 hidden md:block lg:hidden w-px bg-gradient-to-b from-[#1e3a6a] via-primary/20 to-[#1e3a6a]"></div>
            <div className="absolute right-0 top-0 bottom-0 hidden lg:block w-px bg-gradient-to-b from-[#1e3a6a] via-primary/20 to-[#1e3a6a]"></div>
          </div>
          
          {/* Contact */}
          <div className="px-4 lg:px-6">
            <h3 className="text-lg font-medium mb-4 text-white after:content-[''] after:block after:w-12 after:h-[2px] after:bg-primary/50 after:mt-1">
              {translate('footer.contactUs') || "Contactez-nous"}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start group">
                <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                  <FaMapMarkerAlt className="text-primary" />
                </div>
                <span className="text-gray-400 mt-1">
                  Casablanca, Maroc
                </span>
              </li>
              <li className="flex items-start group">
                <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                  <FaPhone className="text-primary" />
                </div>
                <span className="text-gray-400 mt-1.5">+212 664-285673</span>
              </li>
              <li className="flex items-start group">
                <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                  <FaEnvelope className="text-primary" />
                </div>
                <span className="text-gray-400 mt-1.5">support@sou9digital.com</span>
              </li>
            </ul>
          </div>

          {/* Séparateurs horizontaux pour mobile */}
          <div className="md:hidden absolute w-3/4 h-px left-1/2 transform -translate-x-1/2 top-[25%] bg-gradient-to-r from-transparent via-[#1e3a6a] to-transparent"></div>
          <div className="md:hidden absolute w-3/4 h-px left-1/2 transform -translate-x-1/2 top-[50%] bg-gradient-to-r from-transparent via-[#1e3a6a] to-transparent"></div>
          <div className="md:hidden absolute w-3/4 h-px left-1/2 transform -translate-x-1/2 top-[75%] bg-gradient-to-r from-transparent via-[#1e3a6a] to-transparent"></div>
        </div>
        
        <div className="border-t border-[#1e3a6a] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Sou9 Digital. {translate('footer.allRightsReserved') || "Tous droits réservés."}
          </p>
          <div className="flex space-x-4">
            <img 
              src="/images/payment-visa.png" 
              alt="Visa" 
              className="h-6"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
            <img 
              src="/images/payment-mastercard.png" 
              alt="Mastercard" 
              className="h-6"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
            <img 
              src="/images/payment-paypal.png" 
              alt="PayPal" 
              className="h-6"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;