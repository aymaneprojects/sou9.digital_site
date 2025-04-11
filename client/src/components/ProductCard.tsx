import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import PlatformIcon, { getPlatformIcon } from "@/components/ui/PlatformIcon";
import { useLanguage } from "@/hooks/useLanguage";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// Type compatible avec PromotionsPage
export interface Product {
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
  isPreOrder?: boolean | null;
  hasEditions?: boolean | null;
  productType?: string | null;
  isGameCredit?: boolean | null;
  creditValue?: number | null;
  createdAt?: string | null;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { translate } = useLanguage();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isCartButtonClicked, setIsCartButtonClicked] = useState(false);
  
  // Get the primary platform (first one if multiple)
  const primaryPlatform = product.platform.split(',')[0].trim();
  const platformIcon = getPlatformIcon(primaryPlatform);

  // Calculate discount percentage if there's a discounted price
  const discountPercentage = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  // Check if product is a gift card
  const isGiftCard = product.productType === 'giftCard';

  // Handle add to cart with animation
  const handleAddToCart = () => {
    setIsCartButtonClicked(true);
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discountedPrice || product.price,
      image: product.imageUrl,
      platform: primaryPlatform,
      quantity: 1
    });
    
    setTimeout(() => {
      setIsCartButtonClicked(false);
    }, 1000);
  };

  return (
    <motion.div 
      className="bg-[#132743] rounded-[1.25rem] overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(184,134,11,0.4)] transition-all duration-300 flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Platform icon overlay */}
        <div className="absolute top-0 left-0 m-3 z-10 flex items-center bg-[#0a0f1a]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-md shadow-md border border-[#1e3a5f] transition-all duration-300 hover:border-primary">
          <PlatformIcon platform={primaryPlatform} className="text-lg text-white" />
        </div>

        {/* Product Image with hover effect */}
        <Link href={`/product/${product.id}`}>
          <div className="relative overflow-hidden h-64 bg-gradient-to-b from-[#0a0f1a] to-[#132743]">
            <motion.img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-contain object-center"
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.4 }}
            />
            
            {/* Overlay gradient on hover */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: isHovered ? 0.5 : 0.3 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </Link>
        
        {/* Product badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10">
          {product.isNewRelease && (
            <Badge className="bg-[#E63946] hover:bg-[#E63946]/90 text-white text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-md border border-[#E63946]/50">
              {translate('product.new')}
            </Badge>
          )}
          
          {product.isOnSale && (
            <Badge className="bg-primary hover:bg-primary/90 text-background text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-md border border-primary/50">
              -{discountPercentage}%
            </Badge>
          )}
        </div>
        
        {product.isPreOrder && (
          <div className="absolute bottom-3 left-3 z-10">
            <Badge className="bg-[#1a365d] hover:bg-[#1a365d]/90 text-white text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-md border border-[#1a365d]/50">
              {translate('product.preOrder')}
            </Badge>
          </div>
        )}

        {/* Stock indicator */}
        {!isGiftCard && product.stock !== undefined && (
          <div className="absolute bottom-3 right-3 z-10">
            <Badge className={`
              text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-md
              ${product.stock > 0 
                ? 'bg-green-900/60 hover:bg-green-900/80 text-green-400 border border-green-800/50' 
                : 'bg-red-900/60 hover:bg-red-900/80 text-red-400 border border-red-800/50'}
            `}>
              {product.stock > 0 
                ? translate('product.inStock') 
                : translate('product.outOfStock')}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-cairo font-bold text-xl text-white mb-2 hover:text-primary transition-colors duration-200 line-clamp-1 group">
            {product.name}
            <motion.span 
              className="block h-0.5 bg-primary"
              initial={{ width: 0 }}
              animate={{ width: isHovered ? '100%' : 0 }}
              transition={{ duration: 0.3 }}
            />
          </h3>
        </Link>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>
        
        {/* Product info row */}
        <div className="flex justify-between items-center mb-4 border-t border-[#1e3a5f]/70 pt-4 mt-auto">
          {/* Platform icon */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1.5 bg-[#0a0f1a] rounded-md border border-[#1e3a5f]">
              <PlatformIcon platform={primaryPlatform} size="sm" className="text-lg text-gray-300" />
            </div>
            
            {/* Type badge */}
            {isGiftCard ? (
              <Badge variant="outline" className="bg-[#0a0f1a]/50 text-primary border-primary/30 text-xs">
                {translate('product.giftCard')}
              </Badge>
            ) : product.hasEditions ? (
              <Badge variant="outline" className="bg-[#0a0f1a]/50 text-indigo-400 border-indigo-800/30 text-xs">
                {translate('product.hasEditions')}
              </Badge>
            ) : null}
          </div>
          
          {/* Price display */}
          <div>
            {product.discountedPrice ? (
              <div className="flex flex-col items-end">
                <motion.span 
                  className="font-cairo font-bold text-2xl text-primary"
                  animate={{ scale: isHovered ? 1.05 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatCurrency(product.discountedPrice)}
                </motion.span>
                <span className="text-gray-400 text-xs line-through">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <motion.span 
                className="font-cairo font-bold text-2xl text-primary"
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {formatCurrency(product.price)}
              </motion.span>
            )}
          </div>
        </div>
        
        {/* Add to cart button - moved to the bottom */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          animate={{ 
            scale: isCartButtonClicked ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 0.4 }}
          className="mt-auto"
        >
          <Button 
            className={`
              w-full bg-gradient-to-r from-[#B8860B] to-[#DAA520] hover:from-[#DAA520] hover:to-[#B8860B] 
              text-background font-medium tracking-wider uppercase text-sm py-5 
              transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] 
              rounded-lg border border-[#B8860B]/50 hover:border-[#DAA520] group
              ${product.stock === 0 && !isGiftCard ? 'opacity-70 cursor-not-allowed' : ''}
            `}
            onClick={handleAddToCart}
            disabled={product.stock === 0 && !isGiftCard}
          >
            <div className="flex items-center justify-center">
              <svg 
                className={`h-4 w-4 mr-2 ${isCartButtonClicked ? 'animate-bounce' : 'group-hover:animate-pulse'}`} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {product.isPreOrder 
                ? translate('product.preOrderNow') 
                : translate('product.addToCart')}
            </div>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
