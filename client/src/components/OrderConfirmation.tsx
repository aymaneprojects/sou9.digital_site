import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaCheck, FaDownload, FaPrint, FaEnvelope, FaWhatsapp, FaKey, FaCopy, FaGamepad, FaCreditCard, FaTimes, FaClock } from "react-icons/fa";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/LocalAuthContext";


// Fonction helper pour assurer que toutes les traductions sont des chaînes
const ensureString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value : String(value);
};

// Définir les types pour les données de commande
interface OrderItem {
  id: number;
  productId: number;
  orderId: number;
  quantity: number;
  price: number;
  productName?: string;
  productPlatform?: string;
  productImageUrl?: string;
}

interface GameCode {
  id: number;
  productId: number;
  code: string;
  isUsed: number;
  orderId?: number;
  createdAt: string;
  productName?: string;
  productImageUrl?: string;
  productPlatform?: string;
}

interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
  address?: string;
  promoCode?: string;
  promoDiscount?: number;
  walletAmountUsed?: number;
  subtotalBeforeDiscount?: number;
  paymentDeadline?: string;
  items?: OrderItem[];
}

interface OrderConfirmationProps {
  orderId: number;
}

const OrderConfirmation = ({ orderId }: OrderConfirmationProps) => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  
  const { data: orderData, isLoading, error } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
  });
  
  // Récupérer les articles de la commande
  const { data: orderItems } = useQuery<OrderItem[]>({
    queryKey: [`/api/orders/${orderId}/items`],
    enabled: !!orderData, // N'exécuter cette requête que si orderData existe
  });
  
  // Récupérer les codes de jeux de la commande
  const { data: gameCodes, isLoading: isLoadingGameCodes } = useQuery<GameCode[]>({
    queryKey: [`/api/orders/${orderId}/game-codes`],
    enabled: !!orderData && (orderData?.paymentStatus === 'paid' || orderData?.paymentStatus === 'completed'),
  });
  
  useEffect(() => {
    if (gameCodes && gameCodes.length > 0) {
      console.log("Game codes loaded:", gameCodes);
    }
  }, [gameCodes]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Set up polling for order updates
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
    }, 30000); // Poll every 30 seconds
    
    // Cleanup function to clear interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [orderId, queryClient]);

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${String(translate("orderConfirmation.receipt"))} - Sou9Digital</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Tajawal:wght@400;500;700&display=swap');
                
                body { 
                  font-family: 'Tajawal', Arial, sans-serif; 
                  color: #0a0f1a; 
                  background-color: #f5f5f5;
                  margin: 0;
                  padding: 0;
                }
                
                .container { 
                  max-width: 800px; 
                  margin: 20px auto; 
                  padding: 30px;
                  background-color: white;
                  border-radius: 16px;
                  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                  position: relative;
                  overflow: hidden;
                }
                
                .container::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 8px;
                  background: linear-gradient(90deg, #B8860B, #FFD700);
                }
                
                .receipt-header {
                  text-align: center;
                  margin-bottom: 30px;
                  padding-bottom: 20px;
                  border-bottom: 2px solid #B8860B;
                  position: relative;
                }
                
                .receipt-header::after {
                  content: '';
                  position: absolute;
                  bottom: -10px;
                  left: calc(50% - 100px);
                  width: 200px;
                  height: 20px;
                  background-color: white;
                  border-radius: 50%;
                  box-shadow: 0 2px 0 #B8860B;
                }
                
                .logo {
                  font-family: 'Cairo', sans-serif;
                  font-size: 32px;
                  font-weight: 700;
                  color: #132743;
                  margin: 0;
                  letter-spacing: 1px;
                  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                }
                
                .tagline {
                  font-size: 15px;
                  color: #555;
                  margin-top: 6px;
                  font-style: italic;
                }
                
                h1 { 
                  font-family: 'Cairo', sans-serif;
                  color: #132743; 
                  font-size: 24px;
                  margin-top: 10px;
                }
                
                .order-info { 
                  margin-bottom: 25px;
                  background-color: #f8f9fa;
                  padding: 18px;
                  border-radius: 12px;
                  box-shadow: inset 0 0 8px rgba(0,0,0,0.05);
                }
                
                .order-info p {
                  margin: 8px 0;
                  line-height: 1.4;
                }
                
                .section-title {
                  font-family: 'Cairo', sans-serif;
                  font-size: 20px;
                  font-weight: 700;
                  margin: 25px 0 15px 0;
                  color: #132743;
                  padding-bottom: 8px;
                  border-bottom: 2px solid #eee;
                  position: relative;
                }
                
                .section-title::before {
                  content: '';
                  position: absolute;
                  bottom: -2px;
                  left: 0;
                  width: 50px;
                  height: 2px;
                  background-color: #B8860B;
                }
                
                .item { 
                  display: flex; 
                  justify-content: space-between; 
                  margin-bottom: 12px;
                  padding: 10px;
                  border-bottom: 1px dotted #ddd;
                  transition: background-color 0.2s ease;
                }
                
                .item:hover {
                  background-color: #f8f9fa;
                }
                
                .item:last-child {
                  border-bottom: none;
                }
                
                .item span:first-child {
                  width: 70%;
                  font-weight: 500;
                }
                
                .item span:last-child {
                  width: 30%;
                  text-align: right;
                  font-weight: 600;
                  color: #132743;
                }
                
                .discount {
                  color: #28a745;
                  font-weight: bold;
                }
                
                .total { 
                  font-weight: 700; 
                  margin-top: 20px; 
                  padding: 18px;
                  border-top: 3px solid #132743;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  background-color: #f8f9fa;
                  border-radius: 12px;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
                }
                
                .total span:first-child {
                  font-size: 18px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
                
                .total span:last-child {
                  color: #B8860B;
                  font-family: 'Cairo', sans-serif;
                  font-size: 24px;
                  text-shadow: 1px 1px 1px rgba(0,0,0,0.1);
                }
                
                .instructions { 
                  margin-top: 30px; 
                  padding: 20px; 
                  background-color: #fff8e8; 
                  border-radius: 12px;
                  border-left: 5px solid #B8860B;
                  box-shadow: 0 4px 12px rgba(184, 134, 11, 0.1);
                  position: relative;
                }
                
                .instructions::before {
                  content: '!';
                  position: absolute;
                  top: -15px;
                  left: 20px;
                  width: 30px;
                  height: 30px;
                  background-color: #B8860B;
                  color: white;
                  font-weight: bold;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                
                .instructions h3 {
                  margin-top: 0;
                  color: #B8860B;
                  font-size: 18px;
                }
                
                .instructions p {
                  margin: 10px 0;
                  line-height: 1.5;
                }
                
                .footer {
                  margin-top: 40px;
                  text-align: center;
                  color: #555;
                  font-size: 14px;
                  border-top: 1px dashed #ddd;
                  padding-top: 20px;
                }
                
                .footer p {
                  margin: 5px 0;
                }
                
                .important {
                  font-weight: 700;
                  color: #E63946;
                  padding: 2px 5px;
                  background-color: rgba(230, 57, 70, 0.1);
                  border-radius: 3px;
                }
                
                .qr-code {
                  text-align: center;
                  margin-top: 30px;
                }
                
                .qr-code img {
                  width: 120px;
                  height: 120px;
                  border: 1px solid #ddd;
                  padding: 5px;
                  border-radius: 8px;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                }
                
                .watermark {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%) rotate(-45deg);
                  font-size: 120px;
                  color: rgba(184, 134, 11, 0.03);
                  font-weight: bold;
                  pointer-events: none;
                  z-index: 0;
                  white-space: nowrap;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="watermark">SOU9DIGITAL</div>
                <div class="receipt-header">
                  <div class="logo">Sou9Digital</div>
                  <div class="tagline">${translate("orderConfirmation.receiptTagline")}</div>
                </div>
                ${receiptRef.current.innerHTML}
                <div class="qr-code">
                  <img src="data:image/png;base64,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" alt="Order QR Code">
                </div>
                <div class="footer">
                  <p>${translate("orderConfirmation.footerThankYou")}</p>
                  <p>${translate("orderConfirmation.footerContact")}: support@sou9digital.ma</p>
                  <p>${translate("orderConfirmation.footerDate")}: ${new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };
  
  // Utiliser la même fonction de handlePrint pour télécharger le reçu
  const handleDownloadReceipt = () => {
    handlePrint();
  };
  
  // Fonction pour partager le reçu sur WhatsApp
  const shareReceiptOnWhatsApp = () => {
    if (!orderData) return;
    
    // Créer un message formaté avec les détails de la commande
    const orderNumber = `SD-${orderData.id.toString().padStart(6, '0')}`;
    const orderTotal = formatCurrency(orderData.totalAmount);
    const orderStatus = orderData.paymentStatus === 'completed' 
      ? ensureString(translate("orderConfirmation.paid"))
      : ensureString(translate("orderConfirmation.pending"));
    
    // Format de texte pour WhatsApp Business
    const text = `🎮 *Sou9Digital - Commande ${orderNumber}* 🎮\n\n` +
      `Montant total: *${orderTotal}*\n` +
      `Status: *${orderStatus}*\n\n` +
      `Merci pour votre achat! Pour plus de détails visitez notre site: https://sou9digital.ma`;
    
    // Encoder le texte pour l'URL
    const encodedText = encodeURIComponent(text);
    
    // Numéro WhatsApp Business de Sou9Digital (exemple: +212666666666)
    const whatsappNumber = "+212664285673"; 
    
    // Ouvrir WhatsApp Business avec le numéro et le message pré-rempli
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
    
    // Mettre à jour l'état et afficher une notification de succès
    setShareSuccess(true);
    
    toast({
      title: ensureString(translate("notifications.success")),
      description: ensureString(translate("orderConfirmation.whatsappShareSuccess")),
      variant: "default",
    });
    
    // Réinitialiser l'état après 3 secondes
    setTimeout(() => {
      setShareSuccess(false);
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-[#132743] text-white border-none shadow-lg animate-pulse">
          <CardHeader>
            <div className="h-8 w-64 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-48 bg-gray-700 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-16 bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-700 rounded"></div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex space-x-4">
              <div className="h-10 w-32 bg-gray-700 rounded"></div>
              <div className="h-10 w-32 bg-gray-700 rounded"></div>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-[#132743] text-white border-none shadow-lg">
          <CardHeader>
            <CardTitle className="font-cairo text-2xl text-[#E63946]">
              {ensureString(translate("orderConfirmation.errorTitle"))}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {ensureString(translate("orderConfirmation.errorDescription"))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">{String(error)}</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="bg-primary hover:bg-primary/90 text-background">
              <Link href="/store">{ensureString(translate("orderConfirmation.continueShopping"))}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Les codes de jeu sont déjà récupérés plus haut dans le fichier
  
  // Utiliser les items depuis la requête séparée au lieu de orderData.items
  const items = orderItems || [];
  
  // Fonction pour copier un code dans le presse-papiers
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: ensureString(translate("orderConfirmation.codeCopied") || "Code copié"),
        description: ensureString(translate("orderConfirmation.codeCopiedDescription") || "Le code a été copié dans le presse-papiers."),
        variant: "default",
      });
    }).catch((err) => {
      console.error('Erreur lors de la copie:', err);
      toast({
        title: ensureString(translate("orderConfirmation.codeCopyFailed") || "Échec de la copie"),
        description: ensureString(translate("orderConfirmation.codeCopyFailedDescription") || "Impossible de copier le code."),
        variant: "destructive",
      });
    });
  };
  // Ajouter des gardes pour s'assurer que orderData existe avant d'y accéder
  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-[#132743] text-white border-none shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="font-cairo text-2xl">
              {ensureString(translate("orderConfirmation.errorTitle"))}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {ensureString(translate("orderConfirmation.errorDescription"))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{ensureString(translate("orderConfirmation.errorMessage"))}</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="bg-primary hover:bg-primary/90 text-background">
              <Link href="/store">
                {ensureString(translate("orderConfirmation.backToStore"))}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Vérifier et convertir les valeurs en chaînes pour le rendu avec String()
  const isComplete = orderData.paymentStatus === 'completed' || orderData.paymentStatus === 'paid';
  const isCancelled = orderData.status === 'cancelled';
  const isBankTransfer = orderData.paymentMethod === 'bank_transfer';
  const isCashDelivery = orderData.paymentMethod === 'cash_on_delivery';
  const walletAmountUsed = orderData.walletAmountUsed || 0;
  const { user } = useAuth();


  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="bg-[#132743] text-white border-none shadow-lg mb-8">
        <CardHeader className="border-b border-[#B8860B]">
          <div className="flex items-center mb-2">
            {isComplete ? (
              <div className="bg-green-500 text-background p-2 rounded-full mr-3">
                <FaCheck />
              </div>
            ) : isCancelled ? (
              <div className="bg-red-500 text-background p-2 rounded-full mr-3">
                <FaTimes />
              </div>
            ) : (
              <div className="bg-[#FFD700] text-background p-2 rounded-full mr-3">
                <FaClock />
              </div>
            )}
            <CardTitle className="font-cairo text-2xl">
              {isComplete 
                ? ensureString(translate("orderConfirmation.orderComplete")) 
                : isCancelled
                  ? ensureString(translate("orderConfirmation.orderCancelled") || "Commande annulée")
                  : ensureString(translate("orderConfirmation.orderReceived"))}
            </CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            {ensureString(translate("orderConfirmation.thankYou"))}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="space-y-6">
            {isCancelled && (
              <div className="bg-red-900/20 border border-red-800 rounded-md p-4 mb-6">
                <h3 className="text-red-400 font-bold text-xl mb-2 flex items-center">
                  {ensureString(translate("orderConfirmation.cancelled") || "Commande annulée")}
                </h3>
                <p className="text-red-400">
                  {ensureString(translate("orderConfirmation.cancelledDescription") || "Cette commande a été annulée et ne peut plus être traitée.")}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem]">
                <p className="text-gray-400 mb-1">{ensureString(translate("orderConfirmation.orderNumber"))}</p>
                <p className="font-cairo font-bold text-primary">SD-{orderData.id.toString().padStart(6, '0')}</p>
              </div>
              <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem]">
                <p className="text-gray-400 mb-1">{ensureString(translate("orderConfirmation.date"))}</p>
                <p className="font-cairo font-bold text-white">{formatDate(orderData.createdAt)}</p>
              </div>
              <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem]">
                <p className="text-gray-400 mb-1">{ensureString(translate("orderConfirmation.total"))}</p>
                <p className="font-cairo font-bold text-primary">{formatCurrency(orderData.totalAmount)}</p>
              </div>
            </div>
            
            <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem]">
              <h3 className="font-cairo font-bold text-xl mb-4">
                {ensureString(translate("orderConfirmation.paymentDetails"))}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 mb-1">{ensureString(translate("orderConfirmation.method"))}</p>
                  <p className="font-medium">
                    {orderData.paymentMethod === 'bank_transfer' 
                      ? ensureString(translate("checkout.bankTransfer")) 
                      : ensureString(translate("checkout.cashOnDelivery"))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">{ensureString(translate("orderConfirmation.status"))}</p>
                  <p className={`font-medium ${
                    orderData.paymentStatus === 'completed' 
                      ? 'text-green-500' 
                      : isCancelled 
                        ? 'text-red-500'
                        : 'text-[#FFD700]'
                  }`}>
                    {isCancelled 
                      ? ensureString(translate("orderConfirmation.cancelled") || "Annulée")
                      : orderData.paymentStatus === 'completed' 
                        ? ensureString(translate("orderConfirmation.paid")) 
                        : ensureString(translate("orderConfirmation.pending"))}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem]">
              <h3 className="font-cairo font-bold text-xl mb-4">
                {ensureString(translate("orderConfirmation.orderDetails"))}
              </h3>
              <div className="space-y-4">
                {items.map((item: any) => (
                  <div key={item.id} className="flex justify-between border-b border-[#132743] pb-2">
                    <div>
                      <p className="font-medium">{item.quantity}x {item.productName || `Product #${item.productId}`}</p>
                    </div>
                    <p className="font-cairo font-bold text-primary">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
                {/* Afficher la remise du code promo si utilisé */}
                {orderData.promoCode && (
                  <div className="flex justify-between pt-2 text-sm">
                    <p className="text-gray-400">
                      {ensureString(translate("orderConfirmation.promoCode"))}: <span className="font-medium">{orderData.promoCode}</span>
                    </p>
                    <p className="text-green-500">-{formatCurrency(orderData.promoDiscount || 0)}</p>
                  </div>
                )}
                {/* Afficher la remise du code promo si utilisé */}
                {isCashDelivery && (
                  <div className="flex justify-between pt-2 text-sm">
                    <p className="text-gray-400">
                      {ensureString("Frais de Livraison")}:
                    </p>
                    <p className="text-green-700">+{formatCurrency(30)}</p>
                  </div>
                )}
                

                {/* Afficher le montant utilisé du portefeuille si utilisé */}
                {user && orderData.walletAmountUsed && orderData.walletAmountUsed >0 && (
                  <div className="flex justify-between pt-2 text-sm">
                    <p className="text-gray-400">{translate("orderConfirmation.walletUsed")}</p>
                    <p className="text-green-500">-{formatCurrency(orderData.walletAmountUsed)}</p>
                  </div>
                )}
                
                <div className="flex justify-between pt-2">
                  <p className="font-bold">{ensureString(translate("orderConfirmation.totalAmount"))}</p>
                  <p className="font-cairo font-bold text-xl text-primary">
                    {formatCurrency(orderData.walletAmountUsed && orderData.walletAmountUsed > 0 
                      ? Math.max(0, orderData.totalAmount - orderData.walletAmountUsed) 
                      : orderData.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Instructions based on payment method - only shown if order is not cancelled */}
            {!isCancelled && isBankTransfer && orderData.paymentStatus !== 'completed' && (
              <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem] border border-[#B8860B]">
                <h3 className="font-cairo font-bold text-xl mb-2">
                  {ensureString(translate("orderConfirmation.nextSteps"))}
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-400">
                  <li>{ensureString(translate("orderConfirmation.step1"))}</li>
                  <li>{ensureString(translate("orderConfirmation.step2"))}</li>
                  <li>{ensureString(translate("orderConfirmation.step3"))}</li>
                  <li>{ensureString(translate("orderConfirmation.step4"))}</li>
                  <li className="font-medium text-[#E63946]">{ensureString(translate("orderConfirmation.sendPdfInstructions") || "Après le paiement, veuillez envoyer le PDF de votre commande par WhatsApp ou par email à orders@sou9digital.com pour un traitement plus rapide.")}</li>
                </ol>
                <p className="mt-4 text-[#E63946]">{ensureString(translate("orderConfirmation.important"))}</p>
              </div>
            )}
            
            {!isCancelled && orderData.paymentMethod === 'cash_on_delivery' && (
              <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem] border border-[#B8860B]">
                <h3 className="font-cairo font-bold text-xl mb-2">
                  {ensureString(translate("orderConfirmation.nextSteps"))}
                </h3>
                <p className="text-gray-400">
                  {ensureString(translate("orderConfirmation.cashOnDeliveryInstructions"))}
                </p>
                <p className="mt-4 font-medium text-[#E63946]">
                  {ensureString(translate("orderConfirmation.sendPdfInstructions") || "Veuillez envoyer le PDF de votre commande par WhatsApp ou par email à orders@sou9digital.com pour un traitement plus rapide.")}
                </p>
              </div>
            )}

            {/* Hidden div for printing receipt */}
            <div className="hidden">
              <div ref={receiptRef}>
                <div className="section-title">{ensureString(translate("orderConfirmation.orderInfo"))}</div>
                <div className="order-info">
                  <p><strong>{ensureString(translate("orderConfirmation.orderNumber"))}:</strong> SD-{orderData.id.toString().padStart(6, '0')}</p>
                  <p><strong>{ensureString(translate("orderConfirmation.date"))}:</strong> {formatDate(orderData.createdAt)}</p>
                  <p><strong>{ensureString(translate("orderConfirmation.status"))}:</strong> <span className={
                    orderData.paymentStatus === 'completed' 
                      ? 'text-green-600' 
                      : isCancelled 
                        ? 'text-red-600'
                        : ''
                  }>{
                    isCancelled 
                      ? ensureString(translate("orderConfirmation.cancelled") || "Annulée")
                      : orderData.paymentStatus === 'completed' 
                        ? ensureString(translate("orderConfirmation.paid")) 
                        : ensureString(translate("orderConfirmation.pending"))
                  }</span></p>
                </div>
                
                <div className="section-title">{ensureString(translate("orderConfirmation.customerInfo"))}</div>
                <div className="order-info">
                  <p><strong>{ensureString(translate("orderConfirmation.customer"))}:</strong> {orderData.firstName} {orderData.lastName}</p>
                  <p><strong>{ensureString(translate("orderConfirmation.email"))}:</strong> {orderData.email}</p>
                  <p><strong>{ensureString(translate("orderConfirmation.phone"))}:</strong> {orderData.phoneNumber}</p>
                  {orderData.city && <p><strong>{ensureString(translate("orderConfirmation.city"))}:</strong> {orderData.city}</p>}
                </div>
                
                <div className="section-title">{ensureString(translate("orderConfirmation.paymentInfo"))}</div>
                <div className="order-info">
                  <p><strong>{ensureString(translate("orderConfirmation.method"))}:</strong> {
                    orderData.paymentMethod === 'bank_transfer' 
                      ? ensureString(translate("checkout.bankTransfer")) 
                      : ensureString(translate("checkout.cashOnDelivery"))
                  }</p>
                  <p><strong>{ensureString(translate("orderConfirmation.deadline")) || "Délai de paiement"}:</strong> {
                    orderData.paymentMethod === 'bank_transfer' && orderData.paymentDeadline
                      ? formatDate(orderData.paymentDeadline)
                      : ensureString(translate("orderConfirmation.notApplicable")) || "N/A"
                  }</p>
                </div>
                
                <div className="section-title">{ensureString(translate("orderConfirmation.orderDetails"))}</div>
                {items.map((item: any) => (
                  <div key={item.id} className="item">
                    <span>{item.quantity}x {item.productName || `Product #${item.productId}`} {item.platform && `(${item.platform})`}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                
                {/* Sous-total avant remises */}
                {(orderData.promoCode || (orderData.walletAmountUsed && orderData.walletAmountUsed > 0)) && (
                  <div className="item">
                    <span>{ensureString(translate("checkout.subtotal"))}</span>
                    <span>{formatCurrency(orderData.subtotalBeforeDiscount || 0)}</span>
                  </div>
                )}
                
                {/* Inclure les infos du code promo dans le reçu imprimable */}
                {orderData.promoCode && (
                  <div className="item discount">
                    <span>{ensureString(translate("orderConfirmation.promoCode"))}: <strong>{orderData.promoCode}</strong></span>
                    <span>-{formatCurrency(orderData.promoDiscount || 0)}</span>
                  </div>
                )}
                
                {/* Inclure les infos du portefeuille dans le reçu imprimable */}
                {orderData.walletAmountUsed && orderData.walletAmountUsed > 0 && (
                  <div className="item discount">
                    <span>{ensureString(translate("orderConfirmation.walletUsed"))}</span>
                    <span>-{formatCurrency(orderData.walletAmountUsed)}</span>
                  </div>
                )}

                // 2. Remplacer le code existant des frais par:
                {/* Inclure les frais de livraison dans le reçu imprimable */}
                {isCashDelivery && (
                  <div className="item">
                    <span>{ensureString(translate("orderConfirmation.shippingFee"))}</span>
                    <span>+{formatCurrency(30)}</span>
                  </div>
                )}

                <div className="total">
                  <span>{ensureString(translate("orderConfirmation.totalAmount"))}</span>
                  <span>{formatCurrency(orderData.walletAmountUsed && orderData.walletAmountUsed > 0 
                    ? Math.max(0, orderData.totalAmount - orderData.walletAmountUsed) 
                    : orderData.totalAmount)}</span>
                </div>
                
                {isBankTransfer && (
                  <div className="instructions">
                    <h3 className="font-bold mb-2">{ensureString(translate("checkout.bankTransferInstructions"))}</h3>
                    <p><strong>{ensureString(translate("checkout.bankName"))}:</strong> Bank Al-Maghrib</p>
                    <p><strong>{ensureString(translate("checkout.accountName"))}:</strong> Sou9Digital SARL</p>
                    <p><strong>{ensureString(translate("checkout.accountNumber"))}:</strong> 123-456-789</p>
                    <p><strong>{ensureString(translate("checkout.orderRef"))}:</strong> SD-{orderData.id.toString().padStart(6, '0')}</p>
                    <p className="important mt-2">{ensureString(translate("orderConfirmation.important"))}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Game Codes & Gift Cards Section */}
            {isComplete && gameCodes && gameCodes.length > 0 && (
              <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem] mt-6 border border-green-600">
                <h3 className="font-cairo font-bold text-xl mb-4 flex items-center">
                  <FaKey className="mr-2 text-green-500" />
                  {ensureString(translate("orderConfirmation.codesTitle") || "Vos codes d'activation")}
                </h3>
                <p className="text-gray-400 mb-4 text-sm">
                  {ensureString(translate("orderConfirmation.codesDescription") || "Vos Codes d'activation sont disponible dans votre mail qui est associé à la commande.")}
                </p>
                {/* <div className="space-y-3">
                  {gameCodes.map((code: GameCode) => {
                    // Check if this is a gift card based on platform
                    const isGiftCard = code.productPlatform && 
                      (code.productPlatform.toLowerCase().includes('card') || 
                       code.productPlatform.toLowerCase().includes('credit'));
                    
                    return (
                      <div key={code.id} className="bg-[#132743] p-3 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            {code.productImageUrl && (
                              <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                                <img 
                                  src={code.productImageUrl} 
                                  alt={code.productName || "Product"} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-white">{code.productName || `Produit #${code.productId}`}</p>
                              {code.productPlatform && (
                                <p className="text-xs text-gray-400">
                                  <span className="flex items-center">
                                    {isGiftCard ? <FaCreditCard className="mr-1 text-primary" size={12} /> : <FaGamepad className="mr-1 text-primary" size={12} />}
                                    {code.productPlatform}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <div className={`flex items-center px-3 py-2 rounded font-mono text-sm border ${isGiftCard ? 'bg-[#0d1525] border-primary/30' : 'bg-[#0a0d15] border-[#2a3a59]'}`}>
                            <span className="truncate mr-2">{code.code}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80 hover:bg-[#1a2a45] p-1 h-7"
                            onClick={() => copyToClipboard(code.code)}
                          >
                            <FaCopy size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div> */}
                <p className="mt-4 text-sm text-green-500">
                  {ensureString(translate("orderConfirmation.codesNote") || "Note: Si vous rencontrez des problèmes avec votre code, veuillez nous contacter dans les 24 heures.")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-4 justify-between">
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-background transition-colors"
              onClick={handlePrint}
            >
              <FaPrint className="mr-2" />
              {ensureString(translate("orderConfirmation.printReceipt"))}
            </Button>
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-background transition-colors"
              onClick={handlePrint}
            >
              <FaDownload className="mr-2" />
              {ensureString(translate("orderConfirmation.downloadReceipt"))}
            </Button>
            <Button 
              variant="outline" 
              className={`border-[#25D366] ${shareSuccess ? 'bg-[#25D366] text-white' : 'text-[#25D366] hover:bg-[#25D366] hover:text-white'} transition-colors`}
              onClick={shareReceiptOnWhatsApp}
            >
              {shareSuccess ? <FaCheck className="mr-2" /> : <FaWhatsapp className="mr-2" />}
              {shareSuccess 
                ? ensureString(translate("orderConfirmation.whatsappShareSuccess")) || "Partagé sur WhatsApp"
                : ensureString(translate("orderConfirmation.shareOnWhatsApp")) || "Partager sur WhatsApp"}
            </Button>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 text-background">
            <Link href="/store">
              {ensureString(translate("orderConfirmation.continueShopping"))}
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <div className="text-center">
        <p className="text-gray-400 mb-4">{ensureString(translate("orderConfirmation.questions"))}</p>
        <Button 
          asChild
          variant="outline" 
          className="border-primary text-primary hover:bg-primary hover:text-background transition-colors"
        >
          <a href="mailto:support@sou9digital.ma">
            <FaEnvelope className="mr-2" />
            {ensureString(translate("orderConfirmation.contactSupport"))}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
