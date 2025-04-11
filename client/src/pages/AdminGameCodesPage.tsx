import React, { useEffect } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/Admin/Layout";
import { useAuth } from "@/context/LocalAuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

const AdminGameCodesPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const { translate } = useLanguage();

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
      <Card className="bg-[#132743] border-[#1e3a5f]">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            {translate("admin.gameCodes") || "Game Codes"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-900/30 border border-blue-700/30 rounded-md p-4 text-white mb-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-300">
                  {translate("admin.gameCodesInfo") || "Game Code Management"}
                </h4>
                <p className="mt-1 text-sm text-blue-200/80">
                  {translate("admin.gameCodesDescription") || 
                    "Game codes are managed through the order management process. When a payment is confirmed for an order, you can add the game code manually to the order."}
                </p>
                <p className="mt-2 text-sm text-blue-200/80">
                  {translate("admin.gameCodesProcess") || 
                    "Navigate to the Orders section to view pending orders. For each completed payment, add the appropriate game code which will be displayed to the customer on their order confirmation page."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminGameCodesPage;