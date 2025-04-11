import { useEffect } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/Admin/Layout";
import OrderManagement from "@/components/Admin/OrderManagement";
import { useAuth } from "@/context/LocalAuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";

const AdminOrdersValidationPage = () => {
  const { translate } = useLanguage();
  const { isAdmin, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Set page title
    document.title = "Sou9Digital - " + translate("admin.ordersValidation");
    
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
          <p className="text-white mt-4">{translate("admin.loading") || "Chargement..."}</p>
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
        <div className="flex justify-between items-center">
          <h1 className="font-cairo font-bold text-3xl text-white">
            {translate("admin.ordersValidation") || "Validation des Commandes"}
          </h1>
          
          <Button 
            onClick={() => navigate("/admin/orders")}
            className="bg-[#132743] hover:bg-[#1e3a5f] text-white border border-[#264661]"
          >
            {translate("admin.allOrders") || "Toutes les commandes"}
          </Button>
        </div>
        
        <OrderManagement initialFilter="paid" />
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersValidationPage;