import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

const FloatingCart = () => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { items } = useCart();
  const [showButton, setShowButton] = useState(true);
  const itemCount = items.reduce((total: number, item) => total + item.quantity, 0);

  // Hide the floating cart button on the cart page
  useEffect(() => {
    setShowButton(location !== '/cart' && location !== '/checkout');
  }, [location]);

  if (!showButton) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Button
        className="rounded-full p-4 bg-primary hover:bg-primary/90 text-primary-foreground"
        size="icon"
        aria-label={t('navigation.cart')}
        asChild
      >
        <Link href="/cart">
          <ShoppingCart />
          {itemCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-red-500 text-white" 
              variant="default"
            >
              {itemCount}
            </Badge>
          )}
        </Link>
      </Button>
    </div>
  );
};

export default FloatingCart;