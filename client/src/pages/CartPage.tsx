import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { useLanguage } from "@/hooks/useLanguage";

const CartPage = () => {
  const { translate } = useLanguage();
  
  useEffect(() => {
    // Set page title
    document.title = "Sou9Digital - " + translate("cart.title");
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [translate]);
  
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-[#132743] py-20 px-4">
        <div className="container mx-auto">
          <h1 className="font-cairo font-bold text-4xl mb-4 text-center">{translate("cart.title")}</h1>
          <p className="text-gray-400 text-center max-w-2xl mx-auto">{translate("cart.subtitle")}</p>
        </div>
      </div>
      
      <Cart />
      
      <Footer />
    </div>
  );
};

export default CartPage;
