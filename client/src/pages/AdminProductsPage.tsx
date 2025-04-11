import { useEffect } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/Admin/Layout";
import ProductManagement from "@/components/Admin/ProductManagement";
import SimplifiedGiftCardManager from "@/components/Admin/SimplifiedGiftCardManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/LocalAuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { FaGamepad, FaGift } from "react-icons/fa";

const AdminProductsPage = () => {
  const { translate } = useLanguage();
  const { isAdmin, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Set page title
    document.title = "Sou9Digital - " + translate("admin.productsManagement");
    
    // Redirect if not admin after loading
    if (!isLoading && !isAdmin) {
      navigate("/auth");
    }
  }, [isAdmin, isLoading, navigate, translate]);
  
  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white mt-4">{translate("admin.loading")}</p>
        </div>
      </div>
    );
  }
  
  // Allow render only if admin
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-cairo font-bold text-3xl text-white">
          {translate("admin.products")}
        </h1>
        
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="bg-[#0a0f1a] border border-[#1e3a5f] p-1 mb-4">
            <TabsTrigger 
              value="games" 
              className="data-[state=active]:bg-[#132743] data-[state=active]:text-primary"
            >
              <FaGamepad className="mr-2" />
              {translate("admin.videoGames")}
            </TabsTrigger>
            <TabsTrigger 
              value="giftcards" 
              className="data-[state=active]:bg-[#132743] data-[state=active]:text-primary"
            >
              <FaGift className="mr-2" />
              {translate("giftCards.title")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="games" className="mt-0">
            <ProductManagement />
          </TabsContent>
          
          <TabsContent value="giftcards" className="mt-0">
            <SimplifiedGiftCardManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;
