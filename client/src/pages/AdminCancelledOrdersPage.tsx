import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/Admin/Layout";
import { useAuth } from "@/context/LocalAuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch, FaUndo } from "react-icons/fa";

// Types pour les commandes
interface Order {
  id: number;
  userId: number | null;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  paymentMethod: string;
  createdAt: string;
  cancelledReason?: string;
}

const AdminCancelledOrdersPage = () => {
  const { translate } = useLanguage();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    // Set page title
    document.title = "Sou9Digital - " + translate("admin.cancelledOrders");
    
    // Redirect if not admin after loading
    if (!authLoading && !isAdmin) {
      navigate("/auth");
    }
  }, [isAdmin, authLoading, navigate, translate]);
  
  // Récupérer uniquement les commandes annulées
  const { data: cancelledOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders/cancelled"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/orders");
      const allOrders = await response.json() as Order[];
      return allOrders.filter(order => order.status === 'cancelled');
    }
  });
  
  // Mettre à jour le statut d'une commande (restaurer)
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/cancelled"] });
      toast({
        title: translate("admin.success"),
        description: translate("admin.orderRestored"),
      });
      
      // Redirection vers la page des commandes en attente après un court délai
      setTimeout(() => {
        navigate("/admin/orders");
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: translate("admin.error"),
        description: `${translate("admin.restoreError")}: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Filtrer les commandes en fonction du terme de recherche
  const filteredOrders = cancelledOrders.filter(
    (order) =>
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phoneNumber.includes(searchTerm) ||
      order.id.toString().includes(searchTerm)
  );
  
  // Restaurer une commande annulée
  const handleRestoreOrder = (orderId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir restaurer cette commande ?")) {
      updateOrderStatusMutation.mutate({ 
        id: orderId, 
        status: 'pending' 
      });
    }
  };
  
  // Afficher le chargement
  if (authLoading || ordersLoading) {
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
        <div className="flex justify-between items-center">
          <h1 className="font-cairo font-bold text-3xl text-white">
            {translate("admin.cancelledOrders") || "Commandes Annulées"}
          </h1>
          
          <Button 
            onClick={() => navigate("/admin/orders")}
            className="bg-[#132743] hover:bg-[#1e3a5f] text-white border border-[#264661]"
          >
            {translate("admin.backToOrders") || "Retour aux Commandes"}
          </Button>
        </div>
        
        <div className="mb-6 flex justify-start">
          <div className="relative w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={translate("admin.searchOrders") || "Rechercher des commandes"}
              className="pl-10 bg-[#132743] border-[#B8860B] text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="bg-[#132743] rounded-lg shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#B8860B]/30">
                <TableHead className="text-primary">ID</TableHead>
                <TableHead className="text-primary">{translate("admin.customer") || "Client"}</TableHead>
                <TableHead className="text-primary">{translate("admin.amount") || "Montant"}</TableHead>
                <TableHead className="text-primary">{translate("admin.paymentStatus") || "Statut de Paiement"}</TableHead>
                <TableHead className="text-primary">{translate("admin.paymentMethod") || "Méthode de Paiement"}</TableHead>
                <TableHead className="text-primary">{translate("admin.date") || "Date"}</TableHead>
                <TableHead className="text-primary">{translate("admin.cancelReason") || "Raison de l'annulation"}</TableHead>
                <TableHead className="text-primary">{translate("admin.actions") || "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    className="border-b border-[#B8860B]/20 hover:bg-[#0a0f1a]/30"
                  >
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.firstName} {order.lastName}</TableCell>
                    <TableCell>{order.totalAmount.toFixed(2)} MAD</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.paymentStatus === 'completed' 
                          ? 'bg-green-900/50 text-green-200' 
                          : order.paymentStatus === 'failed'
                          ? 'bg-red-900/50 text-red-200'
                          : 'bg-yellow-900/50 text-yellow-200'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={order.cancelledReason || ""}>
                      {order.cancelledReason || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-blue-400 hover:text-blue-400/80 hover:bg-blue-400/10"
                          onClick={() => handleRestoreOrder(order.id)}
                          title={translate("admin.restoreOrder") || "Restaurer la commande"}
                        >
                          <FaUndo className="mr-1" />
                          {translate("admin.restore") || "Restaurer"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {searchTerm 
                      ? (translate("admin.noOrdersFound") || "Aucune commande trouvée") 
                      : (translate("admin.noCancelledOrders") || "Aucune commande annulée")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCancelledOrdersPage;