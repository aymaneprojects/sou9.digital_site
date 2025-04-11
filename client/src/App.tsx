import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { LocalAuthProvider } from "./context/LocalAuthContext";
import { ProtectedRoute } from "./lib/protected-route";
import { NavigationHandler } from "./lib/navigation";
import { useEffect } from "react";
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from "./components/ScrollToTop";
import FloatingCart from "./components/FloatingCart";
import ChatBot from "./components/ChatBot";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ProfileOrders from "@/pages/ProfileOrders";
import StorePage from "@/pages/StorePage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import OrdersCheckPage from "@/pages/OrdersCheckPage";
import LoginPage from "@/pages/LoginPage";
import UserProfilePage from "@/pages/UserProfilePage";
import WalletPage from "@/pages/WalletPage";
import SupportPage from "@/pages/SupportPage";
import FAQPage from "@/pages/FAQPage";
import AfterSalesPage from "@/pages/AfterSalesPage";
import GiftCardsPage from "@/pages/GiftCardsPage";
import PromotionsPage from "@/pages/PromotionsPage";
import AboutPage from "@/pages/AboutPage";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Refund from "@/pages/Refund";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminProductsPage from "@/pages/AdminProductsPage";
import AdminEditionsPage from "@/pages/AdminEditionsPage";
import AdminOrdersPage from "@/pages/AdminOrdersPage";
import AdminCancelledOrdersPage from "@/pages/AdminCancelledOrdersPage";
import AdminOrdersValidationPage from "@/pages/AdminOrdersValidationPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AdminPaymentSettingsPage from "@/pages/AdminPaymentSettingsPage";
import AdminPromoCodesPage from "@/pages/AdminPromoCodesPage";
import AdminGiftCardsPage from "@/pages/AdminGiftCardsPage";
import AdminGiftCardDenominationsPage from "@/pages/AdminGiftCardDenominationsPage";
import AdminGameCodesPage from "@/pages/AdminGameCodesPage";

// Gestionnaire global d'erreurs réseau
function GlobalErrorHandler(): React.ReactElement {
  const { toast } = useToast();

  useEffect(() => {
    // Gestionnaire pour les erreurs réseau non capturées
    const handleNetworkError = (event: ErrorEvent) => {
      // On ne traite que les erreurs liées à des problèmes réseau ou à des sessions expirées
      if (event.error?.message?.includes('Failed to fetch') || 
          event.error?.message?.includes('NetworkError') ||
          event.error?.message?.includes('Network request failed') ||
          event.error?.message?.includes('session expired')) {
        
        toast({
          title: "Problème de connexion",
          description: "Vérifiez votre connexion internet puis actualisez la page.",
          variant: "destructive",
          duration: 6000
        });
        
        console.error("Erreur réseau détectée:", event.error);
      }
    };
    
    // Gestionnaire pour les erreurs non gérées dans les promesses
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Failed to fetch') || 
          event.reason?.message?.includes('NetworkError') ||
          event.reason?.message?.includes('Network request failed') ||
          event.reason?.message?.includes('session expired')) {
        
        toast({
          title: "Problème de connexion",
          description: "Une erreur s'est produite lors de la communication avec le serveur.",
          variant: "destructive",
          duration: 6000
        });
        
        console.error("Promesse rejetée non gérée:", event.reason);
      }
    };
    
    // Gestionnaire d'événement pour l'expiration de session
    const handleSessionExpired = () => {
      toast({
        title: "Session expirée",
        description: "Votre session a expiré. Veuillez vous reconnecter.",
        variant: "destructive",
        duration: 5000
      });
      console.log("🔑 Événement session:expired reçu");
    };
    
    window.addEventListener('error', handleNetworkError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('session:expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('error', handleNetworkError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('session:expired', handleSessionExpired);
    };
  }, [toast]);

  // Utiliser un Fragment plutôt que null pour éviter les problèmes de type
  return <></>;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/store" component={StorePage} />
      <Route path="/product/:id" component={ProductDetailPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/order-confirmation/:id" component={OrderConfirmationPage} />
      <Route path="/orders/check" component={OrdersCheckPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/auth" component={LoginPage} />
      <Route path="/gift-cards" component={GiftCardsPage} />
      <Route path="/promotions" component={PromotionsPage} />
      <Route path="/about" component={AboutPage} />
      
      {/* Protected routes for authenticated users */}
      <ProtectedRoute path="/profile" component={UserProfilePage} />
      <ProtectedRoute path="/profile/orders" component={ProfileOrders} />
      <ProtectedRoute path="/orders" component={ProfileOrders} />
      <ProtectedRoute path="/wallet" component={WalletPage} />
      
      <Route path="/support" component={SupportPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/after-sales" component={AfterSalesPage} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/refund" component={Refund} />
      
      {/* Admin-only routes */}
      <ProtectedRoute path="/admin" component={AdminDashboardPage} adminOrManagerOnly={true} />
      <ProtectedRoute path="/admin/products" component={AdminProductsPage} adminOrManagerOnly={true} />
      <ProtectedRoute path="/admin/editions" component={AdminEditionsPage} adminOrManagerOnly={true} />
      <ProtectedRoute path="/admin/orders" component={AdminOrdersPage} adminOrManagerOnly={true} />
      <ProtectedRoute path="/admin/orders/cancelled" component={AdminCancelledOrdersPage} adminOrManagerOnly={true} />

      <ProtectedRoute path="/admin/orders/validation" component={AdminOrdersValidationPage} adminOrManagerOnly={true} />
      <ProtectedRoute path="/admin/users" component={AdminUsersPage} adminOnly={true} />
      <ProtectedRoute path="/admin/payment-settings" component={AdminPaymentSettingsPage} adminOrManagerOnly={true} />
      <ProtectedRoute path="/admin/promo-codes" component={AdminPromoCodesPage} adminOrManagerOnly={true} />
      <ProtectedRoute path="/admin/gift-cards" component={AdminGiftCardsPage} adminOrManagerOnly={true} />
      <ProtectedRoute path="/admin/gift-card-denominations" component={AdminGiftCardDenominationsPage} adminOrManagerOnly={true} />
      <ProtectedRoute path="/admin/game-codes" component={AdminGameCodesPage} adminOrManagerOnly={true} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <LocalAuthProvider>
          <CartProvider>
            <HelmetProvider>
              <GlobalErrorHandler />
              <NavigationHandler />
              <ScrollToTop />
              <Router />
              {/* FloatingCart retiré à la demande du client */}
              <ChatBot />
              <Toaster 
                className="z-50 fixed bottom-4 right-4"
              />
            </HelmetProvider>
          </CartProvider>
        </LocalAuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
