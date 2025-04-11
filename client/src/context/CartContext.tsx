import { createContext, useEffect, useState, ReactNode, useCallback, useContext } from "react";
import { toast } from "@/hooks/use-toast";
import { Check, AlertCircle } from "lucide-react";
import i18next from "i18next";
import { apiRequest } from "@/lib/queryClient";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  platform: string;
  isEdition?: boolean;
  editionId?: number;
  productId?: number;
  isDenomination?: boolean;
  denominationId?: string;
}

export interface ProductEdition {
  id: number;
  productId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountedPrice: number | null;
  platform: string;
  imageUrl: string;
  stock: number;
  featured: number;
  isNewRelease: number;
  isOnSale: number;
  isPreOrder: number;
  hasEditions: number;
  editions?: ProductEdition[];
  releaseDate: string | null;
  createdAt: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: number, platform: string, quantity: number, isEdition?: boolean, editionId?: number, isDenomination?: boolean, denominationId?: string) => void;
  removeFromCart: (id: number, platform: string, isEdition?: boolean, editionId?: number, isDenomination?: boolean, denominationId?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  getTotal: () => 0,
});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Fonction pour vérifier si un produit existe dans la base de données
  const verifyProductExists = useCallback(async (productId: number): Promise<boolean> => {
    try {
      const response = await apiRequest("GET", `/api/products/${productId}`);
      return response.status === 200;
    } catch (error) {
      console.error("Erreur lors de la vérification du produit:", error);
      return false;
    }
  }, []);

  // Fonction pour valider tous les articles du panier
  const validateCartItems = useCallback(async () => {
    const currentLang = i18next.language;
    const removedItemsText = currentLang === 'fr' 
      ? 'Certains produits ont été retirés de votre panier car ils ne sont plus disponibles.' 
      : 'Some products have been removed from your cart because they are no longer available.';
    
    const itemsToValidate = [...items];
    const validItems: CartItem[] = [];
    let hasRemovedItems = false;

    for (const item of itemsToValidate) {
      const exists = await verifyProductExists(item.id);
      if (exists) {
        validItems.push(item);
      } else {
        hasRemovedItems = true;
      }
    }

    if (hasRemovedItems) {
      setItems(validItems);
      toast({
        title: removedItemsText,
        variant: "destructive",
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
          </div>
        ),
        duration: 5000
      });
    }
  }, [items, verifyProductExists]);

  // Vérification de l'existence des produits dans le panier au démarrage
  useEffect(() => {
    if (items.length > 0) {
      validateCartItems();
    }
  }, [items.length, validateCartItems]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = async (item: CartItem) => {
    // Vérifier que le produit existe avant de l'ajouter au panier
    const productExists = await verifyProductExists(item.id);
    
    if (!productExists) {
      const currentLang = i18next.language;
      const productNotAvailableText = currentLang === 'fr' 
        ? 'Ce produit n\'est plus disponible' 
        : 'This product is no longer available';
      
      toast({
        title: productNotAvailableText,
        description: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{item.name}</p>
          </div>
        ),
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    let isNewItem = false;
    let totalQuantity = item.quantity;
    
    setItems((prevItems) => {
      // Check if the item is already in the cart (with the same platform and edition/denomination if applicable)
      const existingItemIndex = prevItems.findIndex((i) => {
        // Si c'est une édition, on compare aussi l'ID de l'édition
        if (item.isEdition && i.isEdition) {
          return i.editionId === item.editionId && i.platform === item.platform;
        }
        // Si c'est une dénomination de carte cadeau, on compare l'ID de la dénomination
        if (item.isDenomination && i.isDenomination) {
          return i.denominationId === item.denominationId && i.platform === item.platform;
        }
        // Si ce n'est pas une édition ou dénomination, on compare l'ID du produit et la plateforme
        return i.id === item.id && i.platform === item.platform && !i.isEdition && !i.isDenomination;
      });

      if (existingItemIndex >= 0) {
        // If item exists, create a new array with the updated quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        totalQuantity = updatedItems[existingItemIndex].quantity;
        return updatedItems;
      } else {
        // Otherwise, add the new item to the array
        isNewItem = true;
        return [...prevItems, item];
      }
    });
    
    // Get translations directly from i18next
    const currentLang = i18next.language;
    const productAddedText = currentLang === 'fr' 
      ? 'Produit ajouté au panier' 
      : 'Product added to cart';
    const quantityUpdatedText = currentLang === 'fr' 
      ? 'Quantité mise à jour' 
      : 'Quantity updated';
    const itemText = currentLang === 'fr' 
      ? (totalQuantity > 1 ? 'articles' : 'article') 
      : (totalQuantity > 1 ? 'items' : 'item');
    
    // Show toast notification
    toast({
      title: isNewItem ? productAddedText : quantityUpdatedText,
      description: (
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-500">
              {item.platform} - {totalQuantity} {itemText}
            </p>
          </div>
          <div className="flex-shrink-0 h-7 w-7 bg-primary/20 rounded-full flex items-center justify-center text-primary">
            <Check className="h-4 w-4" />
          </div>
        </div>
      ),
      variant: "default",
      duration: 3000
    });
  };

  const updateQuantity = async (id: number, platform: string, quantity: number, isEdition: boolean = false, editionId?: number, isDenomination: boolean = false, denominationId?: string) => {
    // Vérifier que le produit existe avant de mettre à jour la quantité
    const productExists = await verifyProductExists(id);
    
    if (!productExists) {
      // Si le produit n'existe plus, le supprimer du panier
      removeFromCart(id, platform, isEdition, editionId, isDenomination, denominationId);
      
      const currentLang = i18next.language;
      const productRemovedText = currentLang === 'fr' 
        ? 'Produit supprimé du panier' 
        : 'Product removed from cart';
      const productNotAvailableText = currentLang === 'fr' 
        ? 'Ce produit n\'est plus disponible' 
        : 'This product is no longer available';
      
      toast({
        title: productRemovedText,
        description: productNotAvailableText,
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        // Pour une édition, on vérifie l'ID de l'édition et la plateforme
        if (isEdition && item.isEdition && item.editionId === editionId && item.platform === platform) {
          return { ...item, quantity };
        }
        // Pour une dénomination, on vérifie l'ID de la dénomination et la plateforme
        else if (isDenomination && item.isDenomination && item.denominationId === denominationId && item.platform === platform) {
          return { ...item, quantity };
        }
        // Pour un produit standard, on vérifie l'ID et la plateforme
        else if (!isEdition && !isDenomination && !item.isEdition && !item.isDenomination && item.id === id && item.platform === platform) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: number, platform: string, isEdition: boolean = false, editionId?: number, isDenomination: boolean = false, denominationId?: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => {
        // Pour une édition, on garde tout sauf l'article qui correspond à l'ID d'édition et la plateforme
        if (isEdition && item.isEdition) {
          return !(item.editionId === editionId && item.platform === platform);
        }
        // Pour une dénomination de carte cadeau, on garde tout sauf l'article qui correspond à l'ID de dénomination et la plateforme
        if (isDenomination && item.isDenomination) {
          return !(item.denominationId === denominationId && item.platform === platform);
        }
        // Pour un produit standard, on garde tout sauf l'article qui correspond à l'ID et la plateforme
        return !(item.id === id && item.platform === platform && !item.isEdition && !item.isDenomination);
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
