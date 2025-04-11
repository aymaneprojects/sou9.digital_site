import React, { useEffect } from "react";
import GiftCards from "@/components/GiftCards";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Gift, CreditCard, Gamepad } from "lucide-react";
import { motion } from "framer-motion";

const GiftCardsPage: React.FC = () => {
  const { translate } = useLanguage();
  
  // Textes par défaut pour affichage fallback
  const defaultText = {
    pageTitle: "Cartes Cadeaux",
    pageHeading: "Cartes Cadeaux",
    pageSubtitle: "Offrez le plaisir du jeu avec nos cartes cadeaux pour toutes les plateformes",
    highlight1Title: "Livraison Instantanée",
    highlight1Desc: "Codes envoyés immédiatement par email après confirmation du paiement",
    highlight2Title: "Paiement Sécurisé",
    highlight2Desc: "Transactions sécurisées et multiples méthodes de paiement acceptées",
    highlight3Title: "Toutes Plateformes",
    highlight3Desc: "Cartes disponibles pour Steam, PlayStation, Xbox et bien plus"
  };
  
  // Fonction pour obtenir le texte traduit ou la valeur par défaut
  const getTranslatedText = (key: string, defaultValue: string): string => {
    const translated = translate(key);
    return typeof translated === 'string' ? translated : defaultValue;
  };
  
  useEffect(() => {
    // Set page title
    document.title = "Sou9Digital - " + getTranslatedText("giftCards.pageTitle", defaultText.pageTitle);
  }, [translate]);
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1a]">
      <Navbar />
      {/* Hero section with enhanced design */}
      <main className="flex-grow pt-16">
        <div className="w-full bg-gradient-to-b from-[#132743] to-[#0a0f1a] py-20 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/30"></div>
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-primary/30 rounded-full"></div>
            <div className="absolute top-20 right-20 w-40 h-40 border border-primary/20 rounded-full"></div>
            <div className="absolute bottom-10 left-1/4 w-60 h-60 border border-primary/10 rounded-full"></div>
            
            {/* Decorative elements - arabesque style */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <div className="absolute inset-0 bg-[url('/images/pattern-arabesque.svg')] opacity-5 bg-repeat bg-center"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 p-1 rounded-lg mb-6 shadow-[0_0_15px_rgba(184,134,11,0.2)]">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white px-6 py-3 bg-[#0a0f1a]/90 rounded font-cairo">
                  {getTranslatedText("giftCards.pageHeading", defaultText.pageHeading)}
                </h1>
              </div>
              <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
                {getTranslatedText("giftCards.pageSubtitle", defaultText.pageSubtitle)}
              </p>
              
              {/* Gift cards highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
                <motion.div 
                  className="bg-gradient-to-b from-[#132743] to-[#0e1e32] p-8 rounded-xl border border-primary/20 shadow-lg hover:shadow-[0_0_20px_rgba(184,134,11,0.15)] transition-all duration-300 hover:-translate-y-1"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-20 h-20 bg-gradient-radial from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_10px_rgba(184,134,11,0.2)]">
                    <Gift className="text-primary w-10 h-10" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3 font-cairo">
                    {getTranslatedText("giftCards.highlight1Title", defaultText.highlight1Title)}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {getTranslatedText("giftCards.highlight1Desc", defaultText.highlight1Desc)}
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-b from-[#132743] to-[#0e1e32] p-8 rounded-xl border border-primary/20 shadow-lg hover:shadow-[0_0_20px_rgba(184,134,11,0.15)] transition-all duration-300 hover:-translate-y-1"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-20 h-20 bg-gradient-radial from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_10px_rgba(184,134,11,0.2)]">
                    <CreditCard className="text-primary w-10 h-10" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3 font-cairo">
                    {getTranslatedText("giftCards.highlight2Title", defaultText.highlight2Title)}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {getTranslatedText("giftCards.highlight2Desc", defaultText.highlight2Desc)}
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-b from-[#132743] to-[#0e1e32] p-8 rounded-xl border border-primary/20 shadow-lg hover:shadow-[0_0_20px_rgba(184,134,11,0.15)] transition-all duration-300 hover:-translate-y-1"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-20 h-20 bg-gradient-radial from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_10px_rgba(184,134,11,0.2)]">
                    <Gamepad className="text-primary w-10 h-10" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3 font-cairo">
                    {getTranslatedText("giftCards.highlight3Title", defaultText.highlight3Title)}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {getTranslatedText("giftCards.highlight3Desc", defaultText.highlight3Desc)}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Card catalog section */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0a0f1a] to-transparent pointer-events-none"></div>
          <GiftCards />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GiftCardsPage;