import React, { useEffect } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/Admin/Layout";
import { useAuth } from "@/context/LocalAuthContext";
import SimplifiedGiftCardManager from "@/components/Admin/SimplifiedGiftCardManager";

const AdminGiftCardsPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  // Effects
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && user && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <AdminLayout>
      <SimplifiedGiftCardManager />
    </AdminLayout>
  );
};

export default AdminGiftCardsPage;