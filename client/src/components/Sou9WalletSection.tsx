import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { FaShieldAlt, FaTag, FaGamepad, FaWallet } from "react-icons/fa";

const Sou9WalletSection = () => {
  const { translate } = useLanguage();

  // Textes par défaut pour affichage fallback
  const defaultText = {
    subtitle: "Profitez d'avantages exclusifs avec notre portefeuille numérique intégré",
    feature1Title: "Stockage Sécurisé",
    feature1Desc: "Gardez vos fonds de jeu en toute sécurité dans votre Sou9Wallet avec un cryptage de premier ordre",
    feature2Title: "Bonus Exclusifs",
    feature2Desc: "Profitez de bonus spéciaux, cashback et promotions en utilisant Sou9Wallet pour vos achats",
    feature3Title: "Achats Instantanés",
    feature3Desc: "Achetez des jeux instantanément avec des paiements en un clic en utilisant votre solde Sou9Wallet préchargé",
    feature4Title: "3% de Cashback",
    feature4Desc: "Recevez automatiquement 3% du montant de chaque achat crédité dans votre Sou9Wallet",
    activateButton: "Activer Sou9Wallet"
  };

  // Fonction pour obtenir le texte traduit ou la valeur par défaut
  const getTranslatedText = (key: string, defaultValue: string): string => {
    const translated = translate(key);
    return typeof translated === 'string' ? translated : defaultValue;
  };

  return (
    <section className="py-16 bg-[#0a0f1a]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-white mb-3">
            {translate('wallet.sectionTitle') || "Sou9Wallet"}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {getTranslatedText('wallet.subtitle', defaultText.subtitle)}
          </p>
        </div>
        
        <div className="bg-gradient-to-b from-[#0f1f31] to-[#132743] rounded-2xl p-6 md:p-8 border border-primary/30 shadow-[0_0_20px_rgba(184,134,11,0.2)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <motion.div 
              className="flex flex-col items-center text-center p-5 rounded-xl bg-[#132743]/80 border border-primary/20 hover:border-primary/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                <FaShieldAlt className="text-primary text-2xl" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                {getTranslatedText('wallet.feature1Title', defaultText.feature1Title)}
              </h3>
              <p className="text-gray-400 text-sm">
                {getTranslatedText('wallet.feature1Desc', defaultText.feature1Desc)}
              </p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              className="flex flex-col items-center text-center p-5 rounded-xl bg-[#132743]/80 border border-primary/20 hover:border-primary/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                <FaTag className="text-primary text-2xl" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                {getTranslatedText('wallet.feature2Title', defaultText.feature2Title)}
              </h3>
              <p className="text-gray-400 text-sm">
                {getTranslatedText('wallet.feature2Desc', defaultText.feature2Desc)}
              </p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              className="flex flex-col items-center text-center p-5 rounded-xl bg-[#132743]/80 border border-primary/20 hover:border-primary/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                <FaGamepad className="text-primary text-2xl" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                {getTranslatedText('wallet.feature3Title', defaultText.feature3Title)}
              </h3>
              <p className="text-gray-400 text-sm">
                {getTranslatedText('wallet.feature3Desc', defaultText.feature3Desc)}
              </p>
            </motion.div>
            
            {/* Feature 4 */}
            <motion.div 
              className="flex flex-col items-center text-center p-5 rounded-xl bg-[#132743]/80 border border-primary/20 hover:border-primary/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                <FaWallet className="text-primary text-2xl" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                {getTranslatedText('wallet.feature4Title', defaultText.feature4Title)}
              </h3>
              <p className="text-gray-400 text-sm">
                {getTranslatedText('wallet.feature4Desc', defaultText.feature4Desc)}
              </p>
            </motion.div>
          </div>
          
          <div className="mt-8 text-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-background hover:bg-primary/90 transition-all font-medium text-lg shadow-[0_0_10px_rgba(184,134,11,0.4)]"
            >
              <Link href="/wallet" className="flex items-center justify-center gap-2">
                {getTranslatedText('wallet.activateButton', defaultText.activateButton)}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sou9WalletSection;