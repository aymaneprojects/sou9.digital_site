import { useEffect } from "react";
import { useRoute } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import RandomRecommendations from "@/components/RandomRecommendations";
import { useLanguage } from "@/hooks/useLanguage";

const ProductDetailPage = () => {
  const { translate } = useLanguage();
  const [, params] = useRoute("/product/:id");
  const productId = params?.id ? parseInt(params.id, 10) : 0;
  
  useEffect(() => {
    // Set dynamic page title - will be updated when product data loads
    document.title = "Sou9Digital - " + translate("product.loading");
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [translate]);
  
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-[#132743] py-20 px-4">
        <div className="container mx-auto">
          <h1 className="font-cairo font-bold text-4xl mb-4 text-center">{translate("product.title")}</h1>
          <p className="text-gray-400 text-center max-w-2xl mx-auto">{translate("product.subtitle")}</p>
        </div>
      </div>
      
      <ProductDetail productId={productId} />
      
      <div className="container mx-auto px-4 pb-12">
        <RandomRecommendations currentProductId={productId} />
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
