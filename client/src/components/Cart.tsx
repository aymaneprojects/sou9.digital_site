import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FaTrash } from "react-icons/fa";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";

const Cart = () => {
  const { translate } = useLanguage();
  const { items, updateQuantity, removeFromCart, getTotal } = useCart();
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-[#132743] rounded-[1.25rem] overflow-hidden shadow-lg p-8 text-center">
          <h2 className="font-cairo font-bold text-2xl text-white mb-4">{translate('cart.empty')}</h2>
          <p className="text-gray-400 mb-6">{translate('cart.emptyMessage')}</p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-background font-medium transition-colors">
            <Link href="/store">{translate('cart.continueShopping')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
      <div className="bg-[#132743] rounded-[1.25rem] overflow-hidden shadow-lg">
        <div className="p-4 sm:p-6">
          <h2 className="font-cairo font-bold text-xl sm:text-2xl text-white mb-4 sm:mb-6">{translate('cart.title')}</h2>
          
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.platform}`} className="flex flex-col sm:flex-row items-center border-b border-[#0a0f1a] pb-4">
                <div className="w-20 h-20 overflow-hidden rounded-lg mb-4 sm:mb-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="sm:ml-4 flex-grow">
                  <h3 className="font-cairo font-medium text-white mb-1">{item.name}</h3>
                  <p className="text-gray-400 text-sm">{translate('product.platform')}: {item.platform}</p>
                </div>
                <div className="flex items-center mt-4 sm:mt-0">
                  <button 
                    className="w-8 h-8 bg-background text-white flex items-center justify-center rounded-l-md hover:bg-primary hover:text-background transition-colors"
                    onClick={() => updateQuantity(
                      item.id,
                      item.platform,
                      Math.max(1, item.quantity - 1),
                      item.isEdition,
                      item.editionId,
                      item.isDenomination,
                      item.denominationId
                    )}
                  >
                    -
                  </button>
                  <div className="w-10 h-8 bg-background text-white flex items-center justify-center">
                    {item.quantity}
                  </div>
                  <button 
                    className="w-8 h-8 bg-background text-white flex items-center justify-center rounded-r-md hover:bg-primary hover:text-background transition-colors"
                    onClick={() => updateQuantity(
                      item.id,
                      item.platform,
                      Math.min(10, item.quantity + 1),
                      item.isEdition,
                      item.editionId,
                      item.isDenomination,
                      item.denominationId
                    )}
                  >
                    +
                  </button>
                </div>
                <div className="font-cairo font-bold text-primary text-lg sm:ml-6 mt-4 sm:mt-0 w-24 text-right">
                  {formatCurrency(item.price * item.quantity)}
                </div>
                <button 
                  className="sm:ml-4 text-[#E63946] hover:text-red-400 transition-colors mt-4 sm:mt-0"
                  onClick={() => removeFromCart(
                    item.id, 
                    item.platform, 
                    item.isEdition, 
                    item.editionId,
                    item.isDenomination,
                    item.denominationId
                  )}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-background transition-colors mb-4 md:mb-0">
              <Link href="/store">{translate('cart.continueShopping')}</Link>
            </Button>
            
            <div className="text-right">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">{translate('cart.subtotal')}:</span>
                <span className="font-cairo font-bold text-white ml-8">{formatCurrency(getTotal())}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-400">{translate('cart.total')}:</span>
                <span className="font-cairo font-bold text-primary text-xl ml-8">{formatCurrency(getTotal())}</span>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 text-background font-medium transition-colors w-full md:w-auto px-8">
                <Link href="/checkout">{translate('cart.proceedToCheckout')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
