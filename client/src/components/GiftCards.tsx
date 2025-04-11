import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/lib/utils";
import { getPlatformIcon, renderPlatformIcon, PlatformIconSizes } from "@/components/ui/PlatformIcon";
import { ShoppingCart, Gift, CreditCard, Check, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  discountedPrice: number | null;
  platform: string;
  category: string;
  isPreOrder: number;
  releaseDate: string | null;
  stock: number;
  createdAt: string;
  updatedAt: string;
  hasEditions: number;
}

const GiftCards = () => {
  const { translate } = useLanguage();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDenomination, setSelectedDenomination] = useState<any>(null);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch gift cards and game credits
  const { data: giftCards, isLoading } = useQuery({
    queryKey: ["/api/products/credits/all"],
  });
  
  // Fetch all available gift card denominations from API
  const { 
    data: denominations = [], 
    isLoading: isLoadingDenominations, 
    isError: denominationsError 
  } = useQuery({
    queryKey: ["/api/gift-card-denominations"],
    enabled: !isLoading && !!giftCards,
  });

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

  // Ensure giftCards is always an array and clean product names
  const giftCardsArray = Array.isArray(giftCards) 
    ? giftCards.map((card: Product) => ({
        ...card,
        name: card.name ? cleanProductName(card.name) : "Gift Card",
        // Récupérer les dénominations associées à cette carte cadeau
        // Chercher les dénominations par l'ID du produit ou par la plateforme
        denominations: Array.isArray(denominations) 
          ? denominations.filter((denom: any) => {
              // Correspondance directe par platformId (plus précise)
              if (card.id === denom.platformId) {
                return true;
              }
            
              // Correspondance par le nom de la plateforme dans le nom de la dénomination
              const platformInName = card.platform && 
                denom.name && 
                denom.name.toLowerCase().includes(card.platform.toLowerCase());
                
              // Assurons-nous que la correspondance est spécifique pour éviter les faux positifs
              return platformInName && (!denom.platformId || denom.platformId === card.id);
            })
          : []
      }))
    : [];
  
  // Pour le débogage
  console.log("GiftCards: produits avec dénominations:", giftCardsArray);
  
  // Extract all unique categories
  const categoriesSet = new Set(giftCardsArray.map((card: Product) => card.platform));
  const categories = Array.from(categoriesSet);

  // Filter gift cards by selected category
  const filteredGiftCards = selectedCategory
    ? giftCardsArray.filter((card: Product) => card.platform === selectedCategory)
    : giftCardsArray;

  return (
    <div className="py-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-block relative mb-4">
          <h2 className="text-3xl md:text-4xl font-cairo font-bold text-white mb-2 relative z-10">
            {translate("giftCards.title") || "Gift Cards & Game Credits"}
          </h2>
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary/40 rounded-full"></div>
          <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary rounded-full animate-pulse"></div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
          {translate("giftCards.subtitle") || "Purchase digital gift cards and game credits for all major gaming platforms"}
        </p>
      </div>

      {/* Category Filter - Enhanced version */}
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#0e1e32] via-[#132743] to-[#0e1e32] p-6 rounded-xl border border-primary/20 mb-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern-arabesque.svg')] opacity-5 bg-repeat bg-center"></div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        
        <h3 className="text-center text-white font-medium mb-5 flex items-center justify-center">
          <CreditCard className="w-5 h-5 mr-2 text-primary" />
          {translate("giftCards.filterBy") || "Filtrer par plateforme"}
        </h3>
        
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            variant={selectedCategory === null ? "default" : "outline"}
            className={`border-[#1e3a5f] text-white hover:bg-[#1e3a5f] transition-all font-medium cursor-pointer z-10 ${selectedCategory === null ? 'bg-primary hover:bg-primary/90 text-background shadow-[0_0_10px_rgba(184,134,11,0.3)]' : ''}`}
            onClick={() => {
              setSelectedCategory(null);
              console.log("Filtré: Toutes les plateformes");
            }}
          >
            <Gift className="mr-2 h-4 w-4" />
            {translate("giftCards.all") || "Toutes les Plateformes"}
          </Button>
          {categories.map((category) => (
            <Button
              type="button"
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`border-[#1e3a5f] text-white hover:bg-[#1e3a5f] transition-all font-medium cursor-pointer z-10 ${selectedCategory === category ? 'bg-primary hover:bg-primary/90 text-background shadow-[0_0_10px_rgba(184,134,11,0.3)]' : ''}`}
              onClick={() => {
                setSelectedCategory(category);
                console.log("Filtré par:", category);
              }}
            >
              {renderPlatformIcon(category, PlatformIconSizes.sm, "mr-2")}
              <span>{category}</span>
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredGiftCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGiftCards.map((card: Product) => (
            <Link href={`/product/${card.id}`} key={card.id} className="block h-full">
              <Card className="bg-[#132743] border-[#1e3a5f] overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-[0_0_20px_rgba(184,134,11,0.2)] hover:-translate-y-1 flex flex-col h-full cursor-pointer">
                <div className="p-4 bg-[#0e1e32] relative h-48 flex items-center justify-center overflow-hidden">
                  {card.imageUrl ? (
                    <>
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="h-full w-full object-contain transform hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0e1e32]/80 pointer-events-none"></div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center space-y-4 bg-gradient-radial from-[#132743] to-[#0e1e32] w-full h-full px-4 py-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        {renderPlatformIcon(card.platform, PlatformIconSizes.lg, "")}
                      </div>
                      <span className="text-lg font-medium text-white">
                        {card.platform}
                      </span>
                      <span className="text-3xl font-bold text-primary bg-[#0e1e32]/60 px-4 py-1 rounded-md">
                        {formatCurrency(card.price)}
                      </span>
                    </div>
                  )}
                  {card.discountedPrice && card.discountedPrice < card.price && (
                    <Badge
                      variant="outline"
                      className="absolute top-3 right-3 bg-primary text-background font-semibold py-1 px-3 border-none"
                    >
                      -{Math.round(((card.price - card.discountedPrice) / card.price) * 100)}%
                    </Badge>
                  )}
                  {/* Badge de détails retiré - l'utilisateur doit cliquer sur le produit pour voir les détails */}
                </div>
                <CardHeader className="py-4">
                  <CardTitle className="text-white text-xl font-cairo truncate">{card.name}</CardTitle>
                  <CardDescription className="text-gray-400 flex items-center gap-2 mt-1">
                    {renderPlatformIcon(card.platform, PlatformIconSizes.sm, "mr-2")}
                    <span>{card.platform}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <p className="text-sm text-gray-400 line-clamp-2">{card.description}</p>
                  
                  {/* Affichage des dénominations disponibles s'il y en a */}
                  {card.denominations && card.denominations.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-blue-300 mb-1">{translate("giftCards.availableDenominations") || "Valeurs disponibles:"}</p>
                      <div className="flex flex-wrap gap-1">
                        {card.denominations.map((denom: any) => (
                          <Badge 
                            key={denom.id}
                            variant="outline" 
                            className="bg-[#1e3a5f]/50 text-white border-blue-700/30 text-xs"
                          >
                            {formatCurrency(denom.value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between border-t border-[#1e3a5f] pt-4 mt-auto">
                  <div className="flex flex-col">
                    {card.discountedPrice ? (
                      <>
                        <span className="text-gray-400 line-through text-sm">
                          {formatCurrency(card.price)}
                        </span>
                        <span className="text-primary font-bold text-xl">
                          {formatCurrency(card.discountedPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-primary font-bold text-xl">{formatCurrency(card.price)}</span>
                    )}
                  </div>
                  <Button 
                    variant="default" 
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche la navigation lors du clic sur le bouton
                      e.preventDefault(); // Empêche que le Link ne s'active
                      
                      // Vérifier si la carte a des dénominations
                      if (card.denominations && card.denominations.length > 0) {
                        // Ouvrir la boîte de dialogue de sélection
                        setCurrentCard(card);
                        setSelectedDenomination(null);
                        setIsDialogOpen(true);
                      } else {
                        // Ajouter directement au panier si pas de dénominations
                        addToCart({
                          id: card.id,
                          name: card.name,
                          price: card.discountedPrice || card.price,
                          image: card.imageUrl,
                          platform: card.platform,
                          quantity: 1
                        });
                        
                        toast({
                          title: translate("cart.addedToCart") || "Ajouté au panier",
                          description: card.name,
                          duration: 3000,
                        });
                      }
                    }}
                    disabled={card.stock <= 0}
                    className="bg-primary hover:bg-primary/80 text-background font-medium transition-all duration-300 
                               hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:scale-105 hover:font-bold group w-full sm:w-auto z-10"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                    {card.stock <= 0 
                      ? (translate("product.outOfStock") || "Out of Stock") 
                      : (translate("product.addToCart") || "Add to Cart")}
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Gift className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-1">
            {translate("giftCards.noCardsFound") || "No gift cards found"}
          </h3>
          <p className="text-gray-400">
            {translate("giftCards.checkBack") || "Please check back later for available gift cards."}
          </p>
        </div>
      )}

      {/* Boîte de dialogue pour sélectionner une dénomination */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#132743] text-white border-[#1e3a5f]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {translate("giftCards.chooseDenomination") || "Choisir une valeur"}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {translate("giftCards.chooseDenominationDescription") || "Sélectionnez la valeur de la carte cadeau que vous souhaitez acheter"}
            </DialogDescription>
          </DialogHeader>
          
          {currentCard && (
            <div className="mt-4">
              <p className="font-medium text-white flex items-center">
                {renderPlatformIcon(currentCard.platform, PlatformIconSizes.sm, "mr-2")}
                {currentCard.name}
              </p>
              
              <div className="mt-4 space-y-4">
                <label className="text-sm text-white/90">{translate("giftCards.availableValues") || "Valeurs disponibles"}</label>
                <Select
                  onValueChange={(value) => {
                    const selectedDenom = currentCard.denominations.find((d: any) => d.id.toString() === value);
                    setSelectedDenomination(selectedDenom);
                  }}
                  value={selectedDenomination?.id?.toString() || ""}
                >
                  <SelectTrigger className="w-full bg-[#0a0f1a] border-[#264661] text-white">
                    <SelectValue placeholder={translate("giftCards.selectValue") || "Sélectionner une valeur"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f1a] border-[#264661] text-white">
                    {currentCard.denominations && currentCard.denominations.map((denom: any) => (
                      <SelectItem key={denom.id} value={denom.id.toString()} className="focus:bg-blue-950/50 focus:text-white">
                        <span className="flex items-center justify-between w-full">
                          <span>{denom.name}</span>
                          <span className="text-primary font-bold">{formatCurrency(denom.value)}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6 flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedDenomination(null);
              }}
              className="bg-transparent hover:bg-[#1e3a5f]/30 text-white border-[#264661]"
            >
              {translate("common.cancel") || "Annuler"}
            </Button>
            <Button
              onClick={() => {
                if (selectedDenomination && currentCard) {
                  // Ajouter au panier avec les informations de la dénomination
                  addToCart({
                    id: currentCard.id,
                    name: `${currentCard.name} - ${formatCurrency(selectedDenomination.value)}`,
                    price: selectedDenomination.value,
                    image: currentCard.imageUrl,
                    platform: currentCard.platform,
                    quantity: 1,
                    denominationId: selectedDenomination.id,
                    denominationValue: selectedDenomination.value
                  });
                  
                  toast({
                    title: translate("cart.addedToCart") || "Ajouté au panier",
                    description: `${currentCard.name} - ${formatCurrency(selectedDenomination.value)}`,
                    duration: 3000,
                  });
                  
                  setIsDialogOpen(false);
                  setSelectedDenomination(null);
                } else {
                  toast({
                    title: translate("common.error") || "Erreur",
                    description: translate("giftCards.selectValueFirst") || "Veuillez sélectionner une valeur",
                    variant: "destructive",
                    duration: 3000,
                  });
                }
              }}
              disabled={!selectedDenomination}
              className="bg-primary hover:bg-primary/80 text-background flex items-center"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {translate("product.addToCart") || "Ajouter au panier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GiftCards;