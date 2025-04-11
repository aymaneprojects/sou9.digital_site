import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  price: number;
  discountedPrice: number | null;
  imageUrl: string;
  platform: string;
  stock: number;
  isPreOrder: boolean;
  isOnSale: boolean;
}

interface RandomRecommendationsProps {
  currentProductId: number;
}

const RandomRecommendations: React.FC<RandomRecommendationsProps> = ({ currentProductId }) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { translate } = useTranslation();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all products
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const allProducts = await response.json();
        
        // Filter out the current product
        const otherProducts = allProducts.filter((product: Product) => 
          product.id !== currentProductId
        );
        
        // Get 4-5 random products
        const randomProducts = getRandomItems(otherProducts, Math.min(4, otherProducts.length));
        
        setRecommendations(randomProducts);
      } catch (error) {
        console.error('Error fetching random recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [currentProductId]);

  // Function to get random items from an array
  const getRandomItems = (array: any[], count: number) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Handling add to cart
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discountedPrice || product.price,
      image: product.imageUrl,
      platform: product.platform.split(',')[0].trim(),
      quantity: 1
    });
  };

  if (isLoading) {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-cairo font-semibold text-white mb-6 flex items-center">
          <Zap className="mr-2 h-5 w-5 text-primary" />
          {translate('product.recommendedGames') || "Jeux recommandés"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="bg-[#0a0f1a]/40 border border-[#1e3a5f] animate-pulse">
              <div className="aspect-[3/4] bg-[#132743]/60 rounded-t-md" />
              <CardContent className="p-3">
                <div className="h-5 bg-[#132743]/60 rounded mb-2" />
                <div className="h-4 bg-[#132743]/60 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 mb-8">
      <h2 className="text-xl font-cairo font-semibold text-white mb-6 flex items-center">
        <Zap className="mr-2 h-5 w-5 text-primary" />
        {translate('product.recommendedGames') || "Jeux recommandés"}
        <span className="ml-2 text-sm text-gray-400 font-normal">
          ({translate('product.suggestedForYou') || "Suggestions pour vous"})
        </span>
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <Card key={product.id} className="bg-[#0a0f1a]/40 border border-[#1e3a5f] overflow-hidden transition-all hover:shadow-[0_0_10px_rgba(255,215,0,0.2)] hover:scale-[1.02]">
            <Link href={`/product/${product.id}`}>
              <div className="cursor-pointer">
                <div className="relative">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="aspect-[3/4] object-cover w-full rounded-t-md"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isOnSale && (
                      <Badge className="bg-red-600 text-white text-xs">
                        {translate('product.onSale') || "En solde"}
                      </Badge>
                    )}
                    {product.isPreOrder && (
                      <Badge className="bg-purple-600 text-white text-xs">
                        {translate('product.preOrder') || "Précommande"}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-3">
                  <h3 className="text-white font-medium text-sm line-clamp-1">{product.name}</h3>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="bg-[#132743]/60 text-gray-300 border-[#1e3a5f] text-xs">
                      {product.platform.split(',')[0].trim()}
                    </Badge>
                    {product.stock > 0 ? (
                      <span className="ml-auto text-green-400 text-xs">
                        {translate('product.inStock') || "En stock"}
                      </span>
                    ) : (
                      <span className="ml-auto text-red-400 text-xs">
                        {translate('product.outOfStock') || "Rupture de stock"}
                      </span>
                    )}
                  </div>
                </CardContent>
              </div>
            </Link>
            
            <CardFooter className="p-3 pt-0 flex justify-between items-center">
              <div className="flex flex-col">
                {product.discountedPrice ? (
                  <>
                    <span className="text-primary font-semibold">
                      {formatCurrency(product.discountedPrice)}
                    </span>
                    <span className="text-gray-400 text-xs line-through">
                      {formatCurrency(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-primary font-semibold">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
              
              <Button 
                size="sm"
                variant="outline"
                className="border-primary hover:bg-primary hover:text-background text-primary h-8 px-2.5 group"
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-4 w-4 mr-1 group-hover:animate-pulse" />
                <span className="sr-only md:not-sr-only md:inline">
                  {translate('product.addToCart') || "Ajouter"}
                </span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RandomRecommendations;