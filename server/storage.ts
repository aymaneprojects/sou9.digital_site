import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  gameCodes, type GameCode, type InsertGameCode,
  testimonials, type Testimonial, type InsertTestimonial,
  walletTransactions, type WalletTransaction, type InsertWalletTransaction,
  promoCodes, type PromoCode, type InsertPromoCode,
  promoCodeUsage, type PromoCodeUsage, type InsertPromoCodeUsage,
  productEditions, type ProductEdition, type InsertProductEdition,
  giftCards, type GiftCard, type InsertGiftCard,
  giftCardDenominations, type GiftCardDenomination, type InsertGiftCardDenomination
} from "../shared/schema-sqlite";

import { db } from './db';
import { eq, and, sql, inArray } from 'drizzle-orm';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProductsByPlatform(platform: string): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  getNewReleases(): Promise<Product[]>;
  getOnSaleProducts(): Promise<Product[]>;
  getPreOrderProducts(): Promise<Product[]>;
  getGameCredits(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  checkAndCancelExpiredOrders(): Promise<Order[]>;

  // Product Editions operations
  getProductEditions(productId: number): Promise<ProductEdition[]>;
  getProductEditionById(id: number): Promise<ProductEdition | undefined>;
  createProductEdition(edition: InsertProductEdition): Promise<ProductEdition>;
  updateProductEdition(id: number, edition: Partial<InsertProductEdition>): Promise<ProductEdition | undefined>;
  deleteProductEdition(id: number): Promise<boolean>;

  // Order operations
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<Order | undefined>;
  updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order | undefined>;

  // Order Items operations
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  deleteOrderItem(orderId: number, itemId: number): Promise<boolean>;

  // Game Codes operations
  getGameCodesByProductId(productId: number): Promise<GameCode[]>;
  getUnusedGameCodeByProductId(productId: number): Promise<GameCode | undefined>;
  getGameCodesByOrderId(orderId: number): Promise<GameCode[]>;
  createGameCode(gameCode: InsertGameCode): Promise<GameCode>;
  markGameCodeAsUsed(id: number, orderId: number): Promise<GameCode | undefined>;
  updateGameCode(id: number, code: string, editionId?: number | null, platform?: string, productType?: string): Promise<GameCode | undefined>;

  // Testimonial operations
  getTestimonials(): Promise<Testimonial[]>;
  getHomepageTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  // Wallet operations
  getUserWalletBalance(userId: number): Promise<number>;
  updateUserWalletBalance(userId: number, newBalance: number): Promise<User | undefined>;
  getWalletTransactionsByUserId(userId: number): Promise<WalletTransaction[]>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  getWalletTransactions(): Promise<WalletTransaction[]>;
  
  // Promo Codes operations
  getPromoCodes(): Promise<PromoCode[]>;
  getPromoCodeById(id: number): Promise<PromoCode | undefined>;
  getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
  getActivePromoCodes(): Promise<PromoCode[]>;
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: number, promoCode: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: number): Promise<boolean>;
  incrementPromoCodeUsage(id: number): Promise<PromoCode | undefined>;
  
  // Promo Code Usage operations
  getPromoCodeUsageCount(promoCodeId: number, userId: number): Promise<number>;
  createPromoCodeUsage(usage: InsertPromoCodeUsage): Promise<PromoCodeUsage>;
  getPromoCodeUsagesByUserId(userId: number): Promise<PromoCodeUsage[]>;
  getPromoCodeUsagesByPromoCodeId(promoCodeId: number): Promise<PromoCodeUsage[]>;
  
  // Gift Card Denominations operations
  getGiftCardDenominations(): Promise<GiftCardDenomination[]>;
  getGiftCardDenominationsByPlatformId(platformId: number): Promise<GiftCardDenomination[]>;
  getGiftCardDenominationById(id: number): Promise<GiftCardDenomination | undefined>;
  createGiftCardDenomination(denomination: InsertGiftCardDenomination): Promise<GiftCardDenomination>;
  updateGiftCardDenomination(id: number, denomination: Partial<InsertGiftCardDenomination>): Promise<GiftCardDenomination | undefined>;
  deleteGiftCardDenomination(id: number): Promise<boolean>;
  updateGiftCardDenominationStock(id: number, newStock: number): Promise<GiftCardDenomination | undefined>;

  // Gift Card operations
  getGiftCards(): Promise<GiftCard[]>;
  getGiftCardsByDenominationId(denominationId: number): Promise<GiftCard[]>;
  getGiftCardById(id: number): Promise<GiftCard | undefined>;
  getGiftCardByCode(code: string): Promise<GiftCard | undefined>;
  createGiftCard(giftCard: InsertGiftCard): Promise<GiftCard>;
  createGiftCardBatch(amount: number, denominationId: number): Promise<GiftCard[]>;
  updateGiftCard(id: number, giftCard: Partial<InsertGiftCard>): Promise<GiftCard | undefined>;
  deleteGiftCard(id: number): Promise<boolean>;
  redeemGiftCard(code: string, userId: number): Promise<GiftCard | undefined>;
}

// Classe pour implémenter le stockage avec SQLite
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    // On n'a pas besoin d'ajouter createdAt car il est géré par SQLite
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true; // Dans SQLite, nous ne pouvons pas vérifier facilement le nombre de lignes supprimées
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsByPlatform(platform: string): Promise<Product[]> {
    return await db.select()
      .from(products)
      .where(sql`${products.platform} LIKE ${`%${platform}%`}`);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(sql`${products.featured} = 1`);
  }

  async getNewReleases(): Promise<Product[]> {
    return await db.select().from(products).where(sql`${products.isNewRelease} = 1`);
  }

  async getOnSaleProducts(): Promise<Product[]> {
    return await db.select().from(products).where(sql`${products.isOnSale} = 1`);
  }
  
  async getPreOrderProducts(): Promise<Product[]> {
    // Using sql`` template to ensure proper SQL syntax with boolean/integer fields in SQLite
    return await db.select().from(products).where(sql`${products.isPreOrder} = true`);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [createdProduct] = await db.insert(products).values(product).returning();
    return createdProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db.update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    await db.delete(products).where(eq(products.id, id));
    return true; // Dans SQLite, nous ne pouvons pas vérifier facilement le nombre de lignes supprimées
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    // Optimisation : utiliser une seule requête pour récupérer la commande
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    
    if (!order) {
      return undefined;
    }
    
    // Ajouter des données calculées ou utiles pour l'UI
    if (order.createdAt && typeof order.createdAt === 'string') {
      // Calculer la date d'expiration pour le paiement (5 jours après création)
      if (!order.paymentDeadline) {
        const createdDate = new Date(order.createdAt);
        const deadlineDate = new Date(createdDate);
        deadlineDate.setDate(deadlineDate.getDate() + 5);
        order.paymentDeadline = deadlineDate.toISOString();
      }
    }
    
    return order;
  }
  
  async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    
    if (!order) {
      return undefined;
    }
    
    // Ajouter des données calculées ou utiles pour l'UI (comme dans getOrderById)
    if (order.createdAt && typeof order.createdAt === 'string') {
      if (!order.paymentDeadline) {
        const createdDate = new Date(order.createdAt);
        const deadlineDate = new Date(createdDate);
        deadlineDate.setDate(deadlineDate.getDate() + 5);
        order.paymentDeadline = deadlineDate.toISOString();
      }
    }
    
    return order;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [createdOrder] = await db.insert(orders).values(order).returning();
    return createdOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async updatePaymentStatus(id: number, paymentStatus: string): Promise<Order | undefined> {
    const [updatedOrder] = await db.update(orders)
      .set({ paymentStatus })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updatedOrder] = await db.update(orders)
      .set(orderData)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Order Items operations
  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    // Utiliser une jointure pour récupérer les informations des produits avec les éléments de commande
    const items = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      productName: products.name,
      productPlatform: products.platform,
      productImageUrl: products.imageUrl
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));
    
    return items as unknown as OrderItem[];
  }
  
  // Alias pour la compatibilité avec les nouvelles routes API
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return this.getOrderItemsByOrderId(orderId);
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [createdItem] = await db.insert(orderItems).values(orderItem).returning();
    return createdItem;
  }
  
  async deleteOrderItem(orderId: number, itemId: number): Promise<boolean> {
    await db.delete(orderItems)
      .where(
        and(
          eq(orderItems.id, itemId),
          eq(orderItems.orderId, orderId)
        )
      );
    return true;
  }

  // Game Codes operations
  async getGameCodesByProductId(productId: number): Promise<GameCode[]> {
    return await db.select().from(gameCodes).where(eq(gameCodes.productId, productId));
  }

  async getUnusedGameCodeByProductId(productId: number): Promise<GameCode | undefined> {
    const [gameCode] = await db.select()
      .from(gameCodes)
      .where(sql`${gameCodes.productId} = ${productId} AND ${gameCodes.isUsed} = 0`)
      .limit(1);
    return gameCode;
  }

  async createGameCode(gameCode: InsertGameCode): Promise<GameCode> {
    const [createdCode] = await db.insert(gameCodes).values(gameCode).returning();
    return createdCode;
  }

  async markGameCodeAsUsed(id: number, orderId: number): Promise<GameCode | undefined> {
    const [updatedCode] = await db.update(gameCodes)
      .set({ isUsed: sql`1`, orderId })
      .where(eq(gameCodes.id, id))
      .returning();
    return updatedCode;
  }

  async updateGameCode(id: number, code: string, editionId?: number | null, platform?: string, productType?: string): Promise<GameCode | undefined> {
    const updateData: Record<string, any> = { code };
    
    if (editionId !== undefined) {
      updateData.editionId = editionId;
    }
    
    if (platform !== undefined) {
      updateData.platform = platform;
    }
    
    if (productType !== undefined) {
      // Use the correct column name (product_type) instead of the property name (productType)
      updateData.product_type = productType;
    }
    
    const [updatedCode] = await db.update(gameCodes)
      .set(updateData)
      .where(eq(gameCodes.id, id))
      .returning();
    return updatedCode;
  }

  async getGameCodesByOrderId(orderId: number): Promise<GameCode[]> {
    try {
      return await db.select().from(gameCodes).where(eq(gameCodes.orderId, orderId));
    } catch (error) {
      console.error('Error in getGameCodesByOrderId:', error);
      // Return empty array if there's an error (like missing column)
      return [];
    }
  }

  // Testimonial operations
  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async getHomepageTestimonials(): Promise<Testimonial[]> {
    return await db.select()
      .from(testimonials)
      .where(sql`${testimonials.displayOnHomepage} = 1`);
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [createdTestimonial] = await db.insert(testimonials)
      .values(testimonial)
      .returning();
    return createdTestimonial;
  }

  // Wallet operations
  async getUserWalletBalance(userId: number): Promise<number> {
    const [user] = await db.select({ walletBalance: users.walletBalance })
      .from(users)
      .where(eq(users.id, userId));
    return user?.walletBalance || 0;
  }

  async updateUserWalletBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ walletBalance: newBalance })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getWalletTransactionsByUserId(userId: number): Promise<WalletTransaction[]> {
    return await db.select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(sql`${walletTransactions.createdAt} DESC`);
  }

  async createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const [createdTransaction] = await db.insert(walletTransactions)
      .values(transaction)
      .returning();
    return createdTransaction;
  }

  async getWalletTransactions(): Promise<WalletTransaction[]> {
    return await db.select().from(walletTransactions)
      .orderBy(sql`${walletTransactions.createdAt} DESC`);
  }

  // Promo Codes operations
  async getPromoCodes(): Promise<PromoCode[]> {
    return await db.select().from(promoCodes);
  }

  async getPromoCodeById(id: number): Promise<PromoCode | undefined> {
    const [promoCode] = await db.select()
      .from(promoCodes)
      .where(eq(promoCodes.id, id));
    return promoCode;
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    const [promoCode] = await db.select()
      .from(promoCodes)
      .where(eq(promoCodes.code, code));
    return promoCode;
  }

  async getActivePromoCodes(): Promise<PromoCode[]> {
    return await db.select()
      .from(promoCodes)
      .where(sql`${promoCodes.isActive} = 1`);
  }

  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    const [createdCode] = await db.insert(promoCodes)
      .values(promoCode)
      .returning();
    return createdCode;
  }

  async updatePromoCode(id: number, promoCodeData: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const [updatedCode] = await db.update(promoCodes)
      .set(promoCodeData)
      .where(eq(promoCodes.id, id))
      .returning();
    return updatedCode;
  }

  async deletePromoCode(id: number): Promise<boolean> {
    await db.delete(promoCodes).where(eq(promoCodes.id, id));
    return true; // Dans SQLite, nous ne pouvons pas vérifier facilement le nombre de lignes supprimées
  }

  async incrementPromoCodeUsage(id: number): Promise<PromoCode | undefined> {
    const [promoCode] = await db.select().from(promoCodes).where(eq(promoCodes.id, id));
    
    if (!promoCode) return undefined;
    
    const [updatedCode] = await db.update(promoCodes)
      .set({ usedCount: promoCode.usedCount + 1 })
      .where(eq(promoCodes.id, id))
      .returning();
    
    return updatedCode;
  }

  // Promo Code Usage operations
  async getPromoCodeUsageCount(promoCodeId: number, userId: number): Promise<number> {
    const result = await db.select({ count: sql`count(*)` })
      .from(promoCodeUsage)
      .where(and(
        eq(promoCodeUsage.promoCodeId, promoCodeId),
        eq(promoCodeUsage.userId, userId)
      ));
    
    return Number(result[0]?.count || 0);
  }

  async createPromoCodeUsage(usage: InsertPromoCodeUsage): Promise<PromoCodeUsage> {
    const [createdUsage] = await db.insert(promoCodeUsage)
      .values(usage)
      .returning();
    return createdUsage;
  }

  async getPromoCodeUsagesByUserId(userId: number): Promise<PromoCodeUsage[]> {
    return await db.select()
      .from(promoCodeUsage)
      .where(eq(promoCodeUsage.userId, userId));
  }

  async getPromoCodeUsagesByPromoCodeId(promoCodeId: number): Promise<PromoCodeUsage[]> {
    return await db.select()
      .from(promoCodeUsage)
      .where(eq(promoCodeUsage.promoCodeId, promoCodeId));
  }

  // Product Editions operations
  async getProductEditions(productId: number): Promise<ProductEdition[]> {
    return await db.select()
      .from(productEditions)
      .where(eq(productEditions.productId, productId));
  }

  async getProductEditionById(id: number): Promise<ProductEdition | undefined> {
    const [edition] = await db.select()
      .from(productEditions)
      .where(eq(productEditions.id, id));
    return edition;
  }

  async createProductEdition(edition: InsertProductEdition): Promise<ProductEdition> {
    const [createdEdition] = await db.insert(productEditions)
      .values(edition)
      .returning();
    return createdEdition;
  }

  async updateProductEdition(id: number, editionData: Partial<InsertProductEdition>): Promise<ProductEdition | undefined> {
    const [updatedEdition] = await db.update(productEditions)
      .set(editionData)
      .where(eq(productEditions.id, id))
      .returning();
    return updatedEdition;
  }

  async deleteProductEdition(id: number): Promise<boolean> {
    await db.delete(productEditions).where(eq(productEditions.id, id));
    return true;
  }

  // Game Credits operations
  async getGameCredits(): Promise<Product[]> {
    // Récupérer les produits qui sont des crédits de jeu (cartes prépayées)
    // Filtrer en fonction de la plateforme qui contient "credit" ou "card"
    // OU en fonction du type de produit (productType = 'giftCard')
    return await db.select()
      .from(products)
      .where(sql`${products.platform} LIKE '%credit%' OR ${products.platform} LIKE '%card%' OR ${products.productType} = 'giftCard'`);
  }

  // Order expiration utility
  async checkAndCancelExpiredOrders(): Promise<Order[]> {
    // Récupérer toutes les commandes en attente de paiement
    const pendingOrders = await db.select()
      .from(orders)
      .where(and(
        eq(orders.status, 'pending'),
        eq(orders.paymentStatus, 'pending'),
        eq(orders.paymentMethod, 'bank_transfer')
      ));
    
    const currentDate = new Date();
    const cancelledOrders: Order[] = [];
    
    // Vérifier et annuler les commandes expirées
    for (const order of pendingOrders) {
      if (order.paymentDeadline) {
        const deadlineDate = new Date(order.paymentDeadline);
        if (currentDate > deadlineDate) {
          // Marquer la commande comme annulée
          const [cancelledOrder] = await db.update(orders)
            .set({ 
              status: 'cancelled',
              cancelledReason: 'Le délai de paiement a expiré'
            })
            .where(eq(orders.id, order.id))
            .returning();
          
          if (cancelledOrder) {
            cancelledOrders.push(cancelledOrder);
          }
        }
      }
    }
    
    return cancelledOrders;
  }
  
  // Gift Card Denominations operations
  async getGiftCardDenominations(): Promise<GiftCardDenomination[]> {
    return await db.select().from(giftCardDenominations);
  }
  
  async getGiftCardDenominationsByPlatformId(platformId: number): Promise<GiftCardDenomination[]> {
    return await db.select()
      .from(giftCardDenominations)
      .where(eq(giftCardDenominations.platformId, platformId));
  }
  
  async getGiftCardDenominationById(id: number): Promise<GiftCardDenomination | undefined> {
    const [denomination] = await db.select()
      .from(giftCardDenominations)
      .where(eq(giftCardDenominations.id, id));
    return denomination;
  }
  
  async createGiftCardDenomination(denomination: InsertGiftCardDenomination): Promise<GiftCardDenomination> {
    const [createdDenomination] = await db.insert(giftCardDenominations)
      .values(denomination)
      .returning();
    return createdDenomination;
  }
  
  async updateGiftCardDenomination(id: number, denominationData: Partial<InsertGiftCardDenomination>): Promise<GiftCardDenomination | undefined> {
    const [updatedDenomination] = await db.update(giftCardDenominations)
      .set(denominationData)
      .where(eq(giftCardDenominations.id, id))
      .returning();
    return updatedDenomination;
  }
  
  async deleteGiftCardDenomination(id: number): Promise<boolean> {
    await db.delete(giftCardDenominations).where(eq(giftCardDenominations.id, id));
    return true;
  }
  
  async updateGiftCardDenominationStock(id: number, newStock: number): Promise<GiftCardDenomination | undefined> {
    const [updatedDenomination] = await db.update(giftCardDenominations)
      .set({ stock: newStock })
      .where(eq(giftCardDenominations.id, id))
      .returning();
    return updatedDenomination;
  }
  
  // Gift Card operations
  async getGiftCards(): Promise<GiftCard[]> {
    return await db.select().from(giftCards)
      .orderBy(sql`${giftCards.createdAt} DESC`);
  }
  
  async getGiftCardsByDenominationId(denominationId: number): Promise<GiftCard[]> {
    return await db.select()
      .from(giftCards)
      .where(eq(giftCards.denominationId, denominationId));
  }
  
  async getGiftCardById(id: number): Promise<GiftCard | undefined> {
    const [giftCard] = await db.select()
      .from(giftCards)
      .where(eq(giftCards.id, id));
    return giftCard;
  }
  
  async getGiftCardByCode(code: string): Promise<GiftCard | undefined> {
    const [giftCard] = await db.select()
      .from(giftCards)
      .where(eq(giftCards.code, code));
    return giftCard;
  }
  
  async createGiftCard(giftCard: InsertGiftCard): Promise<GiftCard> {
    const [createdGiftCard] = await db.insert(giftCards)
      .values(giftCard)
      .returning();
    return createdGiftCard;
  }
  
  // Generate a unique gift card code
  private async generateUniqueGiftCardCode(): Promise<string> {
    // Format: GC-XXXX-XXXX-XXXX (where X is an alphanumeric character)
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const length = 4;
    let isUnique = false;
    let code = '';
    
    while (!isUnique) {
      // Generate three groups of 4 characters each
      let segments = [];
      for (let i = 0; i < 3; i++) {
        let segment = '';
        for (let j = 0; j < length; j++) {
          segment += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        segments.push(segment);
      }
      
      // Format: GC-XXXX-XXXX-XXXX
      code = `GC-${segments[0]}-${segments[1]}-${segments[2]}`;
      
      // Check if code already exists
      const existingCode = await this.getGiftCardByCode(code);
      if (!existingCode) {
        isUnique = true;
      }
    }
    
    return code;
  }
  
  async createGiftCardBatch(amount: number, denominationId: number): Promise<GiftCard[]> {
    const createdGiftCards: GiftCard[] = [];
    
    // Get the denomination to know the value
    const denomination = await this.getGiftCardDenominationById(denominationId);
    if (!denomination) {
      throw new Error('Denomination not found');
    }
    
    // Create gift cards one by one to ensure unique codes
    for (let i = 0; i < amount; i++) {
      const code = await this.generateUniqueGiftCardCode();
      const newGiftCard: InsertGiftCard = {
        code,
        value: denomination.value,
        denominationId,
        isActive: true,
        isRedeemed: false
      };
      
      const createdGiftCard = await this.createGiftCard(newGiftCard);
      createdGiftCards.push(createdGiftCard);
    }
    
    // Update the denomination stock
    await this.updateGiftCardDenominationStock(
      denominationId, 
      denomination.stock + amount
    );
    
    return createdGiftCards;
  }
  
  async updateGiftCard(id: number, giftCardData: Partial<InsertGiftCard>): Promise<GiftCard | undefined> {
    const [updatedGiftCard] = await db.update(giftCards)
      .set(giftCardData)
      .where(eq(giftCards.id, id))
      .returning();
    return updatedGiftCard;
  }
  
  async deleteGiftCard(id: number): Promise<boolean> {
    await db.delete(giftCards).where(eq(giftCards.id, id));
    return true;
  }
  
  async redeemGiftCard(code: string, userId: number): Promise<GiftCard | undefined> {
    // Find the gift card
    const giftCard = await this.getGiftCardByCode(code);
    
    if (!giftCard) return undefined;
    
    // Check if the gift card is active and not already redeemed
    if (!giftCard.isActive || giftCard.isRedeemed) {
      return undefined;
    }
    
    // Update the gift card as redeemed
    const currentDate = new Date().toISOString();
    const [updatedGiftCard] = await db.update(giftCards)
      .set({
        isRedeemed: true,
        redeemedAt: currentDate,
        redeemedByUserId: userId
      })
      .where(eq(giftCards.id, giftCard.id))
      .returning();
    
    if (updatedGiftCard) {
      // Add the gift card value to the user's wallet
      const currentBalance = await this.getUserWalletBalance(userId);
      const newBalance = currentBalance + updatedGiftCard.value;
      await this.updateUserWalletBalance(userId, newBalance);
      
      // Record the transaction
      await this.createWalletTransaction({
        userId,
        amount: updatedGiftCard.value,
        type: 'credit',
        description: `Carte cadeau ${updatedGiftCard.code} utilisée`,
        status: 'completed'
      });
      
      // If the gift card has a denomination, update the stock
      if (giftCard.denominationId) {
        const denomination = await this.getGiftCardDenominationById(giftCard.denominationId);
        if (denomination && denomination.stock > 0) {
          await this.updateGiftCardDenominationStock(
            giftCard.denominationId, 
            denomination.stock - 1
          );
        }
      }
    }
    
    return updatedGiftCard;
  }
}

// Utiliser DatabaseStorage pour la persistance
export const storage = new DatabaseStorage();