import { useEffect } from "react";
import { useAuth } from "@/context/LocalAuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/Admin/Layout";
import UserManagement from "@/components/Admin/UserManagement";

const AdminUsersPage = () => {
  const { isAdmin, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (user === null) {
      navigate("/auth");
      return;
    }

    if (!isAdmin) {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin area.",
        variant: "destructive",
      });
    }
  }, [isAdmin, navigate, toast, user]);

  // Show loading or error state
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-400">Checking permissions...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6 md:py-12">
        <UserManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;