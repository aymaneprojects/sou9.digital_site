import { useState, useEffect } from "react";
import { useAuth } from "@/context/LocalAuthContext";
import { FaShoppingBag, FaCalendarAlt, FaCreditCard, FaInfoCircle, FaEye, FaClock, FaTimesCircle } from "react-icons/fa";
import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  paymentStatus: string;
  orderNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

const ProfileOrders = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Utiliser react-query pour gérer la récupération des commandes
  const { data: orders = [], isLoading: loadingOrders, refetch } = useQuery({
    queryKey: ["/api/users", user?.id, "orders"],
    queryFn: async () => {
      if (!user?.id) {
        console.log("Aucun utilisateur connecté pour récupérer les commandes");
        return [];
      }
      
      console.log(`📦 Récupération des commandes pour l'utilisateur ${user.id}`);
      
      try {
        const response = await apiRequest("GET", `/api/users/${user.id}/orders`);
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des commandes: ${response.status}`);
        }
        const data = await response.json();
        console.log(`✅ ${data.length} commande(s) récupérée(s)`);
        return data;
      } catch (error) {
        console.error("❌ Erreur lors du chargement des commandes:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos commandes, veuillez réessayer.",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: !!user?.id, // Activer uniquement si un utilisateur est connecté
    refetchInterval: 30000, // Actualiser automatiquement toutes les 30 secondes
  });
  
  // Fonction pour annuler une commande
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    console.log(`🚫 Tentative d'annulation de la commande #${selectedOrder.orderNumber} (ID: ${selectedOrder.id})`);
    
    try {
      // Utilisation du format fetch standard pour éviter les problèmes potentiels avec apiRequest
      console.log(`🚀 Envoi de requête PATCH vers /api/orders/${selectedOrder.id}/status avec le statut "cancelled"`);
      const response = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id?.toString() || '',
          'X-User-Role': user?.role || ''
        },
        body: JSON.stringify({
          status: "cancelled"
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Échec de l'annulation de la commande: ${response.status} ${response.statusText} ${
            errorData.message ? `- ${errorData.message}` : ''
          }`
        );
      }
      
      const data = await response.json();
      console.log(`📥 Réponse reçue pour annulation: status=${response.status}`, data);
      
      // Mise à jour optimiste de l'UI - important pour la réactivité immédiate
      console.log(`🔄 Mise à jour optimiste du cache local`);
      queryClient.setQueryData(["/api/users", user?.id, "orders"], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((o: Order) => 
          o.id === selectedOrder.id ? { ...o, status: "cancelled" } : o
        );
      });
      
      // Définir directement les données pour cette commande spécifique
      queryClient.setQueryData(["/api/orders", selectedOrder.id], {
        ...selectedOrder,
        status: "cancelled"
      });
      
      // Force refetch pour s'assurer d'avoir les données à jour
      console.log(`♻️ Rechargement forcé des données`);
      await refetch();
      
      // Notification utilisateur après le traitement des caches
      toast({
        title: "Commande annulée",
        description: `La commande #${selectedOrder.orderNumber} a été annulée avec succès.`
      });
      
      setShowCancelDialog(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("❌ Erreur lors de l'annulation de la commande:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la commande. Veuillez réessayer ou contacter le support.",
        variant: "destructive"
      });
    }
  };
  
  // Fonction pour vérifier le statut de paiement
  const handleCheckPaymentStatus = async (order: Order) => {
    console.log(`🔍 Vérification du statut de paiement pour la commande #${order.orderNumber}`, order);
    setSelectedOrder(order);
    setCheckingPayment(true);
    
    try {
      // Utilisation du format standard apiRequest pour assurer la synchronisation avec l'API
      console.log(`🚀 Envoi de requête GET vers /api/orders/${order.id}`);
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id?.toString() || '',
          'X-User-Role': user?.role || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Impossible de récupérer les détails de la commande: ${response.status}`);
      }
      
      const updatedOrder = await response.json();
      console.log(`📥 Réponse reçue: status=${response.status}`, updatedOrder);
      
      // Mise à jour du cache optimiste dans l'UI
      queryClient.setQueryData(["/api/users", user?.id, "orders"], (oldData: any) => {
        if (!oldData) return oldData;
        console.log(`🔄 Mise à jour du cache local pour les commandes de l'utilisateur ${user?.id}`);
        return oldData.map((o: Order) => 
          o.id === updatedOrder.id ? { ...o, paymentStatus: updatedOrder.paymentStatus } : o
        );
      });
      
      // Définir directement les données pour cette commande spécifique
      queryClient.setQueryData(["/api/orders", order.id], updatedOrder);
      
      // Puis forcer un rechargement complet des données
      console.log(`♻️ Rechargement des données`);
      await refetch();
      
      // Notification à l'utilisateur
      toast({
        title: "Statut de paiement",
        description: `Le statut de paiement de la commande #${order.orderNumber} est: ${getPaymentStatusText(updatedOrder.paymentStatus)}`
      });
    } catch (error) {
      console.error("❌ Erreur lors de la vérification du statut de paiement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le statut du paiement. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setCheckingPayment(false);
      setSelectedOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "cancelled":
        return "bg-red-500";
      case "pending":
      default:
        return "bg-yellow-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Terminée";
      case "processing":
        return "En traitement";
      case "shipped":
        return "Expédiée";
      case "cancelled":
        return "Annulée";
      case "pending":
      default:
        return "En attente";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Payée";
      case "pending":
        return "En attente";
      case "failed":
        return "Échouée";
      case "unpaid":
        return "Non payée";
      case "refunded":
        return "Remboursée";
      case "partial":
        return "Partiellement payée";
      default:
        // Si le statut n'est pas défini, on affiche "En attente" par défaut au lieu de "Inconnu"
        return status ? status : "En attente";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12 mt-16 flex-grow">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Mes commandes</h1>
          <p className="text-gray-400 mt-1">
            Consultez l'historique et le statut de vos commandes
          </p>
        </div>

        {loadingOrders || authLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#0c1c36] border border-[#1e3a6a] rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <FaShoppingBag className="text-4xl text-primary/60" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Vous n'avez pas encore de commandes
            </h3>
            <p className="text-gray-400 mb-6">
              Découvrez notre catalogue et faites votre première commande dès maintenant.
            </p>
            <Link
              to="/store"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors duration-300"
            >
              Parcourir la boutique
            </Link>
          </div>
        ) : (
          <>
            {/* Version bureau - tableau */}
            <div className="hidden md:block bg-[#0c1c36] border border-[#1e3a6a] rounded-lg overflow-hidden">
              <div className="overflow-y-auto max-h-[70vh] custom-scrollbar">
                <table className="w-full">
                  <thead className="bg-[#132743] sticky top-0 z-10">
                    <tr>
                      <th className="text-left py-4 px-6 text-white font-semibold">
                        Commande
                      </th>
                      <th className="text-left py-4 px-6 text-white font-semibold">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 text-white font-semibold">
                        Statut
                      </th>
                      <th className="text-left py-4 px-6 text-white font-semibold">
                        Paiement
                      </th>
                      <th className="text-left py-4 px-6 text-white font-semibold">
                        Total
                      </th>
                      <th className="text-center py-4 px-6 text-white font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: Order) => (
                      <tr key={order.id} className="border-t border-[#1e3a6a] hover:bg-[#132743]/30 transition-colors duration-150">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <FaShoppingBag className="text-primary mr-3" />
                            <span className="text-white font-medium">
                              #{order.orderNumber}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2" />
                            <div>
                              <p className="text-white">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(order.createdAt), {
                                  addSuffix: true,
                                  locale: fr,
                                })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${getStatusColor(
                                order.status
                              )} mr-2`}
                            ></span>
                            <span className="text-white">
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <FaCreditCard className="text-gray-400 mr-2" />
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(
                                order.paymentStatus
                              )} text-white`}
                            >
                              {getPaymentStatusText(order.paymentStatus)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white font-semibold">
                            {order.totalAmount.toFixed(2)} DH
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center space-x-2">
                            <Link
                              to={`/order-confirmation/${order.id}`}
                              className="p-2 bg-[#1a3354] text-white rounded-full hover:bg-primary transition-colors duration-300"
                              title="Voir les détails"
                            >
                              <FaEye size={16} />
                            </Link>
                            {/* Bouton de vérification du paiement pour les commandes en attente */}
                            {order.status === "pending" && (
                              <button
                                onClick={() => handleCheckPaymentStatus(order)}
                                disabled={checkingPayment}
                                className="p-2 bg-[#1a3354] text-yellow-400 rounded-full hover:bg-yellow-600 hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Vérifier le statut du paiement"
                                aria-label="Vérifier le statut du paiement"
                              >
                                {checkingPayment && selectedOrder?.id === order.id ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                                ) : (
                                  <FaClock size={16} />
                                )}
                              </button>
                            )}
                            
                            {/* Le bouton d'aide redirige vers la page de support */}
                            <Link
                              to="/support"
                              className="p-2 bg-[#1a3354] text-blue-400 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-300"
                              title="Obtenir de l'aide"
                            >
                              <FaInfoCircle size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Version mobile - cartes */}
            <div className="md:hidden space-y-4">
              {orders.map((order: Order) => (
                <div 
                  key={order.id} 
                  className="bg-[#0c1c36] border border-[#1e3a6a] rounded-lg p-4 shadow-md"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <FaShoppingBag className="text-primary mr-2" />
                      <span className="text-white font-medium">#{order.orderNumber}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(
                        order.paymentStatus
                      )} text-white`}
                    >
                      {getPaymentStatusText(order.paymentStatus)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <p className="text-gray-400">Date</p>
                      <p className="text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Statut</p>
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${getStatusColor(
                            order.status
                          )} mr-2`}
                        ></span>
                        <span className="text-white">{getStatusText(order.status)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400">Total</p>
                      <p className="text-white font-semibold">{order.totalAmount.toFixed(2)} DH</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-2 border-t border-[#1e3a6a] pt-3">
                    <Link
                      to={`/order-confirmation/${order.id}`}
                      className="p-2 bg-[#1a3354] text-white rounded-full hover:bg-primary transition-colors duration-300"
                      title="Voir les détails"
                      aria-label="Voir les détails de la commande"
                    >
                      <FaEye size={16} />
                    </Link>
                    
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCheckPaymentStatus(order)}
                        disabled={checkingPayment}
                        className="p-2 bg-[#1a3354] text-yellow-400 rounded-full hover:bg-yellow-600 hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Vérifier le statut du paiement"
                        aria-label="Vérifier le statut du paiement"
                      >
                        {checkingPayment && selectedOrder?.id === order.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                        ) : (
                          <FaClock size={16} />
                        )}
                      </button>
                    )}
                    
                    <Link
                      to="/support"
                      className="p-2 bg-[#1a3354] text-blue-400 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-300"
                      title="Obtenir de l'aide"
                      aria-label="Obtenir de l'aide"
                    >
                      <FaInfoCircle size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
      
      {/* Boîte de dialogue de confirmation pour l'annulation de commande */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-[#0c1c36] border border-[#1e3a6a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-white">
              Confirmer l'annulation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Êtes-vous sûr de vouloir annuler cette commande ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel 
              className="bg-[#132743] text-white border border-[#1e3a6a] hover:bg-[#1e3a6a]"
              onClick={() => {
                setSelectedOrder(null);
                setShowCancelDialog(false);
              }}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleCancelOrder}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileOrders;