import { useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Checkout from "@/components/Checkout";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/context/LocalAuthContext";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CheckoutPage = () => {
  const { translate } = useLanguage();
  const { items } = useCart();
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  
  // Récupérer les informations du profil utilisateur si connecté
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['/api/auth/current'],
    enabled: !!user, // Requête effectuée uniquement si l'utilisateur est connecté
  });
  
  const isLoading = authLoading || profileLoading;
  
  useEffect(() => {
    // Set page title
    document.title = "Sou9Digital - " + translate("checkout.title");
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Redirect to cart if cart is empty
    if (items.length === 0) {
      navigate("/cart");
    }
    
    // Nous permettons maintenant aux utilisateurs non connectés de passer commande
    // La redirection vers login a été supprimée pour permettre les commandes sans compte
  }, [items, navigate, translate]);
  
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-[#132743] py-20 px-4">
        <div className="container mx-auto">
          <h1 className="font-cairo font-bold text-4xl mb-4 text-center">{translate("checkout.title")}</h1>
          <p className="text-gray-400 text-center max-w-2xl mx-auto">{translate("checkout.subtitle")}</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="container mx-auto py-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{translate("common.loading")}</p>
          </div>
        </div>
      ) : profileError ? (
        <div className="container mx-auto py-16">
          <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <p className="text-red-500 mb-4">{translate("errors.profile_load_failed")}</p>
            <Button onClick={() => navigate('/login')} variant="outline">
              {translate("common.try_again")}
            </Button>
          </div>
        </div>
      ) : (
        <Checkout userProfile={userProfile} />
      )}
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
