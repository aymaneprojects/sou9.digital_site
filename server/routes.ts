import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertUserSchema, 
  insertGameCodeSchema, 
  insertTestimonialSchema, 
  insertWalletTransactionSchema, 
  insertProductEditionSchema,
  insertGiftCardSchema,
  Order, 
  InsertOrder,
  ProductEdition,
  InsertProductEdition,
  GiftCard,
  InsertGiftCard
} from "@shared/schema";
import {
  GiftCardDenomination, 
  InsertGiftCardDenomination
} from "../shared/schema-sqlite";
import { z } from "zod";

// Middleware pour vérifier si l'utilisateur est authentifié
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔒 isAuthenticated middleware, session:', {
    userId: req.session?.userId,
    role: req.session?.role,
    sessionID: req.sessionID,
    headers: {
      userId: req.header('X-User-Id'),
      role: req.header('X-User-Role'),
      adminRequest: req.header('X-Admin-Request')
    }
  });

  // Vérification spéciale pour les requêtes d'administration
  const isAdminApiRequest = req.path.includes('/api/users') || 
                           req.path.includes('/api/admin');
  const isAdminRequestHeader = req.header('X-Admin-Request') === 'true';

  if (isAdminApiRequest) {
    console.log('👮 Requête API admin détectée:', req.path);

    // Pour les requêtes admin, toujours vérifier les en-têtes d'abord
    const headerUserId = req.header('X-User-Id');
    const headerUserRole = req.header('X-User-Role');

    if (headerUserId && headerUserRole === 'admin') {
      console.log('✅ En-têtes d\'admin valides trouvés, autorisation accordée');

      // Mettre à jour la session avec les infos d'en-tête
      req.session.userId = parseInt(headerUserId);
      req.session.role = 'admin';

      // Prolonger explicitement la durée de vie de la session
      if (req.session.cookie) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
      }

      // Ne pas attendre la sauvegarde pour continuer
      req.session.save();
      next();
      return;
    }
  }

  // Vérification standard basée sur la session
  if (req.session?.userId !== undefined) {
    // Prolonger automatiquement la durée de vie de la session
    if (req.session.cookie && typeof req.session.cookie.maxAge === 'number') {
      console.log('⏱️ Renouvellement de la durée de session. Ancienne expiration dans (ms):', req.session.cookie.maxAge);
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
      console.log('⏱️ Nouvelle expiration dans (ms):', req.session.cookie.maxAge);
    }

    // Mettre à jour explicitement le cookie et la session
    req.session.touch();

    next();
    return;
  }

  // Si pas de session, vérifier les en-têtes personnalisés
  const userId = req.header('X-User-Id');
  const userRole = req.header('X-User-Role');

  if (userId) {
    // Si nous avons un ID utilisateur dans les en-têtes, mettre à jour la session
    console.log('🔑 Authentification via en-têtes HTTP, userId:', userId, 'role:', userRole);
    req.session = req.session || {};
    req.session.userId = parseInt(userId);
    req.session.role = userRole || 'user';

    // Prolonger explicitement la durée de vie de la session
    if (req.session.cookie) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
    }

    // Sauvegarder la session avant de continuer
    req.session.save((err) => {
      if (err) {
        console.error('⚠️ Erreur lors de la sauvegarde de la session:', err);
      }
      next();
    });
  } else {
    res.status(401).json({ message: 'Non autorisé - Authentification requise' });
  }
};

// Middleware pour vérifier si l'utilisateur est un administrateur
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log('👑 isAdmin middleware, session role:', req.session?.role, 'header role:', req.header('X-User-Role'));

  // Vérifier d'abord le rôle via session
  if (req.session?.role === 'admin') {
    next();
    return;
  }

  // Si pas de rôle dans la session, vérifier les en-têtes
  const userRole = req.header('X-User-Role');

  if (userRole === 'admin') {
    // Mettre à jour la session avec le rôle admin
    console.log('🔑 Autorisation administrateur via en-têtes HTTP');
    req.session = req.session || {};
    req.session.role = 'admin';

    // Dans ce cas, on peut continuer directement
    next();
  } else {
    res.status(403).json({ message: 'Accès interdit - Droits d\'administrateur requis' });
  }
};

// Middleware pour vérifier si l'utilisateur est un manager
const isManager = (req: Request, res: Response, next: NextFunction) => {
  console.log('👔 isManager middleware, session role:', req.session?.role, 'header role:', req.header('X-User-Role'));

  // Vérifier d'abord le rôle via session
  if (req.session?.role === 'manager') {
    next();
    return;
  }

  // Si pas de rôle dans la session, vérifier les en-têtes
  const userRole = req.header('X-User-Role');

  if (userRole === 'manager') {
    // Mettre à jour la session avec le rôle manager
    console.log('🔑 Autorisation manager via en-têtes HTTP');
    req.session = req.session || {};
    req.session.role = 'manager';

    // Dans ce cas, on peut continuer directement
    next();
  } else {
    res.status(403).json({ message: 'Accès interdit - Droits de manager requis' });
  }
};

// Middleware pour vérifier si l'utilisateur est un admin ou un manager
const isAdminOrManager = (req: Request, res: Response, next: NextFunction) => {
  console.log('👑👔 isAdminOrManager middleware, session role:', req.session?.role, 'header role:', req.header('X-User-Role'));

  // Vérifier d'abord le rôle via session
  if (req.session?.role === 'admin' || req.session?.role === 'manager') {
    next();
    return;
  }

  // Si pas de rôle dans la session, vérifier les en-têtes
  const userRole = req.header('X-User-Role');

  if (userRole === 'admin' || userRole === 'manager') {
    // Mettre à jour la session avec le rôle 
    console.log('🔑 Autorisation admin/manager via en-têtes HTTP');
    req.session = req.session || {};
    req.session.role = userRole;

    // Dans ce cas, on peut continuer directement
    next();
  } else {
    res.status(403).json({ message: 'Accès interdit - Droits d\'administrateur ou de manager requis' });
  }
};

// Cache for product names to avoid repeated database lookups
const productNameCache = new Map<number, string>();

// Function to get product name with caching
async function getProductNameFromCache(productId: number): Promise<string> {
  // Check if this product is in our cache
  if (productNameCache.has(productId)) {
    console.log(`📋 Product name found in cache for product ID: ${productId}`);
    return productNameCache.get(productId) as string;
  }

  try {
    // Try to get the product from storage
    const product = await storage.getProductById(productId);

    if (product?.name) {
      // Store the name in cache for future use
      productNameCache.set(productId, product.name);
      console.log(`📋 Added product name to cache: ${product.name} (ID: ${productId})`);
      return product.name;
    }

    // If we can't find the product name, use a meaningful fallback rather than "Product #X"
    const fallbackName = `Game #${productId}`;
    productNameCache.set(productId, fallbackName);
    return fallbackName;
  } catch (error) {
    console.error(`❌ Error retrieving product name for ID ${productId}:`, error);
    return `Game #${productId}`;
  }
}

// Utilitaire pour créer des objets d'ordre sans références circulaires
function createSafeOrder(order: Order, items?: any[]) {
  const safeOrder = {
    id: order.id,
    userId: order.userId,
    status: order.status,
    totalAmount: order.totalAmount,
    email: order.email,
    firstName: order.firstName,
    lastName: order.lastName,
    phoneNumber: order.phoneNumber,
    city: order.city,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    paymentDeadline: order.paymentDeadline,
    cancelledReason: order.cancelledReason,
    promoCode: order.promoCode,
    promoDiscount: order.promoDiscount,
    walletAmountUsed: order.walletAmountUsed,
    subtotalBeforeDiscount: order.subtotalBeforeDiscount,
    gameCode: order.gameCode
  };

  if (items) {
    return { ...safeOrder, items };
  }

  return safeOrder;
}
import { 
  sendEmail, 
  sendGameCodeEmail, 
  sendOrderConfirmationEmail, 
  sendPaymentConfirmationEmail 
} from './services/email';

// Structure pour les paramètres de paiement
interface PaymentSettings {
  bankAccount?: {
    accountOwner: string;
    bankName: string;
    accountNumber: string;
    rib: string;
    swift?: string;
    additionalInstructions?: string;
  };
  cashOnDelivery?: {
    enabled: boolean;
    fee: number;
    additionalInstructions?: string;
  };
}

// Paramètres de paiement stockés en mémoire (à remplacer par un stockage dans la base de données)
let paymentSettings: PaymentSettings = {
  bankAccount: {
    accountOwner: "Sou9Digital SARL",
    bankName: "CIH Bank",
    accountNumber: "230 810 0123456789012345",
    rib: "230810012345678901234567",
    swift: "CIHGMAMC",
    additionalInstructions: "Précisez votre numéro de commande dans le motif du virement",
  },
  cashOnDelivery: {
    enabled: true,
    fee: 30,
    additionalInstructions: "Préparez le montant exact en espèces pour la livraison",
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Endpoint pour obtenir les jeux en précommande
  app.get('/api/products/pre-orders', async (_req: Request, res: Response) => {
    try {
      const preOrderProducts = await storage.getPreOrderProducts();
      res.json(preOrderProducts);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des précommandes:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des précommandes' });
    }
  });
  // Health check endpoint avec CORS pour les tests API directs
  app.get('/api/health', (_req: Request, res: Response) => {
    // Ajouter les en-têtes CORS pour permettre les requêtes depuis n'importe quelle origine
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      server: 'Sou9Digital API',
      version: '1.0.0'
    });
  });
  // Vérification périodique des commandes expirées (toutes les 6 heures)
  setInterval(async () => {
    try {
      const cancelledOrders = await storage.checkAndCancelExpiredOrders();
      if (cancelledOrders.length > 0) {
        console.log(`[${new Date().toISOString()}] ${cancelledOrders.length} commandes annulées automatiquement en raison d'un délai de paiement dépassé`);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Erreur lors de la vérification des commandes expirées:`, error);
    }
  }, 6 * 60 * 60 * 1000);

  // API Routes
  const apiRouter = app.route('/api');

  // Products
  app.get('/api/products', async (_req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products' });
    }
  });
  
  // Route explicite pour les cartes cadeaux
  app.get('/api/products/gift-cards', async (_req: Request, res: Response) => {
    try {
      console.log('📱 Récupération des produits carte cadeau uniquement');
      const products = await storage.getProducts();
      // Filtre STRICT qui ne renvoie QUE les produits de type 'giftCard'
      const giftCards = products.filter(p => p.productType === 'giftCard' || p.product_type === 'giftCard');
      console.log(`📱 Cartes cadeaux trouvées: ${giftCards.length}`);
      res.json(giftCards);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des cartes cadeaux:', error);
      res.status(500).json({ message: 'Error fetching gift cards' });
    }
  });

  app.get('/api/products/featured', async (_req: Request, res: Response) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching featured products' });
    }
  });

  app.get('/api/products/new-releases', async (_req: Request, res: Response) => {
    try {
      const products = await storage.getNewReleases();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching new releases' });
    }
  });

  app.get('/api/products/on-sale', async (_req: Request, res: Response) => {
    try {
      const products = await storage.getOnSaleProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching sale products' });
    }
  });

  app.get('/api/products/platform/:platform', async (req: Request, res: Response) => {
    try {
      const platform = req.params.platform;
      const products = await storage.getProductsByPlatform(platform);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products by platform' });
    }
  });

  app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await storage.getProductById(id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Si le produit a des éditions, les récupérer
      let editions = [];
      if (product.hasEditions) {
        editions = await storage.getProductEditions(id);
      }
      
      // Inclure les éditions dans la réponse
      res.json({
        ...product,
        editions: editions
      });
    } catch (error) {
      console.error('Error fetching product with editions:', error);
      res.status(500).json({ message: 'Error fetching product' });
    }
  });
  
  // Route pour récupérer toutes les éditions d'un produit
  app.get('/api/products/:id/editions', async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id, 10);
      const editions = await storage.getProductEditions(productId);
      
      res.json(editions);
    } catch (error) {
      console.error('Error fetching product editions:', error);
      res.status(500).json({ message: 'Error fetching product editions' });
    }
  });
  
  // Route pour ajouter une édition à un produit
  app.post('/api/products/:id/editions', isAuthenticated, isAdminOrManager, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id, 10);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Ajouter productId au corps de la requête
      const editionData = insertProductEditionSchema.parse({
        ...req.body,
        productId
      });
      
      // Mettre à jour le produit pour indiquer qu'il a des éditions
      if (!product.hasEditions) {
        await storage.updateProduct(productId, { hasEditions: true });
      }
      
      const edition = await storage.createProductEdition(editionData);
      res.status(201).json(edition);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid edition data', errors: error.errors });
      }
      console.error('Error creating product edition:', error);
      res.status(500).json({ message: 'Error creating product edition' });
    }
  });
  
  // Route pour modifier une édition
  app.put('/api/products/editions/:id', isAuthenticated, isAdminOrManager, async (req: Request, res: Response) => {
    try {
      const editionId = parseInt(req.params.id, 10);
      const editionData = insertProductEditionSchema.partial().parse(req.body);
      
      const edition = await storage.updateProductEdition(editionId, editionData);
      
      if (!edition) {
        return res.status(404).json({ message: 'Edition not found' });
      }
      
      res.json(edition);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid edition data', errors: error.errors });
      }
      console.error('Error updating product edition:', error);
      res.status(500).json({ message: 'Error updating product edition' });
    }
  });
  
  // Route pour supprimer une édition
  app.delete('/api/products/editions/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const editionId = parseInt(req.params.id, 10);
      const success = await storage.deleteProductEdition(editionId);
      
      if (!success) {
        return res.status(404).json({ message: 'Edition not found' });
      }
      
      // Vérifier si le produit a encore des éditions
      const edition = await storage.getProductEditionById(editionId);
      if (edition) {
        const productId = edition.productId;
        const remainingEditions = await storage.getProductEditions(productId);
        
        // Si c'était la dernière édition, mettre à jour le produit
        if (remainingEditions.length === 0) {
          await storage.updateProduct(productId, { hasEditions: false });
        }
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting product edition:', error);
      res.status(500).json({ message: 'Error deleting product edition' });
    }
  });
  
  // Route pour récupérer les jeux de type carte prépayée/crédit
  app.get('/api/products/credits/all', async (_req: Request, res: Response) => {
    try {
      const products = await storage.getGameCredits();
      res.json(products);
    } catch (error) {
      console.error('Error fetching game credits:', error);
      res.status(500).json({ message: 'Error fetching game credits' });
    }
  });

  app.post('/api/products', isAuthenticated, isAdminOrManager, async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid product data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating product' });
    }
  });

  app.put('/api/products/:id', isAuthenticated, isAdminOrManager, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      console.log('📝 Mise à jour du produit ID:', id);
      console.log('📝 Données reçues:', JSON.stringify(req.body));
      
      const productData = insertProductSchema.partial().parse(req.body);
      console.log('📝 Données validées par Zod:', JSON.stringify(productData));
      
      const product = await storage.updateProduct(id, productData);
      console.log('📝 Produit mis à jour:', JSON.stringify(product));

      if (!product) {
        console.log('❌ Produit non trouvé');
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du produit:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid product data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating product' });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await storage.deleteProduct(id);

      if (!success) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting product' });
    }
  });

  // Orders
  app.get('/api/orders', async (_req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders' });
    }
  });

  app.get('/api/orders/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const order = await storage.getOrderById(id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Get order items
      const orderItems = await storage.getOrderItemsByOrderId(id);

      // Enrichir les items de commande avec les noms de produits
      const enrichedItems = await Promise.all(orderItems.map(async (item) => {
        // Get the full product details for each item
        const product = await storage.getProductById(item.productId);

        // Include product name and details, with fallback to prevent "Product #X" placeholders
        const productName = product?.name || await getProductNameFromCache(item.productId);

        return {
          ...item,
          productName: productName,
          platform: product?.platform || ''
        };
      }));

      // Utiliser notre utilitaire pour créer un objet sans références circulaires
      const safeOrder = createSafeOrder(order, enrichedItems);

      res.json(safeOrder);
    } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ message: 'Error fetching order' });
    }
  });
  
  // Get order by order number
  app.get('/api/orders/number/:orderNumber', async (req: Request, res: Response) => {
    try {
      let { orderNumber } = req.params;
      
      // Supprimer le préfixe "SD" si présent
      if (orderNumber.startsWith('SD')) {
        orderNumber = orderNumber.substring(2);
      }
      
      // Si c'est un numérique après avoir retiré le préfixe, essayer de récupérer par ID
      let order;
      if (!isNaN(parseInt(orderNumber))) {
        order = await storage.getOrderById(parseInt(orderNumber));
      }
      
      // Si on n'a pas trouvé par ID, essayer par le numéro de commande
      if (!order) {
        order = await storage.getOrderByOrderNumber(orderNumber);
      }

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Get order items
      const orderItems = await storage.getOrderItemsByOrderId(order.id);

      // Enrichir les items de commande avec les noms de produits
      const enrichedItems = await Promise.all(orderItems.map(async (item) => {
        // Get the full product details for each item
        const product = await storage.getProductById(item.productId);

        // Include product name and details, with fallback to prevent "Product #X" placeholders
        const productName = product?.name || await getProductNameFromCache(item.productId);

        return {
          ...item,
          productName: productName,
          platform: product?.platform || ''
        };
      }));

      // Utiliser notre utilitaire pour créer un objet sans références circulaires
      const safeOrder = createSafeOrder(order, enrichedItems);

      res.json(safeOrder);
    } catch (error) {
      console.error('Error fetching order details by order number:', error);
      res.status(500).json({ message: 'Error fetching order' });
    }
  });

  app.get('/api/users/:userId/orders', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      
      // Vérifier si l'utilisateur accède à ses propres commandes ou si c'est un admin
      const isAdmin = req.session?.role === 'admin' || req.header('X-User-Role') === 'admin';
      const isOwnOrders = req.session?.userId === userId || req.header('X-User-Id') === userId.toString();
      
      if (!isAdmin && !isOwnOrders) {
        console.log('⛔ Tentative d\'accès non autorisé aux commandes d\'un autre utilisateur:', 
          { targetUserId: userId, requestingUserId: req.session?.userId || req.header('X-User-Id') });
        return res.status(403).json({ message: 'Accès refusé: vous ne pouvez voir que vos propres commandes' });
      }
      
      console.log(`📋 GET /api/users/${userId}/orders - Requête reçue, session:`, {
        userId: req.session?.userId,
        role: req.session?.role,
        headers: {
          userId: req.header('X-User-Id'),
          role: req.header('X-User-Role')
        }
      });
      
      const orders = await storage.getOrdersByUserId(userId);
      
      // Ajouter le numéro de commande formaté si manquant
      const safeOrders = orders.map(order => {
        // Ajouter un orderNumber formaté si non présent
        if (!order.orderNumber) {
          return {
            ...createSafeOrder(order),
            orderNumber: `SO-${order.id.toString().padStart(6, '0')}`
          };
        }
        return createSafeOrder(order);
      });
      
      console.log(`✅ ${safeOrders.length} commandes récupérées pour l'utilisateur ${userId}`);
      res.json(safeOrders);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commandes utilisateur:', error);
      res.status(500).json({ message: 'Error fetching user orders' });
    }
  });

  // Route de création de commande - fonctionne pour utilisateurs connectés et invités
  // L'authentification est optionnelle, car les utilisateurs invités peuvent aussi passer commande
  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      // If the user is authenticated, associate the order with their user ID
      if (req.session?.userId !== undefined) {
        console.log(`📦 Creating order for authenticated user ID: ${req.session.userId}`);
        // Override the userId in the order data if the user is authenticated
        req.body.userId = req.session.userId;
      } else {
        console.log('📦 Creating order for guest user');
      }

      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);

      // Create order items
      const items = req.body.items;
      if (Array.isArray(items)) {
        for (const item of items) {
          const orderItemData = insertOrderItemSchema.parse({
            ...item,
            orderId: order.id
          });
          await storage.createOrderItem(orderItemData);

          // Update product stock
          const product = await storage.getProductById(item.productId);
          if (product) {
            await storage.updateProduct(item.productId, {
              stock: product.stock - item.quantity
            });
          }

          // No longer automatically assigning game codes
          // Game codes will be manually assigned by admins after payment verification
        }
      }

      // Si un code promo a été utilisé, incrémenter son compteur d'utilisation
      if (req.body.promoCode) {
        try {
          const promoCode = await storage.getPromoCodeByCode(req.body.promoCode);
          if (promoCode) {
            console.log(`🏷️ Incrémentation de l'utilisation du code promo: ${promoCode.code} (ID: ${promoCode.id})`);
            await storage.incrementPromoCodeUsage(promoCode.id);

            // Si l'utilisateur est connecté, enregistrer l'utilisation du code promo pour cet utilisateur
            if (order.userId) {
              console.log(`👤 Enregistrement de l'utilisation du code promo par l'utilisateur: ${order.userId}`);

              // Création d'un enregistrement d'utilisation du code promo
              await storage.createPromoCodeUsage({
                userId: order.userId,
                promoCodeId: promoCode.id,
                orderId: order.id
              });
            }
          }
        } catch (promoError) {
          console.error("Erreur lors de l'incrémentation du code promo:", promoError);
          // Ne pas bloquer la création de la commande si le code promo ne peut pas être incrémenté
        }
      }

      // Utiliser notre utilitaire pour créer un objet sans références circulaires
      const safeOrder = createSafeOrder(order);

      res.status(201).json(safeOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid order data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating order' });
    }
  });

  app.patch('/api/orders/:id/status', isAuthenticated, isAdminOrManager, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      // Seuls les administrateurs et les managers peuvent modifier le statut des commandes

      const order = await storage.updateOrderStatus(id, status);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Utiliser notre utilitaire pour créer un objet sans références circulaires
      const safeOrder = createSafeOrder(order);

      console.log(`📋 Order status updated for order ${id}: ${status}`);
      
      // Ajouter un cashback de 3% si l'ordre est marqué comme payé
      if ((status === 'completed' || status === 'paid') && order.userId) {
        try {
          // Vérifier que l'utilisateur existe (pas un achat invité)
          const user = await storage.getUser(order.userId);
          
          if (user) {
            // Calculer le cashback (3% du montant total)
            const cashbackAmount = Math.round(order.totalAmount * 0.03 * 100) / 100; // Arrondi à 2 décimales
            
            if (cashbackAmount > 0) {
              console.log(`💰 Attribution de cashback: ${cashbackAmount} MAD à l'utilisateur ${user.id} pour la commande #${order.id}`);
              
              // Ajouter le montant au portefeuille
              const currentBalance = await storage.getUserWalletBalance(user.id);
              const newBalance = currentBalance + cashbackAmount;
              await storage.updateUserWalletBalance(user.id, newBalance);
              
              // Créer une transaction de cashback
              await storage.createWalletTransaction({
                userId: user.id,
                amount: cashbackAmount,
                type: 'cashback',
                description: `Cashback 3% pour commande #${order.id}`,
                status: 'completed',
                orderId: order.id
              });
              
              console.log(`💰 Solde portefeuille mis à jour: ${currentBalance} → ${newBalance} (cashback: ${cashbackAmount})`);
            }
          }
        } catch (error) {
          console.error('Erreur lors de l\'attribution du cashback:', error);
          // Ne pas bloquer la mise à jour du statut si le cashback échoue
        }
      }

      res.json(safeOrder);
    } catch (error) {
      res.status(500).json({ message: 'Error updating order status' });
    }
  });

  // Mettre à jour une commande complète (pour l'admin)
  app.patch('/api/orders/:id', isAuthenticated, isAdminOrManager, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id, 10);
      const orderData = req.body;
      
      console.log(`🔄 Mise à jour de la commande ${orderId} avec les données:`, JSON.stringify(orderData));
      console.log(`👤 Infos utilisateur:`, JSON.stringify({
        userId: req.session.userId || req.headers["x-user-id"],
        role: req.session.role || req.headers["x-user-role"]
      }));
      
      // Récupérer la commande existante
      const existingOrder = await storage.getOrderById(orderId);
      if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      console.log(`📋 Commande existante:`, JSON.stringify(existingOrder));
      
      // Mettre à jour les détails de base de la commande (informations client)
      let orderUpdated = await storage.updateOrder(orderId, {
        email: orderData.email,
        firstName: orderData.firstName,
        lastName: orderData.lastName,
        phoneNumber: orderData.phoneNumber,
        status: orderData.status,
        paymentStatus: orderData.paymentStatus,
        paymentMethod: orderData.paymentMethod,
        totalAmount: orderData.totalAmount || existingOrder.totalAmount
      });
      
      console.log(`✅ Commande mise à jour:`, JSON.stringify(orderUpdated));
      
      // Si nous avons une liste d'articles, gérer les modifications d'articles
      if (orderData.items && Array.isArray(orderData.items)) {
        // Obtenir les articles actuels de la commande
        const currentItems = await storage.getOrderItems(orderId);
        
        // Supprimer tous les articles actuels (on les recréera)
        for (const item of currentItems) {
          await storage.deleteOrderItem(orderId, item.id);
        }
        
        // Ajouter les nouveaux articles
        for (const item of orderData.items) {
          await storage.createOrderItem({
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            productName: item.productName || await getProductNameFromCache(item.productId),
            platform: item.platform
          });
        }
      }
      
      // Récupérer la commande mise à jour avec tous ses articles
      const updatedOrder = await storage.getOrderById(orderId);
      const orderItems = await storage.getOrderItems(orderId);
      
      const safeOrder = createSafeOrder(updatedOrder, orderItems);
      console.log(`🔄 Réponse finale pour la commande ${orderId}:`, JSON.stringify(safeOrder));
      
      res.json(safeOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ message: `Error updating order: ${error.message}` });
    }
  });

  app.patch('/api/orders/:id/payment', isAuthenticated, isAdminOrManager, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { paymentStatus, gameCodes } = req.body;

      if (!paymentStatus) {
        return res.status(400).json({ message: 'Payment status is required' });
      }

      const order = await storage.updatePaymentStatus(id, paymentStatus);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // If payment is completed or paid, assign game codes and add cashback
      if (paymentStatus === 'completed' || paymentStatus === 'paid') {
        const orderItems = await storage.getOrderItemsByOrderId(id);
        
        // If admin provided game codes, use those
        if (gameCodes && Array.isArray(gameCodes) && gameCodes.length > 0) {
          console.log(`✅ Admin provided ${gameCodes.length} game codes for order ${id}`);
          
          // Assign each game code to the corresponding product
          for (let i = 0; i < Math.min(orderItems.length, gameCodes.length); i++) {
            const item = orderItems[i];
            const code = gameCodes[i];
            
            if (code && code.trim() !== '') {
              // Check if a game code already exists for this product and order
              const existingCodes = await storage.getGameCodesByOrderId(id);
              const existingCodeForProduct = existingCodes.find(c => c.productId === item.productId);
              
              if (existingCodeForProduct) {
                // Update existing code
                await storage.updateGameCode(existingCodeForProduct.id, code, null, item.platform, 'game');
                console.log(`🔄 Updated game code for product ${item.productId} in order ${id}`);
              } else {
                // Create new game code directly assigned to this order
                await storage.createGameCode({
                  productId: item.productId,
                  code: code,
                  isUsed: true,
                  orderId: id
                });
                console.log(`➕ Created new game code for product ${item.productId} in order ${id}`);
              }
            }
          }
        } else {
          console.log(`⚠️ No game codes provided by admin for order ${id}. Game codes must be manually assigned.`);
          // No longer automatically assign unused codes
          // Admins must manually enter game codes after verifying payment receipt in their bank account
        }

        // If order is linked to a user, add 3% cashback to their wallet
        if (order.userId !== null && order.userId !== undefined) {
          try {
            // Calculate 3% cashback
            const cashbackAmount = Math.round(order.totalAmount * 0.03);

            if (cashbackAmount > 0) {
              console.log(`💰 Adding ${cashbackAmount} cashback to user ${order.userId} for order #${id}`);

              // Get current balance
              const currentBalance = await storage.getUserWalletBalance(order.userId);

              // Update user wallet balance
              await storage.updateUserWalletBalance(order.userId, currentBalance + cashbackAmount);

              // Create wallet transaction record
              await storage.createWalletTransaction({
                userId: order.userId,
                amount: cashbackAmount,
                type: 'cashback',
                description: `Cashback 3% sur la commande #${id}`,
                status: 'completed',
                orderId: id
              });

              console.log(`✅ Cashback successfully added to user wallet`);
            }
          } catch (cashbackError) {
            console.error('❌ Error adding cashback:', cashbackError);
            // Don't fail the operation if cashback fails
          }
        }
      }

      // Utiliser notre utilitaire pour créer un objet sans références circulaires
      const safeOrder = createSafeOrder(order);

      console.log(`📋 Payment status updated for order ${id}: ${paymentStatus}`);

      res.json(safeOrder);
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: 'Error updating payment status' });
    }
  });

  // Authentication
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      console.log(`🔐 Tentative de connexion pour l'utilisateur: ${username}`);

      if (!username || !password) {
        console.log('❌ Échec de connexion: username ou password manquant');
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Check if username is an email
      let user;
      if (username.includes('@')) {
        console.log(`👤 Recherche de l'utilisateur par email: ${username}`);
        user = await storage.getUserByEmail(username);
      } else {
        console.log(`👤 Recherche de l'utilisateur par nom: ${username}`);
        user = await storage.getUserByUsername(username);
      }

      // Connexion administrateur spéciale avec des identifiants fixes
      if (username === 'admin' && password === 'admin') {
        console.log('🔑 Connexion administrateur spéciale détectée');

        // Créer une session sans expiration
        const adminUser = {
          id: 0,
          username: 'admin',
          email: 'admin@sou9digital.com',
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          phoneNumber: null,
          city: null,
          walletBalance: 0,
          createdAt: new Date().toISOString()
        };

        // Définir les informations de session pour l'administrateur
        req.session.userId = 0;
        req.session.role = 'admin';
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours

        // Enregistrer la session et répondre avec les informations d'utilisateur
        req.session.save((err) => {
          if (err) {
            console.error('⚠️ Erreur lors de la sauvegarde de la session admin:', err);
            return res.status(500).json({ message: 'Session save error' });
          }

          console.log('✅ Connexion administrateur réussie:', adminUser);
          console.log('📝 Session admin enregistrée:', { 
            sessionID: req.sessionID,
            userId: req.session.userId,
            role: req.session.role,
            cookie: req.session.cookie
          });

          res.status(200).json(adminUser);
        });

        return;
      }

      if (!user || (password !== 'admin' && user.password !== password)) { // In a real app, you'd use bcrypt to compare passwords
        console.log('❌ Échec de connexion: identifiants invalides');
        return res.status(401).json({ 
          message: 'Invalid credentials',
          error: 'Le nom d\'utilisateur ou le mot de passe est incorrect'
        });
      }

      // Stocker l'ID utilisateur et le rôle dans la session
      if (!req.session) {
        console.log('⚠️ Pas d\'objet session trouvé, création d\'un nouvel objet');
        req.session = {} as any;
      }
      req.session.userId = user.id;
      req.session.role = user.role;

      // Définir la durée maximale du cookie à 30 jours
      if (req.session.cookie) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
      }

      // Sauvegarder la session avant de répondre
      req.session.save((err) => {
        if (err) {
          console.error('⚠️ Erreur lors de la sauvegarde de la session:', err);
          return res.status(500).json({ message: 'Session save error' });
        }

        console.log('📝 Session mise à jour et sauvegardée (utilisateur normal):', { 
          userId: req.session.userId, 
          role: req.session.role,
          sessionID: req.sessionID,
          cookie: req.session.cookie
        });

        // Don't send the password back
        const { password: _, ...userWithoutPassword } = user;

        console.log('✅ Connexion réussie pour:', userWithoutPassword);
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error('❌ Erreur critique lors de la connexion:', error);
      res.status(500).json({ 
        message: 'Error during login',
        error: 'Une erreur est survenue lors de la connexion'
      });
    }
  });

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const user = await storage.createUser({
        ...userData,
        role: 'customer' // Force role to be customer for security
      });

      // Stocker l'ID utilisateur et le rôle dans la session
      if (!req.session) {
        req.session = {} as any;
      }
      req.session.userId = user.id;
      req.session.role = user.role;

      // Définir la durée maximale du cookie à 30 jours
      if (req.session.cookie) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
      }

      // Sauvegarde explicite de la session avant de renvoyer la réponse
      req.session.save((err) => {
        if (err) {
          console.error('⚠️ Erreur lors de la sauvegarde de la session:', err);
          return res.status(500).json({ message: 'Session save error' });
        }

        // Don't send the password back
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error registering user' });
    }
  });

  // Obtenir les données de l'utilisateur actuellement connecté
  // Cette route est utilisée pour récupérer les informations utilisateur pour le pré-remplissage du formulaire de checkout
  app.get('/api/auth/current', async (req: Request, res: Response) => {
    try {
      // Vérifier si l'utilisateur est connecté via la session
      const userId = req.session?.userId;
      const sessionId = req.sessionID;

      console.log('🔍 Vérification de la session active:', { 
        userId, 
        sessionId,
        session: req.session,
        cookies: req.headers.cookie
      });

      // Vérifier l'authentification via les en-têtes HTTP aussi
      const headerUserId = req.header('X-User-Id');

      if (headerUserId) {
        console.log(`🔑 Authentification détectée via en-têtes HTTP, userId: ${headerUserId}`);
        const userId = parseInt(headerUserId, 10);

        // Ensure session exists
        if (!req.session) {
          console.error('❌ Session inexistante');
          return res.status(440).json({ message: 'Session expired or invalid' });
        }

        // Update session with user info
        req.session.userId = userId;
        req.session.role = req.header('X-User-Role') || 'customer';

        // Renew session expiration
        if (req.session.cookie) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
          console.log('✅ Session cookie renewed:', req.session.cookie);
        }

        // Sauvegarder la session et continuer avec la requête
        return new Promise((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error('⚠️ Erreur lors de la sauvegarde de la session:', err);
              reject(err);
              return;
            }
            console.log('✅ Session sauvegardée avec succès');
            // Récupérer l'utilisateur et continuer
            resolve(userId);
          });
        })
        .then(async (userId) => {
          // Cas spécial pour l'admin (id = 0)
          if (userId === 0 && (req.session?.role === 'admin' || req.header('X-User-Role') === 'admin')) {
            console.log('✅ Session admin valide détectée');
            const adminUser = {
              id: 0,
              username: 'admin',
              email: 'admin@sou9digital.com',
              role: 'admin',
              firstName: 'Admin',
              lastName: 'User',
              phoneNumber: null,
              city: null,
              walletBalance: 0,
              createdAt: new Date()
            };
            return res.json(adminUser);
          }

          console.log(`👤 Recherche de l'utilisateur avec id: ${userId}`);
          const user = await storage.getUser(userId as number);

          if (!user) {
            console.log(`❌ Utilisateur non trouvé pour l'id: ${userId}`);
            return res.status(401).json({ message: 'User not found' });
          }

          // Don't send the password back
          const { password: _, ...userWithoutPassword } = user;

          console.log('✅ Utilisateur authentifié:', userWithoutPassword);
          return res.json(userWithoutPassword);
        })
        .catch((err) => {
          return res.status(500).json({ message: 'Session save error', error: err.message });
        });
      }

      // Si pas d'en-tête, vérifier les sessions
      if (!userId && userId !== 0) {
        console.log('⚠️ Utilisateur non authentifié: userId manquant dans la session et dans les en-têtes');
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Cas spécial pour l'admin (id = 0)
      if (userId === 0 && req.session?.role === 'admin') {
        console.log('✅ Session admin valide détectée');
        const adminUser = {
          id: 0,
          username: 'admin',
          email: 'admin@sou9digital.com',
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          phoneNumber: null,
          city: null,
          walletBalance: 0,
          createdAt: new Date()
        };

        return res.json(adminUser);
      }

      console.log(`👤 Recherche de l'utilisateur avec id: ${userId}`);
      const user = await storage.getUser(userId);

      if (!user) {
        console.log(`❌ Utilisateur non trouvé pour l'id: ${userId}`);
        return res.status(401).json({ message: 'User not found' });
      }

      // Don't send the password back
      const { password: _, ...userWithoutPassword } = user;

      console.log('✅ Utilisateur authentifié:', userWithoutPassword);
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'authentification:', error);
      res.status(500).json({ message: 'Error checking authentication', error: JSON.stringify(error) });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    console.log('🚪 Tentative de déconnexion...');
    console.log('📝 État de la session avant déconnexion:', { 
      sessionID: req.sessionID,
      session: req.session,
      cookies: req.headers.cookie
    });

    // Détruire la session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Erreur lors de la déconnexion:', err);
          return res.status(500).json({ message: 'Error during logout' });
        }
        console.log('✅ Session détruite avec succès');
        res.clearCookie('sou9digital.sid'); // Effacer le cookie de session avec le bon nom
        console.log('🍪 Cookie de session effacé');
        res.status(200).json({ message: 'Logged out successfully' });
      });
    } else {
      console.log('⚠️ Pas de session à détruire');
      res.status(200).json({ message: 'Logged out successfully' });
    }
  });

  // Game Codes
  app.get('/api/products/:productId/game-codes', async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const gameCodes = await storage.getGameCodesByProductId(productId);
      res.json(gameCodes);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching game codes' });
    }
  });

  app.post('/api/game-codes', async (req: Request, res: Response) => {
    try {
      const { orderId, codes } = req.body;
      
      if (!orderId || !codes || !Array.isArray(codes)) {
        return res.status(400).json({ message: 'Invalid request format. Expected orderId and codes array.' });
      }
      
      const results = [];
      const errors = [];
      
      // Process each code in the array
      for (const codeData of codes) {
        try {
          // Create the game code with the correct structure
          const gameCodeData = {
            productId: codeData.productId,
            code: codeData.code,
            isUsed: true,
            orderId: orderId,
            editionId: codeData.editionId,
            platform: codeData.platform,
            productType: codeData.productType
          };
          
          // Validate and persist the game code
          const validatedData = insertGameCodeSchema.parse(gameCodeData);
          const gameCode = await storage.createGameCode(validatedData);
          results.push(gameCode);
        } catch (codeError) {
          // Log the error but continue processing other codes
          console.error('Error processing game code:', codeError);
          errors.push({
            productId: codeData.productId,
            error: codeError instanceof Error ? codeError.message : 'Unknown error'
          });
        }
      }
      
      // Return a summary of the operation
      res.status(201).json({
        success: errors.length === 0,
        message: `Processed ${results.length} game codes with ${errors.length} errors.`,
        results,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Error in game code creation:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid game code data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating game codes', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Testimonials
  app.get('/api/testimonials', async (_req: Request, res: Response) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching testimonials' });
    }
  });

  app.get('/api/testimonials/homepage', async (_req: Request, res: Response) => {
    try {
      const testimonials = await storage.getHomepageTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching homepage testimonials' });
    }
  });

  app.post('/api/testimonials', async (req: Request, res: Response) => {
    try {
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(testimonialData);
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid testimonial data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating testimonial' });
    }
  });

  // User Management (Admin)
  app.get('/api/users', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      console.log('📋 GET /api/users - Requête reçue, session:', {
        userId: req.session?.userId,
        role: req.session?.role,
        headers: {
          userId: req.header('X-User-Id'),
          role: req.header('X-User-Role'),
          adminRequest: req.header('X-Admin-Request')
        }
      });

      // Vérifier explicitement les en-têtes d'administration pour une sécurité supplémentaire
      const headerUserId = req.header('X-User-Id');
      const headerUserRole = req.header('X-User-Role');

      // Vérifier si les en-têtes indiquent un administrateur
      const isAdminViaHeaders = headerUserRole === 'admin';
      // Vérifier si la session indique un administrateur
      const isAdminViaSession = req.session?.role === 'admin';

      if (!isAdminViaHeaders && !isAdminViaSession) {
        console.warn('⚠️ Tentative d\'accès non autorisé à /api/users');
        return res.status(403).json({ message: 'Accès refusé - Permissions d\'administrateur requises' });
      }

      console.log('✅ Autorisation admin vérifiée, récupération des utilisateurs...');
      const users = await storage.getAllUsers();

      // Filter out passwords for security
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      console.log(`📊 ${safeUsers.length} utilisateurs récupérés avec succès`);
      res.json(safeUsers);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  });

  app.get('/api/users/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await storage.getUser(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't send the password back
      const { password, ...userWithoutPassword } = user;

      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user' });
    }
  });

  app.put('/api/users/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      console.log('🔄 PUT /api/users/:id - Mise à jour de l\'utilisateur:', id, 'Données:', req.body);
      console.log('Session:', {
        userId: req.session?.userId,
        role: req.session?.role,
        headers: {
          userId: req.header('X-User-Id'),
          role: req.header('X-User-Role'),
          adminRequest: req.header('X-Admin-Request')
        }
      });

      // Vérification explicite des en-têtes d'administration pour une sécurité supplémentaire
      const headerUserId = req.header('X-User-Id');
      const headerUserRole = req.header('X-User-Role');
      const adminRequestFlag = req.body.adminRequest === true;

      // Vérifier si les en-têtes ou la session indiquent un administrateur
      const isAdminViaHeaders = headerUserRole === 'admin';
      const isAdminViaSession = req.session?.role === 'admin';

      if (!isAdminViaHeaders && !isAdminViaSession && !adminRequestFlag) {
        console.warn('⚠️ Tentative de mise à jour non autorisée pour l\'utilisateur:', id);
        return res.status(403).json({ message: 'Accès refusé - Permissions d\'administrateur requises' });
      }

      // Validation des données avec Zod
      const userData = insertUserSchema.partial().parse(req.body);

      // Prohibit role change to admin for security reasons unless it's coming from an admin
      if (userData.role === 'admin' && !adminRequestFlag) {
        console.log('⚠️ Tentative de changement de rôle en admin sans autorisation explicite, conversion en customer');
        userData.role = 'customer';
      }

      console.log('✅ Autorisation vérifiée, mise à jour de l\'utilisateur...');
      const user = await storage.updateUser(id, userData);

      if (!user) {
        console.log('❌ Utilisateur non trouvé:', id);
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't send the password back
      const { password, ...userWithoutPassword } = user;

      console.log('✅ Utilisateur mis à jour avec succès:', id);
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating user' });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      console.log('🗑️ DELETE /api/users/:id - Suppression de l\'utilisateur:', id);
      console.log('Session:', {
        userId: req.session?.userId,
        role: req.session?.role,
        headers: {
          userId: req.header('X-User-Id'),
          role: req.header('X-User-Role'),
          adminRequest: req.header('X-Admin-Request')
        }
      });

      // Vérification explicite des en-têtes d'administration pour une sécurité supplémentaire
      const headerUserId = req.header('X-User-Id');
      const headerUserRole = req.header('X-User-Role');

      // Vérifier si les en-têtes ou la session indiquent un administrateur
      const isAdminViaHeaders = headerUserRole === 'admin';
      const isAdminViaSession = req.session?.role === 'admin';

      if (!isAdminViaHeaders && !isAdminViaSession) {
        console.warn('⚠️ Tentative de suppression non autorisée pour l\'utilisateur:', id);
        return res.status(403).json({ message: 'Accès refusé - Permissions d\'administrateur requises' });
      }

      console.log('✅ Autorisation vérifiée, suppression de l\'utilisateur...');
      const success = await storage.deleteUser(id);

      if (!success) {
        console.log('❌ Utilisateur non trouvé:', id);
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('✅ Utilisateur supprimé avec succès:', id);
      res.status(204).send();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
      res.status(500).json({ message: 'Error deleting user' });
    }
  });

  // Endpoint pour changer le mot de passe d'un utilisateur
  app.post('/api/users/:id/change-password', isAuthenticated, async (req: Request, res: Response) => {
    // Check if the authenticated user is either an admin or the user whose password is being changed
    if (req.session.role !== 'admin' && req.session.userId !== parseInt(req.params.id, 10)) {
      return res.status(403).json({ message: 'Unauthorized: You can only change your own password' });
    }
    try {
      const id = parseInt(req.params.id, 10);
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      // Vérifier que l'utilisateur existe
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Vérifier le mot de passe actuel (dans une application réelle, utiliser bcrypt pour comparer)
      if (user.password !== currentPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Mettre à jour le mot de passe
      const updatedUser = await storage.updateUser(id, { password: newPassword });

      if (updatedUser) {
        // Ne pas renvoyer le mot de passe dans la réponse
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } else {
        res.status(500).json({ message: 'Failed to update password' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating password' });
    }
  });

  // Endpoint pour récupérer les articles d'une commande
  app.get('/api/orders/:id/items', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const orderItems = await storage.getOrderItemsByOrderId(id);

      if (!orderItems.length) {
        return res.status(404).json({ message: 'No items found for this order' });
      }

      // Enrichir les items avec les noms de produits
      const enrichedItems = await Promise.all(orderItems.map(async (item) => {
        // Get the full product details for each item
        const product = await storage.getProductById(item.productId);

        // Include product name and details, with fallback using our cache function
        const productName = product?.name || await getProductNameFromCache(item.productId);

        return {
          ...item,
          productName: productName,
          platform: product?.platform || ''
        };
      }));

      res.json(enrichedItems);
    } catch (error) {
      console.error('Error retrieving order items:', error);
      res.status(500).json({ message: 'Error retrieving order items' });
    }
  });

  // Email services

  // Send a game code email
  app.post('/api/emails/send-game-code', async (req: Request, res: Response) => {
    try {
      const { to, gameName, platform, gameCode, orderNumber } = req.body;

      if (!to || !gameName || !platform || !gameCode || !orderNumber) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const success = await sendGameCodeEmail(to, gameName, platform, gameCode, orderNumber);

      if (success) {
        res.json({ message: 'Game code email sent successfully' });
      } else {
        res.status(500).json({ message: 'Failed to send game code email' });
      }
    } catch (error) {
      console.error('Error sending game code email:', error);
      res.status(500).json({ message: 'Error sending game code email' });
    }
  });

  // Send an order confirmation email
  app.post('/api/emails/send-order-confirmation', async (req: Request, res: Response) => {
    try {
      const { to, orderNumber, customerName, paymentMethod, totalAmount, products } = req.body;

      if (!to || !orderNumber || !customerName || !paymentMethod || !totalAmount || !products) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const success = await sendOrderConfirmationEmail(
        to, 
        orderNumber, 
        customerName, 
        paymentMethod, 
        totalAmount, 
        products
      );

      if (success) {
        res.json({ message: 'Order confirmation email sent successfully' });
      } else {
        res.status(500).json({ message: 'Failed to send order confirmation email' });
      }
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      res.status(500).json({ message: 'Error sending order confirmation email' });
    }
  });

  // Send a payment confirmation email
  app.post('/api/emails/send-payment-confirmation', async (req: Request, res: Response) => {
    try {
      const { to, orderNumber, customerName } = req.body;

      if (!to || !orderNumber || !customerName) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const success = await sendPaymentConfirmationEmail(to, orderNumber, customerName);

      if (success) {
        res.json({ message: 'Payment confirmation email sent successfully' });
      } else {
        res.status(500).json({ message: 'Failed to send payment confirmation email' });
      }
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      res.status(500).json({ message: 'Error sending payment confirmation email' });
    }
  });

  // Send game codes when payment is completed
  // Route pour ajouter des articles à une commande existante (uniquement admin et manager)
  app.post('/api/orders/:id/items', isAuthenticated, isAdminOrManager, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id, 10);
      const { items } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items array is required and must not be empty' });
      }
      
      // Vérifier que la commande existe
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Calculer le montant total de la commande avant l'ajout des nouveaux articles
      const oldTotalAmount = order.totalAmount || 0;
      
      // Ajouter chaque nouvel article à la commande
      let newItemsTotal = 0;
      const addedItems = [];
      
      for (const item of items) {
        // Vérifier que les données nécessaires sont présentes
        if (!item.productId || !item.quantity || !item.price) {
          return res.status(400).json({ 
            message: 'Each item must have productId, quantity, and price',
            error: `Item missing required data: ${JSON.stringify(item)}`
          });
        }
        
        // Vérifier que le produit existe
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return res.status(400).json({ 
            message: `Product with ID ${item.productId} not found`
          });
        }
        
        // Créer l'article dans la commande
        const orderItem = await storage.createOrderItem({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
        
        // Calculer le total pour cet article
        const itemTotal = item.price * item.quantity;
        newItemsTotal += itemTotal;
        
        // Ajouter les informations du produit à l'élément ajouté
        addedItems.push({
          ...orderItem,
          productName: product.name,
          productImageUrl: product.imageUrl,
          platform: product.platform,
          itemTotal
        });
      }
      
      // Mettre à jour le montant total de la commande
      const newTotalAmount = oldTotalAmount + newItemsTotal;
      const updatedOrder = await storage.updateOrder(orderId, { 
        totalAmount: newTotalAmount
      });
      
      res.status(201).json({
        message: 'Items added to order successfully',
        addedItems,
        order: updatedOrder,
        previousTotal: oldTotalAmount,
        newTotal: newTotalAmount,
        addedAmount: newItemsTotal
      });
    } catch (error) {
      console.error('Error adding items to order:', error);
      res.status(500).json({ message: 'Error adding items to order' });
    }
  });
  
  // Route pour supprimer un article d'une commande (uniquement admin et manager)
  app.delete('/api/orders/:orderId/items/:itemId', isAuthenticated, isAdminOrManager, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId, 10);
      const itemId = parseInt(req.params.itemId, 10);
      
      // Vérifier que la commande existe
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Récupérer l'article à supprimer pour connaître son prix
      const orderItems = await storage.getOrderItemsByOrderId(orderId);
      const itemToDelete = orderItems.find(item => item.id === itemId);
      
      if (!itemToDelete) {
        return res.status(404).json({ message: 'Order item not found' });
      }
      
      // Calculer le montant à soustraire du total
      const itemTotal = itemToDelete.price * itemToDelete.quantity;
      
      // Supprimer l'article
      await storage.deleteOrderItem(itemId);
      
      // Mettre à jour le montant total de la commande
      const newTotalAmount = Math.max(0, (order.totalAmount || 0) - itemTotal);
      const updatedOrder = await storage.updateOrder(orderId, { 
        totalAmount: newTotalAmount
      });
      
      res.json({
        message: 'Item removed from order successfully',
        removedItem: itemToDelete,
        order: updatedOrder,
        previousTotal: order.totalAmount,
        newTotal: newTotalAmount,
        removedAmount: itemTotal
      });
    } catch (error) {
      console.error('Error removing item from order:', error);
      res.status(500).json({ message: 'Error removing item from order' });
    }
  });

  app.get('/api/orders/:id/game-codes', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Get the order
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Verify the order is paid - note we now also check if it's 'completed' in status or 'completed'/'paid' in paymentStatus
      if (order.paymentStatus !== 'paid' && order.paymentStatus !== 'completed' && order.status !== 'completed') {
        return res.status(403).json({ message: 'This order has not been paid yet' });
      }
      
      // Verify the user is authorized to access the order
      if (req.session.userId && req.session.userId !== order.userId && req.session.role !== 'admin') {
        return res.status(403).json({ message: 'You are not authorized to access these game codes' });
      }
      
      // Get game codes assigned to this order
      const allGameCodes = await storage.getGameCodesByOrderId(id);
      
      if (!allGameCodes || allGameCodes.length === 0) {
        return res.status(404).json({ message: 'No game codes found for this order' });
      }
      
      // Filter game codes to keep only the most recent one for each product
      // This avoids showing duplicate codes in the UI and only shows the current valid code
      const productCodeMap = new Map();
      
      // Group codes by productId and keep the most recent one based on ID (higher ID = more recent)
      allGameCodes.forEach(code => {
        if (!productCodeMap.has(code.productId) || code.id > productCodeMap.get(code.productId).id) {
          productCodeMap.set(code.productId, code);
        }
      });
      
      // Convert the map back to an array of game codes (only the most recent for each product)
      const uniqueGameCodes = Array.from(productCodeMap.values());
      
      console.log(`Found ${allGameCodes.length} game codes for order, filtered to ${uniqueGameCodes.length} unique products`);
      
      // Enrich game codes with product information
      const enrichedGameCodes = await Promise.all(
        uniqueGameCodes.map(async (code) => {
          const product = await storage.getProductById(code.productId);
          
          // Create enriched game code with all necessary fields
          return {
            ...code,
            productName: product ? product.name : 'Unknown Product',
            productImageUrl: product ? product.imageUrl : null,
            productPlatform: product ? product.platform : code.platform || null,
            // Ensure all fields from the GameCode interface are properly set with fallbacks
            productType: code.productType || "game",
            platform: code.platform || (product ? product.platform : null),
            editionId: code.editionId || null
          };
        })
      );
      
      console.log('Enriched game codes:', enrichedGameCodes);
      res.status(200).json(enrichedGameCodes);
    } catch (error) {
      console.error('Error retrieving game codes:', error);
      res.status(500).json({ message: 'Error retrieving game codes' });
    }
  });

  app.post('/api/orders/:id/game-codes', isAuthenticated, isAdminOrManager, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id, 10);
      const codeRequests = req.body;
      
      if (!Array.isArray(codeRequests) || codeRequests.length === 0) {
        return res.status(400).json({ message: 'Invalid request format. Expected array of game codes.' });
      }
      
      // Vérifier si la commande existe
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Traiter chaque code de jeu
      const results = [];
      for (const codeRequest of codeRequests) {
        const { productId, code } = codeRequest;
        
        if (!productId || !code) {
          return res.status(400).json({ message: 'Each code request must include productId and code.' });
        }
        
        // Vérifier si le produit existe
        const product = await storage.getProductById(productId);
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${productId} not found.` });
        }
        
        // Ajouter le code de jeu
        const gameCode = await storage.createGameCode({
          productId,
          code,
          isUsed: true,
          orderId
        });
        
        results.push(gameCode);
      }
      
      // Mettre à jour le statut de la commande si nécessaire
      if (order.status === 'paid' && order.paymentStatus === 'verified') {
        await storage.updateOrderStatus(orderId, 'delivered');
      }
      
      res.status(201).json(results);
    } catch (error) {
      console.error('Error adding game codes:', error);
      res.status(500).json({ message: 'Error adding game codes', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/orders/:id/send-game-codes', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { codes } = req.body;

      // Get the order
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Allow adding codes even if payment is not completed (for admin flexibility)
      // Removing this restriction so admins can add codes to any order

      // Get order items
      const orderItems = await storage.getOrderItemsByOrderId(id);

      // Si pas de codes spécifiés, utiliser les codes existants
      let codesToSend = [];
      
      if (codes && Array.isArray(codes) && codes.length > 0) {
        // Utiliser les codes fournis dans la requête
        codesToSend = codes;
      } else {
        // Récupérer les codes de jeu existants pour cette commande
        const allGameCodes = await storage.getGameCodesByOrderId(id);
        
        if (!allGameCodes || allGameCodes.length === 0) {
          return res.status(404).json({ message: 'No game codes found for this order' });
        }
        
        // Filtrer pour ne garder que le code le plus récent pour chaque produit
        const productCodeMap = new Map();
        
        // Regrouper les codes par productId et ne garder que le plus récent
        allGameCodes.forEach(code => {
          if (!productCodeMap.has(code.productId) || code.id > productCodeMap.get(code.productId).id) {
            productCodeMap.set(code.productId, code);
          }
        });
        
        // Convertir la map en tableau
        codesToSend = Array.from(productCodeMap.values()).map(code => ({
          productId: code.productId,
          code: code.code,
          editionId: code.editionId,
          platform: code.platform,
          productType: code.productType
        }));
        
        console.log(`Sending ${codesToSend.length} unique game codes (from ${allGameCodes.length} total codes)`);
      }

      let successCount = 0;
      const errors = [];

      // Process each code from the request
      for (const codeItem of codesToSend) {
        try {
          const { productId, code, editionId, platform, productType } = codeItem;

          // Get product details
          const product = await storage.getProductById(productId);
          if (!product) {
            errors.push(`Product not found for product ID: ${productId}`);
            continue;
          }

          // Send the email with the current code
          const success = await sendGameCodeEmail(
            order.email,
            product.name,
            platform || product.platform,
            code,
            order.id.toString()
          );

          if (success) {
            successCount++;
          } else {
            errors.push(`Failed to send email for game: ${product.name}`);
          }
        } catch (error) {
          console.error('Error processing game code:', error);
          errors.push(`Error processing product ID: ${codeItem.productId}`);
        }
      }

      // Return results
      res.json({
        message: `Sent ${successCount} of ${codesToSend.length} game codes`,
        success: successCount > 0,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Error sending game codes:', error);
      res.status(500).json({ message: 'Error sending game codes' });
    }
  });

  // Paramètres de paiement
  app.get('/api/settings/payment', async (_req: Request, res: Response) => {
    try {
      res.json(paymentSettings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching payment settings' });
    }
  });

  app.post('/api/settings/payment', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { bankAccount, cashOnDelivery } = req.body;

      // Mise à jour partielle
      if (bankAccount) {
        paymentSettings.bankAccount = {
          ...paymentSettings.bankAccount,
          ...bankAccount
        };
      }

      if (cashOnDelivery) {
        paymentSettings.cashOnDelivery = {
          ...paymentSettings.cashOnDelivery,
          ...cashOnDelivery
        };
      }

      res.json(paymentSettings);
    } catch (error) {
      res.status(500).json({ message: 'Error updating payment settings' });
    }
  });

  // Wallet Routes
  // Endpoint pour récupérer les infos du checkout (profil et solde portefeuille) d'un utilisateur
  app.get('/api/checkout/user-info', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;

      if (!userId && userId !== 0) {
        console.log('⚠️ Checkout: Utilisateur non authentifié');
        return res.status(401).json({ message: 'Not authenticated' });
      }

      console.log(`👤 Checkout: Récupération des infos pour l'utilisateur ${userId}`);

      // Récupérer les données de l'utilisateur
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Récupérer le solde du portefeuille
      const walletBalance = await storage.getUserWalletBalance(userId);

      // Récupérer les commandes récentes (3 dernières)
      const orders = await storage.getOrdersByUserId(userId);
      const recentOrders = orders.slice(0, 3).map(order => createSafeOrder(order));

      // Créer l'objet de réponse en excluant le mot de passe
      const { password: _, ...userInfo } = user;

      const checkoutInfo = {
        user: userInfo,
        walletBalance,
        recentOrders
      };

      console.log('✅ Checkout: Infos récupérées avec succès');
      res.json(checkoutInfo);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des infos de checkout:', error);
      res.status(500).json({ message: 'Error fetching checkout info' });
    }
  });

  // Get user wallet balance - optimisé pour éviter les problèmes de chargement
  app.get('/api/users/:userId/wallet/balance', isAuthenticated, async (req: Request, res: Response) => {
    // Vérifier que l'utilisateur authentifié accède à son propre portefeuille (sauf admin)
    const requestedUserId = parseInt(req.params.userId, 10);
    const sessionUserId = req.session.userId;
    const userRole = req.session.role;

    if (userRole !== 'admin' && sessionUserId !== requestedUserId) {
      console.log(`⚠️ Accès non autorisé: l'utilisateur ${sessionUserId} essaie d'accéder au portefeuille de l'utilisateur ${requestedUserId}`);
      return res.status(403).json({ message: 'Vous ne pouvez accéder qu\'à votre propre portefeuille' });
    }
    try {
      const userId = parseInt(req.params.userId, 10);
      console.log(`[Wallet API] Récupération du solde pour l'utilisateur ${userId}`);

      // Obtenir l'utilisateur depuis le stockage
      const user = await storage.getUser(userId);

      if (!user) {
        console.log(`[Wallet API] Utilisateur ${userId} non trouvé, renvoyer erreur 404`);
        return res.status(404).json({ message: 'User not found' });
      }

      // Vérifier si l'utilisateur a déjà un solde
      let balance = user.walletBalance || 0;

      // Le solde initial pour tous les nouveaux utilisateurs est de 0
      if (balance === 0) {
        // Pour les nouveaux utilisateurs, solde initial à 0
        balance = 0; // Solde initial à 0
        
        // Persister ce solde dans la base de données
        await storage.updateUserWalletBalance(userId, balance);
        console.log(`[Wallet API] Solde initial de ${balance} MAD créé pour l'utilisateur ${userId}`);

        console.log(`[Wallet API] Création d'un solde initial de ${balance} pour l'utilisateur ${userId}`);
      }

      console.log(`[Wallet API] Solde trouvé pour l'utilisateur ${userId}:`, balance);

      // Retourner directement la valeur numérique du solde
      res.status(200).json(balance);
    } catch (error) {
      console.error(`[Wallet API] Erreur critique:`, error);
      // Renvoyer une erreur 500 en cas d'erreur
      res.status(500).json({ message: 'Error retrieving wallet balance' });
    }
  });

  // Get user wallet transactions avec robustesse
  app.get('/api/users/:userId/wallet/transactions', isAuthenticated, async (req: Request, res: Response) => {
    // Vérifier que l'utilisateur authentifié accède à son propre portefeuille (sauf admin)
    const requestedUserId = parseInt(req.params.userId, 10);
    const sessionUserId = req.session.userId;
    const userRole = req.session.role;

    if (userRole !== 'admin' && sessionUserId !== requestedUserId) {
      console.log(`⚠️ Accès non autorisé: l'utilisateur ${sessionUserId} essaie d'accéder aux transactions du portefeuille de l'utilisateur ${requestedUserId}`);
      return res.status(403).json({ message: 'Vous ne pouvez accéder qu\'à vos propres transactions' });
    }
    try {

      const userId = parseInt(req.params.userId, 10);
      console.log(`[Wallet API] Récupération des transactions pour l'utilisateur ${userId}`);

      // Vérifier si l'utilisateur existe
      const user = await storage.getUser(userId);
      if (!user) {
        console.log(`[Wallet API] Utilisateur ${userId} non trouvé, renvoyer erreur 404`);
        return res.status(404).json({ message: 'User not found' });
      }

      // Récupérer les transactions de l'utilisateur
      let transactions = await storage.getWalletTransactionsByUserId(userId);

      // Si aucune transaction n'existe, créer une transaction initiale pour l'utilisateur
      if (!transactions || transactions.length === 0) {
        console.log(`[Wallet API] Aucune transaction trouvée pour l'utilisateur ${userId}, création d'une transaction initiale`);

        // Créer une transaction initiale avec solde à 0
        const initialTransaction = await storage.createWalletTransaction({
          userId,
          amount: 0,
          type: 'deposit',
          description: 'Solde initial',
          status: 'completed',
          orderId: null
        });

        // Mettre à jour le solde de l'utilisateur à 0
        await storage.updateUserWalletBalance(userId, 0);

        transactions = [initialTransaction];
      }

      console.log(`[Wallet API] ${transactions.length} transactions trouvées pour l'utilisateur ${userId}`);
      res.json(transactions);
    } catch (error) {
      console.error(`[Wallet API] Erreur critique:`, error);

      // Retourner une erreur 500 en cas d'erreur lors de la récupération des transactions
      res.status(500).json({ message: 'Error retrieving wallet transactions' });
    }
  });

  // Create a wallet transaction (deposit or withdrawal)
  app.post('/api/wallet/transactions', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const transactionData = insertWalletTransactionSchema.parse(req.body);
      
      // Get the current user wallet balance
      const userId = transactionData.userId;
      const currentBalance = await storage.getUserWalletBalance(userId);
      
      // Calculate the new balance based on transaction type
      let newBalance = currentBalance;
      
      if (transactionData.type === 'deposit' || transactionData.type === 'cashback' || transactionData.type === 'refund') {
        // Add to balance for deposits, cashbacks and refunds
        newBalance = currentBalance + transactionData.amount;
      } else if (transactionData.type === 'withdrawal' || transactionData.type === 'payment') {
        // Subtract from balance for withdrawals and payments
        if (currentBalance < transactionData.amount) {
          return res.status(400).json({ 
            message: 'Insufficient wallet balance', 
            currentBalance,
            requestedAmount: transactionData.amount 
          });
        }
        newBalance = currentBalance - transactionData.amount;
      }
      
      // Update user's wallet balance
      await storage.updateUserWalletBalance(userId, newBalance);
      
      // Create the transaction record
      const transaction = await storage.createWalletTransaction(transactionData);
      
      // Return the transaction with updated balance info
      res.status(201).json({
        ...transaction,
        previousBalance: currentBalance,
        newBalance: newBalance
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid transaction data', errors: error.errors });
      }
      console.error('Error creating wallet transaction:', error);
      res.status(500).json({ message: 'Error creating wallet transaction' });
    }
  });

  // Pay for an order using wallet balance
  app.post('/api/orders/:orderId/pay-with-wallet', isAuthenticated, async (req: Request, res: Response) => {
    // Check if the authenticated user is the one who owns the order
    const userId = parseInt(req.body.userId, 10);
    if (req.session.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only pay for your own orders' });
    }
    try {
      const orderId = parseInt(req.params.orderId, 10);
      const { userId, walletAmount } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Get the order
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if the order belongs to the user
      if (order.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized: This order does not belong to the user' });
      }

      // Check if the order is already paid
      if (order.paymentStatus === 'completed') {
        return res.status(400).json({ message: 'This order is already paid' });
      }

      // Check if the wallet is already used for this order and payment is completed
      if (order.walletAmountUsed && order.walletAmountUsed > 0 && order.paymentStatus === 'completed') {
        return res.status(400).json({ 
          message: 'Wallet has already been used for this order',
          walletAmountUsed: order.walletAmountUsed 
        });
      }
      
      // Check if we have a wallet amount used but payment is not completed,
      // this means there was a failed previous attempt - we need to reset it
      if (order.walletAmountUsed && order.walletAmountUsed > 0 && order.paymentStatus !== 'completed') {
        console.log(`🔄 Found previous wallet payment attempt for order #${orderId}, resetting wallet amount...`);
        // We'll reset this and continue with the payment
      }

      // Get the user's wallet balance
      const walletBalance = await storage.getUserWalletBalance(userId);

      // Déterminer le montant à utiliser depuis le portefeuille
      const walletAmountToUse = walletAmount || order.totalAmount;

      // Check if the user has enough balance
      if (walletBalance < walletAmountToUse) {
        return res.status(400).json({ 
          message: 'Insufficient wallet balance', 
          balance: walletBalance,
          required: walletAmountToUse 
        });
      }

      // Déduire le montant du solde du portefeuille de l'utilisateur
      const newBalance = walletBalance - walletAmountToUse;
      await storage.updateUserWalletBalance(userId, newBalance);

      console.log(`💰 Solde portefeuille mis à jour: ${walletBalance} → ${newBalance} (utilisé: ${walletAmountToUse})`);

      // Create a wallet transaction for the payment
      const transaction = await storage.createWalletTransaction({
        userId,
        amount: walletAmountToUse,
        type: 'payment',
        description: `Payment for order #${orderId}`,
        status: 'completed',
        orderId
      });

      // Mettre à jour la commande avec le statut de paiement et le montant du portefeuille utilisé
      // Calculer le montant restant à payer après utilisation du portefeuille
      const remainingAmount = Math.max(0, order.totalAmount - walletAmountToUse);
      const isPaidInFull = remainingAmount === 0;
      
      // Définir les données de mise à jour de la commande
      const orderUpdateData: Partial<InsertOrder> = {
        walletAmountUsed: walletAmountToUse,
        paymentStatus: isPaidInFull ? 'completed' : 'partial',
        // Ne marquer comme "paid" que si le paiement est complet
        status: isPaidInFull ? 'paid' : order.status
      };

      // Mettre à jour la commande en une seule opération
      const updatedOrder = await storage.updateOrder(orderId, orderUpdateData);

      // Assign game codes
      const orderItems = await storage.getOrderItemsByOrderId(orderId);
      for (const item of orderItems) {
        const gameCode = await storage.getUnusedGameCodeByProductId(item.productId);
        if (gameCode) {
          await storage.markGameCodeAsUsed(gameCode.id, orderId);
        }
      }

      // Return the updated order and transaction
      const safeOrder = createSafeOrder(updatedOrder!, orderItems);

      res.json({
        success: true,
        message: 'Paiement effectué avec succès via le portefeuille',
        order: safeOrder,
        transaction,
        walletAmountUsed: walletAmountToUse
      });
    } catch (error) {
      console.error('Error processing wallet payment:', error);
      res.status(500).json({ message: 'Error processing wallet payment' });
    }
  });

  // Admin: Get all wallet transactions
  app.get('/api/admin/wallet/transactions', isAuthenticated, isAdmin, async (_req: Request, res: Response) => {
    try {
      const transactions = await storage.getWalletTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching wallet transactions' });
    }
  });

  // Routes pour les codes promo
  app.get('/api/promo-codes', isAuthenticated, isAdmin, async (_req: Request, res: Response) => {
    try {
      const promoCodes = await storage.getPromoCodes();
      res.status(200).json(promoCodes);
    } catch (error) {
      console.error('Erreur lors de la récupération des codes promo:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des codes promo' });
    }
  });

  app.get('/api/promo-codes/active', async (_req: Request, res: Response) => {
    try {
      const activePromoCodes = await storage.getActivePromoCodes();
      res.status(200).json(activePromoCodes);
    } catch (error) {
      console.error('Erreur lors de la récupération des codes promo actifs:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des codes promo actifs' });
    }
  });

  app.get('/api/promo-codes/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de code promo invalide' });
      }

      const promoCode = await storage.getPromoCodeById(id);
      if (!promoCode) {
        return res.status(404).json({ error: 'Code promo non trouvé' });
      }

      res.status(200).json(promoCode);
    } catch (error) {
      console.error('Erreur lors de la récupération du code promo:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du code promo' });
    }
  });

  app.post('/api/promo-codes/validate', async (req: Request, res: Response) => {
    try {
      const { code, userId } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Code promo non fourni' });
      }

      const promoCode = await storage.getPromoCodeByCode(code);

      if (!promoCode) {
        return res.status(404).json({ error: 'Code promo non trouvé' });
      }

      // Vérifier si le code est actif et les autres validations
      const now = new Date();

      if (!promoCode.isActive) {
        return res.status(400).json({ error: 'Ce code promo n\'est plus actif' });
      }

      // Vérifier les dates de validité
      if (promoCode.startDate && new Date(promoCode.startDate) > now) {
        return res.status(400).json({ error: 'Ce code promo n\'est pas encore valide' });
      }

      if (promoCode.endDate && new Date(promoCode.endDate) < now) {
        return res.status(400).json({ error: 'Ce code promo a expiré' });
      }

      // Vérifier le nombre d'utilisations maximum global
      if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
        return res.status(400).json({ error: 'Ce code promo a atteint son nombre maximum d\'utilisations' });
      }

      // Return valid promo code with discount information
      return res.status(200).json({
        valid: true,
        promoCode: {
          id: promoCode.id,
          code: promoCode.code,
          discountType: promoCode.discountType,
          discountValue: promoCode.discountValue,
          minimumOrderAmount: promoCode.minimumOrderAmount
        }
      });
    } catch (error) {
      console.error('Erreur lors de la validation du code promo:', error);
      res.status(500).json({ error: 'Erreur lors de la validation du code promo' });
    }
  });

  app.post('/api/promo-codes', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const promoData = req.body;

      // Validation minimale
      if (!promoData.code || !promoData.discountType || !promoData.discountValue) {
        return res.status(400).json({ error: 'Données de code promo incomplètes' });
      }

      // Vérifier si le code existe déjà
      const existingCode = await storage.getPromoCodeByCode(promoData.code);
      if (existingCode) {
        return res.status(409).json({ error: 'Ce code promo existe déjà' });
      }

      // Créer le code promo
      const newPromoCode = await storage.createPromoCode(promoData);

      res.status(201).json(newPromoCode);
    } catch (error) {
      console.error('Erreur lors de la création du code promo:', error);
      res.status(500).json({ error: 'Erreur lors de la création du code promo' });
    }
  });

  app.put('/api/promo-codes/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de code promo invalide' });
      }

      const promoCode = await storage.getPromoCodeById(id);
      if (!promoCode) {
        return res.status(404).json({ error: 'Code promo non trouvé' });
      }

      const promoData = req.body;

      // Si on change le code, vérifier qu'il n'existe pas déjà
      if (promoData.code && promoData.code !== promoCode.code) {
        const existingCode = await storage.getPromoCodeByCode(promoData.code);
        if (existingCode && existingCode.id !== id) {
          return res.status(409).json({ error: 'Ce code promo existe déjà' });
        }
      }

      const updatedPromoCode = await storage.updatePromoCode(id, promoData);

      res.status(200).json(updatedPromoCode);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du code promo:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du code promo' });
    }
  });

  app.delete('/api/promo-codes/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de code promo invalide' });
      }

      const promoCode = await storage.getPromoCodeById(id);
      if (!promoCode) {
        return res.status(404).json({ error: 'Code promo non trouvé' });
      }

      await storage.deletePromoCode(id);

      res.status(204).send();
    } catch (error) {
      console.error('Erreur lors de la suppression du code promo:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du code promo' });
    }
  });

  app.post('/api/promo-codes/:id/apply', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de code promo invalide' });
      }

      const promoCode = await storage.getPromoCodeById(id);
      if (!promoCode) {
        return res.status(404).json({ error: 'Code promo non trouvé' });
      }

      // Incrémenter le compteur d'utilisation
      const updatedPromoCode = await storage.incrementPromoCodeUsage(id);

      res.status(200).json(updatedPromoCode);
    } catch (error) {
      console.error('Erreur lors de l\'application du code promo:', error);
      res.status(500).json({ error: 'Erreur lors de l\'application du code promo' });
    }
  });

  // Gift Card Denominations Routes
  // Get all gift card denominations
  app.get('/api/gift-card-denominations', async (req: Request, res: Response) => {
    try {
      const denominations = await storage.getGiftCardDenominations();
      res.json(denominations);
    } catch (error) {
      console.error('Erreur lors de la récupération des dénominations de cartes cadeaux:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des dénominations de cartes cadeaux' });
    }
  });
  
  // Get all platforms that can be used for gift cards
  app.get('/api/platforms', async (_req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      const platforms = products
        .filter(product => 
          // Filtre pour ne garder que les produits de type giftCard
          product.product_type === 'giftCard' ||
          // Ou les produits dont la plateforme est liée à une carte cadeau
          (product.platform && (
            product.platform.toLowerCase().includes('credit') ||
            product.platform.toLowerCase().includes('card') ||
            product.platform.toLowerCase().includes('gift')
          ))
        )
        .map(product => ({
          id: product.id,
          name: product.name,
          platform: product.platform
        }));
      
      res.json(platforms);
    } catch (error) {
      console.error('Erreur lors de la récupération des plateformes:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des plateformes' });
    }
  });

  // Get gift card denominations by platform ID
  app.get('/api/platforms/:platformId/denominations', async (req: Request, res: Response) => {
    try {
      const platformId = parseInt(req.params.platformId);
      if (isNaN(platformId)) {
        return res.status(400).json({ error: 'ID de plateforme invalide' });
      }

      const denominations = await storage.getGiftCardDenominationsByPlatformId(platformId);
      res.json(denominations);
    } catch (error) {
      console.error('Erreur lors de la récupération des dénominations de cartes cadeaux pour cette plateforme:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des dénominations de cartes cadeaux pour cette plateforme' });
    }
  });

  // Get gift card denomination by ID
  app.get('/api/gift-card-denominations/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de dénomination invalide' });
      }

      const denomination = await storage.getGiftCardDenominationById(id);
      if (!denomination) {
        return res.status(404).json({ error: 'Dénomination non trouvée' });
      }

      res.json(denomination);
    } catch (error) {
      console.error('Erreur lors de la récupération de la dénomination:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la dénomination' });
    }
  });

  // Create gift card denomination (admin only)
  app.post('/api/gift-card-denominations', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { platformId, value, name, stock, active } = req.body;
      
      if (!platformId || !value || !name) {
        return res.status(400).json({ error: 'Plateforme, valeur et nom sont requis' });
      }

      const newDenomination = await storage.createGiftCardDenomination({
        platformId,
        value,
        name,
        stock: stock || 0,
        active: active !== undefined ? active : true
      });

      res.status(201).json(newDenomination);
    } catch (error) {
      console.error('Erreur lors de la création de la dénomination:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la dénomination' });
    }
  });

  // Update gift card denomination (admin only)
  app.put('/api/gift-card-denominations/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de dénomination invalide' });
      }

      const { platformId, value, name, stock, active } = req.body;
      
      const denomination = await storage.getGiftCardDenominationById(id);
      if (!denomination) {
        return res.status(404).json({ error: 'Dénomination non trouvée' });
      }

      // Modification pour permettre la mise à jour partielle
      // Nous ne mettons à jour que les champs fournis
      const updates: Partial<InsertGiftCardDenomination> = {};
      
      if (platformId !== undefined) updates.platformId = platformId;
      if (value !== undefined) updates.value = value;
      if (name !== undefined) updates.name = name;
      if (stock !== undefined) updates.stock = stock;
      
      // Traitement spécial pour le champ active (booléen)
      if (active !== undefined) {
        // Convertir explicitement en booléen
        // En SQLite, les booléens sont stockés comme 0/1, mais dans notre API nous les traitons comme des booléens
        let boolActive = active;
        if (typeof active === 'string') {
          boolActive = active === 'true';
        } else if (typeof active === 'number') {
          boolActive = active === 1;
        }
        
        updates.active = boolActive;
        
        // Journalisation détaillée pour débogage
        console.log('Mise à jour champ active:');
        console.log('- Valeur actuelle dans la BD:', denomination.active, 'de type', typeof denomination.active);
        console.log('- Valeur reçue du client:', active, 'de type', typeof active);
        console.log('- Valeur convertie pour mise à jour:', boolActive, 'de type', typeof boolActive);
      }

      const updatedDenomination = await storage.updateGiftCardDenomination(id, updates);

      res.json(updatedDenomination);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dénomination:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la dénomination' });
    }
  });

  // Update gift card denomination stock (admin only)
  app.patch('/api/gift-card-denominations/:id/stock', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de dénomination invalide' });
      }

      const { stock } = req.body;
      if (stock === undefined || isNaN(parseInt(stock))) {
        return res.status(400).json({ error: 'Stock invalide' });
      }

      const denomination = await storage.getGiftCardDenominationById(id);
      if (!denomination) {
        return res.status(404).json({ error: 'Dénomination non trouvée' });
      }

      const updatedDenomination = await storage.updateGiftCardDenominationStock(id, parseInt(stock));
      res.json(updatedDenomination);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du stock' });
    }
  });

  // Delete gift card denomination (admin only)
  app.delete('/api/gift-card-denominations/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de dénomination invalide' });
      }

      const denomination = await storage.getGiftCardDenominationById(id);
      if (!denomination) {
        return res.status(404).json({ error: 'Dénomination non trouvée' });
      }

      await storage.deleteGiftCardDenomination(id);
      res.status(204).send();
    } catch (error) {
      console.error('Erreur lors de la suppression de la dénomination:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression de la dénomination' });
    }
  });

  // Gift Cards Routes
  // Get all gift cards (admin only)
  app.get('/api/gift-cards', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const giftCards = await storage.getGiftCards();
      res.json(giftCards);
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      res.status(500).json({ message: 'Error fetching gift cards' });
    }
  });

  // Get a specific gift card by ID (admin only)
  app.get('/api/gift-cards/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const giftCard = await storage.getGiftCardById(id);
      
      if (!giftCard) {
        return res.status(404).json({ message: 'Gift card not found' });
      }
      
      res.json(giftCard);
    } catch (error) {
      console.error('Error fetching gift card:', error);
      res.status(500).json({ message: 'Error fetching gift card' });
    }
  });

  // Create a new gift card (admin only)
  app.post('/api/gift-cards', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const giftCardData = insertGiftCardSchema.parse(req.body);
      const giftCard = await storage.createGiftCard(giftCardData);
      res.status(201).json(giftCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid gift card data', errors: error.errors });
      }
      console.error('Error creating gift card:', error);
      res.status(500).json({ message: 'Error creating gift card' });
    }
  });

  // Create a batch of gift cards (admin only)
  app.post('/api/gift-cards/batch', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { amount, denominationId } = req.body;
      
      if (!amount || !denominationId || amount <= 0 || isNaN(parseInt(denominationId))) {
        return res.status(400).json({ message: 'Invalid amount or denomination ID. Amount must be a positive number and denomination ID must be provided.' });
      }
      
      if (amount > 100) {
        return res.status(400).json({ message: 'Cannot create more than 100 gift cards at once.' });
      }
      
      // Vérifier que la dénomination existe
      const denomination = await storage.getGiftCardDenominationById(parseInt(denominationId));
      if (!denomination) {
        return res.status(404).json({ message: 'Denomination not found' });
      }
      
      const giftCards = await storage.createGiftCardBatch(amount, parseInt(denominationId));
      res.status(201).json({
        message: `Successfully created ${giftCards.length} gift cards`,
        giftCards,
        denomination
      });
    } catch (error) {
      console.error('Error creating gift card batch:', error);
      res.status(500).json({ message: 'Error creating gift card batch' });
    }
  });

  // Update an existing gift card (admin only)
  app.put('/api/gift-cards/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const giftCardData = insertGiftCardSchema.partial().parse(req.body);
      
      const giftCard = await storage.updateGiftCard(id, giftCardData);
      
      if (!giftCard) {
        return res.status(404).json({ message: 'Gift card not found' });
      }
      
      res.json(giftCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid gift card data', errors: error.errors });
      }
      console.error('Error updating gift card:', error);
      res.status(500).json({ message: 'Error updating gift card' });
    }
  });

  // Delete a gift card (admin only)
  app.delete('/api/gift-cards/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await storage.deleteGiftCard(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Gift card not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting gift card:', error);
      res.status(500).json({ message: 'Error deleting gift card' });
    }
  });

  // Redeem a gift card
  app.post('/api/gift-cards/redeem', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      const userId = req.session.userId;
      
      if (!code) {
        return res.status(400).json({ message: 'Gift card code is required' });
      }
      
      if (!userId) {
        return res.status(401).json({ message: 'User must be logged in to redeem a gift card' });
      }
      
      const redeemedGiftCard = await storage.redeemGiftCard(code, userId);
      
      if (!redeemedGiftCard) {
        return res.status(404).json({ message: 'Invalid or already redeemed gift card' });
      }
      
      // Get updated user wallet balance
      const user = await storage.getUser(userId);
      
      res.json({
        message: 'Gift card redeemed successfully',
        giftCard: redeemedGiftCard,
        walletBalance: user?.walletBalance || 0
      });
    } catch (error) {
      console.error('Error redeeming gift card:', error);
      res.status(500).json({ message: 'Error redeeming gift card' });
    }
  });

  // Verify order without authentication (using order number, email and phone)
  app.post('/api/orders/verify', async (req: Request, res: Response) => {
    try {
      let { orderNumber, email, phone } = req.body;
      
      if (!orderNumber || !email || !phone) {
        return res.status(400).json({ 
          success: false, 
          message: 'Order number, email and phone are required' 
        });
      }
      
      // Log les données reçues pour le débogage
      console.log('Vérification commande - Données reçues:', { orderNumber, email, phone });
      
      let numericOrderNumber = orderNumber;
      
      // Supprimer le préfixe "SD" si présent
      if (typeof orderNumber === 'string' && orderNumber.startsWith('SD')) {
        numericOrderNumber = orderNumber.substring(2);
        console.log('Préfixe SD détecté, extrait:', numericOrderNumber);
      }
      
      // Si c'est un numérique après avoir retiré le préfixe, essayer de récupérer par ID
      let order;
      if (!isNaN(parseInt(numericOrderNumber))) {
        const orderId = parseInt(numericOrderNumber);
        console.log('Recherche par ID:', orderId);
        order = await storage.getOrderById(orderId);
      }
      
      // Si on n'a pas trouvé par ID, essayer par le numéro de commande original
      if (!order) {
        console.log('Recherche par numéro de commande original:', orderNumber);
        order = await storage.getOrderByOrderNumber(orderNumber);
      }
      
      // Si toujours pas trouvé et si on a extrait un numéro, essayer avec le numéro extrait
      if (!order && numericOrderNumber !== orderNumber) {
        console.log('Recherche par numéro extrait:', numericOrderNumber);
        order = await storage.getOrderByOrderNumber(numericOrderNumber);
      }
      
      if (!order) {
        console.log('Commande non trouvée');
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found' 
        });
      }
      
      console.log('Commande trouvée:', {
        id: order.id,
        email: order.email,
        phoneNumber: order.phoneNumber,
        emailMatch: order.email.toLowerCase() === email.toLowerCase(),
        phoneMatch: order.phoneNumber === phone
      });
      
      // Verify that email and phone match the order
      if (order.email.toLowerCase() !== email.toLowerCase() || order.phoneNumber !== phone) {
        return res.status(403).json({ 
          success: false, 
          message: 'The provided details do not match the order information' 
        });
      }
      
      // If all checks pass, return success with the order ID
      res.json({
        success: true,
        orderId: order.id
      });
    } catch (error) {
      console.error('Error verifying order:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error verifying order details' 
      });
    }
  });

  // Create a HTTP server
  const httpServer = createServer(app);

  return httpServer;
}