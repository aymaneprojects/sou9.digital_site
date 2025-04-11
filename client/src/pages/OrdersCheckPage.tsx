import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrdersCheckPage = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Vérifier si l'utilisateur est connecté au chargement de la page
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/current");
        const data = await response.json();
        
        // Si l'utilisateur est connecté, le rediriger vers son profil
        if (response.ok && data.id) {
          console.log("Utilisateur connecté, redirection vers le profil");
          setLocation("/profile");
          toast({
            title: t("ordersCheck.redirectToAccount"),
            description: t("ordersCheck.alreadyLoggedIn"),
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur:", error);
        // En cas d'erreur, on laisse l'utilisateur sur la page actuelle
      }
    };
    
    checkUser();
  }, [setLocation, toast, t]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!orderNumber.trim()) {
      newErrors.orderNumber = t("ordersCheck.allFieldsRequired");
    }
    
    if (!email.trim()) {
      newErrors.email = t("ordersCheck.allFieldsRequired");
    }
    
    if (!phone.trim()) {
      newErrors.phone = t("ordersCheck.allFieldsRequired");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // D'abord, essayer de récupérer directement la commande par son numéro
      const directResponse = await fetch(`/api/orders/number/${orderNumber}`);
      
      if (directResponse.ok) {
        const orderData = await directResponse.json();
        
        // Si l'utilisateur connecté a accès à cette commande, le rediriger directement
        setLocation(`/order-confirmation/${orderData.id}`);
        return;
      }
      
      // Si la méthode directe échoue (pas connecté ou pas autorisé), utiliser la méthode de vérification
      const response = await fetch("/api/orders/verify", {
        method: "POST",
        body: JSON.stringify({
          orderNumber,
          email,
          phone
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.orderId) {
        // Rediriger vers la page de confirmation de commande
        setLocation(`/order-confirmation/${data.orderId}`);
      } else {
        toast({
          title: t("ordersCheck.invalidDetails"),
          description: data.message || t("ordersCheck.verificationError"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error verifying order:", error);
      toast({
        title: t("error"),
        description: t("ordersCheck.verificationError"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0a0f1a] pt-24 pb-16">
        <Helmet>
          <title>{t("ordersCheck.title")} | Sou9Digital</title>
        </Helmet>
        
        <div className="container max-w-4xl px-4 mx-auto">
          {/* Instructions Card */}
          <div className="mb-8 bg-[#132743] rounded-xl p-6 shadow-lg border border-[#1e3a6a]">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
              <HelpCircle className="mr-2 h-5 w-5" />
              {t("ordersCheck.title")} - {t("ordersCheck.instructions")}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-[#0c1c36] rounded-full p-2 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <p className="text-gray-300">
                  {t("ordersCheck.instructionStep1")}
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-[#0c1c36] rounded-full p-2 mr-3 mt-0.5">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-gray-300">
                  {t("ordersCheck.instructionStep2")}
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-[#0c1c36] rounded-full p-2 mr-3 mt-0.5">
                  <HelpCircle className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-gray-300">
                  {t("ordersCheck.instructionStep3")}
                </p>
              </div>
            </div>
          </div>
          
          {/* Verification Form Card */}
          <Card className="w-full bg-[#101f38] border border-[#1e3a6a] shadow-xl">
            <CardHeader className="border-b border-[#1e3a6a] bg-gradient-to-r from-[#0c1c36]/80 to-[#132743]/80">
              <CardTitle className="text-2xl font-bold text-primary">{t("ordersCheck.title")}</CardTitle>
              <CardDescription className="text-gray-300">
                {t("ordersCheck.description")}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleVerifyOrder} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber" className="text-white">{t("ordersCheck.orderNumber")}</Label>
                  <Input
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Format: SD000013"
                    className={`bg-[#0c1c36] border-[#1e3a6a] focus:border-primary focus:ring-primary ${errors.orderNumber ? "border-red-500" : ""}`}
                  />
                  {errors.orderNumber && (
                    <p className="text-sm text-red-500">{errors.orderNumber}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">{t("ordersCheck.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("ordersCheck.emailPlaceholder")}
                    className={`bg-[#0c1c36] border-[#1e3a6a] focus:border-primary focus:ring-primary ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">{t("ordersCheck.phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("ordersCheck.phonePlaceholder")}
                    className={`bg-[#0c1c36] border-[#1e3a6a] focus:border-primary focus:ring-primary ${errors.phone ? "border-red-500" : ""}`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t("ordersCheck.checking")}
                    </>
                  ) : (
                    t("ordersCheck.verifyButton")
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-center pt-2 pb-6 border-t border-[#1e3a6a] mt-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation("/")}
                className="mt-2 border-primary text-primary hover:bg-primary/10 hover:text-primary"
              >
                {t("cart.continueShopping")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrdersCheckPage;