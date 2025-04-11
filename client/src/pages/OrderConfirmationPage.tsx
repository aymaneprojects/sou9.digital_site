import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderConfirmation from "@/components/OrderConfirmation";
import { useLanguage } from "@/hooks/useLanguage";

const OrderConfirmationPage = () => {
  const { translate } = useLanguage();
  const [, params] = useRoute("/order-confirmation/:id");
  const [, navigate] = useLocation();
  const orderId = params?.id ? parseInt(params.id, 10) : 0;
  
  useEffect(() => {
    // Set page title
    document.title = "Sou9Digital - " + translate("orderConfirmation.title");
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Redirect if no order ID
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate, translate]);
  
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-[#132743] py-20 px-4">
        <div className="container mx-auto">
          <h1 className="font-cairo font-bold text-4xl mb-4 text-center">{translate("orderConfirmation.title")}</h1>
          <p className="text-gray-400 text-center max-w-2xl mx-auto">{translate("orderConfirmation.subtitle")}</p>
        </div>
      </div>
      
      <OrderConfirmation orderId={orderId} />
      
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
