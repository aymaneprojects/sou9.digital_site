import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { FaTag, FaPercent, FaShoppingCart, FaArrowRight } from "react-icons/fa";
import { useLanguage } from "@/hooks/useLanguage";
import { Helmet } from "react-helmet-async";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";
import { calculateDiscountPercentage } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Types
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  platform: string;
  imageUrl: string;
  releaseDate?: string;
  featured?: boolean;
  quantity?: number;
  discountedPrice?: number | null;
  stock?: number;
  isNewRelease?: boolean | null;
  isOnSale?: boolean | null;
  createdAt?: string | null;
}

const PromotionsPage = () => {
  const { translate } = useLanguage();
  const { addToCart } = useCart();
  
  // Fonction pour convertir un produit standard en élément de panier
  const handleAddToCart = (product: Product) => {
    if (addToCart) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.discountedPrice || product.price,
        image: product.imageUrl,
        platform: product.platform.split(',')[0].trim(),
        quantity: 1
      });
    }
  };
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);

  // Fetch discounted products
  const { data: onSaleProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/on-sale"],
    refetchOnWindowFocus: false,
  });

  // Obtenir les plateformes uniques
  const platforms = onSaleProducts 
    ? Array.from(new Set(onSaleProducts.map(product => product.platform)))
    : [];

  // Filtered products based on platform selection
  const filteredProducts = filterPlatform
    ? onSaleProducts.filter(product => product.platform === filterPlatform)
    : onSaleProducts;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <Helmet>
        <title>{translate('promotions.pageTitle')} | Sou9 Digital</title>
        <meta name="description" content={translate('promotions.pageDescription')} />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0c1c36] to-[#132743] py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-block bg-yellow-500/20 p-2 rounded-xl mb-4">
              <FaPercent className="text-yellow-500 h-8 w-8" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              {translate('promotions.pageHeading') || "Promotions et Offres Spéciales"}
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8">
              {translate('promotions.pageSubtitle') || "Découvrez nos meilleures offres et économisez sur vos jeux préférés"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Platform filter */}
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filterPlatform === null
                  ? "bg-primary text-white shadow-lg"
                  : "bg-primary/10 text-white hover:bg-primary/20"
              }`}
              onClick={() => setFilterPlatform(null)}
            >
              {translate('promotions.allPlatforms') || "Toutes les plateformes"}
            </button>
            {platforms.map((platform) => (
              <button
                key={platform}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  filterPlatform === platform
                    ? "bg-primary text-white shadow-lg"
                    : "bg-primary/10 text-white hover:bg-primary/20"
                }`}
                onClick={() => setFilterPlatform(platform)}
              >
                {platform}
              </button>
            ))}
          </div>

          {/* Discount banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-r from-primary/20 to-yellow-600/20 p-6 rounded-2xl mb-10 border border-primary/30"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="bg-primary/20 p-3 rounded-full mr-4">
                  <FaTag className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">
                    {translate('promotions.specialOffer') || "Offre Spéciale Nouveaux Clients"}
                  </h3>
                  <p className="text-gray-300">
                    {translate('promotions.useCode') || "Utilisez le code"} <span className="bg-background/20 px-2 py-0.5 rounded font-mono">WELCOME10</span> {translate('promotions.forDiscount') || "pour 10% de réduction sur votre première commande"}
                  </p>
                </div>
              </div>
              <Link href="/store?sale=true" className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-full flex items-center transition-all duration-300 hover:shadow-lg whitespace-nowrap">
                {translate('promotions.shopNow') || "Acheter maintenant"} <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-lg bg-gray-800/50 animate-pulse h-[320px]"></div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    ...product,
                    isPreOrder: product.isPreOrder || false,
                    hasEditions: product.hasEditions || false,
                    productType: product.productType || null,
                    isGameCredit: product.isGameCredit || false,
                    creditValue: product.creditValue || null
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="bg-gray-800/50 inline-block p-4 rounded-full mb-4">
                <FaTag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {translate('promotions.noPromotions') || "Aucune promotion disponible"}
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                {translate('promotions.checkBack') || "Revenez bientôt pour découvrir nos nouvelles offres et promotions"}
              </p>
              <Link href="/store" className="inline-flex items-center bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-full transition-all duration-300">
                {translate('promotions.browseStore') || "Parcourir le magasin"} <FaArrowRight className="ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {translate('promotions.featuredCategories') || "Catégories en Promotion"}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {translate('promotions.categoryDescription') || "Explorez nos offres par catégorie pour trouver les meilleures affaires dans vos genres préférés"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Action Games */}
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-blue-900/40 to-blue-700/20 rounded-xl overflow-hidden border border-blue-700/20 group"
            >
              <Link href="/store?sale=true&platform=action" className="block p-6">
                <div className="mb-4 h-12 w-12 bg-blue-500/20 flex items-center justify-center rounded-full">
                  <FaPercent className="text-blue-400 h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {translate('categories.action') || "Jeux d'Action"}
                </h3>
                <p className="text-gray-400 mb-4 text-sm">
                  {translate('promotions.discountUpTo', { percent: '30%' }) || "Jusqu'à 30% de réduction"}
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  {translate('buttons.viewOffers') || "Voir les offres"} <FaArrowRight className="ml-2" />
                </div>
              </Link>
            </motion.div>

            {/* RPG Games */}
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-purple-900/40 to-purple-700/20 rounded-xl overflow-hidden border border-purple-700/20 group"
            >
              <Link href="/store?sale=true&platform=rpg" className="block p-6">
                <div className="mb-4 h-12 w-12 bg-purple-500/20 flex items-center justify-center rounded-full">
                  <FaPercent className="text-purple-400 h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {translate('categories.rpg') || "Jeux de Rôle"}
                </h3>
                <p className="text-gray-400 mb-4 text-sm">
                  {translate('promotions.discountUpTo', { percent: '25%' }) || "Jusqu'à 25% de réduction"}
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  {translate('buttons.viewOffers') || "Voir les offres"} <FaArrowRight className="ml-2" />
                </div>
              </Link>
            </motion.div>

            {/* Sports Games */}
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-green-900/40 to-green-700/20 rounded-xl overflow-hidden border border-green-700/20 group"
            >
              <Link href="/store?sale=true&platform=sports" className="block p-6">
                <div className="mb-4 h-12 w-12 bg-green-500/20 flex items-center justify-center rounded-full">
                  <FaPercent className="text-green-400 h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {translate('categories.sports') || "Jeux de Sport"}
                </h3>
                <p className="text-gray-400 mb-4 text-sm">
                  {translate('promotions.discountUpTo', { percent: '40%' }) || "Jusqu'à 40% de réduction"}
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  {translate('buttons.viewOffers') || "Voir les offres"} <FaArrowRight className="ml-2" />
                </div>
              </Link>
            </motion.div>

            {/* Strategy Games */}
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-amber-900/40 to-amber-700/20 rounded-xl overflow-hidden border border-amber-700/20 group"
            >
              <Link href="/store?sale=true&platform=strategy" className="block p-6">
                <div className="mb-4 h-12 w-12 bg-amber-500/20 flex items-center justify-center rounded-full">
                  <FaPercent className="text-amber-400 h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {translate('categories.strategy') || "Jeux de Stratégie"}
                </h3>
                <p className="text-gray-400 mb-4 text-sm">
                  {translate('promotions.discountUpTo', { percent: '35%' }) || "Jusqu'à 35% de réduction"}
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  {translate('buttons.viewOffers') || "Voir les offres"} <FaArrowRight className="ml-2" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PromotionsPage;