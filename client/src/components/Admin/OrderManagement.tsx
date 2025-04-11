import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  FaSearch, 
  FaEye, 
  FaEdit,
  FaCheck, 
  FaTimes, 
  FaEnvelope, 
  FaKey, 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaExclamationTriangle,
  FaInfo,
  FaSave,
  FaSpinner,
  FaGamepad,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaPhone,
  FaCreditCard,
  FaMoneyBill,
  FaBoxOpen,
  FaClock,
  FaCheckCircle,
  FaExternalLinkAlt
} from "react-icons/fa";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

// Types et interfaces
type OrderStatus = 'all' | 'pending' | 'paid' | 'delivered' | 'cancelled';
type SortField = 'date' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';

interface OrderDetail {
  id: number;
  userId: number | null;
  status: string;
  totalAmount: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
  gameCodes?: GameCode[];
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  productName?: string;
  platform?: string;
  editionId?: number | null;
  editionName?: string;
  productType?: 'game' | 'giftCard';
}

interface GameCode {
  id: number;
  productId: number;
  code: string;
  isUsed: boolean;
  orderId: number | null;
  createdAt?: string;
  editionId?: number | null;
  platform?: string;
  productName?: string;
  productType?: 'game' | 'giftCard';
}

interface GameCodeFormProps {
  orderItems: OrderItem[];
  gameCodes: { [key: number]: string };
  isSubmitting: boolean;
  selectedOrder: OrderDetail;
  onSave: () => void;
  onCodeChange: (productId: number, code: string) => void;
  translate: (key: string) => string;
}

const GameCodeForm = ({
  orderItems,
  gameCodes,
  isSubmitting,
  selectedOrder,
  onSave,
  onCodeChange,
  translate
}: GameCodeFormProps) => {
  const hasCodes = selectedOrder.gameCodes && selectedOrder.gameCodes.length > 0;
  const gameItems = orderItems.filter(item => 
    item.productType === 'game' || // Si productType est défini
    (!item.productType && item.platform !== 'Steam' && item.platform !== 'PlayStation' && 
     item.platform !== 'Xbox' && item.platform !== 'Nintendo Switch' && 
     item.platform !== 'EpicStore' && item.platform !== 'Origin' && 
     item.platform !== 'Amazon')
  );
  
  // Ajouter des logs pour déboguer
  console.log("📝 Données des articles de commande:", orderItems);
  console.log("🎮 Articles de jeu filtrés:", gameItems);
  
  return (
    <div className="rounded-md bg-[#0d1522] p-4 border border-[#1d3a56]">
      <div className="space-y-4">
        <Alert className="bg-[#132743] border-[#B8860B]">
          <FaInfo className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-gray-300">
            {translate("admin.bankVerificationDescription")}
          </AlertDescription>
        </Alert>
        
        {hasCodes ? (
          <div className="space-y-2">
            <h4 className="font-medium text-primary">{translate("admin.assignedGameCodes")}</h4>
            {selectedOrder.gameCodes?.map((code) => (
              <div key={code.id} className="bg-[#132743] p-2 rounded-md flex items-center justify-between">
                <div>
                  <span className="text-gray-300">{code.productName || 'Unknown'} - </span>
                  <span className="font-mono font-bold">{code.code}</span>
                </div>
                <Badge className="bg-green-600">{translate("assignedStatus")}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <>
            {gameItems.length > 0 ? (
              <>
                <div className="space-y-2">
                  <h4 className="font-medium text-primary">{translate("enterGameCodes")}</h4>
                  {gameItems.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <label className="text-sm text-gray-300">
                        {item.productName} {item.editionName ? `(${item.editionName})` : ''} x{item.quantity}:
                      </label>
                      <div className="flex items-center">
                        <Input
                          value={gameCodes[item.productId] || ''}
                          onChange={(e) => onCodeChange(item.productId, e.target.value)}
                          placeholder={translate("enterCodeHere")}
                          className="flex-1 bg-[#0a0f1a] border-[#264661]"
                        />
                      </div>
                    </div>
                  ))}
                  <Button 
                    onClick={onSave}
                    disabled={isSubmitting}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="mr-2 animate-spin" />
                        {translate("savingGameCodes")}
                      </>
                    ) : (
                      <>
                        <FaGamepad className="mr-2" />
                        {translate("saveGameCodes")}
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 py-4">
                <FaGamepad className="mx-auto mb-2 opacity-30" size={24} />
                <p>{translate("admin.noGameProductsInOrder")}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface OrderManagementProps {
  initialFilter?: OrderStatus;
}

const OrderManagement = ({ initialFilter = 'all' }: OrderManagementProps) => {
  // State
  const [selectedTab, setSelectedTab] = useState<OrderStatus>(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ orderId: number, status: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [gameCodes, setGameCodes] = useState<{[key: number]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { translate } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, navigate] = useLocation();

  // Queries
  const { 
    data: orders = [], 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders', {
        headers: {
          'X-User-Id': '0',
          'X-User-Role': 'admin'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    }
  });

  // Mutations
  const updateOrderStatusMutation = useMutation({
    mutationFn: async (data: { orderId: number, status: string }) => {
      return apiRequest('PATCH', `/api/orders/${data.orderId}/status`, 
      { status: data.status },
      {
        'X-User-Id': '0',
        'X-User-Role': 'admin'
      });
    },
    onSuccess: () => {
      toast({
        title: translate("admin.success"),
        description: translate("admin.orderStatusUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      if (selectedOrder) {
        setSelectedOrder({
          ...selectedOrder,
          status: pendingStatusUpdate?.status || selectedOrder.status
        });
      }
      setIsStatusDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating order status:", error);
      toast({
        title: translate("admin.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  });
  
  const updateOrderPaymentStatusMutation = useMutation({
    mutationFn: async (data: { orderId: number, paymentStatus: string }) => {
      return apiRequest('PATCH', `/api/orders/${data.orderId}/payment`, 
      { paymentStatus: data.paymentStatus },
      {
        'X-User-Id': '0',
        'X-User-Role': 'admin'
      });
    },
    onSuccess: () => {
      toast({
        title: translate("admin.success"),
        description: translate("admin.paymentStatusUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      refetch();
    },
    onError: (error) => {
      console.error("Error updating payment status:", error);
      toast({
        title: translate("admin.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  });
  
  const updateOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PATCH', `/api/orders/${data.id}`, 
      data,
      {
        'X-User-Id': '0',
        'X-User-Role': 'admin'
      });
    },
    onSuccess: () => {
      toast({
        title: translate("admin.success"),
        description: translate("admin.orderUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating order:", error);
      toast({
        title: translate("admin.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  });
  
  const saveGameCodesMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrder) return null;
      
      const gameCodesToSave = Object.entries(gameCodes)
        .filter(([_, code]) => code.trim() !== '')
        .map(([productId, code]) => ({
          orderId: selectedOrder.id,
          productId: Number(productId),
          code: code.trim()
        }));
      
      if (gameCodesToSave.length === 0) {
        throw new Error(translate("admin.gameCodesRequired"));
      }
      
      return apiRequest('POST', `/api/orders/${selectedOrder.id}/game-codes`, 
      gameCodesToSave,
      {
        'X-User-Id': '0',
        'X-User-Role': 'admin'
      });
    },
    onSuccess: () => {
      toast({
        title: translate("admin.success"),
        description: translate("admin.gameCodesAdded"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setGameCodes({});
    },
    onError: (error) => {
      console.error("Error saving game codes:", error);
      toast({
        title: translate("admin.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  });
  
  // Handlers
  const handleUpdateOrderStatus = (orderId: number, status: string) => {
    setPendingStatusUpdate({ orderId, status });
    setIsStatusDialogOpen(true);
  };
  
  const confirmStatusUpdate = () => {
    if (pendingStatusUpdate) {
      updateOrderStatusMutation.mutateAsync(pendingStatusUpdate);
    }
  };
  
  const handleUpdatePaymentStatus = (orderId: number, paymentStatus: string) => {
    updateOrderPaymentStatusMutation.mutateAsync({ orderId, paymentStatus });
  };

  const handleViewOrder = async (orderId: number) => {
    try {
      // Fetch order details
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
        headers: {
          'X-User-Id': '0',
          'X-User-Role': 'admin'
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching order: ${response.statusText}`);
      }

      const orderData = await response.json();
      setSelectedOrder(orderData);
      setGameCodes({});

      // Fetch order items with product details
      const itemsResponse = await fetch(`/api/orders/${orderId}/items`, {
        credentials: 'include',
        headers: {
          'X-User-Id': '0',
          'X-User-Role': 'admin'
        }
      });

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setOrderItems(itemsData);
      } else {
        console.error("Failed to fetch order items:", itemsResponse.status, itemsResponse.statusText);
      }
      
      // Ouvrir la boîte de dialogue
      setIsDetailDialogOpen(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        title: translate("admin.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  };

  const handleEditOrder = async (orderId: number) => {
    try {
      // Fetch order details
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
        headers: {
          'X-User-Id': '0',
          'X-User-Role': 'admin'
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching order: ${response.statusText}`);
      }

      const orderData = await response.json();
      console.log("DEBUG: Données de commande reçues pour édition:", orderData);
      setSelectedOrder(orderData);
      setGameCodes({});

      // Fetch order items with product details
      const itemsResponse = await fetch(`/api/orders/${orderId}/items`, {
        credentials: 'include',
        headers: {
          'X-User-Id': '0',
          'X-User-Role': 'admin'
        }
      });

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        console.log("DEBUG: Éléments de commande reçus pour édition:", itemsData);
        setOrderItems(itemsData);
      } else {
        console.error("Failed to fetch order items:", itemsResponse.status, itemsResponse.statusText);
      }
      
      // Ouvrir la boîte de dialogue et activer le mode édition
      console.log("DEBUG: Ouverture de la boîte de dialogue de détails en mode édition");
      setIsDetailDialogOpen(true);
      console.log("DEBUG: Mise à jour de l'état isEditing:", true);
      setIsEditing(true);
    } catch (error) {
      console.error("DEBUG: Erreur lors de la préparation de la commande pour édition:", error);
      toast({
        title: translate("admin.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  };
  
  // Function to save the edited order
  const handleSaveOrder = async () => {
    if (!selectedOrder) {
      console.error("DEBUG: Erreur - Pas de commande sélectionnée pour l'enregistrement");
      return;
    }
    
    try {
      // Prepare order data for update
      const orderToUpdate = {
        id: selectedOrder.id,
        firstName: selectedOrder.firstName,
        lastName: selectedOrder.lastName,
        email: selectedOrder.email,
        phoneNumber: selectedOrder.phoneNumber,
        status: selectedOrder.status,
        paymentStatus: selectedOrder.paymentStatus,
        paymentMethod: selectedOrder.paymentMethod,
        totalAmount: selectedOrder.totalAmount,
        // Ne pas envoyer les items car ils ne sont pas modifiables dans l'interface
      };

      console.log("DEBUG: Enregistrement de la commande avec les données:", JSON.stringify(orderToUpdate, null, 2));
      
      // Utilisation de updateOrderMutation pour gérer la mise à jour
      await updateOrderMutation.mutateAsync(orderToUpdate);
      
      // Le reste est géré par les callbacks onSuccess et onError de la mutation
      console.log("DEBUG: Mise à jour effectuée avec succès");
      
    } catch (error) {
      console.error("DEBUG: Erreur lors de l'enregistrement de la commande:", error);
      toast({
        title: translate("admin.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  };
  
  const handleSaveGameCodes = async () => {
    if (!selectedOrder) {
      console.error("❌ Erreur: Aucune commande sélectionnée");
      return;
    }

    console.log("🎮 Début de l'enregistrement des codes de jeu pour la commande ID:", selectedOrder.id);
    console.log("📋 État actuel des codes de jeu:", gameCodes);
    
    setIsSubmitting(true);

    try {
      const gameCodesList = Object.entries(gameCodes).map(([productId, code]) => ({
        productId: parseInt(productId),
        code: code.trim()
      })).filter(item => item.code !== '');

      console.log("🔍 Codes de jeu filtrés et formatés:", gameCodesList);

      if (gameCodesList.length === 0) {
        console.warn("⚠️ Aucun code valide n'a été saisi");
        toast({
          title: translate("admin.noCodeEntered"),
          description: translate("admin.pleaseEnterGameCodes"),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("🚀 Envoi des codes de jeu à l'API...");
      await saveGameCodesMutation.mutateAsync();

      // Refresh order details
      handleEditOrder(selectedOrder.id);
    } catch (error) {
      console.error("Error saving game codes:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeChange = (productId: number, code: string) => {
    setGameCodes(prev => ({
      ...prev,
      [productId]: code
    }));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'paid':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'delivered':
        return 'bg-green-500 hover:bg-green-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    return status === 'completed' 
      ? 'bg-green-500 hover:bg-green-600'
      : 'bg-yellow-500 hover:bg-yellow-600';
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order: OrderDetail) => {
      // D'abord, filtrer par statut de commande/onglet sélectionné
      let passesStatusFilter = false;
      
      if (selectedTab === 'all') {
        // Si l'onglet "Tous" est sélectionné, toutes les commandes passent ce filtre
        passesStatusFilter = true;
      } else {
        // Pour tous les filtres (pending, delivered, cancelled), vérifier le statut exact
        passesStatusFilter = (order.status === selectedTab);
      }
      
      // Si la commande ne passe pas le filtre de statut, l'exclure immédiatement
      if (!passesStatusFilter) {
        return false;
      }
      
      // Ensuite, filtrer par terme de recherche (si un terme est saisi)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.id.toString().includes(searchLower) ||
          order.email.toLowerCase().includes(searchLower) ||
          `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchLower) ||
          order.phoneNumber.includes(searchLower)
        );
      }
      
      // Si toutes les vérifications sont passées, inclure la commande
      return true;
    })
    .sort((a: OrderDetail, b: OrderDetail) => {
      // Sort by selected field and direction
      if (sortField === 'date') {
        return sortDirection === 'desc'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'amount') {
        return sortDirection === 'desc'
          ? b.totalAmount - a.totalAmount
          : a.totalAmount - b.totalAmount;
      } else if (sortField === 'status') {
        return sortDirection === 'desc'
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      }
      return 0;
    });

  // Pagination
  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Handlers
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-4">
      {/* En-tête - titre et recherche */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
        <h2 className="text-xl sm:text-2xl font-cairo font-bold text-white flex items-center">
          <FaBoxOpen className="mr-2 text-primary" />
          {translate("admin.orderManagement")}
        </h2>

        <div className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
            <Input
              type="text"
              placeholder={translate("admin.searchOrders")}
              className="pl-7 w-full sm:w-[200px] bg-[#132743] border-[#264661] h-8 sm:h-9 text-xs sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="border-[#264661] bg-[#132743] text-xs sm:text-sm h-8 sm:h-9 px-2 py-1 sm:px-3"
              >
                <FaFilter className="mr-1 sm:mr-2" size={12} />
                {translate("admin.filter")}: {selectedTab === 'all' ? translate("admin.allOrders") : translate(`admin.${selectedTab}`)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0a0f1a] border-[#264661]">
              <DropdownMenuItem 
                className={`${selectedTab === 'all' ? 'bg-primary/20 text-primary' : ''}`}
                onClick={() => setSelectedTab('all')}
              >
                {translate("admin.allOrders")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={`${selectedTab === 'pending' ? 'bg-primary/20 text-primary' : ''}`}
                onClick={() => setSelectedTab('pending')}
              >
                {translate("admin.pending")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={`${selectedTab === 'paid' ? 'bg-primary/20 text-primary' : ''}`}
                onClick={() => setSelectedTab('paid')}
              >
                {translate("admin.paid")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={`${selectedTab === 'delivered' ? 'bg-primary/20 text-primary' : ''}`}
                onClick={() => setSelectedTab('delivered')}
              >
                {translate("admin.delivered")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={`${selectedTab === 'cancelled' ? 'bg-primary/20 text-primary' : ''}`}
                onClick={() => setSelectedTab('cancelled')}
              >
                {translate("admin.cancelled")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-8 w-8 text-primary mx-auto">
            <FaSpinner size={32} />
          </div>
          <p className="text-gray-400 mt-2">{translate("admin.loading")}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Alert className="bg-[#0a0f1a] border-[#B8860B]">
          <FaExclamationTriangle className="h-4 w-4 text-[#E63946]" />
          <AlertDescription>
            {translate("admin.noOrdersFound")}
          </AlertDescription>
        </Alert>
      ) : (
        <>
        {/* Vue mobile */}
        <div className="md:hidden space-y-4 mb-4">
          {currentOrders.map((order: OrderDetail) => (
            <Card key={order.id} className="bg-[#132743] overflow-hidden">
              <CardHeader className="bg-[#0a0f1a] pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium flex items-center">
                    <span className="mr-2">#{order.id}</span>
                    <Badge className={getStatusBadgeColor(order.status)}>
                      {translate(`admin.${order.status}`)}
                    </Badge>
                  </CardTitle>
                  <div>
                    <Badge className={getPaymentStatusBadgeColor(order.paymentStatus)}>
                      {order.paymentStatus === 'completed' 
                        ? translate("admin.completed") 
                        : translate("admin.pending")}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-gray-400 flex flex-col gap-1 mt-1">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 mr-2" size={12} />
                    {order.firstName} {order.lastName}
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-2" size={12} />
                    {order.email}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaClock className="text-gray-400 mr-2" size={12} />
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="font-cairo font-bold text-primary">
                      {formatCurrency(order.totalAmount)}
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-wrap justify-between items-center">
                  <div className="text-sm bg-[#0a0f1a80] rounded px-2 py-1 mb-2">
                    <span className="text-gray-400 mr-1">{translate("admin.paymentMethod")}:</span>
                    {order.paymentMethod === 'bank_transfer' 
                      ? translate("checkout.bankTransfer") 
                      : translate("checkout.cashOnDelivery")}
                  </div>
                  <div className="flex gap-2">

                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-background h-7 text-xs px-2 py-0"
                      onClick={() => handleEditOrder(order.id)}
                    >
                      <FaEdit className="mr-1" size={12} />
                      {translate("admin.edit")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Vue Desktop */}
        <div className="bg-[#132743] rounded-[0.75rem] overflow-x-auto hidden md:block">
          <Table>
            <TableHeader className="bg-[#0a0f1a]">
              <TableRow>
                <TableHead className="text-white">{translate("admin.orderId")}</TableHead>
                <TableHead className="text-white">{translate("admin.customer")}</TableHead>
                <TableHead 
                  className="text-white cursor-pointer" 
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center">
                    {translate("admin.date")}
                    {sortField === 'date' && (
                      <span className="ml-1">
                        {sortDirection === 'desc' ? <FaSortAmountDown size={14} /> : <FaSortAmountUp size={14} />}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-white cursor-pointer" 
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center">
                    {translate("admin.amount")}
                    {sortField === 'amount' && (
                      <span className="ml-1">
                        {sortDirection === 'desc' ? <FaSortAmountDown size={14} /> : <FaSortAmountUp size={14} />}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-white">{translate("admin.paymentMethod")}</TableHead>
                <TableHead className="text-white">{translate("admin.paymentStatus")}</TableHead>
                <TableHead 
                  className="text-white cursor-pointer" 
                  onClick={() => toggleSort('status')}
                >
                  <div className="flex items-center">
                    {translate("admin.orderStatus")}
                    {sortField === 'status' && (
                      <span className="ml-1">
                        {sortDirection === 'desc' ? <FaSortAmountDown size={14} /> : <FaSortAmountUp size={14} />}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-white text-right">{translate("admin.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.map((order: OrderDetail) => (
                <TableRow key={order.id} className="border-b border-[#0a0f1a]">
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.firstName} {order.lastName}</p>
                      <p className="text-sm text-gray-400">{order.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="font-cairo font-bold text-primary">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    {order.paymentMethod === 'bank_transfer' 
                      ? translate("checkout.bankTransfer") 
                      : translate("checkout.cashOnDelivery")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge className={getPaymentStatusBadgeColor(order.paymentStatus)}>
                          {order.paymentStatus === 'completed' 
                            ? translate("admin.completed") 
                            : translate("admin.pending")}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#0a0f1a] border-[#B8860B]">
                        <DropdownMenuItem 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleUpdatePaymentStatus(order.id, 'pending')}
                        >
                          <FaTimes className={`mr-2 ${order.paymentStatus === 'pending' ? 'text-primary' : 'text-white'}`} />
                          {translate("admin.pending")}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleUpdatePaymentStatus(order.id, 'completed')}
                        >
                          <FaCheck className={`mr-2 ${order.paymentStatus === 'completed' ? 'text-primary' : 'text-white'}`} />
                          {translate("admin.completed")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {translate(`admin.${order.status}`)}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#0a0f1a] border-[#B8860B]">
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                        >
                          {translate("admin.pending")}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => handleUpdateOrderStatus(order.id, 'paid')}
                        >
                          {translate("admin.paid")}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                        >
                          {translate("admin.delivered")}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                        >
                          {translate("admin.cancelled")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-background"
                        onClick={() => handleEditOrder(order.id)}
                      >
                        <FaEdit className="mr-1" />
                        {translate("admin.edit")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            {/* Bouton Premier - Caché sur mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="border-[#264661] bg-[#132743] hidden sm:flex"
            >
              <FaChevronLeft className="mr-1" />
              {translate("admin.first")}
            </Button>
            
            {/* Bouton Précédent - Version compacte sur mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-[#264661] bg-[#132743] h-8 text-xs sm:text-sm sm:h-9"
            >
              <FaChevronLeft className="sm:hidden" />
              <span className="hidden sm:inline">{translate("admin.previous")}</span>
            </Button>

            <span className="mx-2 text-gray-300 text-xs sm:text-sm">
              {currentPage} / {totalPages}
            </span>

            {/* Bouton Suivant - Version compacte sur mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-[#264661] bg-[#132743] h-8 text-xs sm:text-sm sm:h-9"
            >
              <FaChevronRight className="sm:hidden" />
              <span className="hidden sm:inline">{translate("admin.next")}</span>
            </Button>
            
            {/* Bouton Dernier - Caché sur mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="border-[#264661] bg-[#132743] hidden sm:flex"
            >
              {translate("admin.last")}
              <FaChevronRight className="ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-[#132743] text-white border-[#B8860B] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cairo text-2xl">
              {isEditing
                ? translate("admin.editOrder")
                : translate("admin.orderDetails")} #{selectedOrder?.id}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedOrder && formatDate(selectedOrder.createdAt)}
              {isEditing && <span className="ml-2 text-yellow-400">{translate("admin.editingMode")}</span>}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem]">
                  <div className="flex items-center mb-3">
                    <FaUser className="text-primary mr-2" />
                    <h3 className="font-cairo text-lg">{translate("admin.customerInfo")}</h3>
                  </div>
                  {isEditing ? (
                    <div className="space-y-4 rounded-md bg-[#0d1522] p-4 border border-[#1d3a56]">
                      <div>
                        <label className="text-gray-300 font-medium block mb-1.5">{translate("admin.name")}:</label>
                        <div className="flex gap-2">
                          <div className="relative w-full">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <FaUser size={14} />
                            </div>
                            <Input 
                              className="bg-[#132743] border-[#264661] pl-9 hover:border-primary focus:border-primary transition-colors"
                              value={selectedOrder.firstName}
                              onChange={(e) => setSelectedOrder({...selectedOrder, firstName: e.target.value})}
                              placeholder={translate("admin.firstName")}
                            />
                          </div>
                          <div className="relative w-full">
                            <Input 
                              className="bg-[#132743] border-[#264661] hover:border-primary focus:border-primary transition-colors"
                              value={selectedOrder.lastName}
                              onChange={(e) => setSelectedOrder({...selectedOrder, lastName: e.target.value})}
                              placeholder={translate("admin.lastName")}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-300 font-medium block mb-1.5">{translate("admin.email")}:</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <FaEnvelope size={14} />
                          </div>
                          <Input 
                            className="bg-[#132743] border-[#264661] pl-9 hover:border-primary focus:border-primary transition-colors"
                            value={selectedOrder.email}
                            onChange={(e) => setSelectedOrder({...selectedOrder, email: e.target.value})}
                            placeholder="example@mail.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-300 font-medium block mb-1.5">{translate("admin.phone")}:</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <FaPhone size={14} />
                          </div>
                          <Input 
                            className="bg-[#132743] border-[#264661] pl-9 hover:border-primary focus:border-primary transition-colors"
                            value={selectedOrder.phoneNumber}
                            onChange={(e) => setSelectedOrder({...selectedOrder, phoneNumber: e.target.value})}
                            placeholder="+212612345678"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-md bg-[#0d1522] p-4 border border-[#1d3a56]">
                      <div className="flex">
                        <FaUser className="text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">{translate("admin.name")}:</p>
                          <p className="font-medium">{selectedOrder.firstName} {selectedOrder.lastName}</p>
                        </div>
                      </div>
                      <div className="flex">
                        <FaEnvelope className="text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">{translate("admin.email")}:</p>
                          <p className="font-medium">{selectedOrder.email}</p>
                        </div>
                      </div>
                      <div className="flex">
                        <FaPhone className="text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="text-sm text-gray-400">{translate("admin.phone")}:</p>
                          <p className="font-medium">{selectedOrder.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem]">
                  <div className="flex items-center mb-3">
                    <FaMoneyBill className="text-primary mr-2" />
                    <h3 className="font-cairo text-lg">{translate("admin.paymentInfo")}</h3>
                  </div>
                  {isEditing ? (
                    <div className="space-y-4 rounded-md bg-[#0d1522] p-4 border border-[#1d3a56]">
                      <div>
                        <label className="text-gray-300 font-medium block mb-1.5">{translate("admin.paymentMethod")}:</label>
                        <Select 
                          value={selectedOrder.paymentMethod}
                          onValueChange={(value) => setSelectedOrder({...selectedOrder, paymentMethod: value})}
                        >
                          <SelectTrigger className="bg-[#132743] border-[#264661]">
                            <SelectValue placeholder={translate("admin.selectPaymentMethod")} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a0f1a] border-[#264661]">
                            <SelectItem value="bank_transfer">{translate("checkout.bankTransfer")}</SelectItem>
                            <SelectItem value="cash_on_delivery">{translate("checkout.cashOnDelivery")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-gray-300 font-medium block mb-1.5">{translate("admin.paymentStatus")}:</label>
                        <Select 
                          value={selectedOrder.paymentStatus}
                          onValueChange={(value) => setSelectedOrder({...selectedOrder, paymentStatus: value})}
                        >
                          <SelectTrigger className="bg-[#132743] border-[#264661]">
                            <SelectValue placeholder={translate("admin.selectPaymentStatus")} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a0f1a] border-[#264661]">
                            <SelectItem value="pending">{translate("admin.pending")}</SelectItem>
                            <SelectItem value="completed">{translate("admin.completed")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-gray-300 font-medium block mb-1.5">{translate("admin.orderStatus")}:</label>
                        <Select 
                          value={selectedOrder.status}
                          onValueChange={(value) => setSelectedOrder({...selectedOrder, status: value})}
                        >
                          <SelectTrigger className="bg-[#132743] border-[#264661]">
                            <SelectValue placeholder={translate("admin.selectOrderStatus")} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a0f1a] border-[#264661]">
                            <SelectItem value="pending">{translate("admin.pending")}</SelectItem>
                            <SelectItem value="paid">{translate("admin.paid")}</SelectItem>
                            <SelectItem value="delivered">{translate("admin.delivered")}</SelectItem>
                            <SelectItem value="cancelled">{translate("admin.cancelled")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-md bg-[#0d1522] p-4 border border-[#1d3a56]">
                      <div className="flex justify-between items-center">
                        <div className="flex">
                          <FaCreditCard className="text-gray-400 mt-1 mr-3" />
                          <div>
                            <p className="text-sm text-gray-400">{translate("admin.paymentMethod")}:</p>
                            <p className="font-medium">
                              {selectedOrder.paymentMethod === 'bank_transfer' 
                                ? translate("checkout.bankTransfer") 
                                : translate("checkout.cashOnDelivery")}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusBadgeColor(selectedOrder.status)}>
                          {translate(`admin.${selectedOrder.status}`)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="flex">
                          <FaCheckCircle className="text-gray-400 mt-1 mr-3" />
                          <div>
                            <p className="text-sm text-gray-400">{translate("admin.paymentStatus")}:</p>
                            <p className="font-medium">
                              <Badge className={getPaymentStatusBadgeColor(selectedOrder.paymentStatus)}>
                                {selectedOrder.paymentStatus === 'completed' 
                                  ? translate("admin.completed") 
                                  : translate("admin.pending")}
                              </Badge>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">{translate("admin.totalAmount")}:</p>
                          <p className="font-cairo font-bold text-xl text-primary">
                            {formatCurrency(selectedOrder.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem]">
                <div className="flex items-center mb-3">
                  <FaBoxOpen className="text-primary mr-2" />
                  <h3 className="font-cairo text-lg">{translate("admin.orderContents")}</h3>
                </div>

                <div className="rounded-md bg-[#0d1522] p-4 border border-[#1d3a56]">
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between p-2 border-b border-[#264661] last:border-0">
                        <div>
                          <p className="font-medium">
                            {item.productName} 
                            {item.editionName && <span className="text-gray-400"> ({item.editionName})</span>} 
                            <span className="text-gray-400 ml-1">x{item.quantity}</span>
                          </p>
                          {item.platform && (
                            <Badge variant="outline" className="text-xs mr-1 border-[#264661]">
                              {item.platform}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs border-[#264661]">
                            {item.productType === 'game' ? translate("admin.game") : translate("admin.giftCard")}
                          </Badge>
                        </div>
                        <p className="font-cairo font-medium text-primary">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem]">
                <div className="flex items-center mb-3">
                  <FaKey className="text-primary mr-2" />
                  <h3 className="font-cairo text-lg">{translate("admin.gameCodes")}</h3>
                </div>

                <GameCodeForm 
                  orderItems={orderItems}
                  gameCodes={gameCodes}
                  isSubmitting={isSubmitting}
                  selectedOrder={selectedOrder}
                  onSave={handleSaveGameCodes}
                  onCodeChange={handleCodeChange}
                  translate={translate}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      className="border-[#264661] hover:bg-[#264661]"
                    >
                      {translate("admin.cancel")}
                    </Button>
                    <Button 
                      onClick={handleSaveOrder}
                      className="bg-primary hover:bg-primary/80"
                    >
                      <FaSave className="mr-2" />
                      {translate("admin.saveChanges")}
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsDetailDialogOpen(false)}
                    className="bg-[#264661] hover:bg-[#1d3a56]"
                  >
                    {translate("admin.close")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Status Confirmation Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="bg-[#132743] text-white border-[#B8860B]">
          <DialogHeader>
            <DialogTitle className="font-cairo text-xl">
              {translate("admin.confirmStatusChange")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {translate("admin.changeOrderStatus")} 
              <Badge className={getStatusBadgeColor(pendingStatusUpdate?.status || 'pending')}>
                {translate(`admin.${pendingStatusUpdate?.status}`)}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsStatusDialogOpen(false)}
              className="border border-[#264661] hover:bg-[#264661]"
            >
              {translate("admin.cancel")}
            </Button>
            <Button 
              onClick={confirmStatusUpdate}
              className="bg-primary hover:bg-primary/80 text-white"
            >
              {translate("admin.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;