import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { FaCreditCard, FaMoneyBill, FaUniversity, FaInfoCircle, FaClock, FaTruckMoving, FaMapMarkerAlt, FaWallet, FaTag, FaCheck } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { generateOrderNumber, formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/LocalAuthContext";

type PaymentMethod = "bank_transfer" | "cash_on_delivery";

interface CheckoutProps {
  userProfile?: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    city?: string;
    role?: string;
  };
}

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  paymentMethod: PaymentMethod;
  city: string; // Champ ville pour la livraison
  useWalletBalance: boolean; // Utiliser le solde du portefeuille
  walletAmountToUse: number; // Montant du portefeuille à utiliser
  promoCode: string; // Code promo
}

// Interface pour les paramètres de paiement
interface BankAccount {
  accountOwner: string;
  bankName: string;
  accountNumber: string;
  rib: string;
  swift?: string;
  additionalInstructions?: string;
}

interface CashOnDelivery {
  enabled: boolean;
  fee: number;
  additionalInstructions?: string;
}

interface PaymentSettings {
  bankAccount?: BankAccount;
  cashOnDelivery?: CashOnDelivery;
}

const Checkout = ({ userProfile }: CheckoutProps) => {
  const { translate } = useLanguage();
  const { items, getTotal, clearCart } = useCart();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber] = useState(generateOrderNumber());
  const [codFee, setCodFee] = useState(0);
  const [maxWalletAmount, setMaxWalletAmount] = useState(0);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoCodeData, setPromoCodeData] = useState<any>(null);

  // Récupérer les paramètres de paiement
  const { data: paymentSettings, isLoading: isLoadingSettings } = useQuery<PaymentSettings>({
    queryKey: ['/api/settings/payment'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/settings/payment");
        return await response.json();
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres de paiement:", error);
        return { bankAccount: {
          accountOwner: "Sou9Digital SARL",
          bankName: "Bank Al-Maghrib",
          accountNumber: "123456789012345678",
          rib: "XXX XXX XXX XXX XXX XXX XX",
        }};
      }
    }
  });

  // Récupérer les informations de checkout (profil et portefeuille) pour les utilisateurs connectés
  const { data: checkoutInfo, isLoading: isLoadingCheckoutInfo } = useQuery({
    queryKey: ['/api/checkout/user-info'],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      try {
        const response = await apiRequest("GET", "/api/checkout/user-info");
        return await response.json();
      } catch (error) {
        console.error("Erreur lors de la récupération des infos de checkout:", error);
        return null;
      }
    },
    enabled: !!currentUser?.id
  });

  // Récupérer le solde du portefeuille de l'utilisateur s'il est connecté (avec auto-refresh)
  const { data: walletBalance = 0, isLoading: isLoadingWallet } = useQuery<number>({
    queryKey: ['/api/users', userProfile?.id || currentUser?.id, 'wallet/balance'],
    queryFn: async () => {
      const userId = userProfile?.id || currentUser?.id;
      if (!userId) return 0;

      // Si les données de checkout sont disponibles, utilisez le solde qui s'y trouve
      if (checkoutInfo?.walletBalance !== undefined) {
        return checkoutInfo.walletBalance;
      }

      try {
        const response = await apiRequest("GET", `/api/users/${userId}/wallet/balance`);
        const balance = await response.json();
        console.log("💰 Solde du portefeuille récupéré:", balance);
        return balance;
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du solde du portefeuille:", error);
        return 0;
      }
    },
    // Exécuter la requête seulement si un utilisateur est connecté
    enabled: !!(userProfile?.id || currentUser?.id),
    // Ajouter le rafraîchissement automatique
    refetchInterval: 15000, // Rafraîchir toutes les 15 secondes
    refetchOnWindowFocus: true // Rafraîchir quand l'utilisateur revient sur l'onglet
  });

  // Nouvelle fonction unifiée pour calculer tous les montants de la commande
  const calculateOrderAmounts = () => {
    try {
      // 1. Sous-total (prix des articles seulement)
      const subtotal = getTotal();
      console.log("🛒 Sous-total du panier (getTotal):", subtotal);

      // 2. Calculer la remise du code promo
      let promoDiscount = 0;

      if (isPromoApplied && promoCodeData) {
        console.log("🏷️ Code promo appliqué:", promoCodeData);
        // Make sure discountValue is a number
        const discountValue = Number(promoCodeData.discountValue || 0);
        console.log("💹 Valeur de la remise (brute):", discountValue);

        if (!isNaN(discountValue) && discountValue > 0) {
          if (promoCodeData.discountType === "percentage") {
            // Remise en pourcentage
            const discountRate = discountValue / 100;
            console.log("📊 Taux de remise (%):", discountRate);
            promoDiscount = Math.min(subtotal * discountRate, subtotal);
            console.log("💰 Remise calculée (pourcentage):", promoDiscount);
          } else if (promoCodeData.discountType === "fixed") {
            // Remise à montant fixe
            promoDiscount = Math.min(discountValue, subtotal);
            console.log("💰 Remise calculée (fixe):", promoDiscount);
          } else {
            console.warn("⚠️ Type de remise inconnu:", promoCodeData.discountType);
          }
        } else {
          console.error("⚠️ Valeur de remise invalide dans le code promo:", promoCodeData.discountValue);
          console.log("💰 Remise réelle appliquée:", 0);
        }
      } else {
        console.log("ℹ️ Pas de code promo appliqué");
      }

      // 3. Frais de livraison/paiement à la livraison
      const fees = codFee || 0;
      console.log("🚚 Frais de livraison:", fees);

      // 4. Montant après remise (sous-total - remise) mais avant frais
      const subtotalAfterDiscount = Math.max(0, subtotal - promoDiscount);
      console.log("💸 Sous-total après remise:", subtotalAfterDiscount);

      // 5. Montant total après remise et frais mais avant utilisation du portefeuille
      const totalBeforeWallet = subtotalAfterDiscount + fees;
      console.log("💰 Total avant utilisation du portefeuille:", totalBeforeWallet);

      // 6. Montant utilisé du portefeuille (si activé)
      let walletAmount = 0;
      if (formUseWalletBalance && walletAmountToUse > 0 && walletBalance && walletBalance > 0) {
        console.log("👛 Portefeuille activé, montant à utiliser:", walletAmountToUse);
        // S'assurer que nous n'utilisons pas plus que le solde disponible ET pas plus que le montant total
        walletAmount = Math.min(
          totalBeforeWallet,                   // Ne pas dépasser le montant à payer
          Math.min(                            // Ne pas dépasser le solde disponible ou le montant demandé
            Number(walletBalance) || 0,
            Number(walletAmountToUse) || 0
          )
        );
        console.log("👛 Montant effectivement utilisé du portefeuille:", walletAmount);
      } else {
        console.log("👛 Portefeuille non utilisé ou solde insuffisant");
      }

      // 7. Montant final à payer après toutes les réductions
      const finalAmount = Math.max(0, totalBeforeWallet - walletAmount);
      console.log("💵 Montant final à payer:", finalAmount);

      // 8. Économies totales (remises + portefeuille)
      const totalSavings = promoDiscount + walletAmount;
      console.log("🏆 Économies totales:", totalSavings);

      // Journalisation détaillée pour le débogage
      console.log("📊 RÉSUMÉ DU CALCUL:", {
        sousTotal: subtotal.toFixed(2),
        remisePromo: promoDiscount.toFixed(2),
        fraisLivraison: fees.toFixed(2),
        montantApresRemise: subtotalAfterDiscount.toFixed(2),
        totalAvantWallet: totalBeforeWallet.toFixed(2),
        montantPortefeuille: walletAmount.toFixed(2),
        totalFinal: finalAmount.toFixed(2),
        economieTotal: totalSavings.toFixed(2),
        codePromoInfo: isPromoApplied ? {
          code: promoCodeData?.code,
          type: promoCodeData?.discountType,
          valeur: promoCodeData?.discountValue
        } : 'Non appliqué',
        walletInfo: {
          soldeTotal: walletBalance,
          utilise: formUseWalletBalance,
          montantDemande: walletAmountToUse,
          montantReel: walletAmount
        }
      });

      // Retourner un objet contenant tous les montants calculés
      return {
        subtotal,                // Sous-total (articles seulement)
        promoDiscount,           // Montant de la remise du code promo
        fees,                    // Frais de livraison/paiement
        subtotalAfterDiscount,   // Sous-total après remise
        totalBeforeWallet,       // Total avant utilisation du portefeuille
        walletAmount,            // Montant utilisé du portefeuille
        finalAmount,             // Montant final à payer
        finalTotal: finalAmount,      // Alias pour le montant final (pour plus de clarté dans le template)
        totalSavings             // Économies totales
      };
    } catch (error) {
      console.error("❌ Erreur lors du calcul des montants:", error);
      console.error("📋 Stack trace:", error instanceof Error ? error.stack : "Pas de stack trace disponible");

      // Journal détaillé de l'état actuel
      console.log("📌 État au moment de l'erreur:", {
        panier: items,
        totalPanier: getTotal(),
        codePromo: {
          isApplied: isPromoApplied,
          data: promoCodeData
        },
        portefeuille: {
          balance: walletBalance,
          useWallet: formUseWalletBalance,
          amountToUse: walletAmountToUse
        },
        fraisCOD: codFee
      });

      // En cas d'erreur, retourner des valeurs par défaut sécurisées
      const finalAmountSafe = getTotal() + (codFee || 0);
      return {
        subtotal: getTotal(),
        promoDiscount: 0,
        fees: codFee || 0,
        subtotalAfterDiscount: getTotal(),
        totalBeforeWallet: getTotal() + (codFee || 0),
        walletAmount: 0,
        finalAmount: finalAmountSafe,
        finalTotal: finalAmountSafe,
        totalSavings: 0
      };
    }
  };

  // Fonctions de compatibilité pour maintenir le reste du code fonctionnel

  // Calculer le sous-total (prix des articles)
  const calculateSubtotal = () => {
    return calculateOrderAmounts().subtotal;
  };

  // Calculer la remise du code promo
  const calculatePromoDiscount = (subtotal: number): number => {
    return calculateOrderAmounts().promoDiscount;
  };

  // Calculer le total après remise promo mais avant frais et wallet
  const calculateTotalAfterPromo = (subtotal: number) => {
    return calculateOrderAmounts().subtotalAfterDiscount;
  };

  // Calculer le total final selon la formule: TOTAL = SOUS-TOTAL - REDUCTION - WALLET SOLDE
  const calculateOrderTotal = (applyWalletAmount = false) => {
    const amounts = calculateOrderAmounts();
    return applyWalletAmount ? amounts.finalAmount : amounts.totalBeforeWallet;
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: "bank_transfer",
      useWalletBalance: false,
      walletAmountToUse: 0,
      promoCode: "",
    },
  });

  const selectedPaymentMethod = watch("paymentMethod");
  const walletAmountToUse = watch("walletAmountToUse");
  const formUseWalletBalance = watch("useWalletBalance");
  
  // Update the useWalletBalance state whenever the form field changes
  useEffect(() => {
    setUseWalletBalance(Boolean(formUseWalletBalance));
  }, [formUseWalletBalance]);

  // Déterminer la valeur maximale que l'utilisateur peut utiliser depuis son portefeuille
  useEffect(() => {
    // S'assurer que walletBalance a une valeur (0 par défaut si non défini)
    const currentBalance = walletBalance || 0;

    try {
      // Utiliser le total avant application du portefeuille pour éviter tout calcul circulaire
      const amounts = calculateOrderAmounts();
      const orderTotal = amounts.totalBeforeWallet;

      console.log("💰 Calcul du montant maximum du portefeuille:", { 
        solde: currentBalance, 
        total: orderTotal,
        sous_total: amounts.subtotal,
        remise: amounts.promoDiscount,
        frais: amounts.fees
      });

      if (currentBalance > 0) {
        // Le montant maximum est le solde du portefeuille ou le total de la commande, selon le plus petit
        const maxAmount = Math.min(currentBalance, orderTotal);

        console.log("💰 Montant max utilisable du portefeuille:", maxAmount, "sur un solde de", currentBalance);

        // Mettre à jour la valeur maximale
        setMaxWalletAmount(maxAmount);

        // Si la valeur actuelle du slider dépasse le nouveau maximum, l'ajuster
        if (Number(walletAmountToUse) > maxAmount) {
          console.log("⚠️ Ajustement du montant demandé:", walletAmountToUse, "→", maxAmount);
          setValue("walletAmountToUse", maxAmount);
        }
      } else {
        setMaxWalletAmount(0);
        setValue("walletAmountToUse", 0);
        console.log("💰 Aucun montant utilisable (solde 0)");
      }
    } catch (error) {
      console.error("❌ Erreur lors du calcul du montant max du portefeuille:", error);
      // En cas d'erreur, définir des valeurs sécurisées
      setMaxWalletAmount(0);
      setValue("walletAmountToUse", 0);
    }
  }, [walletBalance, codFee, isPromoApplied, promoCodeData, getTotal, setValue, walletAmountToUse]);

  // Pré-remplir les informations de l'utilisateur connecté depuis les infos de checkout
  useEffect(() => {
    // D'abord, essayer d'utiliser les données de userProfile (depuis la page de checkout)
    if (userProfile) {
      console.log("👤 Pré-remplissage des informations à partir du userProfile:", userProfile);

      // Remplir les champs avec les données du profil utilisateur
      setValue("email", userProfile.email || "");
      setValue("firstName", userProfile.firstName || "");
      setValue("lastName", userProfile.lastName || "");
      setValue("phoneNumber", userProfile.phoneNumber || "");
      if (userProfile.city) {
        setValue("city", userProfile.city);
      }

      console.log("✅ La commande sera associée à l'utilisateur ID:", userProfile.id);
      return;
    }

    // Si userProfile n'est pas disponible, continuer avec les méthodes existantes
    if (currentUser) {
      console.log("👤 Pré-remplissage des informations de l'utilisateur connecté");

      // Si nous avons des infos de checkout, les utiliser en priorité
      if (checkoutInfo?.user) {
        const user = checkoutInfo.user;
        console.log("📝 Utilisation des informations du profil depuis l'API checkout:", user);

        // Remplir les champs avec les données du profil
        setValue("email", user.email || "");
        setValue("firstName", user.firstName || "");
        setValue("lastName", user.lastName || "");
        setValue("phoneNumber", user.phoneNumber || "");
        setValue("city", user.city || "");
      } else {
        // Sinon, utiliser les informations de base de l'utilisateur
        console.log("📝 Utilisation des informations de base de l'utilisateur:", currentUser);

        // Remplir les champs de base
        setValue("email", currentUser.email || "");
        setValue("firstName", currentUser.firstName || "");
        setValue("lastName", currentUser.lastName || "");
        setValue("phoneNumber", currentUser.phoneNumber || "");

        // Essayer de récupérer la ville depuis différentes sources
        if (currentUser.city) {
          setValue("city", currentUser.city);
        } else {
          // Vérifier si nous avons des données Firebase pour l'utilisateur
          const firebaseUserData = (currentUser as any).firebaseUserData;
          if (firebaseUserData && firebaseUserData.city) {
            setValue("city", firebaseUserData.city);
          }
        }
      }

      // Si l'utilisateur est connecté, la commande sera automatiquement associée à son compte
      console.log("✅ La commande sera associée à l'utilisateur ID:", currentUser.id);

      // Afficher les commandes récentes si elles existent
      if (checkoutInfo?.recentOrders && checkoutInfo.recentOrders.length > 0) {
        console.log("📋 Commandes récentes de l'utilisateur:", checkoutInfo.recentOrders);
      }
    } else {
      console.log("ℹ️ Aucun utilisateur connecté, commande anonyme");
    }
  }, [currentUser, checkoutInfo, setValue, userProfile]);

  // Mettre à jour les frais de livraison lorsque la méthode de paiement change
  useEffect(() => {
    if (selectedPaymentMethod === "cash_on_delivery" && paymentSettings?.cashOnDelivery?.enabled) {
      setCodFee(paymentSettings.cashOnDelivery.fee);
    } else {
      setCodFee(0);
    }
  }, [selectedPaymentMethod, paymentSettings]);



  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast({
        title: translate("checkout.emptyCartError"),
        description: translate("checkout.addItemsToCart"),
        variant: "destructive",
      });
      return;
    }

    // Vérifier si l'utilisateur utilise trop de son solde portefeuille
    if (data.useWalletBalance && data.walletAmountToUse > (walletBalance || 0)) {
      toast({
        title: translate("wallet.insufficientFunds"),
        description: translate("wallet.balanceInsufficient"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les articles du panier pour la commande
      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      // Calculer les frais en fonction de la méthode de paiement
      const fees = selectedPaymentMethod === "cash_on_delivery" ? codFee : 0;

      // Montant à payer après utilisation du portefeuille
      const walletAmount = data.useWalletBalance ? Math.min(Number(data.walletAmountToUse || 0), walletBalance || 0) : 0;
      console.log(`💰 Montant du wallet à utiliser: ${walletAmount} (demandé: ${data.walletAmountToUse}, solde disponible: ${walletBalance})`);

      // Récupérer tous les montants calculés à partir de notre fonction centralisée
      const amounts = calculateOrderAmounts();
      const totalAmount = amounts.totalBeforeWallet; // Total sans réduction du wallet
      const remainingAmount = amounts.finalAmount; // Total final avec réduction du wallet

      // Log complet des calculs pour débogage
      console.log("💰 DÉTAILS COMPLETS DES CALCULS DE LA COMMANDE:", {
        // Montants standard
        subtotal: amounts.subtotal,
        remisePromo: amounts.promoDiscount,
        frais: amounts.fees,
        totalAvantWallet: amounts.totalBeforeWallet,

        // Informations de portefeuille
        soldeTotal: walletBalance,
        utiliserWallet: data.useWalletBalance,
        montantDemandé: data.walletAmountToUse,
        montantWalletEffectif: walletAmount,

        // Montants finaux
        montantFinal: remainingAmount,
        économiesTotal: amounts.totalSavings
      });

      // Créer la requête de commande
      const orderData = {
        totalAmount: totalAmount,
        subtotal: getTotal(),
        fees: fees,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        city: data.city, // Inclure la ville
        paymentMethod: data.paymentMethod,
        paymentStatus: walletAmount >= totalAmount ? "paid" : "pending",
        status: "pending",
        orderNumber: orderNumber,
        items: orderItems,
        useWalletBalance: data.useWalletBalance,
        walletAmountUsed: walletAmount,
        feesUsed : fees ,
        remainingAmount: remainingAmount,
        promoCode: data.promoCode, // Inclure le code promo s'il existe
        // Utiliser userProfile.id en priorité s'il est disponible
        userId: userProfile?.id || currentUser?.id
      };
      
      // Logs détaillés pour l'admin
      console.log("📊 DONNÉES COMPLÈTES DE LA COMMANDE POUR L'ADMIN:", {
        // Informations client
        client: {
          id: userProfile?.id || currentUser?.id,
          email: data.email,
          nom: `${data.firstName} ${data.lastName}`,
          telephone: data.phoneNumber,
          ville: data.city
        },
        
        // Informations de paiement
        paiement: {
          methode: data.paymentMethod,
          statut: walletAmount >= totalAmount ? "paid" : "pending",
          fraisLivraison: fees,
          portefeuilleUtilise: data.useWalletBalance,
          montantPortefeuille: walletAmount,
          montantRestantAPayer: remainingAmount,
          codePromo: data.promoCode || "Aucun"
        },
        
        // Informations de commande
        commande: {
          numero: orderNumber,
          statut: "pending",
          sousTotal: getTotal(),
          montantTotal: totalAmount,
          articles: orderItems.map(item => ({
            produitId: item.productId,
            quantite: item.quantity,
            prix: item.price,
            total: item.price * item.quantity
          }))
        }
      });

      // Soumettre la commande à l'API
      const response = await apiRequest("POST", "/api/orders", orderData);
      const order = await response.json();

      // Si l'utilisateur utilise son solde de portefeuille, effectuer le paiement par portefeuille
      // Utiliser userId du userProfile en priorité si disponible
      const userId = userProfile?.id || currentUser?.id;

      if (data.useWalletBalance && walletAmount > 0 && userId) {
        try {
          // Créer une transaction de portefeuille pour le paiement
          console.log(`💰 Paiement avec portefeuille: montant=${walletAmount} pour commande #${order.id}`);
          const walletResponse = await apiRequest("POST", `/api/orders/${order.id}/pay-with-wallet`, {
            userId: userId,
            walletAmount: walletAmount
          });

          if (!walletResponse.ok) {
            const errorData = await walletResponse.json();
            throw new Error(errorData.message || 'Erreur lors du paiement avec le portefeuille');
          }

          // Attendre la réponse pour s'assurer que le paiement est bien effectué
          const paymentResult = await walletResponse.json();
          console.log("💰 Résultat du paiement par portefeuille:", paymentResult);

          // Forcer le rafraîchissement du solde du portefeuille et des transactions immédiatement
          await queryClient.invalidateQueries({
            queryKey: ['/api/users', userId, 'wallet/balance']
          });
          await queryClient.invalidateQueries({
            queryKey: ['/api/users', userId, 'wallet/transactions']
          });
          
          // Mettre également à jour le wallet balance local pour une mise à jour immédiate de l'UI
          // Calculer le nouveau solde en soustrayant le montant utilisé
          const newBalance = (walletBalance || 0) - walletAmount;
          console.log(`💰 Mise à jour locale du solde portefeuille: ${walletBalance} → ${newBalance}`);
          
          // Mettre à jour le cache React Query directement
          queryClient.setQueryData(['/api/users', userId, 'wallet/balance'], newBalance);
          
          // Mettre à jour le statut de paiement si le montant du portefeuille couvre tout
          if (walletAmount >= order.totalAmount) {
            order.paymentStatus = 'completed';
          }

        } catch (error) {
          const walletError = error as Error;
          console.error("Erreur lors du paiement avec le portefeuille:", walletError);
          toast({
            title: "Erreur de paiement",
            description: walletError.message || "Erreur lors de l'utilisation du portefeuille",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Note: Le cashback de 3% sera automatiquement ajouté sur le serveur
      // lorsque la commande sera marquée comme "completed" par l'administrateur
      if (userId) {
        console.log(`✅ Le cashback de 3% sera ajouté automatiquement lorsque la commande #${order.id} sera validée`);

        // Notifier l'utilisateur du futur cashback
        toast({
          title: "Cashback en attente",
          description: "Vous recevrez 3% de cashback lorsque votre commande sera payée",
        });
      }

      // Vider le panier après une commande réussie
      clearCart();

      // Rediriger vers la page de confirmation
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      toast({
        title: translate("checkout.orderError"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation du code promo via requête API
  const validatePromoCode = async (code: string) => {
    try {
      setIsPromoLoading(true);
      console.log("🔍 Validation du code promo:", code);

      const response = await apiRequest("POST", "/api/promo-codes/validate", { 
        code,
        userId: currentUser?.id || userProfile?.id,
        orderAmount: getTotal()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to validate promo code');
      }

      const result = await response.json();
      console.log("📊 Résultat de la validation du code promo:", result);

      if (result.valid && result.promoCode) {
        // Make sure discountValue is properly set as a number
        const promoCode = {
          ...result.promoCode,
          discountValue: Number(result.promoCode.discountValue || 0)
        };
        
        console.log("✅ Code promo valide, application des données:", promoCode);
        setPromoCodeData(promoCode);
        setIsPromoApplied(true);
        return promoCode;
      } else {
        // Afficher un message d'erreur si le code promo n'est pas valide
        toast({
          title: translate("checkout.promoError")?.toString() || "Code promo invalide",
          description: translate("checkout.promoInvalid")?.toString() || "Ce code promo n'est pas valide ou a expiré",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error("❌ Erreur validation code promo:", error);
      toast({
        title: translate("checkout.promoError")?.toString() || "Erreur",
        description: translate("checkout.promoErrorDesc")?.toString() || "Une erreur est survenue lors de la validation du code promo.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsPromoLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-[#132743] text-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="font-cairo text-2xl">
                {translate("checkout.title")}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {translate("checkout.subtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} id="checkout-form">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-cairo text-xl text-white">
                      {translate("checkout.contactInfo")}
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="email">{translate("checkout.email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                        placeholder= {translate("checkout.emailPlaceholder") || "Enter your email address"}
                        {...register("email", {
                          required: translate("checkout.emailRequired") as string,
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: translate("checkout.invalidEmail") as string,
                          },
                        })}
                      />
                      {errors.email && (
                        <p className="text-[#E63946] text-sm">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">
                          {translate("checkout.firstName")}
                        </Label>
                        <Input
                          id="firstName"
                          className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                          placeholder={translate("checkout.firstNamePlaceholder") || "Enter your first name"}
                          {...register("firstName", {
                            required: translate("checkout.firstNameRequired") as string,
                          })}
                        />
                        {errors.firstName && (
                          <p className="text-[#E63946] text-sm">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">
                          {translate("checkout.lastName")}
                        </Label>
                        <Input
                          id="lastName"
                          className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                          placeholder={translate("checkout.lastNamePlaceholder") || "Enter your last name"}
                          {...register("lastName", {
                            required: translate("checkout.lastNameRequired") as string,
                          })}
                        />
                        {errors.lastName && (
                          <p className="text-[#E63946] text-sm">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">
                        {translate("checkout.phoneNumber")}
                      </Label>
                      <Input
                        id="phoneNumber"
                        className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                        placeholder={translate("checkout.phoneNumberPlaceholder") || "Enter your phone number"}
                        {...register("phoneNumber", {
                          required: translate("checkout.phoneNumberRequired") as string,
                          pattern: {
                            value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                            message: translate("checkout.invalidPhoneNumber") as string,
                          },
                        })}
                      />
                      {errors.phoneNumber && (
                        <p className="text-[#E63946] text-sm">
                          {errors.phoneNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Afficher le champ ville uniquement si le paiement à la livraison est sélectionné */}
                    <div className="space-y-2">
                        <Label htmlFor="city" className="flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-primary" />
                          {translate("checkout.city") || "Ville"} 
                          {selectedPaymentMethod === "cash_on_delivery" && (
                            <span className="text-[#E63946] ml-1">*</span>
                          )}
                        </Label>
                        <Input
                          id="city"
                          className={`bg-[#0a0f1a] ${selectedPaymentMethod === "cash_on_delivery" ? 'border-[#E63946] focus:border-[#E63946]' : 'border-[#B8860B] focus:border-primary'}`}
                          placeholder={selectedPaymentMethod === "cash_on_delivery" 
                            ? (translate("checkout.cityRequiredPlaceholder") || " Obligatoire pour la livraison")
                            : (translate("checkout.cityPlaceholder") || "Facultatif")}
                          {...register("city", {
                            required: selectedPaymentMethod === "cash_on_delivery" ? 
                              (translate("checkout.cityRequired") || "La ville est obligatoire pour les livraisons en espèces. Veuillez indiquer votre ville pour continuer.") as string : 
                              false,
                          })}
                        />
                        {errors.city && (
                          <p className="text-[#E63946] text-sm font-bold">
                            {errors.city.message}
                          </p>
                        )}
                        {selectedPaymentMethod === "cash_on_delivery" && !watch("city") && (
                          <p className="text-yellow-400 text-sm">
                            {translate("checkout.cityRequiredInfo") || " Pour les paiements à la livraison, nous avons besoin de connaître votre ville."}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-cairo text-xl text-white">
                      {translate("checkout.paymentMethod")}
                    </h3>

                    <RadioGroup
                      defaultValue="bank_transfer"
                      value={selectedPaymentMethod}
                      onValueChange={(value) => setValue("paymentMethod", value)}
                    >
                      <div className="flex items-center space-x-2 bg-[#0a0f1a] p-4 rounded-[0.75rem] border border-[#B8860B] mb-4 hover:border-primary transition-colors">
                        <RadioGroupItem 
                          value="bank_transfer" 
                          id="bank_transfer"
                          className="text-primary border-[#B8860B]"
                        />
                        <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer flex items-center">
                          <FaUniversity className="text-primary mr-2" />
                          {translate("checkout.bankTransfer")}
                        </Label>
                      </div>

                      {paymentSettings?.cashOnDelivery?.enabled && (
                        <div className="flex items-center space-x-2 bg-[#0a0f1a] p-4 rounded-[0.75rem] border border-[#B8860B] hover:border-primary transition-colors">
                          <RadioGroupItem 
                            value="cash_on_delivery" 
                            id="cash_on_delivery"
                            className="text-primary border-[#B8860B]"
                            disabled={!paymentSettings?.cashOnDelivery?.enabled}
                          />
                          <Label htmlFor="cash_on_delivery" className="flex-1 cursor-pointer flex items-center">
                            <FaMoneyBill className="text-primary mr-2" />
                            {translate("checkout.cashOnDelivery")}
                          </Label>
                        </div>
                      )}
                    </RadioGroup>

                    {selectedPaymentMethod === "bank_transfer" && (
                      <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem] border border-[#B8860B]">
                        <h4 className="font-cairo text-lg text-white mb-2">
                          {translate("checkout.bankTransferInstructions")}
                        </h4>
                        <p className="text-gray-400 mb-2">{translate("checkout.bankTransferDescription")}</p>

                        {isLoadingSettings ? (
                          <div className="flex justify-center py-4">
                            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
                              <div>
                                <p className="text-white font-medium">{translate("checkout.bankDetails")}:</p>
                                <p>{translate("checkout.bankName")}: {paymentSettings?.bankAccount?.bankName || "Bank Al-Maghrib"}</p>
                                <p>{translate("checkout.accountName")}: {paymentSettings?.bankAccount?.accountOwner || "Sou9Digital SARL"}</p>
                                <p>{translate("checkout.rib") || "RIB"}: {paymentSettings?.bankAccount?.rib}</p>
                                {paymentSettings?.bankAccount?.swift && (
                                  <p>{translate("checkout.swift") || "SWIFT"}: {paymentSettings.bankAccount.swift}</p>
                                )}
                              </div>
                              <div>
                                <p className="text-white font-medium">{translate("checkout.reference")}:</p>
                                <p>{translate("checkout.accountNumber")}: {paymentSettings?.bankAccount?.accountNumber}</p>
                                <p>{translate("checkout.orderRef")}: {orderNumber}</p>
                              </div>
                            </div>

                            {paymentSettings?.bankAccount?.additionalInstructions && (
                              <div className="mt-4 text-gray-400">
                                <p className="text-white font-medium">{translate("checkout.additionalInstructions")}:</p>
                                <p>{paymentSettings.bankAccount.additionalInstructions}</p>
                              </div>
                            )}
                          </>
                        )}

                        <Alert className="mt-4 bg-blue-950/50 border-blue-800/50 text-blue-300">
                          <FaClock className="h-4 w-4 mr-2" />
                          <AlertTitle>{translate("checkout.paymentTimeLimit") || "Délai de paiement"}</AlertTitle>
                          <AlertDescription>
                            {translate("checkout.paymentTimeLimitDesc") || "Veuillez effectuer votre paiement dans les 5 jours suivant votre commande. Les commandes non payées seront automatiquement annulées après cette période."}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {/* Note: Le champ de ville a été déplacé et est maintenant dans la section des informations de contact */}

                    {selectedPaymentMethod === "cash_on_delivery" && (
                      <div className="bg-[#0a0f1a] p-4 rounded-[0.75rem] border border-[#B8860B]">
                        <h4 className="font-cairo text-lg text-white mb-2">
                          {translate("checkout.cashOnDeliveryInstructions")}
                        </h4>
                        <p className="text-gray-400 mb-4">{translate("checkout.cashOnDeliveryDescription")}</p>

                        {paymentSettings?.cashOnDelivery?.additionalInstructions && (
                          <div className="mb-4 text-gray-400">
                            <p className="text-white font-medium">{translate("checkout.additionalInstructions")}:</p>
                            <p>{paymentSettings.cashOnDelivery.additionalInstructions}</p>
                          </div>
                        )}

                        {paymentSettings?.cashOnDelivery?.fee && paymentSettings?.cashOnDelivery?.fee > 0 && (
                          <Alert className="bg-amber-950/50 border-amber-800/50 text-amber-300">
                            <FaInfoCircle className="h-4 w-4 mr-2" />
                            <AlertTitle>{translate("checkout.deliveryFeesNotice") || "Frais de livraison"}</AlertTitle>
                            <AlertDescription>
                              {translate("checkout.deliveryFeesNoticeDesc") || "Des frais supplémentaires de"} {paymentSettings?.cashOnDelivery?.fee ? formatCurrency(paymentSettings.cashOnDelivery.fee) : ''} {translate("checkout.deliveryFeesNoticeDesc2") || "sont appliqués pour le paiement à la livraison."}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-[#132743] text-white border-none shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="font-cairo text-2xl">
                {translate("checkout.orderSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.platform}`} className="flex justify-between py-2 border-b border-[#0a0f1a]">
                    <div>
                      <p className="text-white">{item.name}</p>
                      <p className="text-gray-400 text-sm">
                        {item.platform} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-cairo font-bold text-primary">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}

                {/* Utiliser notre nouvelle fonction de calcul pour tous les montants */}
                {(() => {
                  // Calculer tous les montants en une seule fois en utilisant notre nouvelle fonction
                  const amounts = calculateOrderAmounts();

                  return (
                    <>
                      <div className="flex justify-between py-2">
                        <p className="text-gray-400">{translate("checkout.subtotal")}:</p>
                        <p className="font-cairo text-white">{formatCurrency(amounts.subtotal)}</p>
                      </div>

                      {/* Afficher le code promo si appliqué */}
                      {isPromoApplied && promoCodeData && (
                        <>
                          <div className="flex justify-between py-2">
                            <p className="text-gray-400 flex items-center">
                              <FaTag className="text-primary mr-2" />
                              {translate("checkout.promoCode")?.toString() || "Code promo"} ({String(promoCodeData.code)}):
                            </p>
                            <p className="font-cairo text-green-500">
                              -{promoCodeData.discountType === 'percentage' 
                                ? `${Number(promoCodeData.discountValue)}%` 
                                : formatCurrency(Number(promoCodeData.discountValue))}
                            </p>
                          </div>

                          {/* Montant de la remise code promo */}
                          <div className="flex justify-between py-2 text-gray-400">
                            <p>{translate("checkout.discount")}:</p>
                            <p className="font-cairo text-green-500">-{formatCurrency(amounts.promoDiscount)}</p>
                          </div>

                          {/* Sous-total après remise mais avant frais */}
                          <div className="flex justify-between py-2 border-t border-[#0a0f1a]">
                            <p className="text-gray-400">{translate("checkout.subtotalAfterPromo")?.toString() || "Sous-total après réduction"}:</p>
                            <p className="font-cairo text-white">{formatCurrency(amounts.subtotalAfterDiscount)}</p>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}

                {codFee > 0 && (
                  <div className="flex justify-between py-2">
                    <p className="text-gray-400">{translate("checkout.deliveryFee")}:</p>
                    <p className="font-cairo text-white">{formatCurrency(codFee)}</p>
                  </div>
                )}

                {/* Option pour utiliser le solde du portefeuille - seulement pour utilisateurs connectés */}
                {(userProfile?.id || currentUser?.id) && (
                  <div className="py-4 border-t border-[#0a0f1a] bg-[#0a142a] p-4 rounded-lg mt-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-[#132743] p-2 rounded-full mr-3">
                        <FaWallet className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{translate("wallet.payWithWallet")?.toString() || "Payer avec mon portefeuille"}</h4>
                        <p className="text-gray-400 text-sm">
                          {translate("checkout.walletBalance")?.toString() || "Solde portefeuille"}: <span className="text-primary font-medium">{formatCurrency(walletBalance || 0)}</span>
                        </p>
                      </div>
                      <Checkbox 
                        id="useWalletBalance" 
                        className="border-[#B8860B] data-[state=checked]:bg-primary data-[state=checked]:border-primary h-5 w-5"
                        checked={formUseWalletBalance}
                        onCheckedChange={(checked) => {
                          setValue("useWalletBalance", Boolean(checked));
                          setUseWalletBalance(Boolean(checked));
                          if (!checked) {
                            setValue("walletAmountToUse", 0);
                          }
                        }}
                      />
                    </div>

                    {formUseWalletBalance && (
                      <div className="space-y-2 mt-4 bg-[#132743] p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <Label 
                            htmlFor="walletAmountToUse"
                            className="text-gray-300 font-medium"
                          >
                            {translate("wallet.amountToUse")?.toString() || "Montant à utiliser"}:
                          </Label>
                          <span className="text-primary font-bold">{formatCurrency(walletAmountToUse || 0)}</span>
                        </div>

                        <Slider
                          id="walletAmountToUse"
                          max={maxWalletAmount}
                          step={1}
                          defaultValue={[0]}
                          value={[walletAmountToUse]}
                          onValueChange={(value) => setValue("walletAmountToUse", value[0])}
                          className="py-2"
                        />

                        <div className="flex justify-between text-xs text-gray-400">
                          <span>0</span>
                          <span>{formatCurrency(maxWalletAmount)}</span>
                        </div>

                        {walletAmountToUse > 0 && (
                          <div className="mt-2 text-sm text-gray-300">
                            <p>
                              {translate("wallet.remainingBalance")?.toString() || "Solde restant"}: 
                              <span className="ml-1 text-white font-medium">
                                {formatCurrency(Math.max(0, (walletBalance || 0) - walletAmountToUse))}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Code Promo */}
                <div className="py-4 mt-4 border-t border-[#0a0f1a] bg-[#0a142a] p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="bg-[#132743] p-2 rounded-full mr-3">
                      <FaTag className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{translate("checkout.promoCode")?.toString() || "Code promo"}</h4>
                      <p className="text-gray-400 text-sm">
                        {translate("checkout.promoCodeDescription")?.toString() || "Entrez un code promo pour bénéficier d'une réduction"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-2">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          id="promoCode"
                          className="bg-[#132743] border-[#132743] focus:border-primary text-white pl-3 pr-10 py-2 h-10"
                          placeholder={translate("checkout.enterPromoCode")?.toString() || "Entrer un code promo"}
                          {...register("promoCode")}
                        />
                        {isPromoApplied && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                            <FaCheck />
                          </div>
                        )}
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="bg-[#132743] border-primary hover:bg-primary hover:text-black text-white min-w-[100px]"
                        disabled={!watch("promoCode") || isPromoLoading}
                        onClick={async () => {
                          const code = watch("promoCode");
                          if (!code) return;

                          try {
                            const promo = await validatePromoCode(code);
                            if (promo) {
                              // Afficher un message de succès avec le montant de la remise
                              const discountAmount = promo.discountType === 'percentage' 
                                ? `${promo.discountValue}%`
                                : formatCurrency(promo.discountValue);
                              toast({
                                title: translate("checkout.promoApplied")?.toString() || "Code promo appliqué",
                                description: promo.discountType === 'percentage'
                                  ? `Réduction de ${promo.discountValue}% (${formatCurrency(calculateOrderAmounts().promoDiscount)}) appliquée à votre commande`
                                  : `Réduction de ${formatCurrency(calculateOrderAmounts().promoDiscount)} appliquée à votre commande`,
                              });
                            }
                          } catch (error) {
                            console.error("Erreur lors de la validation du code promo:", error);
                            toast({
                              title: translate("checkout.promoError")?.toString() || "Erreur",
                              description: translate("checkout.promoErrorDesc")?.toString() || "Une erreur est survenue lors de la validation du code promo.",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        {isPromoLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          translate("checkout.apply")?.toString() || "Appliquer"
                        )}
                      </Button>
                    </div>

                    {isPromoApplied && promoCodeData && (
                      <div className="bg-[#132743] p-2 rounded border border-green-900/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FaCheck className="text-green-500 mr-2" />
                            <span className="text-green-400">{String(promoCodeData.code)}</span>
                          </div>
                          <span className="text-green-400 font-medium">
                            {promoCodeData.discountType === 'percentage' 
                              ? `-${Number(promoCodeData.discountValue)}% (${formatCurrency(calculateOrderAmounts().promoDiscount)})` 
                              : `-${formatCurrency(calculateOrderAmounts().promoDiscount)}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total final à payer */}
                <div className="flex justify-between py-2 border-t border-[#B8860B]">
                  <p className="text-white font-bold">{translate("checkout.total")}:</p>
                  <p className="font-cairo font-bold text-xl text-primary">
                    {formatCurrency(calculateOrderAmounts().finalAmount)}
                  </p>
                </div>

                {/* Afficher un résumé des économies */}
                {(isPromoApplied || (formUseWalletBalance && walletAmountToUse > 0)) && (
                  <div className="mt-4 pt-4 border-t border-gray-700 bg-[#0a142a] p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-primary mb-3 flex items-center">
                      <FaTag className="mr-2" />
                      {translate("checkout.yourSavings")?.toString() || "Vos économies"}
                    </h4>
                    <div className="space-y-3 text-sm">
                      {isPromoApplied && promoCodeData && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 flex items-center">
                            <div className="bg-[#132743] p-2 rounded-full mr-2">
                              <FaTag className="text-primary" />
                            </div>
                            <div>
                              <span className="block">{translate("checkout.discount")?.toString() || "Réduction"}</span>
                              <span className="text-xs text-gray-400">
                                {String(promoCodeData.code)}{' '}
                                {promoCodeData.discountType === 'percentage' 
                                  ? `(${Number(promoCodeData.discountValue)}%)` 
                                  : `(${formatCurrency(Number(promoCodeData.discountValue))})`}
                              </span>
                            </div>
                          </span>
                          <span className="font-medium text-green-400">
                            -{formatCurrency(calculateOrderAmounts().promoDiscount)}
                          </span>
                        </div>
                      )}

                      {formUseWalletBalance && walletAmountToUse > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 flex items-center">
                            <div className="bg-[#132743] p-2 rounded-full mr-2">
                              <FaWallet className="text-primary" />
                            </div>
                            <div>
                              <span className="block">{translate("checkout.walletCredit")?.toString() || "Crédit portefeuille"}</span>
                              <span className="text-xs text-gray-400">{formatCurrency(walletBalance || 0)} {translate("checkout.available")?.toString() || "disponible"}</span>
                            </div>
                          </span>
                          <span className="font-medium text-green-400">
                            -{formatCurrency(Number(walletAmountToUse) || 0)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between pt-3 mt-1 border-t border-gray-700">
                        <span className="font-medium text-white">{translate("checkout.totalSavings")?.toString() || "Économies totales"}</span>
                        <span className="font-medium text-green-400 text-lg">
                          -{formatCurrency(calculateOrderAmounts().totalSavings)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                form="checkout-form"
                className="w-full bg-primary hover:bg-primary/90 text-background font-medium transition-all hover:shadow-[0_0_15px_rgba(255,215,0,0.6)] text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {translate("checkout.processing")}
                  </span>
                ) : (
                  <>
                    <FaCreditCard className="mr-2" />
                    {translate("checkout.placeOrder")}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;