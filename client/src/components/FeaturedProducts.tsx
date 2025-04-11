import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ProductCard, { type Product } from "./ProductCard";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { FaArrowRight, FaFire } from "react-icons/fa";

const FeaturedProducts = () => {
  const { translate } = useLanguage();

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['/api/products/featured'],
    refetchOnWindowFocus: false
  });
  
  // Ensure products is always an array
  const products = Array.isArray(productsData) ? productsData : [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5
      }
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-cairo font-bold text-3xl md:text-4xl text-white mb-3">
              Produits en Vedette
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Découvrez notre sélection spéciale de jeux</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#132743] rounded-[1.25rem] overflow-hidden shadow-lg animate-pulse">
                <div className="w-full h-48 bg-gray-700" />
                <div className="p-5">
                  <div className="h-7 bg-gray-700 rounded mb-2" />
                  <div className="h-20 bg-gray-700 rounded mb-4" />
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-20 bg-gray-700 rounded" />
                    <div className="h-6 w-16 bg-gray-700 rounded" />
                  </div>
                  <div className="h-10 bg-gray-700 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading featured products</div>;
  }

  return (
    <section className="py-16 bg-background relative">
      {/* Top arabesque divider */}
      <div 
        className="w-full h-8 absolute top-0 left-0"
        style={{ 
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="30" viewBox="0 0 200 30"><path d="M0,15 C25,5 50,25 75,15 S125,5 150,15 S175,25 200,15" fill="none" stroke="%23B8860B" stroke-width="1"/></svg>')`,
          backgroundRepeat: 'repeat-x',
          opacity: 0.7
        }}
      />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-white mb-3">
            Produits en Vedette
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Découvrez notre sélection spéciale de jeux</p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product: Product) => (
            <motion.div key={product.id} variants={item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12"
        >
          {/* Platforms badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {['playstation', 'xbox', 'steam', 'nintendo', 'epic', 'pc', 'mobile'].map((platform) => (
              <Link 
                key={platform} 
                href={`/store?platform=${platform}`}
                className="bg-[#132743]/70 hover:bg-[#132743] px-3 py-2 rounded-full transition-all hover:scale-110"
              >
                <span className="text-sm font-medium">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              asChild
              variant="outline"
              className="border-2 border-primary text-primary font-cairo font-medium text-lg px-8 py-3 hover:bg-primary hover:text-background transition-all group"
            >
              <Link href="/store" className="flex items-center gap-2">
                <span>Voir tous les produits</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
      
      {/* Bottom arabesque divider */}
      <div 
        className="w-full h-8 absolute bottom-0 left-0"
        style={{ 
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="30" viewBox="0 0 200 30"><path d="M0,15 C25,5 50,25 75,15 S125,5 150,15 S175,25 200,15" fill="none" stroke="%23B8860B" stroke-width="1"/></svg>')`,
          backgroundRepeat: 'repeat-x',
          opacity: 0.7
        }}
      />
    </section>
  );
};

export default FeaturedProducts;