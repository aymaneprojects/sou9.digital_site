import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Clock, CreditCard, Gift, ShoppingCart } from "lucide-react";
import { formatCurrency, calculateReleaseDate } from "@/lib/utils";
import PlatformIcon, { getPlatformIcon } from "@/components/ui/PlatformIcon";
import { type Product } from "@shared/schema";
import { useLanguage } from "@/hooks/useLanguage";
import { useCart } from "@/hooks/useCart";


const PreOrderSection = () => {
  const { translate } = useLanguage();
  const { addToCart } = useCart();
  
  // On utilise l'API spécifique pour les pré-commandes
  const { data, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products/pre-orders'],
  });
  
  const products = data || [];

  // On n'utilise plus useEffect pour calculer le compte à rebours car 
  // chaque produit doit avoir son propre compte à rebours, calculé au moment du rendu

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-cairo font-bold text-3xl md:text-4xl text-white mb-3">{translate('preOrder.title')}</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{translate('preOrder.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-[#132743] rounded-[1.25rem] overflow-hidden shadow-lg animate-pulse flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto bg-gray-700" />
                <div className="md:w-2/3 p-6">
                  <div className="h-6 w-2/3 bg-gray-700 rounded mb-3" />
                  <div className="h-20 bg-gray-700 rounded mb-4" />
                  <div className="h-6 w-1/3 bg-gray-700 rounded mb-4" />
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-1/4 bg-gray-700 rounded" />
                    <div className="h-10 w-1/4 bg-gray-700 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading pre-orders</div>;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block relative mb-4">
            <h2 className="font-cairo font-bold text-3xl md:text-4xl text-white mb-2 relative z-10">
              {translate('preOrder.title') || "Précommandes"}
            </h2>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary/40 rounded-full"></div>
            <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {translate('preOrder.subtitle') || "Sécurisez vos jeux avant leur sortie officielle"}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.slice(0, 2).map((product: Product) => (
            <div 
              key={product.id} 
              className="bg-[#132743] rounded-[1.25rem] overflow-hidden shadow-lg flex flex-col md:flex-row hover:shadow-[0_0_20px_rgba(184,134,11,0.3)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="md:w-1/3 relative group">
                <div className="absolute top-0 left-0 m-3 z-10 flex items-center space-x-1 bg-[#0a0f1a]/70 backdrop-blur-sm px-2 py-1 rounded-md shadow-md">
                  {product.platform.split(',').slice(0, 2).map(platform => (
                    <PlatformIcon key={platform} platform={platform.trim()} className="h-4 w-4" />
                  ))}
                  {product.platform.split(',').length > 2 && (
                    <span className="text-xs text-white">+{product.platform.split(',').length - 2}</span>
                  )}
                </div>
                
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-48 md:h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"></div>
                {product.discountedPrice && product.discountedPrice < product.price && (
                  <div className="absolute top-3 right-3 bg-[#E63946] text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg transform rotate-3 hover:rotate-0 transition-transform z-10">
                    -{Math.round(((product.price - product.discountedPrice) / product.price) * 100)}%
                  </div>
                )}
              </div>
              <div className="md:w-2/3 p-6">
                <div className="flex justify-between items-start mb-3">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-cairo font-bold text-xl text-white hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    {product.discountedPrice ? (
                      <>
                        <span className="font-cairo font-bold text-2xl text-primary">
                          {formatCurrency(product.discountedPrice)}
                        </span>
                        <span className="text-gray-400 text-sm line-through ml-2">
                          {formatCurrency(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="font-cairo font-bold text-2xl text-primary">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {product.platform.split(',').map((platform) => (
                      <div key={platform} className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1e3a5f] hover:bg-[#2a4a71] transition-colors">
                        <PlatformIcon platform={platform.trim()} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col w-full gap-4">
                  <div className="flex items-center px-3 py-2 bg-[#0e1e32] rounded-lg w-full">
                    <Clock className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                    <div className="text-gray-400 text-xs whitespace-nowrap">{translate('preOrder.releaseDate')}:</div>
                    <div className="ml-2 font-cairo font-medium text-primary text-sm min-w-20 truncate">{calculateReleaseDate(product)}</div>
                  </div>
                  
                  <Button 
                    className="bg-primary hover:bg-primary/80 text-background font-medium transition-all duration-300 
                               hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:scale-105 hover:font-bold group w-full"
                    onClick={() => addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.discountedPrice || product.price,
                      image: product.imageUrl,
                      platform: product.platform.split(',')[0].trim(),
                      quantity: 1
                    })}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                    {translate('product.preOrderNow') || "Précommander maintenant"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            asChild
            variant="outline"
            className="border-2 border-primary text-primary font-cairo font-medium text-lg px-8 py-3 hover:bg-primary hover:text-background transition-all"
          >
            <Link href="/store?preorder=true">
              {translate('preOrder.viewAll') || "Voir toutes les précommandes"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PreOrderSection;
