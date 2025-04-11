import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { FaPlaystation, FaXbox, FaSteam, FaWindows, FaGamepad, FaMobileAlt } from "react-icons/fa";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import PlatformIcon, { getPlatformIcon } from "@/components/ui/PlatformIcon";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CountdownTimer from "./CountdownTimer";

interface ProductDetailProps {
  productId: number;
}

interface ProductEdition {
  id: number;
  productId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  createdAt: string;
}

// Gift Card denominations (for gift card products)
interface GiftCardDenomination {
  id: string;
  value: number;
  name: string;
  stock: number;
  active?: boolean;
}

const ProductDetail = ({ productId }: ProductDetailProps) => {
  const { translate } = useLanguage();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedEdition, setSelectedEdition] = useState<number | null>(null);
  const [selectedDenomination, setSelectedDenomination] = useState<number | null>(null);
  
  const { data: productData, isLoading, error } = useQuery({
    queryKey: [`/api/products/${productId}`],
  });

  // Récupérer les éditions du produit
  const { 
    data: editionsData, 
    isLoading: isEditionsLoading
  } = useQuery({
    queryKey: [`/api/products/${productId}/editions`],
    enabled: !!productId
  });

  // Ensure productData is an object and safely handle it
  const productObj = productData && typeof productData === 'object' ? productData : {};

  // Récupérer dynamiquement les dénominations de cartes cadeaux depuis l'API
  const { 
    data: denominationsData, 
    isLoading: isDenominationsLoading, 
    error: denominationsError 
  } = useQuery({
    queryKey: [
      `/api/platforms/${productObj.id}/denominations`, 
      productObj.id
    ],
    enabled: productObj && 
      (productObj.productType === 'giftCard' || productObj.product_type === 'giftCard') && 
      !!productObj.id,
    retry: 2, // Réessayer au maximum 2 fois en cas d'erreur
    staleTime: 5 * 60 * 1000 // Considérer les données comme "fraîches" pendant 5 minutes
  });

  // Préparer le tableau de dénominations à partir des données API
  const giftCardDenominations: GiftCardDenomination[] = useMemo(() => {
    // Si les données de l'API sont disponibles, utiliser ces données
    if (denominationsData && Array.isArray(denominationsData) && denominationsData.length > 0) {
      console.log('🎮 Dénominations récupérées de l\'API:', denominationsData.length);
      return denominationsData.map((denom: any) => ({
        id: denom.id.toString(),
        value: denom.value,
        name: denom.name || `${denom.value} DH`,
        stock: denom.stock || 0,
        active: denom.active !== undefined ? denom.active : true
      }));
    }
    
    // Si des dénominations existent déjà dans les données du produit
    if (productObj && productObj.denominations && Array.isArray(productObj.denominations)) {
      console.log('🎮 Utilisation des dénominations du produit:', productObj.denominations.length);
      return productObj.denominations.map((denom: any) => ({
        id: denom.id.toString(),
        value: denom.value,
        name: denom.name || `${denom.value} DH`,
        stock: denom.stock || 0,
        active: denom.active !== undefined ? denom.active : true
      }));
    }
    
    // Fallback à des valeurs par défaut si aucune donnée n'est disponible
    console.log('🎮 Utilisation des dénominations par défaut');
    return [
      { id: '1', value: 50, name: '50 DH', stock: 5, active: true },
      { id: '2', value: 100, name: '100 DH', stock: 3, active: true },
      { id: '3', value: 200, name: '200 DH', stock: 0, active: true },
      { id: '4', value: 500, name: '500 DH', stock: 4, active: true },
    ];
  }, [productObj, denominationsData]);
  
  // Fonction pour nettoyer les noms de produits ayant des problèmes comme "xbox soldCboxsold"
  const cleanProductName = (name: string): string => {
    // Si le nom contient "sold" ou "Cbox", c'est probablement un nom mal formaté
    if (name.includes('sold') || name.includes('Cbox')) {
      // Essayer d'extraire le nom de la plateforme (xbox, playstation, etc.)
      const platformMatches = name.match(/^(xbox|playstation|ps|steam|nintendo|switch)/i);
      if (platformMatches && platformMatches[0]) {
        const platform = platformMatches[0].charAt(0).toUpperCase() + platformMatches[0].slice(1);
        return `${platform} Gift Card`;
      }
      return "Gift Card"; // Nom par défaut si aucune plateforme n'est trouvée
    }
    return name;
  };
  
  // Destructure the product and editions from the response
  const rawProduct = productObj.editions ? productObj : { ...productObj, editions: [] };
  // Nettoyer le nom du produit s'il contient des erreurs
  const product = {
    ...rawProduct,
    name: rawProduct.name ? cleanProductName(rawProduct.name) : "Product"
  };
  const editions = Array.isArray(product.editions) ? product.editions : [];
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-[#132743] rounded-[1.25rem] overflow-hidden shadow-lg animate-pulse">
          <div className="md:flex">
            <div className="md:w-1/2 h-96 bg-gray-700" />
            <div className="md:w-1/2 p-6">
              <div className="h-10 bg-gray-700 rounded mb-4" />
              <div className="h-6 w-24 bg-gray-700 rounded mb-4" />
              <div className="h-40 bg-gray-700 rounded mb-6" />
              <div className="h-8 w-32 bg-gray-700 rounded mb-4" />
              <div className="h-10 bg-gray-700 rounded mb-4" />
              <div className="h-12 bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading product details</div>;
  }

  // If product loaded but no platform selected yet, set it to the first one (for game products)
  // Check productType in both formats (camelCase and snake_case) due to SQLite/JS naming inconsistency
  if (product && !selectedPlatform && product.platform && 
      (product.productType === 'game' || product.product_type === 'game')) {
    setSelectedPlatform(product.platform.split(',')[0].trim());
  }

  // Set the default edition to the base product if no edition is selected
  if (product && product.hasEditions && editions.length > 0 && selectedEdition === null) {
    setSelectedEdition(0); // 0 represents the base product
  }
  
  // Get the current selected edition's data
  const getSelectedEditionData = () => {
    if (selectedEdition === 0 || selectedEdition === null) {
      return null; // Base product (no edition)
    }
    
    const editionIndex = selectedEdition - 1;
    if (editionsData && Array.isArray(editionsData) && editionsData[editionIndex]) {
      return editionsData[editionIndex];
    }
    
    if (editions && editions.length > 0 && editions[editionIndex]) {
      return editions[editionIndex];
    }
    
    return null;
  };
  
  // Get the current edition or fallback to product
  const currentEdition = getSelectedEditionData();
  
  // Set the default denomination for gift cards
  if (product && (product.productType === 'giftCard' || product.product_type === 'giftCard') && selectedDenomination === null) {
    setSelectedDenomination(0);
  }

  const handleAddToCart = () => {
    if (product) {
      // Handle gift card products
      if ((product.productType === 'giftCard' || product.product_type === 'giftCard') && selectedDenomination !== null) {
        const selectedDenom = giftCardDenominations[selectedDenomination];
        addToCart({
          id: product.id,
          name: `${product.name} - ${selectedDenom.name}`,
          price: selectedDenom.value,
          image: product.imageUrl,
          platform: product.platform,
          quantity: quantity,
          isEdition: false,
          isDenomination: true,
          denominationId: selectedDenom.id,
          productId: product.id
        });
      } 
      // Handle game products with editions
      else if (currentEdition) {
        addToCart({
          id: currentEdition.id,
          name: `${product.name} - ${currentEdition.name}`,
          price: currentEdition.price,
          image: currentEdition.imageUrl || product.imageUrl,
          platform: selectedPlatform,
          quantity: quantity,
          isEdition: true,
          editionId: currentEdition.id,
          productId: product.id
        });
      } 
      // Handle standard products (no edition selected)
      else {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.discountedPrice || product.price,
          image: product.imageUrl,
          platform: selectedPlatform,
          quantity: quantity,
          isEdition: false,
          productId: product.id
        });
      }
    }
  };

  const platforms = product?.platform?.split(',').map((p: string) => p.trim()) || [];
  
  // Get primary platform for display
  const primaryPlatform = platforms.length > 0 ? platforms[0] : '';
  
  // Calculate discount percentage if there's a discounted price
  const discountPercentage = product?.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-[#132743] rounded-[1.25rem] overflow-hidden shadow-lg border border-[#1e3a5f] hover:shadow-[0_0_30px_rgba(184,134,11,0.3)]">
        {/* Breadcrumb navigation */}
        <div className="p-4 border-b border-[#1e3a5f] flex items-center text-sm">
          <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
            {translate('navigation.home')}
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <Link href="/store" className="text-primary hover:text-primary/80 transition-colors">
            {translate('navigation.store')}
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-gray-400 truncate max-w-[150px]">{product.name}</span>
        </div>
        
        <div className="md:flex">
          {/* Product image section */}
          <div className="md:w-1/2 relative p-6 bg-gradient-to-br from-[#0a0f1a] to-[#132743]">
            <div className="relative flex items-center justify-center">
              {/* Platform badge */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#0a0f1a]/80 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-md border border-[#1e3a5f]">
                <PlatformIcon platform={primaryPlatform} className="text-lg text-white" />
                <span className="text-sm font-medium text-gray-300">{primaryPlatform}</span>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-lg overflow-hidden shadow-xl border border-[#1e3a5f] w-full h-full aspect-video flex items-center justify-center p-2 bg-[#0a0f1a]/40"
              >
                <img 
                  src={currentEdition && currentEdition.imageUrl ? currentEdition.imageUrl : product.imageUrl} 
                  alt={product.name} 
                  className="max-w-full max-h-[400px] object-contain rounded-lg"
                  key={currentEdition ? `edition-img-${currentEdition.id}` : `product-img-${product.id}`}
                />
                
                {/* Status badge overlays */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {product.isNewRelease && (
                    <Badge className="bg-[#E63946] hover:bg-[#E63946]/90 text-white px-3 py-1.5 rounded-md font-bold border border-[#E63946]/20">
                      {translate('product.new')}
                    </Badge>
                  )}
                  
                  {product.isOnSale && (
                    <Badge className="bg-primary hover:bg-primary/90 text-background px-3 py-1.5 rounded-md font-bold border border-primary/20">
                      -{discountPercentage}%
                    </Badge>
                  )}
                </div>
                
                {product.isPreOrder && (
                  <Badge className="absolute bottom-3 left-3 bg-[#1a365d] hover:bg-[#1a365d]/90 text-white px-3 py-1.5 rounded-md font-medium border border-blue-900/20">
                    {translate('product.preOrder')}
                  </Badge>
                )}
              </motion.div>
            </div>
            
            {/* Additional product info badges */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {(product.productType !== 'giftCard' && product.product_type !== 'giftCard') && product.stock !== undefined && (
                <Badge className={`
                  text-xs px-3 py-1.5 rounded-md shadow-sm border font-medium
                  ${product.stock > 0 
                    ? 'bg-green-900/30 hover:bg-green-900/40 text-green-400 border-green-800/20' 
                    : 'bg-red-900/30 hover:bg-red-900/40 text-red-400 border-red-800/20'}
                `}>
                  {product.stock > 0 
                    ? `✓ ${translate('product.inStock')} (${product.stock})` 
                    : `✕ ${translate('product.outOfStock')}`}
                </Badge>
              )}
              
              {product.hasEditions && (
                <Badge className="bg-indigo-900/30 hover:bg-indigo-900/40 text-indigo-400 border-indigo-800/20 text-xs px-3 py-1.5 rounded-md shadow-sm">
                  {translate('product.multipleEditions')}
                </Badge>
              )}
              
              {(product.productType === 'giftCard' || product.product_type === 'giftCard') && (
                <Badge className="bg-amber-900/30 hover:bg-amber-900/40 text-amber-400 border-amber-800/20 text-xs px-3 py-1.5 rounded-md shadow-sm">
                  {translate('product.giftCard')}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Product details section */}
          <div className="md:w-1/2 p-6 border-l border-[#1e3a5f] bg-gradient-to-bl from-[#0a0f1a] to-[#132743]">
            <motion.h1 
              className="font-cairo font-bold text-3xl text-white mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {product.name}
            </motion.h1>
            
            {/* Product price shown differently based on product type */}
            {(product.productType !== 'giftCard' && product.product_type !== 'giftCard') && (
              <motion.div 
                className="mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                key={`price-display-${currentEdition ? currentEdition.id : 'standard'}`}
              >
                {currentEdition ? (
                  // Affichage du prix de l'édition sélectionnée
                  <div className="flex items-center">
                    <span className="font-cairo font-bold text-4xl text-primary">
                      {formatCurrency(currentEdition.price)}
                    </span>
                    {product.price < currentEdition.price && (
                      <Badge className="ml-3 bg-indigo-900/20 text-indigo-400 border-indigo-900/20 text-xs px-2 py-1">
                        +{formatCurrency(currentEdition.price - product.price)} {currentEdition.name}
                      </Badge>
                    )}
                  </div>
                ) : (
                  // Affichage du prix du produit standard
                  product.discountedPrice ? (
                    <div className="flex items-center">
                      <span className="font-cairo font-bold text-4xl text-primary">
                        {formatCurrency(product.discountedPrice)}
                      </span>
                      <span className="text-gray-400 text-lg line-through ml-3">
                        {formatCurrency(product.price)}
                      </span>
                      <Badge className="ml-3 bg-primary/20 text-primary border-primary/20 text-xs px-2 py-1">
                        {translate('product.youSave') || "Économisez"} {formatCurrency(product.price - product.discountedPrice)}
                      </Badge>
                    </div>
                  ) : (
                    <span className="font-cairo font-bold text-4xl text-primary">
                      {formatCurrency(product.price)}
                    </span>
                  )
                )}
              </motion.div>
            )}
            
            <motion.div 
              className="mb-6 p-4 bg-[#0a0f1a]/60 rounded-md border border-[#1e3a5f] text-gray-300 text-base"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {product.description && product.description.length > 60 
                ? product.description.substring(0, 60) + '...' 
                : product.description}
            </motion.div>
            
            {/* Game Editions Selection */}
            {(product.productType === 'game' || product.product_type === 'game') && 
             (product.hasEditions || (editionsData && Array.isArray(editionsData) && editionsData.length > 0)) && (
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h3 className="font-cairo font-medium text-white mb-4 flex items-center">
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded mr-2">
                    {translate('product.selectEdition') || "Sélectionner une édition"}:
                  </span>
                </h3>
                
                {isEditionsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
                    <div className="h-14 bg-gray-700 rounded-md"></div>
                    <div className="h-14 bg-gray-700 rounded-md"></div>
                  </div>
                ) : (
                  <RadioGroup 
                    className="space-y-3"
                    value={selectedEdition?.toString() || "0"}
                    onValueChange={(value) => setSelectedEdition(parseInt(value))}
                  >
                    {/* Option pour le produit de base */}
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value="0" 
                        id="edition-base"
                        className="border-primary text-primary"
                      />
                      <Label 
                        htmlFor="edition-base"
                        className="flex flex-1 cursor-pointer p-3 rounded-md border border-[#1e3a5f] bg-[#0a0f1a]/40 hover:bg-[#0a0f1a]/60"
                      >
                        <div className="flex flex-row items-center justify-between w-full">
                          <div className="font-medium text-white">{product.name}</div>
                          <div className="text-sm font-semibold text-primary">{formatCurrency(product.discountedPrice || product.price)}</div>
                        </div>
                      </Label>
                    </div>
                    
                    {/* Options pour les éditions premium */}
                    {editionsData && Array.isArray(editionsData) && editionsData.map((edition, index) => (
                      <div key={edition.id} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={(index + 1).toString()} 
                          id={`edition-${edition.id}`}
                          className="border-primary text-primary"
                          disabled={edition.stock <= 0}
                        />
                        <Label 
                          htmlFor={`edition-${edition.id}`}
                          className={`flex flex-1 cursor-pointer p-3 rounded-md border border-[#1e3a5f] ${
                            edition.stock <= 0 
                              ? 'bg-[#0a0f1a]/20 opacity-50' 
                              : 'bg-[#0a0f1a]/40 hover:bg-[#0a0f1a]/60'
                          }`}
                        >
                          <div className="flex flex-row items-center justify-between w-full">
                            <div className="font-medium text-white">
                              {edition.name}
                              {edition.stock <= 0 && <span className="ml-2 text-red-400 text-xs">{translate('product.outOfStock')}</span>}
                            </div>
                            <div className="text-sm font-semibold text-primary">{formatCurrency(edition.price)}</div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </motion.div>
            )}
            
            {/* Gift Card Denominations Selection - Enhanced Version */}
            {(product.productType === 'giftCard' || product.product_type === 'giftCard') && (
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h3 className="font-cairo font-medium text-white mb-4 flex items-center">
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded mr-2">
                    {translate('giftCards.selectDenomination') || "Sélectionner une valeur"}:
                  </span>
                  <Badge className="ml-2 bg-[#0a0f1a] border-primary/20">
                    {`${giftCardDenominations.length} ${translate('giftCards.valuesAvailable') || "valeurs disponibles"}`}
                  </Badge>
                </h3>
                
                {/* Message d'erreur si la récupération des dénominations a échoué */}
                {denominationsError && (
                  <div className="p-3 mb-4 bg-red-900/30 border border-red-900/50 rounded-md text-red-300 text-sm">
                    <div className="flex items-center mb-1">
                      <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
                      <span className="font-semibold">{translate('giftCards.errorLoading') || "Erreur de chargement"}</span>
                    </div>
                    <p>{translate('giftCards.tryRefresh') || "Impossible de charger les valeurs disponibles pour cette carte cadeau. Veuillez rafraîchir la page ou réessayer plus tard."}</p>
                  </div>
                )}
                
                {/* État de chargement des dénominations */}
                {isDenominationsLoading && (
                  <div className="flex items-center mb-4 p-3 bg-[#0a0f1a]/60 rounded-md border border-primary/20 animate-pulse">
                    <div className="h-8 w-32 bg-gray-700 rounded"></div>
                    <div className="ml-3 h-6 w-20 bg-gray-700 rounded"></div>
                  </div>
                )}
                
                {/* Price display for the selected denomination */}
                {!isDenominationsLoading && selectedDenomination !== null && giftCardDenominations[selectedDenomination] && (
                  <div className="flex items-center mb-4 p-3 bg-[#0a0f1a]/60 rounded-md border border-primary/20">
                    <span className="font-cairo font-bold text-3xl text-primary">
                      {formatCurrency(giftCardDenominations[selectedDenomination].value)}
                    </span>
                    <Badge className="ml-3 bg-[#0e1e32] text-white border-[#1e3a5f]">
                      {giftCardDenominations[selectedDenomination].name}
                    </Badge>
                  </div>
                )}
                
                <Tabs 
                  defaultValue="0" 
                  value={selectedDenomination?.toString() || "0"} 
                  className="w-full"
                  onValueChange={(value) => setSelectedDenomination(parseInt(value))}
                >
                  <TabsList className="grid grid-flow-row grid-cols-3 gap-2 mb-4">
                    {giftCardDenominations.map((denom, index) => (
                      <TabsTrigger 
                        key={denom.id} 
                        value={index.toString()} 
                        disabled={!denom.active || denom.stock <= 0}
                        className={`py-2 px-3 ${!denom.active || denom.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/80 hover:text-background'}`}
                      >
                        {formatCurrency(denom.value)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {giftCardDenominations.map((denom, index) => (
                    <TabsContent 
                      key={denom.id} 
                      value={index.toString()} 
                      className="border border-[#1e3a5f] rounded-md p-4 mb-4 bg-gradient-to-r from-[#0e1e32] to-[#132743]"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-white flex items-center">
                          <PlatformIcon platform={product.platform} className="mr-2 text-primary" />
                          <span>{product.platform} {translate('giftCards.giftCard') || "Gift Card"}</span>
                        </h4>
                        <div className="flex items-center gap-2">
                          {denom.stock > 0 ? (
                            <div className="bg-green-900/30 text-green-400 border border-green-800/40 px-2 py-1 rounded-full text-xs flex items-center">
                              <span className="bg-green-500/30 p-0.5 rounded-full mr-1">✓</span>
                              {translate('giftCards.inStock') || "En stock"}
                              {denom.stock > 0 && <span className="ml-1 text-xs opacity-80">({denom.stock})</span>}
                            </div>
                          ) : (
                            <div className="bg-red-900/30 text-red-400 border border-red-800/40 px-2 py-1 rounded-full text-xs flex items-center">
                              <span className="bg-red-500/30 p-0.5 rounded-full mr-1">✕</span>
                              {translate('giftCards.outOfStock') || "Rupture de stock"}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-[#0a0f1a]/60 p-3 rounded-md mb-3 flex justify-between items-center border border-[#1e3a5f]">
                        <span className="text-white">{translate('giftCards.value') || "Valeur"}:</span>
                        <Badge variant="outline" className="bg-[#132743] text-primary border-primary">
                          {formatCurrency(denom.value)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-400 text-sm">
                        {translate('giftCards.denominationDescription') || 
                         `Cette carte cadeau ${product.platform} vous offre une valeur de ${formatCurrency(denom.value)} utilisable sur la plateforme pour vos achats de jeux, abonnements ou contenus additionnels.`}
                      </p>
                      
                      {denom.active && denom.stock > 0 && (
                        <div className="mt-3 flex justify-end">
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/80 text-background flex items-center"
                            onClick={() => {
                              setSelectedDenomination(index);
                              setTimeout(() => {
                                const sectionElement = document.getElementById('add-to-cart-section');
                                if (sectionElement) {
                                  sectionElement.scrollIntoView({ behavior: 'smooth' });
                                }
                              }, 100);
                            }}
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-4 w-4 mr-1" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor" 
                              strokeWidth={2}
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                              />
                            </svg>
                            {translate('product.selectValue') || "Sélectionner cette valeur"}
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.div>
            )}
            
            {/* Game Product Editions Selection */}
            {(product.productType !== 'giftCard' && product.product_type !== 'giftCard') && product.hasEditions && editions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-cairo font-medium text-white mb-2">
                  {translate('product.selectEdition')}:
                </h3>
                <Tabs defaultValue="0" value={selectedEdition?.toString() || "0"} className="w-full"
                      onValueChange={(value) => setSelectedEdition(parseInt(value))}>
                  <TabsList className="grid grid-cols-3 mb-2">
                    <TabsTrigger value="0" className="text-sm">
                      {translate('product.standard')}
                    </TabsTrigger>
                    {editions.map((edition, index) => (
                      <TabsTrigger key={edition.id} value={(index + 1).toString()} className="text-sm">
                        {edition.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  <TabsContent value="0" className="border border-[#1e3a5f] rounded-md p-3 mb-4 bg-[#0e1e32]">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-white">{translate('product.standard')}</h4>
                      <Badge variant="outline" className="bg-[#132743] text-primary border-primary">
                        {formatCurrency(product.discountedPrice || product.price)}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{product.description}</p>
                  </TabsContent>
                  
                  {editions.map((edition, index) => (
                    <TabsContent key={edition.id} value={(index + 1).toString()} 
                                className="border border-[#1e3a5f] rounded-md p-3 mb-4 bg-[#0e1e32]">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-white">{edition.name}</h4>
                        <Badge variant="outline" className="bg-[#132743] text-primary border-primary">
                          {formatCurrency(edition.price)}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{edition.description}</p>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
            
            {/* Platform Selection (only for games) */}
            {(product.productType !== 'giftCard' && product.product_type !== 'giftCard') && platforms.length > 0 && (
              <div className="mb-6">
                <h3 className="font-cairo font-medium text-white mb-2">{translate('product.selectPlatform')}:</h3>
                <div className="flex space-x-3">
                  {platforms.map(platform => {
                    const iconName = getPlatformIcon(platform);
                    let PlatformIcon;
                    
                    switch (iconName) {
                      case 'playstation':
                        PlatformIcon = FaPlaystation;
                        break;
                      case 'xbox':
                        PlatformIcon = FaXbox;
                        break;
                      case 'steam':
                        PlatformIcon = FaSteam;
                        break;
                      case 'windows':
                        PlatformIcon = FaWindows;
                        break;
                      case 'mobile-alt':
                        PlatformIcon = FaMobileAlt;
                        break;
                      default:
                        PlatformIcon = FaGamepad;
                    }
                    
                    return (
                      <button
                        key={platform}
                        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
                          selectedPlatform === platform 
                            ? 'bg-primary text-background' 
                            : 'bg-background text-gray-400 hover:bg-primary/20 hover:text-primary'
                        }`}
                        onClick={() => setSelectedPlatform(platform)}
                      >
                        <PlatformIcon className="text-xl" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Quantity Selection */}
            <div className="mb-6">
              <h3 className="font-cairo font-medium text-white mb-2">{translate('product.quantity')}:</h3>
              <div className="flex items-center">
                <button 
                  className="w-10 h-10 bg-background text-white flex items-center justify-center rounded-l-md hover:bg-primary hover:text-background transition-colors"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <div className="w-12 h-10 bg-background text-white flex items-center justify-center">
                  {quantity}
                </div>
                <button 
                  className="w-10 h-10 bg-background text-white flex items-center justify-center rounded-r-md hover:bg-primary hover:text-background transition-colors"
                  onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
                >
                  +
                </button>
                
                {(product.productType !== 'giftCard' && product.product_type !== 'giftCard') && (
                  <div className="ml-3 text-gray-400">
                    {product.stock > 0 
                      ? `${product.stock} ${translate('product.inStock')}` 
                      : translate('product.outOfStock')}
                  </div>
                )}
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <div id="add-to-cart-section">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-background font-medium py-3 text-lg transition-all hover:shadow-[0_0_15px_rgba(255,215,0,0.6)] hover:scale-[1.02] flex items-center justify-center"
                onClick={handleAddToCart}
                disabled={(product.productType !== 'giftCard' && product.product_type !== 'giftCard') && product.stock === 0}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                  />
                </svg>
                {product.isPreOrder 
                  ? translate('product.preOrderNow') 
                  : translate('product.addToCart')}
              </Button>
              
              {(product.productType === 'giftCard' || product.product_type === 'giftCard') && selectedDenomination !== null && (
                <div className="mt-2 text-center text-sm text-gray-400">
                  {translate('giftCards.addToCartNote') || "Vous ajouterez une carte cadeau d'une valeur de"} <span className="text-primary font-medium">{formatCurrency(giftCardDenominations[selectedDenomination].value)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Section détaillée de la description en bas de page */}
        <div className="mt-12 bg-[#0a0f1a]/60 rounded-xl border border-[#1e3a5f] p-6 shadow-lg">
          <h2 className="text-2xl font-cairo font-bold text-white mb-4">
            {translate('product.detailedDescription') || "Description détaillée"}
          </h2>
          
          <div 
            className="prose prose-invert max-w-none prose-headings:text-primary prose-a:text-primary hover:prose-a:text-primary/80"
            dangerouslySetInnerHTML={{ __html: product.description || "" }}
          />
          
          {/* Informations techniques */}
          {(product.productType === 'game' || product.product_type === 'game') && (
            <div className="mt-8">
              <h3 className="text-xl font-cairo font-semibold text-white mb-3">
                {translate('product.technicalInfo') || "Informations techniques"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-start space-x-3">
                  <span className="text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-white">{translate('product.platform') || "Plateforme"}</p>
                    <p className="text-sm text-gray-400">{product.platform}</p>
                  </div>
                </div>
                {product.releaseDate && (
                  <>
                    <div className="flex items-start space-x-3">
                      <span className="text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-medium text-white">{translate('product.releaseDate') || "Date de sortie"}</p>
                        <p className="text-sm text-gray-400">{product.releaseDate ? new Date(product.releaseDate).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                    
                    {/* Preorder countdown timer */}
                    {product.isPreOrder && product.releaseDate && (
                      <div className="mt-4">
                        <CountdownTimer targetDate={product.releaseDate} className="mt-2" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
