import React, { useState, useRef, useEffect } from "react";
import Together from "together-ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "../hooks/useTranslation";
import { apiRequest } from "@/lib/queryClient";

// Types
interface Message {
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
}

// Types pour l'API Together
interface APIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  productType: string;
  platformId?: number;
  platformName?: string;
  isNewRelease?: boolean;
  isOnSale?: boolean;
  isFeatured?: boolean;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { translate } = useTranslation();
  
  // Fetch products from multiple API endpoints
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Récupérer les produits via l'API standard
        const productsResponse = await fetch('/api/products');
        if (!productsResponse.ok) {
          throw new Error(`Erreur API: ${productsResponse.status}`);
        }
        
        const allProducts = await productsResponse.json();
        
        if (!Array.isArray(allProducts)) {
          throw new Error("Format de réponse invalide");
        }
        
        setProducts(allProducts);
        console.log("🛍️ Produits chargés pour le chatbot:", allProducts.length);
        
        if (allProducts.length > 0) {
          console.log("📊 Types de produits:", allProducts.map(p => p.productType).filter((v, i, a) => a.indexOf(v) === i));
          console.log("🎮 Exemples:", allProducts.slice(0, 3).map(p => `${p.name} (${p.price}MAD)`));
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des produits:", error);
        setProducts([]);
      }
    };
    
    fetchProducts();
  }, []);

  // Initial welcome message based on actual products
  useEffect(() => {
    if (messages.length === 0) {
      // Message par défaut en cas de problème d'API
      let welcomeMessage = "Marhaba! 🎮 Bienvenue sur Sou9Digital! Comment puis-je vous aider à trouver votre prochain jeu aujourd'hui?";
      
      // Si des produits sont chargés, créer un message personnalisé
      if (products.length > 0) {
        const gameOnSale = products.find(p => p.productType === 'game' && p.isOnSale);
        const newGame = products.find(p => p.productType === 'game' && p.isNewRelease);
        
        if (gameOnSale || newGame) {
          welcomeMessage = "Marhaba! 🎮 Découvrez";
          
          if (gameOnSale) {
            // Calcul d'une réduction fictive de 20% pour les produits en solde
            const estimatedDiscount = Math.round(gameOnSale.price * 0.2);
            const estimatedDiscountedPrice = gameOnSale.price - estimatedDiscount;
              
            welcomeMessage += ` "${gameOnSale.name}" en solde à ${estimatedDiscountedPrice} MAD (économisez ${estimatedDiscount} MAD)`;
          }
          
          if (gameOnSale && newGame) {
            welcomeMessage += " ou";
          }
          
          if (newGame) {
            welcomeMessage += ` "${newGame.name}", notre nouveauté à ${newGame.price} MAD`;
          }
          
          welcomeMessage += "! Comment puis-je vous aider aujourd'hui?";
        }
      }
      
      setMessages([
        {
          content: translate("chatbot.welcome") || welcomeMessage,
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages.length, translate, products]); // Dépendance à products pour mettre à jour le message quand les produits sont chargés

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Create conversation history for the API with proper typing
      const messageHistory: APIMessage[] = messages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

      // Add current user message
      messageHistory.push({
        role: "user",
        content: inputMessage,
      });

      // Préparer les informations sur les produits pour le chatbot
      const getProductsInfo = () => {
        // Intégrer directement les informations sur les jeux populaires et les promotions
        // même si l'API ne répond pas correctement
        
        // Données statiques de secours si l'API échoue
        const backupGames = `
- Jeu disponible sur notre site (à partir de 100 MAD)`;

        const backupGiftCards = `
- Cartes cadeaux disponibles sur notre site`;

        // Si nous avons réussi à charger des produits depuis l'API, les utiliser à la place
        if (products.length > 0) {
          const gamesList = products
            .filter(p => p.productType === 'game')
            .slice(0, 5)
            .map(p => `${p.name} (${p.price.toFixed(2)}MAD)${p.isNewRelease ? ' - Nouveauté!' : ''}${p.isOnSale ? ' - En solde!' : ''}`)
            .join('; ');
          
          const apiGiftCards = products
            .filter(p => p.productType === 'giftCard')
            .slice(0, 3)
            .map(p => `${p.name} pour ${p.platformName || 'diverses plateformes'}`)
            .join('; ');
            
          return `
PRODUITS POPULAIRES:
- Jeux: ${gamesList || backupGames}
- Cartes Cadeaux: ${apiGiftCards || backupGiftCards}

PROMOTIONS ACTUELLES:
- CODE WELCOME: -10% sur votre première commande
- CODE SUMMER24: -15% sur certains jeux d'été
- SOLDES DE PRINTEMPS: Jusqu'à -40% sur une sélection de jeux
- PROMO WALLET: +5% de bonus sur chaque rechargement Sou9Wallet

INFO CONTACT:
- Site web: www.sou9digital.ma
- Email: contact@sou9digital.ma
- WhatsApp: +212 622 123 456
- Téléphone: +212 555-123456
- Heures: 9h-18h (Lun-Ven)
- Chat en direct: Disponible sur notre site
- Instagram/Facebook: @Sou9Digital

LIENS UTILES:
- Support: support@sou9digital.ma
- Service après-vente: sav@sou9digital.ma
- Partenariats: partners@sou9digital.ma
- Réclamations: reclamation@sou9digital.ma

SOU9WALLET:
- Portefeuille électronique intégré
- +5% bonus sur chaque rechargement
- Transactions instantanées sans frais
- Code promo WALLET10: +10% bonus (500+ MAD)

MODES DE PAIEMENT: 
- Visa, Mastercard, PayPal
- Sou9Wallet (recommandé, bonus exclusifs)
- Virement bancaire (commandes importantes)
- Cash On Delivery (Casablanca, Rabat, Marrakech)

LIVRAISON:
- Codes de jeux: Instantanée par email
- Cartes cadeaux: Immédiate par email/SMS
- Support après-vente disponible 24/7`;
        }
        
        // Version par défaut avec données intégrées si l'API n'a pas fourni de produits
        return `
PRODUITS POPULAIRES:
${backupGames}
${backupGiftCards}

PROMOTIONS ACTUELLES:
- CODE WELCOME: -10% sur votre première commande
- CODE SUMMER24: -15% sur certains jeux d'été
- SOLDES DE PRINTEMPS: Jusqu'à -40% sur une sélection de jeux
- PROMO WALLET: +5% de bonus sur chaque rechargement Sou9Wallet

INFO CONTACT:
- Site web: www.sou9digital.ma
- Email: contact@sou9digital.ma
- WhatsApp: +212 622 123 456
- Téléphone: +212 555-123456
- Heures: 9h-18h (Lun-Ven)
- Chat en direct: Disponible sur notre site
- Instagram/Facebook: @Sou9Digital

LIENS UTILES:
- Support: support@sou9digital.ma
- Service après-vente: sav@sou9digital.ma
- Partenariats: partners@sou9digital.ma
- Réclamations: reclamation@sou9digital.ma

SOU9WALLET:
- Portefeuille électronique intégré
- +5% bonus sur chaque rechargement
- Transactions instantanées sans frais
- Code promo WALLET10: +10% bonus (500+ MAD)

MODES DE PAIEMENT: 
- Visa, Mastercard, PayPal
- Sou9Wallet (recommandé, bonus exclusifs)
- Virement bancaire (commandes importantes)
- Cash On Delivery (Casablanca, Rabat, Marrakech)

LIVRAISON:
- Codes de jeux: Instantanée par email
- Cartes cadeaux: Immédiate par email/SMS
- Support après-vente disponible 24/7`;
      };

      // Informations sur les produits
      const productsInfo = getProductsInfo();

      // Add system message to provide context
      messageHistory.unshift({
        role: "system",
        content: `You are an AI assistant for Sou9Digital, a Moroccan digital gaming marketplace. Your primary purpose is to convert visitors into customers by recommending products and highlighting promotions.

IMPORTANT ROLE: You are a SALES agent focused on CONVERSIONS. Keep all responses VERY BRIEF and direct - maximum 1-3 sentences.

PRODUCT CATALOG AND INFORMATION:
${productsInfo}

COORDONNÉES ET CONTACT:
- Site web: www.sou9digital.ma
- Email: contact@sou9digital.ma
- WhatsApp: +212 622 123 456
- Instagram: @Sou9Digital
- Facebook: facebook.com/Sou9Digital
- Bureau principal: Casablanca, Maroc
- Heures d'ouverture: 9h-18h (Lun-Ven)

LIENS IMPORTANTS:
- Support client: support@sou9digital.ma ou WhatsApp +212 622 123 456
- Service après-vente: sav@sou9digital.ma
- Demande de partenariat: partners@sou9digital.ma
- Réclamations: reclamation@sou9digital.ma

INFORMATION SOU9WALLET:
- Sou9Wallet est notre portefeuille électronique intégré qui offre des avantages exclusifs
- Permet aux utilisateurs de stocker des fonds pour des achats plus rapides
- Avantage principal: +5% de bonus sur chaque rechargement
- Transactions instantanées sans frais supplémentaires
- Utilisable pour tous les produits sur le site
- Sécurisé et surveillé par notre équipe 24/7
- Code promo spécial WALLET10 pour obtenir +10% sur le premier rechargement de 500+ MAD

MODES DE PAIEMENT:
- Cartes bancaires: Visa, Mastercard (paiement sécurisé, confirmation immédiate)
- PayPal: Transactions rapides et protection acheteur
- Sou9Wallet: Recommandé pour les transactions les plus rapides et les bonus exclusifs
- Virement bancaire: Pour les commandes importantes (délai 24-48h pour validation)
- Cash On Delivery: Disponible uniquement pour les clients à Casablanca, Rabat et Marrakech

LIVRAISON ET DISTRIBUTION:
- Produits numériques (codes de jeux): Livraison instantanée par email après confirmation
- Cartes cadeaux: Envoi immédiat du code par email et SMS
- Délais de livraison: Instantané après confirmation du paiement
- Support après-vente disponible en cas de problème avec un code

SALES TACTICS (IMPORTANT):
- Always recommend specific products with prices ("Assassin's screed shadow à 476.8 MAD")
- Highlight LIMITED TIME offers to create urgency ("Profitez de -20% cette semaine seulement!")
- Invite users to checkout ("Ajoutez-le à votre panier maintenant!")
- Emphasize delivery speed ("Livraison instantanée de votre code par email")
- Use FOMO (Fear of Missing Out): "Ne manquez pas cette offre limitée!"
- Offer personal assistance for purchase: "Je peux vous aider à finaliser votre achat"
- Promote ease of purchase: "En quelques clics seulement, possédez ce jeu!"
- If user asks for contact info, provide it and suggest they might want to explore available games before contacting
- Promote Sou9Wallet for its exclusive bonus and faster checkout experience

STYLE GUIDELINES:
- Use friendly but persuasive tone with occasional Moroccan Arabic phrases
- Match user's language (French, English, Arabic)
- Be extremely concise - focus on CONVERSION
- Use exclamation marks for emphasis and excitement
- Create a sense of opportunity and urgency

IMPORTANT: Your ONLY goal is to transform visitors into buyers. For ANY question, recommend products and push toward purchase, but provide precise information if asked about payment methods, delivery, or Sou9Wallet.`,
      });

      // Utilisation directe de la clé API Together dans le code
      const API_KEY = "61f3aee12215d2555803ef1f1eb20c67fd694e547be9c22f2ae203a6910645c9";
      let botResponse;

      if (API_KEY) {
        try {
          // Initialiser Together avec la clé API directement passée dans l'objet d'options
          const together = new Together({
            apiKey: API_KEY
          });
          
          // Structure de messages avec limite de longueur de réponse
          const response = await together.chat.completions.create({
            messages: messageHistory,
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            max_tokens: 150 // Limiter la longueur des réponses
          });

          // @ts-ignore - Ignorer l'erreur de type avec response.choices
          botResponse =
            response?.choices?.[0]?.message?.content ||
            translate("chatbot.error") ||
            "Désolé, je n'ai pas pu générer de réponse. Veuillez réessayer plus tard.";
        } catch (error) {
          console.error("Erreur avec l'API Together:", error);
          throw error; // Relancer l'erreur pour être traitée par le bloc catch global
        }
      } else {
        // Fallback when API key is missing
        botResponse =
          translate("chatbot.apiKeyMissing") ||
          "Je suis désolé, je ne peux pas répondre pour le moment. Veuillez contacter notre support pour plus d'informations.";
      }

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          content: botResponse,
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Erreur lors de la communication avec l'API:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          content:
            translate("chatbot.error") ||
            "Désolé, j'ai rencontré un problème. Veuillez réessayer plus tard.",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format message timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Chat trigger button - Positionné au même endroit que l'ancien bouton du panier */}
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed z-50 bottom-4 right-4 rounded-full p-3 md:p-4 shadow-lg transition-all duration-300 transform hover:scale-110 ${
          isOpen
            ? "bg-red-600 hover:bg-red-700"
            : "bg-primary hover:bg-primary/90"
        }`}
        size="icon"
        aria-label={translate("chatbot.toggle") || "Ouvrir/Fermer le chat"}
      >
        {isOpen ? (
          <X size={20} className="text-white" />
        ) : (
          <MessageCircle size={20} className="text-white" />
        )}
      </Button>

      {/* Chat window - Design plus moderne et effet d'animation */}
      {isOpen && (
        <Card 
          className="fixed z-40 bottom-16 right-0 md:right-4 w-full md:w-[95%] md:max-w-[380px] shadow-lg border-y border-primary/20 md:border bg-background overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
        >
          <CardHeader className="bg-[#0a1526] border-b border-primary/10 p-3">
            <div className="flex items-center">
              <Avatar className="h-9 w-9 mr-3">
                <AvatarImage src="/images/sou9-logo.png" alt="Sou9Digital" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  SD
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base text-white">
                  Sou9Digital Assistant
                </CardTitle>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                  <span className="text-xs text-gray-300">
                    {translate("chatbot.online") || "En ligne"}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="h-[250px] md:h-[380px] overflow-y-auto p-3 md:p-4 bg-[#0a1526]/95 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-3 transition-all animate-in ${
                    message.role === "user"
                      ? "ml-auto max-w-[85%] slide-in-from-right-5"
                      : "mr-auto max-w-[85%] slide-in-from-left-5"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-white rounded-tr-none shadow-sm"
                        : "bg-[#132743] text-white rounded-tl-none shadow-sm"
                    }`}
                  >
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-1 text-gray-400 ${
                      message.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="mb-3 mr-auto max-w-[85%] animate-in fade-in slide-in-from-left-5">
                  <div className="p-3 rounded-lg bg-[#132743] text-white rounded-tl-none flex items-center">
                    <div className="flex space-x-1 mr-2">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                    <span className="text-sm">{translate("chatbot.typing") || "En train d'écrire..."}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <CardFooter className="p-3 border-t border-primary/10 bg-[#0a1526]">
            <form onSubmit={handleSubmit} className="flex space-x-2 w-full">
              <Textarea
                placeholder={
                  translate("chatbot.placeholder") ||
                  "Demandez-moi des recommandations de jeux ou des codes promo..."
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 resize-none h-8 md:h-10 p-2 text-sm md:text-base text-white bg-[#132743] border-[#1e3a5f]/40 focus:border-primary focus:ring-primary rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-primary hover:bg-primary/90 text-white rounded-lg transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
